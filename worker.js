const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const ALLOWED_TYPES = new Set(["opinion", "news", "about"]);
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

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
  let binary = "";
  const value = new Uint8Array(bytes);
  for (let i = 0; i < value.length; i++) binary += String.fromCharCode(value[i]);
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
    {
      name: "PBKDF2",
      salt,
      iterations: 210000,
      hash: "SHA-256"
    },
    key,
    256
  );

  return {
    hash: bytesToBase64(bits),
    salt: bytesToBase64(salt)
  };
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
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function makeCookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

async function getDeveloper(request, env) {
  const sessionId = getCookie(request, env.COOKIE_NAME || "developer_session");
  if (!sessionId) return null;

  const row = await env.DB.prepare(`
    SELECT s.id, s.developer_id, s.expires_at, d.email
    FROM sessions s
    JOIN developers d ON d.id = s.developer_id
    WHERE s.id = ? AND s.expires_at > ?
  `).bind(sessionId, now()).first();

  return row || null;
}

function validEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validPassword(password) {
  return typeof password === "string" && password.length >= 12 && password.length <= 200;
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

function cors(request, env) {
  const origin = request.headers.get("Origin");
  const configured = env.FRONTEND_ORIGIN;
  const allowedOrigin = configured && origin === configured ? origin : (configured ? configured : "*");

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  };
}

async function parseJson(request) {
  return request.json().catch(() => null);
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
  sql += " ORDER BY updated_at DESC";

  const result = await env.DB.prepare(sql).bind(...params).all();
  return result.results.map(cleanContent);
}

async function deleteStoredImage(env, key) {
  if (!key) return;
  await env.MEDIA.delete(key);
}

function safeImageExtension(type) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif"
  };
  return map[type];
}

