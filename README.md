# aarondavidge.com

Static personal site, deployed to GitHub Pages. No build step is required to
*deploy* — the compiled stylesheet is committed. The build step exists so you can
edit styles in one place instead of nine.

## File map

```
.
├── index.html               home
├── contact.html             contact + A4RON.AI comms panel
├── security.html            responsible disclosure policy
├── disclosure.html          disclosure detail
├── content.html             Twitch broadcast + store/X/Instagram feed
├── assistant.html           A4RON.AI full-page chat
├── signin.html              placeholder
├── 404.html                 themed not-found (uses root-absolute paths — see note)
├── blog.html, store.html    redirect stubs to /blog/ and store.aarondavidge.com
├── blog/
│   ├── index.html           post listing
│   └── boot-sequence/       one post per folder
│
├── src/styles/main.css      ← THE stylesheet. Edit this one.
│
├── assets/
│   ├── css/site.css         compiled output — DO NOT EDIT (generated)
│   ├── js/
│   │   ├── analytics.js     GA4 + Meta Pixel — every page
│   │   ├── site.js          mobile menu, particles, EQ bars, nav highlight — every page
│   │   ├── a4ron.js         chat panel — index + assistant
│   │   ├── home.js          uptime, ops console, music toggle, GitHub tiles — index
│   │   ├── content.js       Twitch embeds + feed carousel — content
│   │   └── contact.js       contact form handler — contact
│   ├── img/                 hero.webp, hero.jpg
│   └── media/               theme.mp3
│
├── feeds.json               content-page feed data (see below)
├── favicon.*, apple-touch-icon.png,
│   card_image.jpg, aaron_resume.pdf      ← stay at the root on purpose (see below)
│
└── _headers, robots.txt, sitemap.xml, CNAME, .nojekyll, .well-known/
```

### Why some assets are still at the root

`favicon.*` and `apple-touch-icon.png` are requested from the root by browsers by
convention. `card_image.jpg` is the Open Graph image cached by Facebook, X and
LinkedIn under its current URL, and `aaron_resume.pdf` is the kind of link that
ends up pasted into job applications. Moving either would break links that live
outside this repo, so they stayed put. Everything internal moved into `assets/`.

## The design system

`src/styles/main.css` opens with a `:root` block of design tokens — colour,
type scale, spacing, radii, borders, elevation, motion, focus ring, safe-area
insets. **Everything below that block is forbidden from using a raw hex, rgba,
px size or duration.** If you need a value that doesn't exist, add a token
rather than inlining one. That single rule is what stops the UI drifting apart
again; it is how the codebase got to 26 font sizes and 7 different panel
paddings the first time.

The scale, in short:

| | tokens | use |
|---|---|---|
| type | `--text-2xs` 10 · `--text-xs` 11 · `--text-sm` 12 · `--text-md` 13 · `--text-lg` 14 · `--text-xl` 20 · `--text-title` · `--text-display` | 8 steps, nothing between |
| spacing | `--space-1` … `--space-10` | 4px rhythm |
| radii | `--radius-panel` 2px · `--radius-ctl` 6px · `--radius-pill` | panels are sharp, controls are soft |
| motion | `--dur-fast` 120ms press · `--dur` 220ms hover · `--dur-slow` 320ms transform · `--pulse` 3.2s ambient | |
| colour | `--bg` `--surface` `--line` `--ink-1…5` `--accent*` `--ok` `--warn` | |

The accent hue is defined once as channel triplets (`--c-accent: 59 130 246`)
and every glow, border and wash derives from it via `rgb(var(--c-accent) / a)`.
Change those three numbers and the entire UI re-tints.

**Panels use `.panel-pad`** — one responsive padding recipe (20 / 32 / 40px).
Do not put `p-6`, `p-7` or `lg:p-10` on a panel; that is exactly the drift the
class exists to prevent. The traffic-light strip is `.term-head` + `.term-dots`
+ `.term-cmd`, not pasted markup.

## App shell

The `APP SHELL` block in `main.css` is what makes the site read as an
application rather than a document, and it applies to every page automatically:

- **Focus** — one ring, `:focus-visible` only, so it appears for Tab and never
  for a mouse click. It is an `outline`, deliberately: components define their
  own hover box-shadows and a box-shadow ring loses the cascade to them.
- **Pressed states** — every control scales to .97 on `:active` at 120ms.
- **Tap targets** — 44px minimum under `@media (pointer: coarse)`. Links inline
  in a sentence opt out (WCAG 2.5.8 exempts them and 44px blocks would wreck the
  prose). Icon-only controls are matched by `a[aria-label]:has(> svg:only-child)`
  — the `[aria-label]` part is load-bearing, since `:only-child` ignores text
  nodes and would otherwise catch the wordmark and the CV button.
