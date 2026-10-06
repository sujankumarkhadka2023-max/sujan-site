// Backend for sujankumarkhadka.com.np (Cloudflare Pages advanced mode).
// Content and images are stored in a GitHub repo through the GitHub API.
// Needs these Cloudflare variables: ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_REPO (owner/name), GITHUB_BRANCH (optional, default main)

const GH = 'https://api.github.com';
const SECTIONS = ['opinion', 'article'];
const enc = new TextEncoder();
const dec = new TextDecoder();

class HttpError extends Error {
  constructor(status, message, conflict = false) { super(message); this.status = status; this.conflict = conflict; }
}
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

function toB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromB64(b64) {
  const bin = atob(b64.replace(/\s/g, ''));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const toUrl = (bytes) => toB64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromUrl = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return fromB64(s); };
const same = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0; };

/* ---------- GitHub ---------- */
function cfg(env) {
  const repo = (env.GITHUB_REPO || '').trim(), token = (env.GITHUB_TOKEN || '').trim();
  if (!repo || !token) throw new HttpError(500, 'Setup incomplete: GITHUB_REPO or GITHUB_TOKEN is missing in Cloudflare variables.');
  return { repo, token, branch: (env.GITHUB_BRANCH || 'main').trim() };
}
function gh(env, path, opts = {}) {
  const c = cfg(env);
  return fetch(GH + path, {
    ...opts,
    headers: {
      Authorization: 'Bearer ' + c.token, 'User-Agent': 'sujan-site', 'X-GitHub-Api-Version': '2022-11-28',
      Accept: 'application/vnd.github+json', ...(opts.headers || {})
    }
  });
}
function ghError(res) {
  if (res.status === 401) return new HttpError(502, 'GitHub token is invalid or expired. Create a new token and update GITHUB_TOKEN.');
  if (res.status === 403) return new HttpError(502, 'GitHub refused the request. The token needs Contents read and write access, or the rate limit was hit.');
  if (res.status === 404) return new HttpError(502, 'GitHub repo or branch not found. Check GITHUB_REPO and GITHUB_BRANCH.');
  return new HttpError(502, 'GitHub error (' + res.status + ').');
}
const fileUrl = (c, path) => `/repos/${c.repo}/contents/${path}`;

