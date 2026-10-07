// Backend for The Sujan Khadka — Cloudflare Worker (static assets + API)
// Variables needed: ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_REPO ("owner/repo")
// Data lives in the GitHub repo: db.json and img/<id>.jpg
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

async function handle({ request: req, env, next }) {
  const p = new URL(req.url).pathname, r = req.method;
  const isApi = p.startsWith('/api/'), isImg = p.startsWith('/img/');
  if (!isApi && !isImg) return next();
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
    if (p === '/api/data' && r === 'GET') {
      const ck = new Request(new URL(req.url).origin + '/api/data');
      const hit = await caches.default.match(ck);
      if (hit) return hit;
      const { db } = await readDb(env), now = Date.now();
      const res = J({ articles: (db.articles || []).filter(a => a.status === 'published' && Date.parse(a.date) <= now), home: db.home || [], pages: db.pages || {}, views: {} }, 200, { 'cache-control': 'public,max-age=60' });
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
      return J({ articles: db.articles || [], home: db.home || [], pages: db.pages || {} });
    }
    if (p === '/api/admin/db' && r === 'PUT') {
      const t = await req.text();
      if (t.length > 4e6) return J({ error: 'Too large' }, 413);
      let b; try { b = JSON.parse(t); } catch { return J({ error: 'Bad JSON' }, 400); }
      await writeDb(env, {
        articles: Array.isArray(b.articles) ? b.articles : [],
        home: Array.isArray(b.home) ? b.home : [],
        pages: b.pages && typeof b.pages === 'object' ? b.pages : {}
      });
      await caches.default.delete(new Request(new URL(req.url).origin + '/api/data'));
      return J({ ok: 1 });
    }
    if (p === '/api/admin/upload' && r === 'POST') {
      const buf = await req.arrayBuffer(), u = new Uint8Array(buf);
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
