const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
};

const ALLOWED_TYPES = new Set(["opinion", "news", "about"]);
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const IMAGE_KEY_RE = /^uploads\/[0-9a-f-]{36}\.(jpg|png|webp|gif|avif)$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const LOGIN_LIMIT = 8;
const LOGIN_IP_LIMIT = 20;

function now() {
  return Math.floor(Date.now() / 1000);
}

function newId() {
  return crypto.randomUUID();
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...headers }
  });
}

function fail(message, status = 400) {
  return json({ error: message }, status);
}

function bytesToBase64(bytes) {
  const value = new Uint8Array(bytes);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < value.length; i += chunkSize) {
    binary += String.fromCharCode(...value.subarray(i, Math.min(i + chunkSize, value.length)));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function passwordHash(password, saltBase64) {
  const salt = saltBase64
    ? base64ToBytes(saltBase64)
    : crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" },
    key,
    256
  );

  return { hash: bytesToBase64(bits), salt: bytesToBase64(salt) };
}

function constantTimeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      try { return decodeURIComponent(rest.join("=")); } catch { return null; }
    }
  }
  return null;
}

function makeCookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=None`;
}

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function requestOriginAllowed(request, env, requireOrigin = false) {
  const origin = request.headers.get("Origin");
  if (!origin) return !requireOrigin;
  return getAllowedOrigins(env).includes(origin);
}

function cors(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return {};
  if (!getAllowedOrigins(env).includes(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Vary": "Origin"
  };
}

async function parseJson(request, maxChars = 100000) {
  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > maxChars * 4) return null;
  const text = await request.text().catch(() => "");
  if (!text || text.length > maxChars * 4) return null;
  try { return JSON.parse(text); } catch { return null; }
}

async function getDeveloper(request, env) {
  const sessionId = getCookie(request, env.COOKIE_NAME || "developer_session");
  if (!sessionId || sessionId.length > 100) return null;

  const row = await env.DB.prepare(`
    SELECT s.id, s.developer_id, s.expires_at, d.email
    FROM sessions s
    JOIN developers d ON d.id = s.developer_id
    WHERE s.id = ? AND s.expires_at > ?
  `).bind(sessionId, now()).first();

  return row || null;
}

function validEmail(email) {
  return typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validPassword(password) {
  return typeof password === "string" && password.length >= 12 && password.length <= 200;
}

function limitString(value, max, required = false) {
  if (typeof value !== "string") return required ? null : "";
  const trimmed = value.trim();
  if (trimmed.length > max) return null;
  if (required && !trimmed) return null;
  return trimmed;
}

function cleanContent(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    slug: row.slug,
    body: row.body,
    imageUrl: row.image_url || null,
    published: Boolean(row.published),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function cleanProject() {
  return {
    name: "Content Platform",
    endpoints: {
      health: "/api/health",
      login: "/api/auth/login",
      logout: "/api/auth/logout",
      currentDeveloper: "/api/auth/me",
      publicContent: "/api/public/{type}",
      developerContent: "/api/developer/content",
      uploadImage: "/api/developer/media"
    }
  };
}

async function contentList(env, type, includeDrafts) {
  let sql = "SELECT * FROM content";
  const params = [];
  const conditions = [];

  if (type) {
    if (!ALLOWED_TYPES.has(type)) return [];
    conditions.push("type = ?");
    params.push(type);
  }

  if (!includeDrafts) conditions.push("published = 1");

  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY updated_at DESC LIMIT 100";

  const result = await env.DB.prepare(sql).bind(...params).all();
  return result.results.map(cleanContent);
}

function safeImageExtension(type) {
  return {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif"
  }[type];
}

function imageSignatureMatches(bytes, type) {
  const b = new Uint8Array(bytes);
  const ascii = (start, length) => String.fromCharCode(...b.slice(start, start + length));

  if (type === "image/jpeg") return b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (type === "image/png") return b.length >= 8 && b[0] === 0x89 && ascii(1, 3) === "PNG" && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a;
  if (type === "image/gif") return b.length >= 6 && (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a");
  if (type === "image/webp") return b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP";
  if (type === "image/avif") return b.length >= 12 && ascii(4, 4) === "ftyp" && ["avif", "avis"].includes(ascii(8, 4));
  return false;
}

function githubApiHeaders(env) {
  return {
    "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json"
  };
}

function githubMediaPath(env, key) {
  const base = String(env.GITHUB_MEDIA_PATH || "uploads")
    .replace(/^\/+|\/+$/g, "");
  return `${base}/${key.replace(/^\/+/, "")}`;
}

function githubContentsUrl(env, key) {
  const encodedPath = githubMediaPath(env, key).split("/").map(encodeURIComponent).join("/");
  return `https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/${encodedPath}`;
}

async function githubGetFile(env, key) {
  if (!env.GITHUB_TOKEN) throw new Error("GitHub storage is not configured.");
  const response = await fetch(`${githubContentsUrl(env, key)}?ref=${encodeURIComponent(env.GITHUB_BRANCH || "main")}`, {
    headers: githubApiHeaders(env)
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("GitHub media lookup failed.");
  return response.json();
}

async function githubUploadFile(env, key, bytes) {
  if (!env.GITHUB_TOKEN) throw new Error("GitHub storage is not configured.");
  const response = await fetch(githubContentsUrl(env, key), {
    method: "PUT",
    headers: githubApiHeaders(env),
    body: JSON.stringify({
      message: "Upload media",
      content: bytesToBase64(bytes),
      branch: env.GITHUB_BRANCH || "main"
    })
  });

  if (!response.ok) throw new Error("GitHub media upload failed.");
  return response.json();
}

async function deleteStoredImage(env, key) {
  if (!key || !IMAGE_KEY_RE.test(key)) return;
  const file = await githubGetFile(env, key);
  if (!file || !file.sha) return;

  const response = await fetch(githubContentsUrl(env, key), {
    method: "DELETE",
    headers: githubApiHeaders(env),
    body: JSON.stringify({
      message: "Delete media",
      sha: file.sha,
      branch: env.GITHUB_BRANCH || "main"
    })
  });

  if (!response.ok && response.status !== 404) throw new Error("GitHub media deletion failed.");
}

function mediaPublicUrl(env, key) {
  const path = githubMediaPath(env, key).split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/${encodeURIComponent(env.GITHUB_BRANCH || "main")}/${path}`;
}

