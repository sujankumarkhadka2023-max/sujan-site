# Content Platform

## Repository

- frontend-public/
- frontend-developer/
- backend/
- database/
- wrangler.toml

## Cloudflare resources

Create a D1 database and an R2 bucket.

Set the D1 database ID in `wrangler.toml`.

Set the R2 bucket name in `wrangler.toml`.

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
The public website uses `frontend-public/assets/site-header.png` as the full-width top header image. The image keeps its original aspect ratio and scales to the full horizontal width of the application.
