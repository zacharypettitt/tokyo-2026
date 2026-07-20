# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, no-build personal travel site: a day-by-day recap and recommendation guide for a Tokyo/Hakone trip (March 31 – April 9, 2026). Plain HTML/CSS/JS, no framework, no package manager, no bundler. Pushed to `origin/main` on GitHub (`zacharypettitt/tokyo-2026`), which is a **public** repo — never commit secrets (e.g. the site passcode) into any file here.

## Commands

There is no build, lint, or test tooling — there's no `package.json`. Just edit the `.html`/`.css`/`.js` files directly.

To preview locally, serve the folder with any static file server, e.g.:
```
python -m http.server 8000
```
then open `http://localhost:8000/index.html`.

**The live site is gated behind a client-side passcode** (`js/passgate.js`, included at the top of `<body>` on every page — it overlays the page until the entered value's SHA-256 hash matches the `HASH` constant). This blocks straightforward automated browser QA. To visually verify changes with a browser tool, copy the relevant `.html` files plus `css/`, `js/`, `img/` into a scratch directory, strip the `<script src="js/passgate.js"></script>` line from *those copies only*, and serve/preview from there. Never remove or weaken the passgate script in the real repo files, and never write the plaintext passcode into any tracked file.

## Architecture

**One shared stylesheet, one shared script.** Every page (`index.html`, `timeline.html`, `logistics.html`, `sights.html`, `food.html`, `disney.html`, `map.html`) links the same `css/style.css` and `js/main.js`, and repeats the same header/nav/footer markup verbatim. There's no templating — shared markup changes (nav links, footer text, etc.) must be hand-edited across every page.

**Per-page color theming via a `body` class.** Each `<body>` has a `page-*` class (`page-home`, `page-timeline`, `page-logistics`, `page-sights`, `page-food`, `page-disney`, `page-map`) that sets the CSS custom properties `--accent`/`--accent-ink` to that page's theme color (defined near the top of `style.css`, e.g. sights = matcha green, logistics = indigo, disney = gold). Everything else in the stylesheet reads from `--accent`, so adding a new themed page means adding one `body.page-x { --accent: …; --accent-ink: …; }` rule.

**`style.css` is layered, and later sections intentionally override earlier ones** — keep new rules in the right layer rather than fighting an earlier one:
1. Tokens/reset/base components (nav, buttons, cards, filters, footer)
2. Page-specific components (hero, timeline, prose blocks)
3. "Warmth layer" — a later block that re-skins the base components with softer surfaces/glows; comments explicitly say to keep it last
4. "Link warmth layer" — turns inline prose links into tinted chips instead of underlines
5. Real-photo (`.photo`) rules and the tap-to-zoom lightbox rules, appended at the very end

**Placeholder vs. real photos.** Cards/sections without a photo yet use `.ph`/`.ph--4x3` etc. (a dashed "写真" placeholder block with a `.ph__label` caption describing what should go there). Once a photo exists, swap it for `<img class="photo photo--4x3" src="…" alt="…">` — same aspect-ratio modifier classes work on both. `git log`/`git grep '\.ph--'` shows which cards are still awaiting photos.

**Card variants** (`sights.html`/`food.html`): `.card` is the base; `.card--wide` + `.card__inner` makes a two-column card (used for landmark write-ups); `.card__media--split` inside `.card--wide` shows two photos side-by-side (e.g. Tokyo Tower + its view); `.card--muted` dims a card for a "we'd skip this" recommendation. Filtering is data-driven: `[data-filter-group]` + `.chip[data-filter]` buttons toggle visibility of `[data-card][data-tags]` elements by matching tag text — wired up generically in `main.js`, no page-specific JS needed.

**Timeline (`timeline.html`)**: each day is a `<details data-day="N">`. `main.js` opens all of them on desktop (`min-width: 721px`) and closes them on mobile, syncing on breakpoint crossings only (so a user's manual toggle within a breakpoint isn't fought). `.linkcards`/`.linkcard--sights`/`.linkcard--food` cross-link a day's narrative to anchors on `sights.html#id`/`food.html#id`.

**Tap-to-zoom lightbox**: opt-in, not automatic — add a bare `data-zoom` attribute to any `<img class="photo">` and `main.js` wires it into a single lazily-created lightbox overlay (click/tap/Enter to open, click backdrop/close button/Escape to close, focus is trapped and restored). Currently only used on `disney.html`'s Shinjuku bus wayfinding photos.

**Map (`map.html`)**: embeds a Google My Maps map (an `<iframe>` in the `.embed--map` slot) referenced by its `mid`. The embed pulls the map's live state, so pins added/edited in Google My Maps appear automatically with no code change — as long as it stays the same map (same `mid`) and its sharing stays "Anyone with link can view." A caption below links to the public `/maps/d/viewer?mid=…` version. See the `reference-tokyo-mymaps` memory for the specific map ID/URLs.

**Known gaps**: every page's `<meta property="og:image">` points at `img/ui/og.png`, which doesn't exist yet. The `food.html` "Katsuya" card is the one remaining card still on a `.ph` placeholder (awaiting an actual katsu photo).

**Image pipeline**: raw phone exports (often `.HEIC`) get dropped in a sibling folder, `../toyko-2026-site/img/<section>/` (note the typo in that folder name — it is *not* this repo, has no git). Convert to JPEG, apply EXIF-based orientation correction, resize to a 1600px-longest-side cap, and save at ~85% quality before placing the result in this repo's `img/<section>/` — that matches the existing site's ~150–500KB per-photo profile.