async function readFile(env, path) {
  const c = cfg(env), q = '?ref=' + encodeURIComponent(c.branch);
  const res = await gh(env, fileUrl(c, path) + q);
  if (res.status === 404) return null;
  if (!res.ok) throw ghError(res);
  const meta = await res.json();
  let bytes;
  if (meta.content && meta.encoding === 'base64') bytes = fromB64(meta.content);
  else {
    const raw = await gh(env, fileUrl(c, path) + q, { headers: { Accept: 'application/vnd.github.raw+json' } });
    if (!raw.ok) throw ghError(raw);
    bytes = new Uint8Array(await raw.arrayBuffer());
  }
  return { sha: meta.sha, bytes };
}
async function writeFile(env, path, bytes, sha, message) {
  const c = cfg(env);
  const body = { message, content: toB64(bytes), branch: c.branch };
  if (sha) body.sha = sha;
  const res = await gh(env, fileUrl(c, path), { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  if (res.status === 409 || res.status === 422) throw new HttpError(409, 'Save conflict, please try again.', true);
  if (!res.ok) throw ghError(res);
}
async function deleteFile(env, path, sha, message) {
  const c = cfg(env);
  const res = await gh(env, fileUrl(c, path), { method: 'DELETE', body: JSON.stringify({ message, sha, branch: c.branch }), headers: { 'Content-Type': 'application/json' } });
  if (!res.ok && res.status !== 404) throw ghError(res);
}
async function readJson(env, path, fallback) {
  const f = await readFile(env, path);
  if (!f) return fallback();
  try { return JSON.parse(dec.decode(f.bytes)); }
  catch { throw new HttpError(500, 'Data file ' + path + ' is damaged. Open it on GitHub and fix the JSON.'); }
}
async function mutateJson(env, path, fallback, fn, message) {
  for (let i = 0; i < 3; i++) {
    const f = await readFile(env, path);
    let data;
    try { data = f ? JSON.parse(dec.decode(f.bytes)) : fallback(); }
    catch { throw new HttpError(500, 'Data file ' + path + ' is damaged. Open it on GitHub and fix the JSON.'); }
    const out = await fn(data);
    try { await writeFile(env, path, enc.encode(JSON.stringify(out, null, 1)), f && f.sha, message); return out; }
    catch (e) { if (!e.conflict || i === 2) throw e; }
  }
}
async function removeImage(env, path) {
  try { const f = await readFile(env, path); if (f) await deleteFile(env, path, f.sha, 'Remove image'); } catch (e) { /* ignore */ }
}

/* ---------- auth ---------- */
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}
const sha256 = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
function needPassword(env) {
  if (!env.ADMIN_PASSWORD) throw new HttpError(500, 'Setup incomplete: ADMIN_PASSWORD is missing in Cloudflare variables.');
}
async function login(request, env) {
  needPassword(env);
  const body = await readBody(request);
  if (!same(await sha256(String(body.password || '')), await sha256(env.ADMIN_PASSWORD))) {
    await new Promise(r => setTimeout(r, 800));
    throw new HttpError(401, 'Wrong password.');
  }
  const payload = toUrl(enc.encode(JSON.stringify({ exp: Date.now() + 7 * 864e5 })));
  return json({ token: payload + '.' + toUrl(await hmac('sk:' + env.ADMIN_PASSWORD, payload)) });
}
async function requireAuth(request, env) {
  needPassword(env);
  const h = request.headers.get('Authorization') || '';
  const [p, s] = (h.startsWith('Bearer ') ? h.slice(7) : '').split('.');
  if (!p || !s) throw new HttpError(401, 'Please log in.');
  let ok = false;
  try {
    ok = same(fromUrl(s), await hmac('sk:' + env.ADMIN_PASSWORD, p)) && JSON.parse(dec.decode(fromUrl(p))).exp > Date.now();
  } catch { ok = false; }
  if (!ok) throw new HttpError(401, 'Session expired. Please log in again.');
}
async function readBody(request) {
  try { return await request.json(); } catch { throw new HttpError(400, 'Invalid request.'); }
}

/* ---------- content ---------- */
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const IMG_RE = /^uploads\/[A-Za-z0-9._-]+$/;

function imgsOf(p) { return Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []); }
async function savePost(env, section, body) {
  const title = String(body.title || '').trim(), text = String(body.body || '').trim();
  const author = String(body.author || '').trim().slice(0, 100);
  const images = (Array.isArray(body.images) ? body.images : []).map(String);
  if (!title) throw new HttpError(400, 'Heading is required.');
  if (!text) throw new HttpError(400, 'Full news is required.');
  if (title.length > 200 || text.length > 100000) throw new HttpError(400, 'Heading or text is too long.');
  if (images.length > 10) throw new HttpError(400, 'Maximum 10 images.');
  if (images.some(i => !IMG_RE.test(i))) throw new HttpError(400, 'Invalid image.');
  let oldImages = [], post;
  await mutateJson(env, `data/${section}.json`, () => [], (list) => {
    oldImages = [];
    if (!Array.isArray(list)) throw new HttpError(500, 'Data file is damaged.');
    const now = new Date().toISOString();
    if (body.id) {
      post = list.find(x => x.id === body.id);
      if (!post) throw new HttpError(404, 'Post not found.');
      oldImages = imgsOf(post);
      Object.assign(post, { title, body: text, author, images, updated: now });
      delete post.image;
    } else {
      post = { id: newId(), title, body: text, author, images, date: now };
      list.unshift(post);
    }
    return list;
  }, `Save ${section}`);
  for (const o of oldImages) if (!images.includes(o)) await removeImage(env, o);
  return json(post);
}
async function deletePost(env, section, id) {
  let old = [];
  await mutateJson(env, `data/${section}.json`, () => [], (list) => {
    const p = list.find(x => x.id === id);
    old = p ? imgsOf(p) : [];
    return list.filter(x => x.id !== id);
  }, `Delete ${section}`);
  for (const o of old) await removeImage(env, o);
  return json({ ok: true });
}
async function saveContact(env, body) {
  const intro = String(body.intro || '').slice(0, 5000);
  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 50)
    .map(i => ({ label: String(i.label || '').trim().slice(0, 200), value: String(i.value || '').trim().slice(0, 500) }))
    .filter(i => i.label || i.value);
  const data = { intro, items };
  await mutateJson(env, 'data/contact.json', () => ({}), () => data, 'Update contact');
  return json(data);
}
async function upload(env, body) {
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[body.type];
  if (!ext) throw new HttpError(400, 'Only JPG, PNG or WEBP images are allowed.');
  const data = String(body.data || '');
  if (!data || data.length > 7000000) throw new HttpError(400, 'Image is empty or too large.');
  let bytes;
  try { bytes = fromB64(data); } catch { throw new HttpError(400, 'Image data is invalid.'); }
  const name = newId() + '.' + ext;
  await writeFile(env, 'uploads/' + name, bytes, null, 'Upload image');
  return json({ image: 'uploads/' + name });
}
async function health(env) {
  const checks = [];
  const add = (name, ok, msg) => checks.push({ name, ok, message: msg });
  add('ADMIN_PASSWORD', !!env.ADMIN_PASSWORD, env.ADMIN_PASSWORD ? 'Set.' : 'Missing. Add it in Cloudflare variables.');
  add('GITHUB_TOKEN', !!env.GITHUB_TOKEN, env.GITHUB_TOKEN ? 'Set.' : 'Missing. Add it in Cloudflare variables.');
  add('GITHUB_REPO', !!env.GITHUB_REPO, env.GITHUB_REPO ? 'Set.' : 'Missing. Use the form owner/repo-name.');
  if (env.GITHUB_TOKEN && env.GITHUB_REPO) {
    const c = cfg(env);
    const r = await gh(env, `/repos/${c.repo}`);
    if (!r.ok) add('GitHub repo', false, ghError(r).message);
    else {
      const j = await r.json();
      add('GitHub repo', true, 'Found ' + j.full_name + '.');
      add('Write access', !!(j.permissions && j.permissions.push), j.permissions && j.permissions.push ? 'Token can save content.' : 'Token cannot write. Give it Contents: Read and write.');
      const b = await gh(env, `/repos/${c.repo}/branches/${encodeURIComponent(c.branch)}`);
      add('Branch ' + c.branch, b.ok, b.ok ? 'Found.' : 'Branch not found. Check GITHUB_BRANCH, or add a first file to the repo.');
    }
  }
  return json({ checks });
}

