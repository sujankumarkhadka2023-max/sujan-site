# Content Platform

## Repository

- frontend-public/
- frontend-developer/
- backend/
- database/
- wrangler.toml

## Cloudflare resources

Create a D1 database and an GitHub bucket.

Set the D1 database ID in `wrangler.toml`.

Set the GitHub bucket name in `wrangler.toml`.

Set these Worker secrets:

- `SETUP_TOKEN`

Optional Worker variables:

- `FRONTEND_ORIGIN`
- `COOKIE_NAME`
- `SESSION_TTL_SECONDS`

Apply the database schema:

```bash
wrangler d1 execute content_platform --file=database/schema.sql
```

Deploy the Worker:

```bash
wrangler deploy
```

The first developer account is created through `/api/auth/setup` using `SETUP_TOKEN`. After a developer exists, the setup endpoint is disabled.

Set the deployed Worker URL in both frontend `config.js` files.

Do not commit credentials, tokens, or private keys.

## Public header image
The public website uses `frontend-public/assets/site-header.png` as the full-width top header image.

## Image storage
Uploaded images are stored directly in the configured GitHub repository under `GITHUB_MEDIA_PATH`.

Set these Worker variables:
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_MEDIA_PATH`
- `GITHUB_BRANCH`

Create a Cloudflare Worker secret named `GITHUB_TOKEN`. Do not commit the token to GitHub.

The GitHub repository must be publicly readable for the public website to load image URLs from `raw.githubusercontent.com`.
