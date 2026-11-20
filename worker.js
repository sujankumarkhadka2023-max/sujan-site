// Backend for The Sujan Khadka — Cloudflare Worker (static assets + API)
// Variables needed: ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_REPO ("owner/repo")
// Data lives in the GitHub repo: db.json, img/<id>.jpg and audio/<id>.<ext>
const enc = new TextEncoder(), dec = new TextDecoder();
const J = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...h } });
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const b64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = t => Uint8Array.from(atob(t.replace(/\n/g, '')), c => c.charCodeAt(0));
async function hmac(k, m) {
  const key = await crypto.subtle.importKey('raw', enc.encode(k), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(m)));
}
const eq = (a, b) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };
async function authed(req, env) {
  const m = (req.headers.get('cookie') || '').match(/sk_s=(\d+)\.([a-f0-9]+)/);
  if (!m || Date.now() > +m[1]) return false;
  return eq(m[2], await hmac(env.ADMIN_PASSWORD, 's' + m[1]));
}
// GitHub helpers
const gh = (env, path, o = {}) => fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`, {
  ...o, headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'User-Agent': 'sujan-news', 'X-GitHub-Api-Version': '2022-11-28', Accept: 'application/vnd.github+json', ...o.headers }
});
async function readDb(env) {
  const r = await gh(env, 'db.json');
  if (r.status === 404) return { db: {}, sha: null };
  if (!r.ok) throw new Error('GitHub read ' + r.status);
  const j = await r.json();
  let text = j.content ? dec.decode(unb64(j.content)) : await (await gh(env, 'db.json', { headers: { Accept: 'application/vnd.github.raw+json' } })).text();
  return { db: JSON.parse(text || '{}'), sha: j.sha };
}
async function writeDb(env, db) {
  const body = b64(enc.encode(JSON.stringify(db)));
  for (let i = 0; i < 2; i++) {
    const { sha } = await readDb(env);
    const r = await gh(env, 'db.json', { method: 'PUT', body: JSON.stringify({ message: 'Update site data', content: body, ...(sha ? { sha } : {}) }) });
    if (r.ok) return;
    if (r.status !== 409 && r.status !== 422) throw new Error('GitHub write ' + r.status);
  }
  throw new Error('GitHub conflict');
}
const RL = ip => 'https://rl.local/' + encodeURIComponent(ip);
async function fails(ip) { const c = await caches.default.match(RL(ip)); return c ? +(await c.text()) : 0; }
const addFail = (ip, n) => caches.default.put(RL(ip), new Response(String(n), { headers: { 'cache-control': 'max-age=900' } }));

// ---- audio helpers ----
const AUDIO_MAX = 10e6; // 10 MB per audio file (GitHub + Worker limits)
const VIDEO_MAX = 10e6; // 10 MB per short video clip
const VIDEO_MIME = { mp4: 'video/mp4', webm: 'video/webm' };
function sniffVideo(u) {
  if (String.fromCharCode(...u.subarray(4, 8)) === 'ftyp') return 'mp4';
  if (u[0] === 0x1A && u[1] === 0x45 && u[2] === 0xDF && u[3] === 0xA3) return 'webm';
  return null;
}
const AUDIO_MIME = { mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac', webm: 'audio/webm' };
function sniffAudio(u) {
  const s = (a, b) => String.fromCharCode(...u.subarray(a, b));
  if (s(0, 3) === 'ID3' || (u[0] === 0xFF && (u[1] & 0xE0) === 0xE0)) return 'mp3';
  if (s(4, 8) === 'ftyp') return 'm4a';
  if (s(0, 4) === 'RIFF' && s(8, 12) === 'WAVE') return 'wav';
  if (s(0, 4) === 'OggS') return 'ogg';
  if (s(0, 4) === 'fLaC') return 'flac';
  if (u[0] === 0x1A && u[1] === 0x45 && u[2] === 0xDF && u[3] === 0xA3) return 'webm';
  return null;
}
// Serve a full buffer with HTTP Range support (needed for seeking / iPhone Safari)
function sendAudio(req, buf, type) {
  const size = buf.byteLength, h = { 'content-type': type, 'accept-ranges': 'bytes', 'cache-control': 'public,max-age=31536000,immutable' };
  const m = (req.headers.get('range') || '').match(/^bytes=(\d*)-(\d*)$/);
  if (m && (m[1] || m[2])) {
    const s = m[1] ? +m[1] : Math.max(0, size - +m[2]);
    const e = m[1] && m[2] ? Math.min(+m[2], size - 1) : size - 1;
    if (s >= size || s > e) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}` } });
    return new Response(buf.slice(s, e + 1), { status: 206, headers: { ...h, 'content-range': `bytes ${s}-${e}/${size}`, 'content-length': String(e - s + 1) } });
  }
  return new Response(buf, { headers: { ...h, 'content-length': String(size) } });
}

