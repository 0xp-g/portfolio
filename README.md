# yogesh.dev portfolio

React + Vite. Dark "ops console" theme with a vermilion (朱色) accent.

```bash
npm install
npm run dev      # local dev server
npm run build    # static site in dist/
```

**All content is in `src/data.js`** (profile, stats, projects, skills, experience log).
Theme colors are CSS variables at the top of `src/styles.css`.

## Features
- **Witch's-aura theme**: violet/black palette (tokens at the top of `src/styles.css`) with drifting miasma fog in the hero
- **Sound** (off by default, nav toggle): every effect is synthesized live in `src/sound.js` (Web Audio, no audio files)
- **死に戻り / return by death**: desaturate → clock spins backwards → snap → back to checkpoint (terminal `return-by-death`, stress-test reset, command menu, 404 page)
- **Case studies** at `/projects/<id>`: content lives in `src/cases.js` (⚠ review the drafted decisions and retro sections)
- **Achievements**: 10 hidden badges with unlock toasts, progress in the footer, `achievements` in the terminal
- **404 page** that returns you to the checkpoint
- **Social previews**: `public/og.png` (1200×630), Open Graph + Twitter tags, JSON-LD
- **EN ⇄ 日本語** toggle (nav, terminal `lang ja`, or the command menu). Japanese copy lives in the `ja:` fields of `src/data.js` and UI strings in `src/i18n.jsx`
- **Live GitHub data** fetched in the visitor's browser: activity feed, contribution heatmap, per-repo stars and last-push time. Cached 10 min and falls back gracefully if the API is rate-limited
- **Break my system**: interactive in-browser model of QueueLess (rushes, no-shows, counters, rolling service-rate estimate, prediction error)
- **Anime touches**: episode-style headers, eyecatch wipes, character profile with stat radar and special moves, “next episode” contact, ending card
- **限界突破 LIMIT BREAK**: Konami code (↑↑↓↓←→←→BA), `limit-break` in the terminal, or the button on the character sheet
- **Re:Zero nods**: loop counter in the footer, `return-by-death` terminal command
- Boot sequence (once per session, skippable, off for reduced-motion users)
- Hero with a live canvas "service mesh" that reacts to the cursor, a scrambling name and a rotating role line
- Command palette: `Ctrl/⌘ + K` or `/` (also the mobile menu)
- Projects as tabs, each with an animated architecture pipeline
- Stack explorer: pick a technology to see which projects use it
- Experience shown as a `git log`
- Working terminal (`help`, `projects`, `open 2`, `sudo hire-me`, `konnichiwa`, …)

## Deploy
Set the `SITE_URL` environment variable (e.g. `https://yogesh.vercel.app`) on your host so link previews use absolute URLs.
Client-side routes (`/projects/...`) need an SPA fallback: `vercel.json` (Vercel) and `public/_redirects` (Netlify) are included,
and the build copies `index.html` to `404.html` for GitHub Pages (which also needs a custom domain or a `base` change in `vite.config.js`).

Vercel or Netlify: import the repo; build command `npm run build`, output dir `dist`.
GitHub Pages: push `dist/` to a site served at the domain root (custom domain or `<user>.github.io`); for a `/repo/` subpath set `base` in `vite.config.js`.
