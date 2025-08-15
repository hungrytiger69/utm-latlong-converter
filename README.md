# New Multi-page Static Starter (No Build)

Minimal setup for a multi-page site on **Cloudflare Pages**, with a landing page, a Hello example, and a UTM app scaffold. Plain HTML/CSS/JS. No frameworks or bundlers.

## Core ideas
- Files map to URLs. Example: `/apps/utm/index.html` → `/apps/utm/`.
- Each app lives under `/apps/<name>/`.
- Shared assets under `/assets/`.
- Use `<script defer>` when your JS needs the DOM or other scripts.

## Structure
```
/index.html            # landing page
/apps/hello/
  index.html           # example app
  main.js              # per-app JS
/apps/utm/
  index.html           # UTM app page (loads proj4)
  main.js              # paste your converter IIFE here
/assets/
  css/main.css         # shared styles
  js/site.js           # tiny site helpers
/_redirects            # short links (/hello, /utm)
/_headers              # security & long cache for /assets/*
/404.html              # custom not-found
```

## Deploy (Direct Upload)
1. Cloudflare Dashboard → **Pages** → Create project → **Upload assets**.
2. Drag the folder with these files.
3. Add your **Custom Domain** under Pages → Custom domains (CNAME).

## URLs
- `/` → landing
- `/apps/hello/` (or `/hello`)
- `/apps/utm/` (or `/utm`)

## Add your converter
- Put your working IIFE into `apps/utm/main.js` (it already logs whether proj4 is loaded).
- Keep proj4 load in `apps/utm/index.html`:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/proj4/dist/proj4.js" defer></script>
  <script src="/apps/utm/main.js" defer></script>
  ```

## Cache tips
- `/assets/*` is set to long-cache. When you change `main.css` or `site.js`, bump a version query in HTML:
  ```html
  <link rel="stylesheet" href="/assets/css/main.css?v=2">
  <script defer src="/assets/js/site.js?v=2"></script>
  ```

## Local test
- Open `index.html` directly, or run a tiny server:
  ```bash
  python3 -m http.server 8080
  ```
  Visit `http://localhost:8080`.

## When to consider Vite (later)
- You want TypeScript/SCSS, bundling, minification, or hashed filenames. Then build to `/dist` and deploy that folder.