async function consumeLoginLimit(env, key, limit, timestamp) {
  const existing = await env.DB.prepare("SELECT * FROM login_attempts WHERE key = ?").bind(key).first();

  if (!existing || timestamp - Number(existing.window_started_at) >= LOGIN_WINDOW_SECONDS) {
    await env.DB.prepare(`
      INSERT INTO login_attempts (key, window_started_at, attempts)
      VALUES (?, ?, 1)
      ON CONFLICT(key) DO UPDATE SET window_started_at = excluded.window_started_at, attempts = 1
    `).bind(key, timestamp).run();
    return true;
  }

  if (Number(existing.attempts) >= limit) return false;
  await env.DB.prepare("UPDATE login_attempts SET attempts = attempts + 1 WHERE key = ?").bind(key).run();
  return true;
}

async function enforceLoginRateLimit(env, request, email) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const timestamp = now();
  const ipKey = await sha256Hex(`ip|${ip}`);
  const emailKey = await sha256Hex(`email|${normalizedEmail}`);
  const ipAllowed = await consumeLoginLimit(env, `ip:${ipKey}`, LOGIN_IP_LIMIT, timestamp);
  if (!ipAllowed) return false;
  const emailAllowed = await consumeLoginLimit(env, `email:${emailKey}`, LOGIN_LIMIT, timestamp);
  return emailAllowed;
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function cleanupExpired(env) {
  const cutoff = now() - LOGIN_WINDOW_SECONDS;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now()),
    env.DB.prepare("DELETE FROM login_attempts WHERE window_started_at < ?").bind(cutoff)
  ]);
}

