# Content Platform

## Repository

- frontend-public/
- frontend-developer/
- backend/
- database/
- wrangler.toml

## Storage

Images are stored directly in the public GitHub repository through the GitHub Contents API. Cloudflare R2 is not used.

The repository must remain public so the public site can load media from `raw.githubusercontent.com`.

## Cloudflare D1

Create a D1 database named `content_platform`, then put its database ID in `wrangler.toml`.

Apply the schema:

```bash
wrangler d1 execute content_platform --remote --file=database/schema.sql
```

## Worker configuration

Set these variables in `wrangler.toml` or the Cloudflare Worker environment:

- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_MEDIA_PATH`
- `GITHUB_BRANCH`
- `ALLOWED_ORIGINS` — comma-separated public/developer frontend origins
- `COOKIE_NAME`
- `SESSION_TTL_SECONDS`
- `MAX_IMAGE_BYTES`
- `MAX_BODY_CHARS`
- `MAX_TITLE_CHARS`
- `MAX_SLUG_CHARS`

Set these as Cloudflare Worker secrets. Never commit them to GitHub:

- `GITHUB_TOKEN` — GitHub token with repository Contents read/write permission
- `SETUP_TOKEN` — one-time developer-account setup token

## Deploy

```bash
wrangler deploy
```

Set the deployed Worker URL in both:

- `frontend-public/config.js`
- `frontend-developer/config.js`

Then create the first developer account by sending one HTTPS POST request to `/api/auth/setup` with the setup token, email, and password. The setup endpoint permanently disables itself after the first developer exists. Once an account exists, setup is permanently disabled by the Worker.

## Security

- Passwords use PBKDF2-SHA-256 with a unique random salt.
- Developer sessions are server-side and stored in D1.
- Session cookies are `HttpOnly`, `Secure`, and `SameSite=None` so a separately hosted developer frontend can authenticate; state-changing requests are protected by strict Origin allowlisting.
- State-changing browser requests require an allowed Origin.
- Login attempts are rate-limited in D1.
- Image MIME types and file signatures are checked server-side.
- Media paths are restricted to generated UUID filenames inside the configured media directory.
- Public content only exposes published records.
- GitHub credentials are never sent to the browser.
- API responses use security headers and do not expose internal errors.

## Public header image

The public website uses `frontend-public/assets/site-header.png` as the full-width top header image.
