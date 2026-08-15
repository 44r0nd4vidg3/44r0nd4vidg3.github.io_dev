# Deployment Guide — aarondavidge.com

Production-ready static site. No build step required at deploy time — the compiled
CSS is committed. See `README.md` for the project layout and the stylesheet build.

## Files to deploy (upload all of these)

**Pages**
- `index.html` — home
- `contact.html` — contact + A4RON.AI comms panel
- `security.html` / `disclosure.html` — responsible disclosure policy
- `assistant.html` — A4RON.AI full-page chat
- `content.html` — Twitch broadcast + store / X / Instagram feed
- `blog/` — post listing plus one folder per post
- `blog.html`, `store.html` — redirect stubs to `/blog/` and store.aarondavidge.com
- `signin.html` — "coming soon" placeholder
- `404.html` — themed not-found page

**Assets** — the whole `assets/` folder
- `assets/css/site.css` — the single compiled stylesheet every page depends on
- `assets/js/` — `analytics.js`, `site.js`, `a4ron.js`, `home.js`, `contact.js`, `content.js`
- `assets/img/` — `hero.webp` + `hero.jpg` (WebP with JPEG fallback)
- `assets/media/` — `theme.mp3`

**Root-level assets** (deliberately not under `assets/` — external links depend on
these exact URLs)
- `favicon.svg`, `favicon-32.png`, `favicon-16.png`, `favicon.ico`, `apple-touch-icon.png`
- `card_image.jpg` — social share card, cached by Facebook/X under this URL
- `aaron_resume.pdf` — served by the Download CV button

**Config / SEO / security**
- `_headers` — security headers + CSP (Netlify / Cloudflare Pages format)
- `robots.txt`
- `sitemap.xml`
- `feeds.json` — data for the content page carousel (ships empty; safe to overwrite)
- `.nojekyll` — stops GitHub Pages running the file tree through Jekyll
- `.well-known/security.txt` — RFC 9116 (hidden folder — make sure it uploads)

**Not deployed** — `src/`, `package.json`, `package-lock.json`, `node_modules/`,
`README.md`, `DEPLOY.md`. Harmless if they ship (GitHub Pages serves the repo as-is),
but they are build/authoring files, not site output.

> `hero.png` and `card_image.png` (original source images, never referenced) have been removed from the project.

## Host-specific notes

- **Netlify / Cloudflare Pages:** `_headers` is picked up automatically. Set the 404
  by ensuring `404.html` is at the site root (both hosts use it by default).
- **Vercel:** translate `_headers` into `vercel.json` (`headers` array). 404 is automatic.
- **Apache:** convert `_headers` to `.htaccess` `Header set` directives; add
  `ErrorDocument 404 /404.html`.
- **Nginx:** move `_headers` values into `add_header` directives; `error_page 404 /404.html;`.

## Before you go live

1. Point `aarondavidge.com` DNS at the host; enable HTTPS (the HSTS header assumes TLS).
2. Create the `bugs@aarondavidge.com` mailbox (referenced by the security policy).
3. Optional: create `aaron@aarondavidge.com` for the contact links.
4. Verify the CSP doesn't block anything in your browser's console on first load.

## SEO & social (done)

- Home page ranks for "Aaron Davidge": real name in `<title>`, meta description,
  H-level body copy, PROFILE.DAT, and a JSON-LD `Person` schema (name, alternateName,
  jobTitle, sameAs links to GitHub/LinkedIn/X/Instagram, degree, knowsAbout).
- Open Graph + Twitter `summary_large_image` cards on index/contact/security, sharing
  `card_image.jpg` (1600×1127) with alt text — link previews render with the site screenshot card.
- `robots.txt` + `sitemap.xml` expose the 3 real pages; placeholders are `noindex`.
- **After deploy:** submit the site to Google Search Console and request indexing of `/`
  to speed up ranking for your name. Verify cards at the Facebook Sharing Debugger and
  the X Card Validator (they cache — re-scrape after any change).

## Content still to personalize

- Project tech-stack chips on the home page are best guesses — adjust to taste.

## When subdomains launch

Current state: STORE already points at `https://store.aarondavidge.com`, BLOG is
served locally from `/blog/`, and the assistant lives at `/assistant.html`.
`blog.html` and `store.html` remain as redirect stubs for old inbound links.

When a subdomain goes live, update the nav links in every page (they are the same
`<ul>` block in each `<head>`-adjacent navbar) and drop the matching stub plus its
`robots.txt` Disallow line.

## Security posture (MVP)

- 100% static — no server code, no database, no user input persisted. Minimal attack surface.
- CSP locks scripts/styles to self + inline (`'unsafe-inline'` is still required for
  the JSON-LD block on the home page and the Google/Meta tag loaders — all other
  scripts and styles are now external files under `assets/`, so this can be
  tightened to a nonce or hash if you want to drop `'unsafe-inline'` for scripts);
  images to self + `data:`; fonts to Google Fonts only; `frame-ancestors 'none'` blocks clickjacking.
- All external links use `rel="noopener"`. No `eval`, no `document.write`; the one dynamic
  DOM write uses `textContent` (no HTML injection path).
- HSTS with `preload` — only submit to the preload list once you're confident in permanent HTTPS.