- **Safe areas** — `viewport-fit=cover` plus `env(safe-area-inset-*)`, so the
  fixed bottom bar clears the iPhone home indicator instead of sitting under it.
- **Touch** — no tap-highlight flash, no double-tap zoom delay, contained
  overscroll, momentum scrolling in horizontal rails.
- **Overflow** — the page never scrolls sideways. Content that cannot wrap
  (`pre`, the feed carousel) scrolls inside its own panel instead.

## Installable app

`manifest.webmanifest` + the `apple-mobile-web-app-*` meta make the site
installable to a home screen, launching standalone with no browser chrome, with
four shortcuts (Content, Blog, A4RON.AI, Contact). Icons are generated from
`favicon.svg` — `icon-192.png`, `icon-512.png` and a maskable 512 with 10%
padding so platform crops don't clip the art. Regenerate them if the favicon
changes. `@media (display-mode: standalone)` in the stylesheet is where
installed-only behaviour goes.

## Working on styles

All CSS lives in `src/styles/main.css` — Tailwind's theme, the component layer,
and the animations. **No page has a `<style>` block, and none should.** A change
in that one file reaches all 11 pages.

```bash
npm install          # once
npm run watch:css    # rebuild assets/css/site.css on save
npm run serve        # http://localhost:8000
```

Before committing, run a production build so the committed CSS is minified:

```bash
npm run build:css
```

`@source` directives at the top of `main.css` tell Tailwind which files to scan
for class names. `assets/js/*.js` is on that list deliberately: `site.js` and
`home.js` add utility classes at runtime (the nav underline, EQ bars, GitHub
tiles), and Tailwind would otherwise strip classes it can't see in the HTML.

## Working on scripts

Each module in `assets/js/` no-ops when its markup isn't on the page, so
`site.js` is safe to include everywhere. To add shared behaviour, add a guarded
IIFE to `site.js`; for page-specific behaviour, add a new file and link it in
that page only.

## Adding a blog post

Copy `blog/boot-sequence/` to `blog/<slug>/`, edit `index.html`, then add a card
to `blog/index.html` and a `<url>` entry to `sitemap.xml`.

## The nav

Every page carries the same eight-item nav — HOME, ABOUT, PROJECTS, SKILLS,
CONTENT, BLOG, STORE, CONTACT — in the same order, in both the horizontal bar
and the drawer. The drawer repeats all eight and appends SIGN IN.

The bar needs roughly 1190px to lay out eight items plus the logo and the two
buttons, so it appears at `xl` (1280px) and the burger menu covers everything
below that, phones and tablets alike. **If you add a ninth item, re-check that
breakpoint** — at `md` (768px), where it used to sit, the items ran off the edge
of the bar on every tablet width.

Adding or renaming a nav item means editing all nine pages: the `<ul class="hidden
xl:flex …">` block and the `#mobile-menu` list. They must stay identical.

## feeds.json

The content page's carousel reads `feeds.json` from the site root. The committed
file is an empty scaffold — three sources (`store`, `x`, `instagram`), each with a
`handle` and an empty `posts` array — so the page renders labelled placeholder
slots until real data lands. Post shape:

```json
{ "image": "https://…", "title": "…", "price": "$40", "available": true,
  "caption": "…", "text": "…", "permalink": "https://…", "timestamp": "2026-08-14" }
```

`store` uses `title`/`price`/`available`, `instagram` uses `image`/`caption`, and
`x` uses `text`. Set the top-level `updated` timestamp when a refresh job writes
the file; the page shows it under the carousel. A missing or invalid file is
handled — the placeholders simply stay.

## Twitch embeds

The player and chat only mount when the page is served from a hostname listed in
`PARENTS` in `assets/js/content.js` (`aarondavidge.com`, `www.aarondavidge.com`,
`44r0nd4vidg3.github.io`). Twitch refuses to frame otherwise. On localhost you
get the styled CHANNEL OFFLINE · STANDBY panel instead — that is expected, not a
bug. Add any new domain to `PARENTS`.

The iframes also need `frame-src` in the `_headers` CSP, which now allows
`player.twitch.tv`, `www.twitch.tv` and `embed.twitch.tv`. `img-src` was widened
to `https:` so feed images from the store and Instagram CDNs can load.

## A note on 404.html

GitHub Pages serves `404.html` for *any* unmatched path, including nested ones
like `/blog/typo/`. Its asset and nav links are therefore root-absolute
(`/assets/css/site.css`, not `assets/css/site.css`) — with relative paths the
page renders unstyled at any depth below the root. Keep them absolute.

See `DEPLOY.md` for hosting and go-live details.
