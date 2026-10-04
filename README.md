# Content Platform

## Repository

This phone-upload version keeps all project files in the repository root so GitHub mobile upload does not require folder selection.

- `index.html` — public home
- `opinion.html` — public opinion
- `news.html` — public news
- `about.html` — public about
- `developer-login.html` — developer login
- `developer-dashboard.html` — developer dashboard
- `worker.js` — Cloudflare Worker API
- `schema.sql` — D1 schema
- `wrangler.toml` — Worker configuration
- `site-header.png` — public header image

## Storage

Images are stored directly in the configured GitHub repository. Cloudflare R2 is not used. The GitHub token is a Cloudflare Worker secret and is never committed to the repository or exposed to the browser.

## Cloudflare

Create the D1 database named `content_platform`, set its database ID in `wrangler.toml`, then apply `schema.sql` and deploy `worker.js`.

Set these Worker variables:

- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_MEDIA_PATH`
- `GITHUB_BRANCH`
- `ALLOWED_ORIGINS`

Set this Worker secret:

- `GITHUB_TOKEN`

The token must have repository Contents read/write permission for the configured repository. Never put the token in frontend files.

The first developer account is created through `/api/auth/setup` using the one-time setup secret configured by the Worker. After a developer exists, setup is disabled.

Set the deployed Worker URL in both `public-config.js` and `developer-config.js`.

## Security

The application uses server-side sessions, secure HTTP-only cookies, password hashing, login rate limiting, origin checks, strict response headers, input validation, image signature validation, size limits, and GitHub media path validation.

No article, opinion, news, or other sample content is included.
