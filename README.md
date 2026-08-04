# Simplify Daily — Frontend

React 19 + Vite site for Simplify Daily: news, jobs, scholarships, and entertainment. Pairs with the `simplify-daily-backend` repo, which serves the admin auth API and `/rss.xml` feed.

## Run locally

1. `npm install`
2. In a sibling checkout of `simplify-daily-backend`, run its dev server (defaults to `http://localhost:3001`)
3. `npm run dev` — runs on `http://localhost:5173`, proxying `/api` and `/rss.xml` to the backend automatically (see `vite.config.ts`)

No `.env` needed for local dev. If your backend runs on a different port, set `VITE_BACKEND_DEV_URL` before starting Vite.

## Deploy (e.g. Vercel / Netlify free tier)

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL` set to the deployed backend's URL (no trailing slash)
- This is a client-side-routed SPA (no react-router, custom `pushState` handling in `App.tsx`) — configure your host to rewrite all paths to `/index.html` (Vercel/Netlify both do this by default for SPAs; if not, add a catch-all rewrite rule).

## Keeping content in sync

`src/data/articles.ts` is also used by the backend repo's RSS feed (as a standalone copy in `data/articles.ts` there). If you edit article content here, copy the same file into the backend repo too.