async function route(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === "OPTIONS") return new Response(null, { status: 204, headers: cors(request, env) });

  if (path === "/api/health" && method === "GET") {
    return json({ ok: true, timestamp: now() });
  }

  if (path === "/api/auth/setup" && method === "POST") {
    const body = await parseJson(request);

    if (!env.SETUP_TOKEN || !body || body.setupToken !== env.SETUP_TOKEN) {
      return fail("Unauthorized.", 401);
    }

    if (!validEmail(body.email) || !validPassword(body.password)) {
      return fail("Invalid account details.", 400);
    }

    const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM developers").first();
    if (Number(count.count) > 0) return fail("Setup is already complete.", 409);

    const password = await passwordHash(body.password);
    const developerId = newId();
    const timestamp = now();

    await env.DB.prepare(`
      INSERT INTO developers
      (id, email, password_hash, password_salt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      developerId,
      body.email.trim().toLowerCase(),
      password.hash,
      password.salt,
      timestamp,
      timestamp
    ).run();

    return json({ ok: true }, 201);
  }

  if (path === "/api/auth/login" && method === "POST") {
    const body = await parseJson(request);

    if (!body || !validEmail(body.email) || typeof body.password !== "string") {
      return fail("Invalid login details.", 400);
    }

    const developer = await env.DB.prepare(
      "SELECT * FROM developers WHERE email = ?"
    ).bind(body.email.trim().toLowerCase()).first();

    if (!developer) return fail("Invalid email or password.", 401);

    const candidate = await passwordHash(body.password, developer.password_salt);

    if (!constantTimeEqual(candidate.hash, developer.password_hash)) {
      return fail("Invalid email or password.", 401);
    }

    const sessionId = newId();
    const ttl = Number(env.SESSION_TTL_SECONDS || 28800);
    const expiresAt = now() + ttl;

    await env.DB.prepare(`
      INSERT INTO sessions (id, developer_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(sessionId, developer.id, expiresAt, now()).run();

    return json(
      { ok: true, developer: { id: developer.id, email: developer.email } },
      200,
      {
        "Set-Cookie": makeCookie(
          env.COOKIE_NAME || "developer_session",
          sessionId,
          ttl
        )
      }
    );
  }

  if (path === "/api/auth/logout" && method === "POST") {
    const sessionId = getCookie(request, env.COOKIE_NAME || "developer_session");
    if (sessionId) {
      await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
    }

    return json(
      { ok: true },
      200,
      { "Set-Cookie": makeCookie(env.COOKIE_NAME || "developer_session", "", 0) }
    );
  }

  if (path === "/api/auth/me" && method === "GET") {
    const developer = await getDeveloper(request, env);
    if (!developer) return fail("Unauthorized.", 401);

    return json({
      developer: {
        id: developer.developer_id,
        email: developer.email
      }
    });
  }

  if (path.startsWith("/api/public/") && method === "GET") {
    const type = path.slice("/api/public/".length);

    if (!ALLOWED_TYPES.has(type)) return fail("Not found.", 404);

    return json({ items: await contentList(env, type, false) });
  }

  const developer = await getDeveloper(request, env);
  const isProtected =
    path.startsWith("/api/developer/");

  if (isProtected && !developer) return fail("Unauthorized.", 401);

  if (path === "/api/developer/projects" && method === "GET") {
    return json({ project: cleanProject() });
  }

  if (path === "/api/developer/content" && method === "GET") {
    const type = url.searchParams.get("type");
    return json({ items: await contentList(env, type, true) });
  }

  if (path === "/api/developer/media" && method === "POST") {
    const contentType = request.headers.get("Content-Type") || "";
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      return fail("Unsupported image type.", 415);
    }

    const maxBytes = Number(env.MAX_IMAGE_BYTES || 10485760);
    const declaredLength = Number(request.headers.get("Content-Length") || 0);
    if (declaredLength > maxBytes) return fail("Image is too large.", 413);

    const buffer = await request.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > maxBytes) {
      return fail("Image is too large.", 413);
    }

    const extension = safeImageExtension(contentType);
    const key = `uploads/${newId()}.${extension}`;

    await env.MEDIA.put(key, buffer, {
      httpMetadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable"
      }
    });

    const mediaUrl = `${url.origin}/media/${encodeURIComponent(key)}`;

    return json({
      key,
      url: mediaUrl,
      contentType,
      size: buffer.byteLength
    }, 201);
  }

  if (path.startsWith("/media/") && method === "GET") {
    const key = decodeURIComponent(path.slice("/media/".length));
    const object = await env.MEDIA.get(key);

    if (!object) return new Response("Not found.", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body, { headers });
  }

  if (path.startsWith("/api/developer/media/") && method === "DELETE") {
    const key = decodeURIComponent(path.slice("/api/developer/media/".length));
    await deleteStoredImage(env, key);
    return json({ ok: true });
  }

  if (path === "/api/developer/content" && method === "POST") {
    const body = await parseJson(request);

    if (!body || !ALLOWED_TYPES.has(body.type) || typeof body.body !== "string" || !body.body.trim()) {
      return fail("Invalid content.", 400);
    }

    const contentId = newId();
    const timestamp = now();
    const title = typeof body.title === "string" ? body.title.trim() || null : null;
    const slug = typeof body.slug === "string" && body.slug.trim()
      ? body.slug.trim().toLowerCase()
      : null;

    await env.DB.prepare(`
      INSERT INTO content
      (id, type, title, slug, body, image_key, image_url, published, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      contentId,
      body.type,
      title,
      slug,
      body.body,
      body.imageKey || null,
      body.imageUrl || null,
      body.published === true ? 1 : 0,
      timestamp,
      timestamp
    ).run();

    const row = await env.DB.prepare(
      "SELECT * FROM content WHERE id = ?"
    ).bind(contentId).first();

    return json({ item: cleanContent(row) }, 201);
  }

  const contentMatch = path.match(/^\/api\/developer\/content\/([^/]+)$/);

  if (contentMatch) {
    const contentId = contentMatch[1];

    if (method === "PUT") {
      const body = await parseJson(request);

      if (!body || !ALLOWED_TYPES.has(body.type) || typeof body.body !== "string" || !body.body.trim()) {
        return fail("Invalid content.", 400);
      }

      const existing = await env.DB.prepare(
        "SELECT * FROM content WHERE id = ?"
      ).bind(contentId).first();

      if (!existing) return fail("Content not found.", 404);

      const nextImageKey = body.imageKey || null;
      const oldImageKey = existing.image_key;

      await env.DB.prepare(`
        UPDATE content
        SET type = ?,
            title = ?,
            slug = ?,
            body = ?,
            image_key = ?,
            image_url = ?,
            published = ?,
            updated_at = ?
        WHERE id = ?
      `).bind(
        body.type,
        typeof body.title === "string" ? body.title.trim() || null : null,
        typeof body.slug === "string" && body.slug.trim() ? body.slug.trim().toLowerCase() : null,
        body.body,
        nextImageKey,
        body.imageUrl || null,
        body.published === true ? 1 : 0,
        now(),
        contentId
      ).run();

      if (oldImageKey && oldImageKey !== nextImageKey) {
        await deleteStoredImage(env, oldImageKey);
      }

      const updated = await env.DB.prepare(
        "SELECT * FROM content WHERE id = ?"
      ).bind(contentId).first();

      return json({ item: cleanContent(updated) });
    }

    if (method === "DELETE") {
      const existing = await env.DB.prepare(
        "SELECT * FROM content WHERE id = ?"
      ).bind(contentId).first();

      if (!existing) return fail("Content not found.", 404);

      await env.DB.prepare("DELETE FROM content WHERE id = ?").bind(contentId).run();
      await deleteStoredImage(env, existing.image_key);

      return json({ ok: true });
    }
  }

  return fail("Not found.", 404);
}

export default {
  async fetch(request, env) {
    try {
      const result = await route(request, env);
      const headers = new Headers(result.headers);

      for (const [key, value] of Object.entries(cors(request, env))) {
        headers.set(key, value);
      }

      return new Response(result.body, {
        status: result.status,
        headers
      });
    } catch {
      return fail("Internal server error.", 500);
    }
  }
};
