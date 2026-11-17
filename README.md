# Quranic Core — Cloudflare Pages (GitHub integration)

Static website (plain HTML/CSS/JS, no framework) + one Cloudflare Pages Function for the "Ask a Question" email.

## Repository layout (this folder IS the repo root)
- `quranic-core.html`  source of the site content/styling
- `build.mjs`          generates the multi-page site into `website/` (Node 18+, no dependencies)
- `assets/`            logo, banner, icons (copied into `website/assets/` by the build)
- `website/`           generated site = Cloudflare build output (also committed as a ready fallback)
- `functions/api/ask.js`  Cloudflare Pages Function -> POST /api/ask (emails via Resend)
- `tests/`             optional tests
- `package.json`, `.node-version`  build configuration

## Cloudflare Pages settings
- Production branch: main
- Framework preset: None
- Build command: node build.mjs
- Build output directory: website
- Root directory: (leave empty)

## Variables and Secrets (Settings -> Variables and Secrets)
- RESEND_API_KEY  (type: Secret)  required for the question form
- SITE_URL        (type: Text)    your real address, e.g. https://your-site.pages.dev  (no trailing slash)
- FROM_EMAIL      (optional)      e.g. Quranic Core <no-reply@your-domain.com> after verifying the domain in Resend
- ALLOWED_ORIGIN  (optional)      same value as SITE_URL, restricts who can call /api/ask
After adding or changing variables, redeploy (Deployments -> Retry / push a commit).

## Changing the site
Edit `quranic-core.html` (and `build.mjs` if page templates change), run `node build.mjs`, commit and push.