function validateContent(body, env) {
  const maxBody = Number(env.MAX_BODY_CHARS || 100000);
  const maxTitle = Number(env.MAX_TITLE_CHARS || 240);
  const maxSlug = Number(env.MAX_SLUG_CHARS || 120);

  if (!body || !ALLOWED_TYPES.has(body.type)) return { error: "Invalid content type." };

  const contentBody = limitString(body.body, maxBody, true);
  if (contentBody === null) return { error: "Invalid content body." };

  const title = body.title == null ? null : limitString(body.title, maxTitle, false);
  if (body.title != null && title === null) return { error: "Invalid title." };

  const rawSlug = body.slug == null ? "" : String(body.slug).trim().toLowerCase();
  if (rawSlug.length > maxSlug || (rawSlug && !SLUG_RE.test(rawSlug))) return { error: "Invalid slug." };

  const imageKey = body.imageKey == null || body.imageKey === "" ? null : String(body.imageKey);
  if (imageKey && !IMAGE_KEY_RE.test(imageKey)) return { error: "Invalid image." };

  return { value: { type: body.type, body: contentBody, title: title || null, slug: rawSlug || null, imageKey, published: body.published === true } };
}

async function verifyMedia(env, imageKey) {
  if (!imageKey) return null;
  const row = await env.DB.prepare("SELECT key, content_id FROM media WHERE key = ?").bind(imageKey).first();
  return row || null;
}