// ---- /api/rates: currency (NRB, else market rates) + gold & silver (FENEGOSIDA, else backups), cached at the edge ----
const RT_CUR = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'AED', 'QAR', 'SAR', 'MYR', 'JPY', 'CNY', 'KWD', 'KRW', 'CAD', 'SGD', 'OMR', 'BHD', 'HKD'];
const RT_UNIT = { INR: 100, JPY: 10, KRW: 100 };
const npDay = (off = 0) => new Date(Date.now() + 20700000 + off * 864e5).toISOString().slice(0, 10);
const asciiDigits = s => s.replace(/[०-९]/g, c => '०१२३४५६७८९'.indexOf(c));
const visText = h => asciiDigits(h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' '));
async function rtGet(url, ms = 8000) {
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(url, { signal: ac.signal, headers: { 'user-agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36', accept: 'text/html,application/json;q=0.9,*/*;q=0.8', 'accept-language': 'en-US,en;q=0.9' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.text();
  } finally { clearTimeout(t); }
}
// follows tiny "redirect" pages (meta refresh or script redirect) that fetch() does not follow by itself
async function rtGetFollow(url) {
  let html = '';
  for (let i = 0; i < 3; i++) {
    html = await rtGet(url);
    const m = html.length < 4000 && (html.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]*content=["'][^"']*url=\s*([^"'>\s]+)/i) || html.match(/location(?:\.href)?\s*=\s*["']([^"']+)["']/i) || html.match(/location\.replace\(\s*["']([^"']+)["']/i));
    if (!m) return html;
    url = new URL(m[1], url).href;
  }
  return html;
}
/* ---- currency ---- */
async function rtCurrencyApi() {
  const j = JSON.parse(await rtGet(`https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=10&from=${npDay(-6)}&to=${npDay(0)}`, 5000));
  const pl = (j.data && j.data.payload) || j.payload || [];
  if (!Array.isArray(pl) || !pl.length) throw new Error('no currency rates');
  pl.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const d = pl[0], list = [];
  for (const r of d.rates || []) {
    const c = r.currency && r.currency.iso3, b = +String(r.buy).replace(/,/g, ''), s = +String(r.sell).replace(/,/g, '');
    if (RT_CUR.includes(c) && b > 0 && s > 0) list.push({ c, u: +r.currency.unit || 1, b, s });
  }
  list.sort((a, b) => RT_CUR.indexOf(a.c) - RT_CUR.indexOf(b.c));
  if (!list.length) throw new Error('no usable currencies');
  return { date: String(d.date).slice(0, 10), list };
}
const RT_NAMES = { 'indian rupee': 'INR', 'u.s. dollar': 'USD', 'european euro': 'EUR', 'uk pound sterling': 'GBP', 'australian dollar': 'AUD', 'uae dirham': 'AED', 'qatari riyal': 'QAR', 'saudi arabian riyal': 'SAR', 'malaysian ringgit': 'MYR', 'japanese yen': 'JPY', 'chinese yuan': 'CNY', 'kuwaity dinar': 'KWD', 'kuwaiti dinar': 'KWD', 'south korean won': 'KRW', 'canadian dollar': 'CAD', 'singapore dollar': 'SGD', 'omani rial': 'OMR', 'bahrain dinar': 'BHD', 'hong kong dollar': 'HKD' };
async function rtCurrencyPage() {
  const text = visText(await rtGet('https://www.nrb.org.np/download-forex', 5000)), dm = text.match(/\d{4}-\d{2}-\d{2}/), lower = text.toLowerCase(), list = [];
  for (const [name, c] of Object.entries(RT_NAMES)) {
    const i = lower.indexOf(name);
    if (i < 0 || list.some(x => x.c === c)) continue;
    const m = text.slice(i + name.length, i + name.length + 90).match(/(\d+)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/);
    if (!m) continue;
    const u = +m[1], b = +m[2], s = +m[3];
    if ([1, 10, 100].includes(u) && b > 0 && s >= b) list.push({ c, u, b, s });
  }
  list.sort((a, b) => RT_CUR.indexOf(a.c) - RT_CUR.indexOf(b.c));
  if (!list.length) throw new Error('no currencies on page');
  return { date: dm ? dm[0] : npDay(0), list };
}
// Backup when the bank's site cannot be reached: market mid-rates from free public feeds (not the official buy/sell)
function rtFromPerUsd(per, date) {
  const npr = per.NPR;
  if (!(npr > 0)) throw new Error('no NPR rate');
  const list = [];
  for (const c of RT_CUR) {
    const v = c === 'USD' ? 1 : per[c];
    if (!(v > 0)) continue;
    const u = RT_UNIT[c] || 1, x = Math.round(npr / v * u * 100) / 100;
    list.push({ c, u, b: x, s: x });
  }
  return { date, list, mid: 1 };
}
async function rtCurrencyMarket() {
  const tries = [
    async () => { const j = JSON.parse(await rtGet('https://open.er-api.com/v6/latest/USD')); return rtFromPerUsd(j.rates || {}, npDay(0)); },
    async () => { const j = JSON.parse(await rtGet('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')), per = {}; for (const k in j.usd || {}) per[k.toUpperCase()] = j.usd[k]; return rtFromPerUsd(per, String(j.date || npDay(0)).slice(0, 10)); },
    async () => { const j = JSON.parse(await rtGet('https://latest.currency-api.pages.dev/v1/currencies/usd.json')), per = {}; for (const k in j.usd || {}) per[k.toUpperCase()] = j.usd[k]; return rtFromPerUsd(per, String(j.date || npDay(0)).slice(0, 10)); }
  ];
  let err;
  for (const f of tries) { try { return await f(); } catch (e) { err = e; } }
  throw err;
}
async function rtCurrency() {
  const market = rtCurrencyMarket();
  market.catch(() => {});
  try { return await Promise.any([rtCurrencyApi(), rtCurrencyPage()]); } catch (e) { return await market; }
}
/* ---- gold & silver ---- */
const RT_GOLD = 'fine\\s*gold|gold\\s*[-(]?\\s*hallmark|hallmark\\s*gold|hallmark|chhapawal|छापावाल';
const RT_TEJ = 'tejabi|tajabi|तेजाबी';
const RT_SIL = 'silver|चाँदी';
function rtMetal(text, label, lo, hi) {
  const re = new RegExp(label, 'gi');
  let m;
  while ((m = re.exec(text))) {
    const seg = text.slice(m.index + m[0].length, m.index + m[0].length + 260).replace(/\([^)]*\)/g, ' ');
    const nums = (seg.match(/\d{1,3}(?:,\d{2,3})+|\d{4,7}/g) || []).map(x => +x.replace(/,/g, '')).filter(n => n >= lo && n <= hi).slice(0, 2);
    if (nums.length) return Math.max(...nums);
  }
  return 0;
}
function rtParseMetals(html) {
  const text = visText(html);
  const fine = rtMetal(text, RT_GOLD, 50000, 2000000), tej = rtMetal(text, RT_TEJ, 50000, 2000000), silver = rtMetal(text, RT_SIL, 1000, 100000);
  const gold = fine || tej;
  if (!gold) throw new Error('no gold rate found');
  if (silver && (gold / silver < 25 || gold / silver > 250)) throw new Error('rates failed sanity check');
  return { fine, tejabi: tej, silver };
}
const RT_METAL_SRC = ['https://fenegosida.org/', 'https://www.fenegosida.org/', 'https://www.hamropatro.com/gold', 'https://www.ashesh.com.np/gold/'];
async function rtMetals() {
  const all = await Promise.allSettled(RT_METAL_SRC.map(async u => { const r = rtParseMetals(await rtGetFollow(u)); r.src = new URL(u).hostname; return r; }));
  const ok = all.find(x => x.status === 'fulfilled');
  if (ok) return ok.value;
  throw all[0].reason || new Error('no source worked');
}
/* ---- response ---- */
async function ratesDebug() {
  const rep = { currency: {}, metals: [] };
  for (const [k, f] of [['api', rtCurrencyApi], ['page', rtCurrencyPage], ['market', rtCurrencyMarket]]) {
    try { const c = await f(); rep.currency[k] = { ok: 1, date: c.date, count: c.list.length }; } catch (e) { rep.currency[k] = { ok: 0, error: String(e.message || e) }; }
  }
  for (const u of RT_METAL_SRC) {
    const o = { url: u };
    try {
      const html = await rtGetFollow(u);
      o.bytes = html.length;
      try { Object.assign(o, { ok: 1 }, rtParseMetals(html)); } catch (e) { o.ok = 0; o.error = String(e.message || e); }
      const t = visText(html), i = t.search(/gold|सुन/i);
      o.hint = (i < 0 ? t : t.slice(Math.max(0, i - 40), i + 300)).slice(0, 360);
      if (!o.ok && html.length < 1500) o.raw = html.slice(0, 600);
    } catch (e) { o.ok = 0; o.error = String(e.message || e); }
    rep.metals.push(o);
  }
  return J(rep, 200);
}
async function ratesResponse(req) {
  if (req && new URL(req.url).searchParams.get('debug') === '1') return ratesDebug();
  const ck = new Request('https://rates.internal/v2'), sk = new Request('https://rates.internal/v2-stale');
  const hit = await caches.default.match(ck);
  if (hit) return new Response(hit.body, { headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=300' } });
  const stale = await caches.default.match(sk), old = stale ? await stale.json().catch(() => null) : null;
  const [cu, mt] = await Promise.allSettled([rtCurrency(), rtMetals()]);
  const out = { at: Date.now() };
  if (cu.status === 'fulfilled') out.cur = cu.value; else if (old && old.cur) { out.cur = old.cur; out.curStale = 1; }
  if (mt.status === 'fulfilled') out.metals = mt.value; else if (old && old.metals) { out.metals = old.metals; out.metalsStale = 1; }
  if (!out.cur && !out.metals) return J({ error: 'Rates are unavailable right now.' }, 503);
  const body = JSON.stringify(out), mk = age => new Response(body, { headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=' + age } });
  await caches.default.put(ck, mk(cu.status === 'fulfilled' && mt.status === 'fulfilled' ? 900 : 120));
  await caches.default.put(sk, mk(259200));
  return new Response(body, { headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=300' } });
}

// ---- share previews: put each story's own title, summary and picture into the page for WhatsApp, Facebook, Messenger, X, Google ----
// which section a story belongs to (older stories say "Culture & Lifestyle"; the site shows them under /culture or /lifestyle)
const ogSec = a => ({ World: 'world', Opinion: 'opinion', History: 'history', Culture: 'culture', Lifestyle: 'lifestyle' })[a.category] || (a.category === 'Culture & Lifestyle' ? (a.subcategory === 'Lifestyle' ? 'lifestyle' : 'culture') : '');
// the title and description of every page, written into the page itself so Google sees different text on each address (made from what the site shows)
const PAGE_HEADS = {
 "/": [
  "The Sujan Khadka — News, Weather, Rates and Tools",
  "World news, history, opinion, culture and lifestyle, plus weather, horoscope, games, today's rates and free tools for Nepal."
 ],
 "/world": [
  "World — The Sujan Khadka",
  "Latest world news, analysis and explainers from The Sujan Khadka."
 ],
 "/opinion": [
  "Opinion — The Sujan Khadka",
  "Opinion and commentary from The Sujan Khadka."
 ],
 "/history": [
  "History — The Sujan Khadka",
  "History stories and explainers from The Sujan Khadka."
 ],
 "/culture": [
  "Culture — The Sujan Khadka",
  "Culture stories from The Sujan Khadka."
 ],
 "/lifestyle": [
  "Lifestyle — The Sujan Khadka",
  "Lifestyle stories from The Sujan Khadka."
 ],
 "/audio": [
  "Audio — The Sujan Khadka",
  "Listen to audio stories and talks from The Sujan Khadka."
 ],
 "/videos": [
  "Videos — The Sujan Khadka",
  "Watch videos from The Sujan Khadka."
 ],
 "/horoscope": [
  "Daily Rashifal — The Sujan Khadka",
  "Read your daily horoscope (rashifal) for all twelve zodiac signs in English and Nepali. Love, career, money and health, updated every day."
 ],
 "/weather": [
  "Weather — The Sujan Khadka",
  "Live weather forecast for Kathmandu, Pokhara and cities around the world: temperature, rain chance, wind, hourly and 7-day views."
 ],
 "/explore": [
  "Explore — The Sujan Khadka",
  "Explore weather forecasts for Nepal and the world, your daily horoscope (rashifal) and free browser games, all in one place."
 ],
 "/tools": [
  "Tools — The Sujan Khadka",
  "Free online tools: resume builder, 13 calculators, trek planner for Nepal, and today's gold, silver and currency rates."
 ],
 "/tools/money": [
  "Money tools — The Sujan Khadka",
  "Remittance, loan EMI, income tax and savings calculators."
 ],
 "/rates": [
  "Today's rates — The Sujan Khadka",
  "Today's gold, silver and foreign currency rates in Nepal, plus remittance, loan EMI, income tax and savings calculators."
 ],
 "/calculators": [
  "Calculators — The Sujan Khadka",
  "Thirteen free online calculators: basic, percentage, discount, VAT, income tax, loan EMI, interest, age, date difference, GPA, BMI, unit converter and AD to…"
 ],
 "/exercise": [
  "Exercises, stretches and yoga with a 3D body guide — The Sujan Khadka",
  "Learn exercises with an animated body guide, follow ready-made home workouts with a timer and voice, and track your progress."
 ],
 "/resume": [
  "Free Resume Builder — The Sujan Khadka",
  "Free online resume builder that fits your CV on one A4 page. Fill in your details, preview instantly and download as PDF."
 ],
 "/trek-planner": [
  "Trek Planner for Nepal — The Sujan Khadka",
  "Plan a trek in Nepal day by day: choose a route, see stages, altitude and rest days, and get a simple itinerary you can save."
 ],
 "/p/about": [
  "About Me — The Sujan Khadka",
  "Hello, I'm Sujan Kumar Khadka."
 ],
 "/p/contact": [
  "Contact — The Sujan Khadka",
  "We would be glad to hear from you. Whether you have a question, a news tip, feedback or a correction, please write to us by email."
 ],
 "/p/support": [
  "Support us — The Sujan Khadka",
  "The Sujan Khadka is independent, free to read and free of advertising. Your support helps us keep it that way. There are simple ways to help, and every one…"
 ],
 "/p/privacy": [
  "Privacy — The Sujan Khadka",
  "The Sujan Khadka respects your privacy. This page explains what information is handled when you use this website."
 ],
 "/p/cookies": [
  "Cookies — The Sujan Khadka",
  "This website does not use cookies to track readers."
 ],
 "/p/terms": [
  "Terms — The Sujan Khadka",
  "By using The Sujan Khadka you agree to these terms."
 ],
 "/calculators/basic": [
  "Basic Calculator — Calculators — The Sujan Khadka",
  "Add, subtract, multiply, divide and work out percentages. Free online calculator on The Sujan Khadka. It runs in your browser and nothing you type is sent…"
 ],
 "/calculators/percentage": [
  "Percentage Calculator — Calculators — The Sujan Khadka",
  "Find a percentage, a share or a percentage change. Free online calculator on The Sujan Khadka. It runs in your browser and nothing you type is sent anywhere."
 ],
 "/calculators/discount": [
  "Discount Calculator — Calculators — The Sujan Khadka",
  "Work out the sale price, the saving and any tax on top. Free online calculator on The Sujan Khadka. It runs in your browser and nothing you type is sent…"
 ],
 "/calculators/vat": [
  "VAT Calculator — Calculators — The Sujan Khadka",
  "Add VAT to a price or take it out. Nepal VAT is 13%. Free online calculator on The Sujan Khadka. It runs in your browser and nothing you type is sent…"
 ],
 "/calculators/income-tax": [
  "Nepal Income Tax Calculator 2083/84 | The Sujan Khadka",
  "Estimate your Nepal income tax for 2083/84 (from Shrawan 2083) with the new slabs from 1% to 29%, deductions, and take-home pay each month. Free online…"
 ],
 "/calculators/loan-emi": [
  "Loan EMI Calculator — Monthly Instalment | The Sujan Khadka",
  "Work out your monthly loan instalment (EMI), total interest and total payment, with a year-by-year schedule. Free EMI calculator for home, vehicle and…"
 ],
 "/calculators/interest": [
  "Interest Calculator — Calculators — The Sujan Khadka",
  "Simple and compound interest side by side. Free online calculator on The Sujan Khadka. It runs in your browser and nothing you type is sent anywhere."
 ],
 "/calculators/age": [
  "Age Calculator — Calculators — The Sujan Khadka",
  "Your exact age in years, months and days. Free online calculator on The Sujan Khadka. It runs in your browser and nothing you type is sent anywhere."
 ],
 "/calculators/date-difference": [
  "Date Difference Calculator — Calculators — The Sujan Khadka",
  "The time between two dates in years, months, weeks and days. Free online calculator on The Sujan Khadka. It runs in your browser and nothing you type is…"
 ],
 "/calculators/gpa-cgpa": [
  "GPA / CGPA Calculator — Calculators — The Sujan Khadka",
  "Grade point average for a term, or cumulative average over many terms. Free online calculator on The Sujan Khadka. It runs in your browser and nothing you…"
 ],
 "/calculators/bmi": [
  "BMI Calculator — Calculators — The Sujan Khadka",
  "Body mass index from your height and weight. Free online calculator on The Sujan Khadka. It runs in your browser and nothing you type is sent anywhere."
 ],
 "/calculators/unit-converter": [
  "Unit Converter — Calculators — The Sujan Khadka",
  "Convert length, weight, area, volume, speed, time, data and temperature. Free online calculator on The Sujan Khadka. It runs in your browser and nothing you…"
 ],
 "/calculators/ad-to-bs": [
  "AD to BS Date Converter — Nepali Date | The Sujan Khadka",
  "Convert any date between AD (English) and BS (Bikram Sambat, Nepali) with the Nepali month name, weekday and days in the month. Covers BS 2000 to 2083. Free…"
 ],
};
const OG_NAME = 'The Sujan Khadka';
const OG_PAGES = {
  '/': ['The Sujan Khadka', 'The Sujan Khadka — fewer sections, better stories.'],
  '/world': ['World', 'World news and analysis from The Sujan Khadka.'],
  '/opinion': ['Opinion', 'Opinion and commentary from The Sujan Khadka.'],
  '/history': ['History', 'Stories from history, told by The Sujan Khadka.'],
  '/culture': ['Culture & Lifestyle', 'Culture and lifestyle stories from The Sujan Khadka.'],
  '/audio': ['Audio', 'Listen to audio from The Sujan Khadka.'],
  '/videos': ['Videos', 'Watch videos from The Sujan Khadka.'],
  '/horoscope': ['Daily Rashifal', "Today's tithi, nakshatra and Moon sign, with a reading for every rashi, calculated for Kathmandu."],
  '/tools': ['Money tools', 'Remittance calculator, loan EMI, income tax and savings tools for Nepal.'],
  '/weather': ['Weather', 'Hourly and 7-day forecasts for Nepal and capital cities around the world.']
};
const ogEsc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function ogPlain(body) {
  for (const para of String(body || '').split(/\n{2,}/)) {
    let t = para.trim();
    if (!t || /^(##|>|\[\[|!\[|<)/.test(t) || /^https?:\/\//.test(t)) continue;
    t = t.replace(/<[^>]*>/g, ' ').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '$1').replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim();
    if (t.length >= 30) return t;
  }
  return '';
}
const ogCut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; const c = s.slice(0, n - 1), i = c.lastIndexOf(' '); return (i > n * 0.6 ? c.slice(0, i) : c).replace(/[ ,;:.\-–—]+$/, '') + '…'; };
async function ogData(env, origin) {
  const ck = new Request(origin + '/api/data'), hit = await caches.default.match(ck);
  if (hit) return await hit.json();
  const { db } = await readDb(env), now = Date.now();
  const res = J({
    articles: (db.articles || []).filter(a => a.status === 'published' && Date.parse(a.date) <= now),
    home: db.home || [], pages: db.pages || {}, views: {},
    audios: (db.audios || []).filter(a => a.status === 'published' && Date.parse(a.date) <= now)
  }, 200, { 'cache-control': 'public,max-age=60' });
  await caches.default.put(ck, res.clone());
  return await res.json();
}
function ogMeta(o) {
  const t = ogEsc(o.title), d = ogEsc(o.desc), u = ogEsc(o.url), im = ogEsc(o.image);
  let h = `<link rel="canonical" href="${u}">` +
    `<meta property="og:site_name" content="${OG_NAME}"><meta property="og:type" content="${o.article ? 'article' : 'website'}">` +
    `<meta property="og:title" content="${t}"><meta property="og:description" content="${d}"><meta property="og:url" content="${u}">` +
    `<meta property="og:image" content="${im}"><meta property="og:image:alt" content="${ogEsc(o.alt || o.title)}">` +
    `<meta name="twitter:card" content="${o.cover ? 'summary_large_image' : 'summary'}"><meta name="twitter:title" content="${t}"><meta name="twitter:description" content="${d}"><meta name="twitter:image" content="${im}">`;
  if (o.article) h += `<meta property="article:published_time" content="${ogEsc(o.published)}">${o.modified ? `<meta property="article:modified_time" content="${ogEsc(o.modified)}">` : ''}<meta property="article:section" content="${ogEsc(o.section)}">${o.author ? `<meta property="article:author" content="${ogEsc(o.author)}">` : ''}`;
  if (o.ld) h += `<script id="ld" type="application/ld+json">${JSON.stringify(o.ld).replace(/</g, '\\u003c')}</script>`;
  return h;
}
async function ogRewrite(req, env, res) {
  const u = new URL(req.url), origin = u.origin, p = decodeURIComponent(u.pathname).replace(/\/+$/, '') || '/', icon = origin + '/icon-512.png';
  let o = null, m;
  if ((m = p.match(/^\/(world|opinion|history|culture|lifestyle)\/([^/]+)$/))) {
    const a = ((await ogData(env, origin)).articles || []).find(x => x.slug === m[2] && ogSec(x));
    if (a) {
      const abs = origin + '/' + ogSec(a) + '/' + a.slug, cover = a.image && /^\/img\/[a-f0-9-]{36}$/.test(a.image) ? origin + a.image : '';
      const desc = ogCut(a.seoDesc || a.subtitle || ogPlain(a.body) || OG_PAGES['/'][1], 200), title = ogCut(a.seoTitle || a.title, 110);
      o = { article: 1, title, desc, url: abs, image: cover || icon, cover: !!cover, alt: a.imageCaption || a.title, published: a.date, modified: a.updated || '', section: a.category, author: a.author,
        ld: { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: ogCut(a.title, 110), description: desc, author: { '@type': 'Person', name: a.author || OG_NAME }, datePublished: a.date, dateModified: a.updated || a.date, image: [cover || icon], mainEntityOfPage: abs, publisher: { '@type': 'Organization', name: OG_NAME, logo: { '@type': 'ImageObject', url: icon } } } };
    }
  } else if ((m = p.match(/^\/listen\/([^/]+)$/))) {
    const a = ((await ogData(env, origin)).audios || []).find(x => x.id === m[1]);
    if (a) o = { title: ogCut(a.title, 110), desc: ogCut(a.desc || 'Listen on The Sujan Khadka.', 200), url: origin + '/listen/' + a.id, image: icon };
  } else if (PAGE_HEADS[p]) {
    o = { title: PAGE_HEADS[p][0].replace(/ [—|] The Sujan Khadka$/, ''), full: PAGE_HEADS[p][0], desc: PAGE_HEADS[p][1], url: origin + (p === '/' ? '' : p), image: icon };
  } else if (OG_PAGES[p]) {
    o = { title: OG_PAGES[p][0], desc: OG_PAGES[p][1], url: origin + (p === '/' ? '' : p), image: icon };
  }
  if (!o) return res;
  let html = await res.text();
  const full = o.full || (o.title === OG_NAME ? OG_NAME : o.title + ' — ' + OG_NAME);
  const t1 = '<title>' + ogEsc(full) + '</title>', t2 = '<meta name="description" content="' + ogEsc(o.desc) + '">', t3 = ogMeta(o) + '</head>';
  html = html.replace(/<title>[\s\S]*?<\/title>/i, () => t1) // function replacers: a "$&" in a story title must not be treated as a pattern
    .replace(/<meta name="description" content="[^"]*">/i, () => t2)
    .replace(/<\/head>/i, () => t3);
  const h = new Headers(res.headers);
  ['content-length', 'content-encoding', 'etag'].forEach(k => h.delete(k));
  h.set('cache-control', 'public, max-age=0, must-revalidate');
  return new Response(html, { status: res.status, headers: h });
}

// ---- /sitemap.xml: built on request from the fixed pages + every published article, so new articles appear by themselves ----
const SM_SITE = 'https://sujankumarkhadka.com.np';
const SM_PAGES = [
  '/',
  '/world',
  '/history',
  '/opinion',
  '/culture',
  '/lifestyle',
  '/audio',
  '/videos',
  '/horoscope',
  '/weather',
  '/explore',
  '/tools',
  '/rates',
  '/calculators',
  '/resume',
  '/trek-planner',
  '/p/about',
  '/p/contact',
  '/p/support',
  '/p/privacy',
  '/p/cookies',
  '/p/terms',
  '/calculators/basic',
  '/calculators/percentage',
  '/calculators/discount',
  '/calculators/vat',
  '/calculators/income-tax',
  '/calculators/loan-emi',
  '/calculators/interest',
  '/calculators/age',
  '/calculators/date-difference',
  '/calculators/gpa-cgpa',
  '/calculators/bmi',
  '/calculators/unit-converter',
  '/calculators/ad-to-bs',
  '/exercise',
  '/games',
  '/2048',
  '/memory',
  '/slide',
  '/sudoku',
  '/word'
];
const smEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const smDay = d => { const t = new Date(d); return isNaN(t) ? '' : t.toISOString().slice(0, 10); };
async function sitemapResponse(req, env) {
  const rows = SM_PAGES.map(p => [SM_SITE + p, '']);
  try {
    const d = await ogData(env, new URL(req.url).origin), seen = new Set();
    for (const a of d.articles || []) {
      const sec = ogSec(a);
      if (!sec || !a.slug) continue;
      const loc = SM_SITE + '/' + sec + '/' + encodeURIComponent(a.slug);
      if (seen.has(loc)) continue;
      seen.add(loc);
      rows.push([loc, smDay(a.updated || a.date)]);
    }
  } catch (e) { /* if the article list cannot be read, still serve the fixed pages */ }
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    rows.map(([u, m]) => '  <url><loc>' + smEsc(u) + '</loc>' + (m ? '<lastmod>' + m + '</lastmod>' : '') + '</url>').join('\n') + '\n</urlset>\n';
  return new Response(req.method === 'HEAD' ? null : xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}

async function handle({ request: req, env, next }) {
  const p = new URL(req.url).pathname, r = req.method;
  // Visitor's approximate place from Cloudflare (free, no permission prompt) — used for the weather
  if (p === '/api/geo' && r === 'GET') {
    const c = req.cf || {};
    return J({ city: c.city || '', region: c.region || '', country: c.country || '', lat: c.latitude ?? null, lon: c.longitude ?? null });
  }
  // Addresses that contain template leftovers such as ${y.id} are never real pages: answer 404 so Google drops them.
  if (/[${}]|%24|%7B|%7D/i.test(p) && (r === 'GET' || r === 'HEAD')) return new Response(r === 'HEAD' ? null : '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — The Sujan Khadka</title><meta name="robots" content="noindex"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:60px auto;padding:0 16px"><h1>Page not found</h1><p><a href="/">Go to the home page</a></p></body></html>', { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
  if (p === '/sitemap.xml' && (r === 'GET' || r === 'HEAD')) return sitemapResponse(req, env);
  // The Learn section was removed. Tell search engines the pages are gone for good (410) so they drop them quickly.
  if ((p === '/learn' || p.startsWith('/learn/')) && (r === 'GET' || r === 'HEAD')) return new Response(r === 'HEAD' ? null : '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>This page has been removed — The Sujan Khadka</title><meta name="robots" content="noindex"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:60px auto;padding:0 16px"><h1>This page has been removed</h1><p>The Learn section is no longer part of the site.</p><p><a href="/">Go to the home page</a></p></body></html>', { status: 410, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
  if (p === '/api/chat-config' || p === '/api/chat-login') return chatAuthRoute(req, env);
  if (p.startsWith('/api/chat/') || p.startsWith('/api/group/')) return chatRoute(req, env);
  if (p === '/api/push-key' || p === '/api/push-sub' || p === '/api/push-unsub' || p === '/api/notice') return pushRoute(req, env, false);
  if (p === '/api/rates' && r === 'GET') { try { return await ratesResponse(req); } catch (e) { return J({ error: 'Rates are unavailable right now.' }, 503); } }
  const isApi = p.startsWith('/api/'), isImg = p.startsWith('/img/'), isAud = p.startsWith('/audio/'), isVid = p.startsWith('/video/');
  if (!isApi && !isImg && !isAud && !isVid) {
    const res = await next();
    if (r === 'GET' && !/\.[a-z0-9]+$/i.test(p) && (res.headers.get('content-type') || '').includes('text/html')) { try { return await ogRewrite(req, env, res); } catch (e) { return res; } }
    return res;
  }
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO || !env.ADMIN_PASSWORD) return J({ error: 'Set ADMIN_PASSWORD, GITHUB_TOKEN and GITHUB_REPO in Cloudflare.' }, 503);
  try {
    if (isImg) {
      const id = p.slice(5);
      if (!/^[a-f0-9-]{36}$/.test(id)) return new Response('Not found', { status: 404 });
      const ck = new Request(req.url), hit = await caches.default.match(ck);
      if (hit) return hit;
      const o = await gh(env, `img/${id}.jpg`, { headers: { Accept: 'application/vnd.github.raw+json' } });
      if (!o.ok) return new Response('Not found', { status: 404 });
      const res = new Response(o.body, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public,max-age=31536000,immutable' } });
      await caches.default.put(ck, res.clone());
      return res;
    }
    if (isVid) {
      const m = p.match(/^\/video\/([a-f0-9-]{36})\.(mp4|webm)$/);
      if (!m || (r !== 'GET' && r !== 'HEAD')) return new Response('Not found', { status: 404 });
      const type = VIDEO_MIME[m[2]], ck = new Request(new URL(req.url).origin + p);
      let buf;
      const hit = await caches.default.match(ck);
      if (hit) buf = await hit.arrayBuffer();
      else {
        const o = await gh(env, `video/${m[1]}.${m[2]}`, { headers: { Accept: 'application/vnd.github.raw+json' } });
        if (!o.ok) return new Response('Not found', { status: 404 });
        buf = await o.arrayBuffer();
        await caches.default.put(ck, new Response(buf, { headers: { 'content-type': type, 'cache-control': 'public,max-age=31536000,immutable' } }));
      }
      return sendAudio(req, buf, type);
    }
    if (isAud) {
      const m = p.match(/^\/audio\/([a-f0-9-]{36})\.(mp3|m4a|wav|ogg|flac|webm)$/);
      if (!m || (r !== 'GET' && r !== 'HEAD')) return new Response('Not found', { status: 404 });
      const type = AUDIO_MIME[m[2]], ck = new Request(new URL(req.url).origin + p);
      let buf;
      const hit = await caches.default.match(ck);
      if (hit) buf = await hit.arrayBuffer();
      else {
        const o = await gh(env, `audio/${m[1]}.${m[2]}`, { headers: { Accept: 'application/vnd.github.raw+json' } });
        if (!o.ok) return new Response('Not found', { status: 404 });
        buf = await o.arrayBuffer();
        await caches.default.put(ck, new Response(buf, { headers: { 'content-type': type, 'cache-control': 'public,max-age=31536000,immutable' } }));
      }
      return sendAudio(req, buf, type);
    }
    if (p === '/api/data' && r === 'GET') {
      const ck = new Request(new URL(req.url).origin + '/api/data');
      const hit = await caches.default.match(ck);
      if (hit) return hit;
      const { db } = await readDb(env), now = Date.now();
      const res = J({
        articles: (db.articles || []).filter(a => a.status === 'published' && Date.parse(a.date) <= now),
        home: db.home || [], pages: db.pages || {}, views: {},
        audios: (db.audios || []).filter(a => a.status === 'published' && Date.parse(a.date) <= now)
      }, 200, { 'cache-control': 'public,max-age=60' });
      await caches.default.put(ck, res.clone());
      return res;
    }
    if (p === '/api/view') return J({ ok: 1 }); // views are not stored (each count would be a GitHub commit)
    if (p === '/api/login' && r === 'POST') {
      const ip = req.headers.get('cf-connecting-ip') || 'x', n = await fails(ip);
      if (n >= 5) return J({ error: 'Too many attempts. Wait 15 minutes.' }, 429);
      const { password = '' } = await req.json().catch(() => ({}));
      if (!eq(await hmac('k', String(password)), await hmac('k', env.ADMIN_PASSWORD))) { await addFail(ip, n + 1); return J({ error: 'Wrong password.' }, 401); }
      const exp = Date.now() + 7 * 864e5;
      return J({ ok: 1 }, 200, { 'set-cookie': `sk_s=${exp}.${await hmac(env.ADMIN_PASSWORD, 's' + exp)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800` });
    }
    if (p === '/api/logout') return J({ ok: 1 }, 200, { 'set-cookie': 'sk_s=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' });
    if (!p.startsWith('/api/admin/')) return J({ error: 'Not found' }, 404);
    if (!(await authed(req, env))) return J({ error: 'Unauthorized' }, 401);

    if (p === '/api/admin/db' && r === 'GET') {
      const { db } = await readDb(env);
      return J({ articles: db.articles || [], home: db.home || [], pages: db.pages || {}, audios: db.audios || [] });
    }
    if (p === '/api/admin/db' && r === 'PUT') {
      const t = await req.text();
      if (t.length > 4e6) return J({ error: 'Too large' }, 413);
      let b; try { b = JSON.parse(t); } catch { return J({ error: 'Bad JSON' }, 400); }
      await writeDb(env, {
        articles: Array.isArray(b.articles) ? b.articles : [],
        home: Array.isArray(b.home) ? b.home : [],
        pages: b.pages && typeof b.pages === 'object' ? b.pages : {},
        audios: Array.isArray(b.audios) ? b.audios : []
      });
      await caches.default.delete(new Request(new URL(req.url).origin + '/api/data'));
      return J({ ok: 1 });
    }
    if (p === '/api/admin/upload' && r === 'POST') {
      const buf = await req.arrayBuffer(), u = new Uint8Array(buf);
      const ct = (req.headers.get('content-type') || '').toLowerCase();
      if (ct.startsWith('video/')) {
        if (buf.byteLength > VIDEO_MAX) return J({ error: 'Video over 10 MB' }, 413);
        const ext = sniffVideo(u);
        if (!ext) return J({ error: 'Unsupported video format (use MP4 or WebM)' }, 400);
        const id = crypto.randomUUID();
        const w = await gh(env, `video/${id}.${ext}`, { method: 'PUT', body: JSON.stringify({ message: 'Add video', content: b64(buf) }) });
        if (!w.ok) return J({ error: 'GitHub upload ' + w.status }, 502);
        return J({ url: `/video/${id}.${ext}` });
      }
      if (ct.startsWith('audio/')) {
        if (buf.byteLength > AUDIO_MAX) return J({ error: 'Audio over 10 MB' }, 413);
        const ext = sniffAudio(u);
        if (!ext) return J({ error: 'Unsupported audio format (use MP3, M4A, WAV, OGG, FLAC or WebM)' }, 400);
        const id = crypto.randomUUID();
        const w = await gh(env, `audio/${id}.${ext}`, { method: 'PUT', body: JSON.stringify({ message: 'Add audio', content: b64(buf) }) });
        if (!w.ok) return J({ error: 'GitHub upload ' + w.status }, 502);
        return J({ url: `/audio/${id}.${ext}` });
      }
      if (buf.byteLength > 5e6) return J({ error: 'Image over 5 MB' }, 413);
      if (u[0] !== 0xFF || u[1] !== 0xD8) return J({ error: 'JPEG only' }, 400);
      const id = crypto.randomUUID();
      const w = await gh(env, `img/${id}.jpg`, { method: 'PUT', body: JSON.stringify({ message: 'Add image', content: b64(buf) }) });
      if (!w.ok) return J({ error: 'GitHub upload ' + w.status }, 502);
      return J({ url: '/img/' + id });
    }
    if (p === '/api/admin/push-stats' || p === '/api/admin/push-send') return pushRoute(req, env, true);
    return J({ error: 'Not found' }, 404);
  } catch (e) {
    return J({ error: String(e.message || e) }, 500);
  }
}

export default {
  async fetch(request, env) {
    const res = await handle({ request, env, next: () => env.ASSETS.fetch(request) });
    if (res.status === 101 || res.webSocket) return res;
    const h = new Headers(res.headers); // basic browser safety headers on every response
    if (!h.has('x-content-type-options')) h.set('x-content-type-options', 'nosniff');
    if (!h.has('referrer-policy')) h.set('referrer-policy', 'strict-origin-when-cross-origin');
    if (!h.has('x-frame-options')) h.set('x-frame-options', 'SAMEORIGIN');
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  }
};

// ---- CHAT START: private two-person chat. One Durable Object per room. It only relays encrypted text and forgets each message once it has been seen. ----
const CH_TTL = 6048e5, CH_MAX = 6000, CH_QUEUE = 40;
// Files and voice messages: the browser cuts an encrypted file into pieces, the server only stores the scrambled pieces for one hour.
const CH_BLOB = 3e5, CH_FCH = 44, CH_QUOTA = 40e6, CH_HOUR = 36e5, CH_FID = /^[A-Za-z0-9_-]{6,24}$/;
const chBK = (fid, i) => 'b:' + fid + ':' + String(i).padStart(2, '0');
async function blobPut(st, m, now) {
  const fid = String(m.fid || ''), i = m.i, iv = String(m.iv || ''), ct = String(m.ct || '');
  if (!CH_FID.test(fid) || !Number.isInteger(i) || i < 0 || i >= CH_FCH || !iv || iv.length > 40 || !ct || ct.length > 280000) return 'blobbad';
  const old = await st.get(chBK(fid, i)), bq = (await st.get('bq')) || 0, add = ct.length - (old ? old.ct.length : 0);
  if (bq + add > CH_QUOTA) return 'blobfull';
  await st.put(chBK(fid, i), { iv, ct });
  const bm = (await st.get('bm:' + fid)) || { s: 0 }; bm.s += add; await st.put('bm:' + fid, bm);
  await st.put('bq', bq + add);
  if (!(await st.get('bx:' + fid))) await st.put('bx:' + fid, now + CH_HOUR);
  return '';
}
async function blobKeep(st, fid, until) { if (CH_FID.test(fid) && (await st.get('bx:' + fid))) await st.put('bx:' + fid, until); }
async function blobSweep(st, now) {
  for (const [k, until] of await st.list({ prefix: 'bx:' })) {
    if (until > now) continue;
    const fid = k.slice(3), bm = await st.get('bm:' + fid);
    for (const [bk] of await st.list({ prefix: 'b:' + fid + ':' })) await st.delete(bk);
    if (bm) await st.put('bq', Math.max(0, ((await st.get('bq')) || 0) - bm.s));
    await st.delete('bm:' + fid); await st.delete(k);
  }
}
async function blobNext(st) { let n = 0; for (const [, v] of await st.list({ prefix: 'bx:' })) if (!n || v < n) n = v; return n; }
const chSend = (ws, o) => { try { ws.send(JSON.stringify(o)); } catch (e) {} };
// Sign in with Google (optional: only active when GOOGLE_CLIENT_ID is set). Google proves who the person is, we keep only a hashed id.
const chKey = env => env.CHAT_SECRET || env.ADMIN_PASSWORD; // CHAT_SECRET is optional; it keeps chat sign-ins fully separate from the developer login
const chHex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
async function chToken(env, uid) { const exp = Date.now() + 30 * 864e5; return uid + '.' + exp + '.' + await hmac(chKey(env), 'chat' + uid + '.' + exp); }
async function chVerify(env, tok) {
  const m = String(tok || '').match(/^(u[0-9a-f]{24})\.(\d{10,15})\.([0-9a-f]{64})$/);
  if (!m || +m[2] < Date.now() || !chKey(env)) return null;
  return eq(m[3], await hmac(chKey(env), 'chat' + m[1] + '.' + m[2])) ? m[1] : null;
}
async function chatAuthRoute(req, env) {
  const u = new URL(req.url);
  if (u.pathname === '/api/chat-config') return J({ gid: env.GOOGLE_CLIENT_ID && chKey(env) ? env.GOOGLE_CLIENT_ID : '' }, 200, { 'cache-control': 'no-store' });
  if (req.method !== 'POST') return J({ error: 'POST only' }, 405);
  if (await chHit(req, 'login', 20)) return J({ error: 'Too many sign-in attempts. Wait a minute.' }, 429);
  const o = req.headers.get('origin');
  if (o && o !== u.origin) return J({ error: 'Forbidden' }, 403);
  if (!env.GOOGLE_CLIENT_ID || !chKey(env)) return J({ error: 'Sign-in is not set up.' }, 503);
  let b; try { b = await req.json(); } catch (e) { return J({ error: 'Bad request' }, 400); }
  const cred = String((b && b.credential) || '');
  if (cred.length < 100 || cred.length > 4000) return J({ error: 'Bad sign-in' }, 400);
  let g; try { const r = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(cred)); if (!r.ok) throw 0; g = await r.json(); } catch (e) { return J({ error: 'Google sign-in could not be checked.' }, 401); }
  const okIss = g.iss === 'accounts.google.com' || g.iss === 'https://accounts.google.com';
  if (g.aud !== env.GOOGLE_CLIENT_ID || !okIss || !g.sub || +g.exp * 1000 < Date.now() || String(g.email_verified) !== 'true') return J({ error: 'Google sign-in was not accepted.' }, 401);
  const uid = 'u' + chHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('chat:' + g.sub))).slice(0, 24);
  const token = await chToken(env, uid);
  return J({ token, uid, name: String(g.given_name || g.name || '').slice(0, 30), exp: +token.split('.')[1] }, 200, { 'cache-control': 'no-store' });
}
async function chWho(env, ws, m, at) { // returns the person's id, or null after telling the browser to sign in
  if (!env.GOOGLE_CLIENT_ID) return String(m.cid || '');
  const uid = await chVerify(env, m.tok);
  if (!uid) { chSend(ws, { t: 'auth' }); try { ws.close(1000, 'auth'); } catch (e) {} return null; }
  return uid;
}
// simple per-visitor speed limit (spam guard): at most `max` calls per minute from one address
async function chHit(req, kind, max) {
  try {
    if (typeof caches === 'undefined') return false;
    const ip = req.headers.get('cf-connecting-ip') || 'x', k = new Request('https://rl.local/' + kind + '/' + encodeURIComponent(ip)), c = await caches.default.match(k);
    const n = c ? +(await c.text()) || 0 : 0;
    if (n >= max) return true;
    await caches.default.put(k, new Response(String(n + 1), { headers: { 'cache-control': 'max-age=60' } }));
  } catch (e) {}
  return false;
}
async function chatRoute(req, env) {
  if (await chHit(req, 'ws', 60)) return J({ error: 'Too many requests. Wait a minute.' }, 429);
  const u = new URL(req.url), m = u.pathname.match(/^\/api\/(chat|group)\/([A-Za-z0-9_-]{16,64})$/);
  if (!m) return J({ error: 'Not found' }, 404);
  const ns = m[1] === 'group' ? env.GROUP : env.CHAT;
  if (!ns) return J({ error: 'Chat is not set up yet.' }, 503);
  if ((req.headers.get('upgrade') || '').toLowerCase() !== 'websocket') return J({ error: 'Expected a WebSocket connection.' }, 426);
  const o = req.headers.get('origin');
  if (o && o !== u.origin) return J({ error: 'Forbidden' }, 403);
  return ns.get(ns.idFromName(m[2])).fetch(req);
}
export class ChatRoom {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  async fetch(req) {
    if (this.ctx.getWebSockets().length >= 6) return new Response('Room is busy', { status: 429 });
    const pair = new WebSocketPair(), [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }
  peers(slot) { return this.ctx.getWebSockets().filter(s => (s.deserializeAttachment() || {}).slot === slot); }
  async wipe(why) {
    for (const s of this.ctx.getWebSockets()) { chSend(s, { t: 'ended', why }); try { s.close(1000, 'ended'); } catch (e) {} }
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
    await this.ctx.storage.put('dead', Date.now()); // the link stays dead, it cannot be reused
  }
  async plan() {
    const st = this.ctx.storage, room = await st.get('room'); if (!room) return;
    let next = room.c + CH_TTL; const bx = await blobNext(st); if (bx) next = Math.min(next, bx + 500);
    await st.setAlarm(next);
  }
  async alarm() {
    const st = this.ctx.storage, now = Date.now(), room = await st.get('room');
    if (!room || now >= room.c + CH_TTL) { await this.wipe('expired'); return; }
    await blobSweep(st, now); await this.plan();
  }
  async webSocketMessage(ws, data) {
    if (typeof data !== 'string' || data.length > CH_BLOB || (data.length > CH_MAX && !data.startsWith('{"t":"blob"'))) { try { ws.close(1009, 'Too large'); } catch (e) {} return; }
    let m; try { m = JSON.parse(data); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;
    const st = this.ctx.storage, now = Date.now(), at = ws.deserializeAttachment() || {};
    // at most 30 messages in 10 seconds per connection
    let w = at.w || now, n = at.n || 0;
    if (now - w > 1e4) { w = now; n = 0; }
    n += (m.t === 'blob' || m.t === 'get') ? 0.25 : 1;
    if (n > 30) { chSend(ws, { t: 'err', e: 'slow' }); return; }
    at.w = w; at.n = n; ws.serializeAttachment(at);
    if (m.t === 'hello') {
      const cid = await chWho(this.env, ws, m, at); if (cid === null) return;
      if (!/^[A-Za-z0-9_-]{16,40}$/.test(cid)) return;
      if (await st.get('dead')) { chSend(ws, { t: 'ended', why: 'expired' }); try { ws.close(1000, 'ended'); } catch (e) {} return; }
      const room = (await st.get('room')) || { a: null, b: null, c: now };
      if (now > room.c + CH_TTL) { await this.wipe('expired'); return; }
      let slot = room.a === cid ? 'a' : room.b === cid ? 'b' : !room.a ? 'a' : !room.b ? 'b' : null;
      if (!slot) { chSend(ws, { t: 'full' }); try { ws.close(1000, 'full'); } catch (e) {} return; }
      room[slot] = cid; await st.put('room', room);
      for (const s of this.ctx.getWebSockets()) {
        if (s !== ws && (s.deserializeAttachment() || {}).cid === cid) { chSend(s, { t: 'replaced' }); try { s.close(1000, 'replaced'); } catch (e) {} }
      }
      at.cid = cid; at.slot = slot; ws.serializeAttachment(at);
      const other = slot === 'a' ? 'b' : 'a';
      chSend(ws, { t: 'joined', you: slot, peer: this.peers(other).length > 0, locked: !!(room.a && room.b), exp: room.c + CH_TTL });
      for (const s of this.peers(other)) chSend(s, { t: 'peer', on: true, locked: !!(room.a && room.b) });
      const q = await st.list({ prefix: 'q:' + slot + ':' });
      for (const [, v] of q) chSend(ws, { t: 'msg', id: v.id, iv: v.iv, ct: v.ct, ts: v.ts, fid: v.fid });
      await this.plan();
      return;
    }
    if (!at.slot) return;
    const other = at.slot === 'a' ? 'b' : 'a';
    if (m.t === 'msg') {
      const id = String(m.id || ''), iv = String(m.iv || ''), ct = String(m.ct || '');
      if (!/^[A-Za-z0-9_-]{6,24}$/.test(id) || !iv || iv.length > 40 || !ct || ct.length > 5000) return;
      const q = await st.list({ prefix: 'q:' + other + ':' });
      if (q.size >= CH_QUEUE) { chSend(ws, { t: 'err', e: 'queue', id }); return; }
      const rec = { id, iv, ct, ts: now };
      const fid = m.fid ? String(m.fid) : '';
      if (fid) { if (!CH_FID.test(fid)) return; rec.fid = fid; const rm = await st.get('room'); await blobKeep(st, fid, rm.c + CH_TTL); }
      await st.put('q:' + other + ':' + id, rec);
      chSend(ws, { t: 'sent', id });
      for (const s of this.peers(other)) chSend(s, { t: 'msg', ...rec });
    } else if (m.t === 'seen') {
      const id = String(m.id || '');
      if (!/^[A-Za-z0-9_-]{6,24}$/.test(id)) return;
      const seenRec = await st.get('q:' + at.slot + ':' + id);
      await st.delete('q:' + at.slot + ':' + id);
      if (seenRec && seenRec.fid) { await blobKeep(st, seenRec.fid, now + CH_HOUR); await this.plan(); }
      for (const s of this.peers(other)) chSend(s, { t: 'seen', id });
    } else if (m.t === 'blob') {
      const e = await blobPut(st, m, now);
      if (e) chSend(ws, { t: 'err', e, fid: m.fid }); else { chSend(ws, { t: 'bok', fid: m.fid, i: m.i }); await this.plan(); }
    } else if (m.t === 'get') {
      const row = CH_FID.test(String(m.fid || '')) && Number.isInteger(m.i) ? await st.get(chBK(m.fid, m.i)) : null;
      chSend(ws, row ? { t: 'blob', fid: m.fid, i: m.i, iv: row.iv, ct: row.ct } : { t: 'nob', fid: m.fid });
    } else if (m.t === 'typing') {
      for (const s of this.peers(other)) chSend(s, { t: 'typing' });
    } else if (m.t === 'end') {
      await this.wipe('ended');
    }
  }
  async webSocketClose(ws) {
    const at = ws.deserializeAttachment() || {};
    if (!at.slot) return;
    const other = at.slot === 'a' ? 'b' : 'a';
    if (this.peers(at.slot).filter(s => s !== ws).length === 0) for (const s of this.peers(other)) chSend(s, { t: 'peer', on: false });
  }
  async webSocketError(ws) { await this.webSocketClose(ws); }
}
// ---- CHAT END ----

// ---- GROUP START: group chat, up to 20 people. Messages are encrypted in the browser and kept for one hour, then deleted. ----
const GR_MAX = 20, GR_KEEP = 36e5, GR_STORE = 200;
export class GroupRoom {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  async fetch(req) {
    if (this.ctx.getWebSockets().length >= 60) return new Response('Room is busy', { status: 429 });
    const rid = new URL(req.url).pathname.split('/').pop();
    if ((await this.ctx.storage.get('rid')) !== rid) await this.ctx.storage.put('rid', rid);
    const pair = new WebSocketPair(), [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }
  online() { return this.ctx.getWebSockets().filter(s => (s.deserializeAttachment() || {}).cid); }
  async reg(uid, op, exp) { // the person's own list of groups, kept by a small per-person object: at most 5 groups
    if (!this.env.GOOGLE_CLIENT_ID || !this.env.USER || !/^u[0-9a-f]{24}$/.test(uid)) return true;
    try { const rid = await this.ctx.storage.get('rid'); if (!rid) return true;
      const r = await this.env.USER.get(this.env.USER.idFromName(uid)).fetch('https://u.local/' + op + '?r=' + encodeURIComponent(rid) + '&x=' + (exp || 0));
      return !!(await r.json()).ok; } catch (e) { return true; }
  }
  async count(ws) {
    const room = (await this.ctx.storage.get('room')) || { m: [] };
    const n = new Set(this.online().filter(s => s !== ws).map(s => s.deserializeAttachment().cid)).size;
    return { t: 'n', on: n, members: room.m.length };
  }
  async wipe(why) {
    for (const s of this.ctx.getWebSockets()) { chSend(s, { t: 'ended', why }); try { s.close(1000, 'ended'); } catch (e) {} }
    const room = await this.ctx.storage.get('room');
    if (room) for (const uid of room.m) await this.reg(uid, 'leave', 0);
    const rid = await this.ctx.storage.get('rid');
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
    await this.ctx.storage.put('dead', Date.now());
    if (rid) await this.ctx.storage.put('rid', rid);
  }
  async plan() {
    const st = this.ctx.storage, room = await st.get('room'); if (!room) return;
    const end = room.c + CH_TTL, old = await st.list({ prefix: 'g:', limit: 1 });
    let next = end;
    for (const [, v] of old) next = Math.min(end, v.ts + GR_KEEP + 1000);
    const bx = await blobNext(st); if (bx) next = Math.min(next, bx + 500);
    await st.setAlarm(next);
  }
  async alarm() {
    const st = this.ctx.storage, now = Date.now(), room = await st.get('room');
    if (!room || now >= room.c + CH_TTL) { await this.wipe('expired'); return; }
    for (const [k, v] of await st.list({ prefix: 'g:' })) if (now - v.ts >= GR_KEEP) await st.delete(k);
    await blobSweep(st, now);
    await this.plan();
  }
  async webSocketMessage(ws, data) {
    if (typeof data !== 'string' || data.length > CH_BLOB || (data.length > CH_MAX && !data.startsWith('{"t":"blob"'))) { try { ws.close(1009, 'Too large'); } catch (e) {} return; }
    let m; try { m = JSON.parse(data); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;
    const st = this.ctx.storage, now = Date.now(), at = ws.deserializeAttachment() || {};
    let w = at.w || now, n = at.n || 0;
    if (now - w > 1e4) { w = now; n = 0; }
    n += (m.t === 'blob' || m.t === 'get') ? 0.25 : 1;
    if (n > 30) { chSend(ws, { t: 'err', e: 'slow' }); return; }
    at.w = w; at.n = n; ws.serializeAttachment(at);
    if (m.t === 'hello') {
      const cid = await chWho(this.env, ws, m, at); if (cid === null) return;
      if (!/^[A-Za-z0-9_-]{16,40}$/.test(cid)) return;
      if (await st.get('dead')) { chSend(ws, { t: 'ended', why: 'expired' }); try { ws.close(1000, 'ended'); } catch (e) {} return; }
      const room = (await st.get('room')) || { m: [], c: now, o: cid };
      if (now > room.c + CH_TTL) { await this.wipe('expired'); return; }
      if (!room.m.includes(cid)) {
        if (room.m.length >= GR_MAX) { chSend(ws, { t: 'full' }); try { ws.close(1000, 'full'); } catch (e) {} return; }
        if (!(await this.reg(cid, 'join', room.c + CH_TTL))) { chSend(ws, { t: 'limit' }); try { ws.close(1000, 'limit'); } catch (e) {} return; }
        room.m.push(cid);
      }
      await st.put('room', room);
      for (const s of this.ctx.getWebSockets()) {
        if (s !== ws && (s.deserializeAttachment() || {}).cid === cid) { chSend(s, { t: 'replaced' }); try { s.close(1000, 'replaced'); } catch (e) {} }
      }
      at.cid = cid; ws.serializeAttachment(at);
      chSend(ws, { t: 'joined', owner: room.o === cid, exp: room.c + CH_TTL, max: GR_MAX });
      for (const [, v] of await st.list({ prefix: 'g:' })) if (now - v.ts < GR_KEEP) chSend(ws, { t: 'msg', id: v.id, iv: v.iv, ct: v.ct, ts: v.ts, fid: v.fid });
      const c = await this.count();
      for (const s of this.online()) chSend(s, c);
      await this.plan();
      return;
    }
    if (!at.cid) return;
    if (m.t === 'msg') {
      const id = String(m.id || ''), iv = String(m.iv || ''), ct = String(m.ct || '');
      if (!/^[A-Za-z0-9_-]{6,24}$/.test(id) || !iv || iv.length > 40 || !ct || ct.length > 5000) return;
      const all = await st.list({ prefix: 'g:' });
      if (all.size >= GR_STORE) { const first = [...all.keys()][0]; await st.delete(first); }
      const rec = { id, iv, ct, ts: now };
      const fid = m.fid ? String(m.fid) : '';
      if (fid) { if (!CH_FID.test(fid)) return; rec.fid = fid; await blobKeep(st, fid, now + GR_KEEP); }
      await st.put('g:' + String(now).padStart(14, '0') + ':' + id, rec);
      await this.plan();
      chSend(ws, { t: 'sent', id, ts: now });
      for (const s of this.online()) if (s !== ws) chSend(s, { t: 'msg', ...rec });
    } else if (m.t === 'blob') {
      const e = await blobPut(st, m, now);
      if (e) chSend(ws, { t: 'err', e, fid: m.fid }); else { chSend(ws, { t: 'bok', fid: m.fid, i: m.i }); await this.plan(); }
    } else if (m.t === 'get') {
      const row = CH_FID.test(String(m.fid || '')) && Number.isInteger(m.i) ? await st.get(chBK(m.fid, m.i)) : null;
      chSend(ws, row ? { t: 'blob', fid: m.fid, i: m.i, iv: row.iv, ct: row.ct } : { t: 'nob', fid: m.fid });
    } else if (m.t === 'typing') {
      for (const s of this.online()) if (s !== ws) chSend(s, { t: 'typing' });
    } else if (m.t === 'leave') {
      const room = await st.get('room');
      if (room) { room.m = room.m.filter(x => x !== at.cid); await st.put('room', room); await this.reg(at.cid, 'leave', 0); }
      at.cid = null; ws.serializeAttachment(at); try { ws.close(1000, 'left'); } catch (e) {}
      const c = await this.count();
      for (const s of this.online()) chSend(s, c);
    } else if (m.t === 'end') {
      const room = await st.get('room');
      if (room && room.o === at.cid) await this.wipe('ended');
    }
  }
  async webSocketClose(ws) {
    const at = ws.deserializeAttachment() || {};
    if (!at.cid) return;
    const c = await this.count(ws);
    for (const s of this.online()) if (s !== ws) chSend(s, c);
  }
  async webSocketError(ws) { await this.webSocketClose(ws); }
}
export class ChatUser {
  constructor(ctx) { this.ctx = ctx; }
  async fetch(req) {
    const u = new URL(req.url), r = (u.searchParams.get('r') || '').slice(0, 64), x = +u.searchParams.get('x') || 0, st = this.ctx.storage, now = Date.now();
    const g = (await st.get('g')) || {};
    for (const k in g) if (g[k] <= now) delete g[k];
    let ok = true;
    if (u.pathname === '/join') { if (!g[r]) { if (Object.keys(g).length >= 5) ok = false; else g[r] = x || now + 7 * 864e5; } }
    else if (u.pathname === '/leave') delete g[r];
    await st.put('g', g);
    return new Response(JSON.stringify({ ok, n: Object.keys(g).length }));
  }
}
// ---- GROUP END ----

// ---- PUSH START ----
// "Notify me": readers allow alerts once. We keep only the anonymous address their browser gives us (no name, no email).
// When a story or announcement is sent, the hub wakes each phone with an empty push, and the phone then reads the latest notice from /api/notice.
const PUSH_HOSTS = /^(fcm\.googleapis\.com|android\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9.-]+\.push\.apple\.com|[a-z0-9.-]+\.notify\.windows\.com)$/;
const PUSH_MAX = 50000, PUSH_BATCH = 40;
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const pushOk = u => { try { const x = new URL(u); return x.protocol === 'https:' && u.length < 1200 && PUSH_HOSTS.test(x.hostname); } catch (e) { return false; } };
export class PushHub {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  async keys() {
    const st = this.ctx.storage; let k = await st.get('vapid');
    if (!k) {
      const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
      k = { pub: b64u(await crypto.subtle.exportKey('raw', kp.publicKey)), priv: await crypto.subtle.exportKey('jwk', kp.privateKey) };
      await st.put('vapid', k);
    }
    return k;
  }
  async jwt(aud, k) {
    const h = b64u(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' }))), c = b64u(new TextEncoder().encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'https://sujankumarkhadka.com.np' })));
    const key = await crypto.subtle.importKey('jwk', k.priv, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
    return h + '.' + c + '.' + b64u(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(h + '.' + c)));
  }
  async hash(e) { return chHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(e))).slice(0, 32); }
  async count() { return (await this.ctx.storage.list({ prefix: 's:' })).size; }
  async fetch(req) {
    const u = new URL(req.url), st = this.ctx.storage, J2 = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { 'content-type': 'application/json' } });
    if (u.pathname === '/key') return J2({ key: (await this.keys()).pub });
    if (u.pathname === '/notice') return J2((await st.get('notice')) || {});
    if (u.pathname === '/stats') return J2({ subs: await this.count(), last: (await st.get('notice')) || null, sending: !!(await st.get('q')) });
    const b = await req.json().catch(() => ({}));
    if (u.pathname === '/sub') {
      if (!pushOk(b.endpoint)) return J2({ error: 'bad endpoint' }, 400);
      if ((await this.count()) >= PUSH_MAX) return J2({ error: 'full' }, 507);
      await st.put('s:' + await this.hash(b.endpoint), { e: b.endpoint, t: Date.now() });
      return J2({ ok: 1 });
    }
    if (u.pathname === '/unsub') { if (typeof b.endpoint === 'string') await st.delete('s:' + await this.hash(b.endpoint)); return J2({ ok: 1 }); }
    if (u.pathname === '/send') {
      const title = String(b.title || '').trim().slice(0, 90), body = String(b.body || '').trim().slice(0, 160);
      let link = String(b.url || '/').trim().slice(0, 300); if (!/^\/[^/\\]/.test(link) && link !== '/') link = '/';
      if (!title) return J2({ error: 'A title is needed.' }, 400);
      const last = await st.get('notice');
      if (last && Date.now() - last.t < 60000) return J2({ error: 'Wait a minute before sending another alert.' }, 429);
      await st.put('notice', { title, body, url: link, t: Date.now() });
      await st.put('q', { after: '', sent: 0, gone: 0 }); await this.keys();
      await st.setAlarm(Date.now() + 200);
      return J2({ ok: 1, subs: await this.count() });
    }
    return J2({ error: 'Not found' }, 404);
  }
  async alarm() {
    const st = this.ctx.storage, q = await st.get('q'); if (!q) return;
    const k = await this.keys(), opts = { prefix: 's:', limit: PUSH_BATCH }; if (q.after) opts.startAfter = q.after;
    const rows = await st.list(opts); let lastKey = q.after;
    for (const [key, v] of rows) {
      lastKey = key;
      try {
        const aud = new URL(v.e).origin, r = await fetch(v.e, { method: 'POST', headers: { TTL: '86400', Urgency: 'normal', Authorization: 'vapid t=' + await this.jwt(aud, k) + ', k=' + k.pub} });
        if (r.status === 404 || r.status === 410) { await st.delete(key); q.gone++; } else if (r.ok) q.sent++;
      } catch (e) {}
    }
    if (rows.size < PUSH_BATCH) { q.done = Date.now(); await st.delete('q'); await st.put('lastrun', q); }
    else { q.after = lastKey; await st.put('q', q); await st.setAlarm(Date.now() + 700); }
  }
}
async function pushRoute(req, env, admin) {
  if (!env.PUSH) return J({ error: 'Alerts are not set up yet.' }, 503);
  const u = new URL(req.url), p = u.pathname, hub = env.PUSH.get(env.PUSH.idFromName('main')), call = (path, body) => hub.fetch(new Request('https://hub' + path, body ? { method: 'POST', body: JSON.stringify(body) } : {}));
  if (p === '/api/push-key' && req.method === 'GET') return new Response(await (await call('/key')).text(), { headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=86400' } });
  if (p === '/api/notice' && req.method === 'GET') return new Response(await (await call('/notice')).text(), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  if ((p === '/api/push-sub' || p === '/api/push-unsub') && req.method === 'POST') {
    if (await chHit(req, 'push', 12)) return J({ error: 'Too many requests. Wait a minute.' }, 429);
    const t = await req.text(); if (t.length > 3000) return J({ error: 'Too large' }, 413);
    let b; try { b = JSON.parse(t); } catch (e) { return J({ error: 'Bad JSON' }, 400); }
    const o = req.headers.get('origin'); if (o && o !== u.origin) return J({ error: 'Forbidden' }, 403);
    const r = await call(p === '/api/push-sub' ? '/sub' : '/unsub', { endpoint: b.endpoint });
    return new Response(await r.text(), { status: r.status, headers: { 'content-type': 'application/json' } });
  }
  if (admin && p === '/api/admin/push-stats') return new Response(await (await call('/stats')).text(), { headers: { 'content-type': 'application/json' } });
  if (admin && p === '/api/admin/push-send' && req.method === 'POST') {
    const b = await req.json().catch(() => ({}));
    const r = await call('/send', { title: b.title, body: b.body, url: b.url });
    return new Response(await r.text(), { status: r.status, headers: { 'content-type': 'application/json' } });
  }
  return J({ error: 'Not found' }, 404);
}
// ---- PUSH END ----