/* ---------- routing ---------- */
async function api(request, env, url) {
  const parts = url.pathname.split('/').filter(Boolean).slice(1), m = request.method;
  if (m === 'POST' && parts[0] === 'login') return login(request, env);
  if (m === 'GET' && parts[0] === 'data' && parts.length === 2) {
    if (parts[1] === 'contact') return json(await readJson(env, 'data/contact.json', () => ({ intro: '', items: [] })));
    if (SECTIONS.includes(parts[1])) return json(await readJson(env, `data/${parts[1]}.json`, () => []));
    throw new HttpError(404, 'Not found.');
  }
  await requireAuth(request, env);
  if (m === 'GET' && parts[0] === 'health') return health(env);
  if (m === 'POST' && parts[0] === 'upload') return upload(env, await readBody(request));
  if (m === 'POST' && parts[0] === 'contact') return saveContact(env, await readBody(request));
  if (parts[0] === 'post' && SECTIONS.includes(parts[1])) {
    if (m === 'POST' && parts.length === 2) return savePost(env, parts[1], await readBody(request));
    if (m === 'DELETE' && parts.length === 3) return deletePost(env, parts[1], parts[2]);
  }
  throw new HttpError(404, 'Not found.');
}
async function image(env, pathname) {
  const name = decodeURIComponent(pathname.slice(5));
  if (!/^[A-Za-z0-9._-]+$/.test(name)) throw new HttpError(404, 'Not found.');
  const c = cfg(env);
  const res = await gh(env, fileUrl(c, 'uploads/' + name) + '?ref=' + encodeURIComponent(c.branch), { headers: { Accept: 'application/vnd.github.raw+json' } });
  if (!res.ok) return new Response('Not found', { status: 404 });
  const type = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[name.split('.').pop().toLowerCase()] || 'application/octet-stream';
  return new Response(res.body, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' } });
}


async function sharePage(env, url) {
  const parts = url.pathname.split('/').filter(Boolean);
  const section = parts[1], id = parts[2];
  if (!SECTIONS.includes(section) || !id) return Response.redirect(url.origin + '/', 302);
  const list = await readJson(env, `data/${section}.json`, () => []);
  const p = list.find(x => x.id === id);
  if (!p) return Response.redirect(url.origin + '/', 302);
  const e = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const target = url.origin + '/#/' + section + '/' + encodeURIComponent(p.id);
  const desc = p.body.replace(/\s+/g, ' ').slice(0, 200);
  const first = imgsOf(p)[0];
  const img = first ? url.origin + '/img/' + encodeURIComponent(first.split('/').pop()) : url.origin + '/header.png';
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${e(p.title)}</title>
<meta property="og:type" content="article"><meta property="og:site_name" content="Sujan Kumar Khadka">
<meta property="og:title" content="${e(p.title)}"><meta property="og:description" content="${e(desc)}">
<meta property="og:image" content="${e(img)}"><meta property="og:url" content="${e(url.origin + '/share/' + section + '/' + p.id)}">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=${e(target)}"></head><body><script>location.replace(${JSON.stringify(target)})</script></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60' } });
}

export default {
  async fetch(request, env) {
    const p = new URL(request.url).pathname;
    try {
      if (p.startsWith('/api/')) return await api(request, env, new URL(request.url));
      if (p.startsWith('/img/')) return await image(env, p);
      if (p.startsWith('/share/')) return await sharePage(env, new URL(request.url));
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: 'Unexpected server error.' }, 500);
    }
    return env.ASSETS.fetch(request);
  }
};
