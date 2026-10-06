# SUJAN KUMAR KHADKA

Two separate sites. Upload each folder to its own GitHub repo (or one repo, two Cloudflare Pages projects).

- `public/` : public website (Cloudflare Pages root = `public`). No developer link anywhere.
- `developer/` : private dashboard on its own address (e.g. dev.yourdomain). Never link to it from public.

## Publishing flow
1. Open the developer site, log in.
2. Import current `public/data/content.json`, add stories / edit footer and site settings.
3. Download `content.json`, replace `public/data/content.json` in GitHub.

## Change the password
Login: user `admin`, password `ChangeMe-2026`. Change it now: open `developer/hash.html`, generate a hash, paste it into `developer/js/auth.js`.

## Security note
The login runs in the browser, so it only keeps casual visitors out. For real protection, put the developer site behind Cloudflare Access (Zero Trust, free).