async function route(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === "OPTIONS") {
    if (!requestOriginAllowed(request, env)) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: cors(request, env) });
  }

  if (path === "/api/health" && method === "GET") return json({ ok: true, timestamp: now() });

  if (path === "/api/auth/setup" && method === "POST") {
    if (!requestOriginAllowed(request, env, true)) return fail("Forbidden.", 403);
    const body = await parseJson(request);
    if (!env.SETUP_TOKEN || !body || typeof body.setupToken !== "string" || !constantTimeEqual(body.setupToken, env.SETUP_TOKEN)) return fail("Unauthorized.", 401);
    if (!validEmail(body.email) || !validPassword(body.password)) return fail("Invalid account details.", 400);

    const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM developers").first();
    if (Number(count.count) > 0) return fail("Setup is already complete.", 409);

    const password = await passwordHash(body.password);
    const developerId = newId();
    const timestamp = now();
    await env.DB.prepare(`
      INSERT INTO developers (id, email, password_hash, password_salt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(developerId, body.email.trim().toLowerCase(), password.hash, password.salt, timestamp, timestamp).run();

    return json({ ok: true }, 201);
  }

  if (path === "/api/auth/login" && method === "POST") {
    if (!requestOriginAllowed(request, env, true)) return fail("Forbidden.", 403);
    const body = await parseJson(request);
    if (!body || !validEmail(body.email) || typeof body.password !== "string" || body.password.length > 200) return fail("Invalid login details.", 400);

    await cleanupExpired(env);
    const allowed = await enforceLoginRateLimit(env, request, body.email);
    if (!allowed) return fail("Too many login attempts. Try again later.", 429, { "Retry-After": String(LOGIN_WINDOW_SECONDS) });

    const developer = await env.DB.prepare("SELECT * FROM developers WHERE email = ?").bind(body.email.trim().toLowerCase()).first();
    if (!developer) return fail("Invalid email or password.", 401);

    const candidate = await passwordHash(body.password, developer.password_salt);
    if (!constantTimeEqual(candidate.hash, developer.password_hash)) return fail("Invalid email or password.", 401);

    await env.DB.prepare("DELETE FROM sessions WHERE developer_id = ? AND expires_at <= ?").bind(developer.id, now()).run();
    const sessionId = newId();
    const ttl = Math.min(Math.max(Number(env.SESSION_TTL_SECONDS || 28800), 900), 86400);
    const expiresAt = now() + ttl;

    await env.DB.prepare("INSERT INTO sessions (id, developer_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
      .bind(sessionId, developer.id, expiresAt, now()).run();

    return json({ ok: true, developer: { id: developer.id, email: developer.email } }, 200, {
      "Set-Cookie": makeCookie(env.COOKIE_NAME || "developer_session", sessionId, ttl)
    });
  }

  if (path === "/api/auth/logout" && method === "POST") {
    if (!requestOriginAllowed(request, env, true)) return fail("Forbidden.", 403);
    const sessionId = getCookie(request, env.COOKIE_NAME || "developer_session");
    if (sessionId) await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
    return json({ ok: true }, 200, { "Set-Cookie": makeCookie(env.COOKIE_NAME || "developer_session", "", 0) });
  }

  if (path === "/api/auth/me" && method === "GET") {
    const developer = await getDeveloper(request, env);
    if (!developer) return fail("Unauthorized.", 401);
    return json({ developer: { id: developer.developer_id, email: developer.email } });
  }

  if (path.startsWith("/api/public/") && method === "GET") {
    const type = path.slice("/api/public/".length);
    if (!ALLOWED_TYPES.has(type)) return fail("Not found.", 404);
    return json({ items: await contentList(env, type, false) });
  }

  const developer = await getDeveloper(request, env);
  if (path.startsWith("/api/developer/") && !developer) return fail("Unauthorized.", 401);
  if (path.startsWith("/api/developer/") && ["POST", "PUT", "DELETE"].includes(method) && !requestOriginAllowed(request, env)) return fail("Forbidden.", 403);

  if (path === "/api/developer/projects" && method === "GET") return json({ project: cleanProject() });

  if (path === "/api/developer/content" && method === "GET") {
    const type = url.searchParams.get("type");
    if (type && !ALLOWED_TYPES.has(type)) return fail("Invalid content type.", 400);
    return json({ items: await contentList(env, type, true) });
  }

  if (path === "/api/developer/media" && method === "POST") {
    const contentType = (request.headers.get("Content-Type") || "").split(";", 1)[0].trim().toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) return fail("Unsupported image type.", 415);

    const maxBytes = Math.min(Number(env.MAX_IMAGE_BYTES || 950000), 950000);
    const declaredLength = Number(request.headers.get("Content-Length") || 0);
    if (declaredLength > maxBytes) return fail("Image is too large.", 413);

    const buffer = await request.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > maxBytes) return fail("Image is too large.", 413);
    if (!imageSignatureMatches(buffer, contentType)) return fail("Image data does not match its type.", 415);

    const extension = safeImageExtension(contentType);
    const key = `uploads/${newId()}.${extension}`;
    await githubUploadFile(env, key, buffer);
    const mediaUrl = mediaPublicUrl(env, key);

    try {
      await env.DB.prepare("INSERT INTO media (key, content_id, created_at) VALUES (?, NULL, ?)").bind(key, now()).run();
    } catch (error) {
      try { await deleteStoredImage(env, key); } catch {}
      throw error;
    }
    return json({ key, url: mediaUrl, contentType, size: buffer.byteLength }, 201);
  }

  if (path.startsWith("/api/developer/media/") && method === "DELETE") {
    const key = decodeURIComponent(path.slice("/api/developer/media/".length));
    if (!IMAGE_KEY_RE.test(key)) return fail("Invalid media key.", 400);
    const media = await verifyMedia(env, key);
    if (!media) return fail("Media not found.", 404);
    if (media.content_id) return fail("Media is attached to content.", 409);
    await deleteStoredImage(env, key);
    await env.DB.prepare("DELETE FROM media WHERE key = ?").bind(key).run();
    return json({ ok: true });
  }

  if (path === "/api/developer/content" && method === "POST") {
    const validation = validateContent(await parseJson(request), env);
    if (validation.error) return fail(validation.error, 400);
    const data = validation.value;

    if (data.imageKey) {
      const media = await verifyMedia(env, data.imageKey);
      if (!media || media.content_id) return fail("Invalid image.", 400);
    }

    const contentId = newId();
    const timestamp = now();
    try {
      await env.DB.prepare(`
        INSERT INTO content (id, type, title, slug, body, image_key, image_url, published, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        contentId, data.type, data.title, data.slug, data.body, data.imageKey,
        data.imageKey ? mediaPublicUrl(env, data.imageKey) : null,
        data.published ? 1 : 0,
        timestamp, timestamp
      ).run();
    } catch (error) {
      if (data.slug) return fail("Slug already exists.", 409);
      throw error;
    }

    try {
      if (data.imageKey) {
        await env.DB.prepare("UPDATE media SET content_id = ? WHERE key = ?").bind(contentId, data.imageKey).run();
      }
      const row = await env.DB.prepare("SELECT * FROM content WHERE id = ?").bind(contentId).first();
      return json({ item: cleanContent(row) }, 201);
    } catch (error) {
      await env.DB.prepare("DELETE FROM content WHERE id = ?").bind(contentId).run();
      if (data.imageKey) await env.DB.prepare("UPDATE media SET content_id = NULL WHERE key = ?").bind(data.imageKey).run();
      throw error;
    }
  }

  const contentMatch = path.match(/^\/api\/developer\/content\/([^/]+)$/);
  if (contentMatch) {
    const contentId = contentMatch[1];

    if (method === "PUT") {
      const body = await parseJson(request);
      const validation = validateContent(body, env);
      if (validation.error) return fail(validation.error, 400);
      const data = validation.value;
      const existing = await env.DB.prepare("SELECT * FROM content WHERE id = ?").bind(contentId).first();
      if (!existing) return fail("Content not found.", 404);

      if (data.imageKey) {
        const media = await verifyMedia(env, data.imageKey);
        if (!media || (media.content_id && media.content_id !== contentId)) return fail("Invalid image.", 400);
      }

      try {
        await env.DB.prepare(`
          UPDATE content SET type = ?, title = ?, slug = ?, body = ?, image_key = ?, image_url = ?, published = ?, updated_at = ?
          WHERE id = ?
        `).bind(
          data.type, data.title, data.slug, data.body, data.imageKey,
          data.imageKey ? mediaPublicUrl(env, data.imageKey) : null,
          bodyPublished(body) ? 1 : 0, now(), contentId
        ).run();
      } catch (error) {
        if (data.slug) return fail("Slug already exists.", 409);
        throw error;
      }

      if (data.imageKey) await env.DB.prepare("UPDATE media SET content_id = ? WHERE key = ?").bind(contentId, data.imageKey).run();
      if (existing.image_key && existing.image_key !== data.imageKey) {
        await deleteStoredImage(env, existing.image_key);
        await env.DB.prepare("DELETE FROM media WHERE key = ?").bind(existing.image_key).run();
      }

      const updated = await env.DB.prepare("SELECT * FROM content WHERE id = ?").bind(contentId).first();
      return json({ item: cleanContent(updated) });
    }

    if (method === "DELETE") {
      const existing = await env.DB.prepare("SELECT * FROM content WHERE id = ?").bind(contentId).first();
      if (!existing) return fail("Content not found.", 404);

      await env.DB.prepare("DELETE FROM content WHERE id = ?").bind(contentId).run();
      if (existing.image_key) {
        await deleteStoredImage(env, existing.image_key);
        await env.DB.prepare("DELETE FROM media WHERE key = ?").bind(existing.image_key).run();
      }
      return json({ ok: true });
    }
  }

  return fail("Not found.", 404);
}

function bodyPublished(body) {
  return body && body.published === true;
}

export default {
  async fetch(request, env) {
    try {
      const result = await route(request, env);
      const headers = new Headers(result.headers);
      for (const [key, value] of Object.entries(cors(request, env))) headers.set(key, value);
      return new Response(result.body, { status: result.status, headers });
    } catch (error) {
      return fail("Internal server error.", 500);
    }
  }
};
