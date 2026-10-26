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
const RT_CUR = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'AED', 'QAR', 'SAR', 'MYR', 'JPY', 'CNY', 'KWD'];
const RT_UNIT = { INR: 100, JPY: 10 };
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
const RT_NAMES = { 'indian rupee': 'INR', 'u.s. dollar': 'USD', 'european euro': 'EUR', 'uk pound sterling': 'GBP', 'australian dollar': 'AUD', 'uae dirham': 'AED', 'qatari riyal': 'QAR', 'saudi arabian riyal': 'SAR', 'malaysian ringgit': 'MYR', 'japanese yen': 'JPY', 'chinese yuan': 'CNY', 'kuwaity dinar': 'KWD', 'kuwaiti dinar': 'KWD' };
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
const OG_SECT = { World: 'world', Opinion: 'opinion', History: 'history', 'Culture & Lifestyle': 'culture' };
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
  if ((m = p.match(/^\/(world|opinion|history|culture)\/([^/]+)$/))) {
    const a = ((await ogData(env, origin)).articles || []).find(x => x.slug === m[2] && OG_SECT[x.category] === m[1]);
    if (a) {
      const abs = origin + '/' + OG_SECT[a.category] + '/' + a.slug, cover = a.image && /^\/img\/[a-f0-9-]{36}$/.test(a.image) ? origin + a.image : '';
      const desc = ogCut(a.seoDesc || a.subtitle || ogPlain(a.body) || OG_PAGES['/'][1], 200), title = ogCut(a.seoTitle || a.title, 110);
      o = { article: 1, title, desc, url: abs, image: cover || icon, cover: !!cover, alt: a.imageCaption || a.title, published: a.date, modified: a.updated || '', section: a.category, author: a.author,
        ld: { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: ogCut(a.title, 110), description: desc, author: { '@type': 'Person', name: a.author || OG_NAME }, datePublished: a.date, dateModified: a.updated || a.date, image: [cover || icon], mainEntityOfPage: abs, publisher: { '@type': 'Organization', name: OG_NAME, logo: { '@type': 'ImageObject', url: icon } } } };
    }
  } else if ((m = p.match(/^\/listen\/([^/]+)$/))) {
    const a = ((await ogData(env, origin)).audios || []).find(x => x.id === m[1]);
    if (a) o = { title: ogCut(a.title, 110), desc: ogCut(a.desc || 'Listen on The Sujan Khadka.', 200), url: origin + '/listen/' + a.id, image: icon };
  } else if (OG_PAGES[p]) {
    o = { title: OG_PAGES[p][0], desc: OG_PAGES[p][1], url: origin + (p === '/' ? '' : p), image: icon };
  }
  if (!o) return res;
  let html = await res.text();
  const full = o.title === OG_NAME ? OG_NAME : o.title + ' — ' + OG_NAME;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + ogEsc(full) + '</title>')
    .replace(/<meta name="description" content="[^"]*">/i, '<meta name="description" content="' + ogEsc(o.desc) + '">')
    .replace(/<\/head>/i, ogMeta(o) + '</head>');
  const h = new Headers(res.headers);
  ['content-length', 'content-encoding', 'etag'].forEach(k => h.delete(k));
  h.set('cache-control', 'public, max-age=0, must-revalidate');
  return new Response(html, { status: res.status, headers: h });
}

async function handle({ request: req, env, next }) {
  const p = new URL(req.url).pathname, r = req.method;
  // Visitor's approximate place from Cloudflare (free, no permission prompt) — used for the weather
  if (p === '/api/geo' && r === 'GET') {
    const c = req.cf || {};
    return J({ city: c.city || '', region: c.region || '', country: c.country || '', lat: c.latitude ?? null, lon: c.longitude ?? null });
  }
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
    return J({ error: 'Not found' }, 404);
  } catch (e) {
    return J({ error: String(e.message || e) }, 500);
  }
}

export default { fetch: (request, env) => handle({ request, env, next: () => env.ASSETS.fetch(request) }) };
