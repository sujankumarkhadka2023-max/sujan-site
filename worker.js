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

async function handle({ request: req, env, next }) {
  const p = new URL(req.url).pathname, r = req.method;
  // Visitor's approximate place from Cloudflare (free, no permission prompt) — used for the weather
  if (p === '/api/geo' && r === 'GET') {
    const c = req.cf || {};
    return J({ city: c.city || '', region: c.region || '', country: c.country || '', lat: c.latitude ?? null, lon: c.longitude ?? null });
  }
  const isApi = p.startsWith('/api/'), isImg = p.startsWith('/img/'), isAud = p.startsWith('/audio/'), isVid = p.startsWith('/video/');
  if (!isApi && !isImg && !isAud && !isVid) return next();
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
