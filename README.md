# RapidAid

**RapidAid is live — just open it in your browser:**

### 👉 https://dannibar-rapidaid-1c3b6ba96b7b.herokuapp.com/

No install, no setup, nothing to download. Submit an aid request or browse the responder dashboard — no account required. Everything below is for people who want to *develop* RapidAid; if you just want to *use* it, the link above is all you need.

---

## What it is

A disaster-relief aid-matching web app that connects people who need help with responders who can provide it:

- **Submit aid requests** — anyone can post a request with their location and a free-text description of what they need; no sign-up.
- **AI categorization** — Google Gemini reads each request and tags it with one or more of Food, Water, Shelter, Medical, or Other.
- **Responder dashboard** — browse, filter, and sort all requests, with live stats on response progress and completion rate.
- **Status workflow** — track each request through unclaimed → claimed → completed, with one-click status changes.
- **Directions** — open any request's location straight in Google Maps.

Requests are stored in a shared Supabase (Postgres) database and visible to everyone; Row-Level Security guards the data.

## Using it

1. **Submit a request** at the link above — enter your location and describe what you need (name is optional). Gemini categorizes it automatically.
2. **Open the dashboard** to see every request, filter by category/status, and sort newest/oldest.
3. **Claim and complete** requests as a responder — claim a request, mark it complete when done, or unclaim it to release it back.
4. **Get directions** to any request's location via the 📍 button.

---

## Local development

RapidAid is a React 19 + Vite single-page app with a hosted Supabase (Postgres) backend. The same Supabase project backs both local dev and production; AI categorization runs client-side against Gemini.

```bash
npm install
```

Create a `.env` file in the project root:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=https://pjjsasukxjafqrgnmzpe.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Get a Gemini key from [Google AI Studio](https://makersuite.google.com/app/apikey). The Supabase URL and publishable (anon) key are safe to expose in the browser — RLS protects the data. `.env` is gitignored.

**Run the server:**

```bash
npm run dev          # dev server → http://localhost:5173
```

Other scripts: `npm run build` (production build to `dist/`), `npm run preview` (serve the build), `npm run lint` (ESLint), `npm start` (run the production Express server on `$PORT`).

> No automated test suite yet.

## Configuration (production env vars)

All three are `VITE_`-prefixed, so Vite **inlines them at build time** — they must be set as Heroku config vars on each app (the local `.env` is not deployed). None are true secrets; Supabase RLS guards the data.

| Var | Required | Notes |
|---|---|---|
| `VITE_GEMINI_API_KEY` | ✅ | Gemini key for AI categorization. Without it, submitting throws "Gemini API key not configured". |
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL (`https://pjjsasukxjafqrgnmzpe.supabase.co`). |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase publishable (anon) key; read in `supabaseClient.js`. |

## Deployment & CI/CD

Deployed on **Heroku** via a staging → production pipeline (`rapidaid-pipeline`). RapidAid is a static SPA, so a small Express server (`server.js`) serves the built `dist/` and falls back to `index.html` for unknown paths — client-side routes like `/dashboard` survive a refresh. `Procfile` runs `web: node server.js`; `heroku-postbuild` builds on deploy; `engines.node` is pinned to `22.x`.

| Environment | Heroku app | URL |
|---|---|---|
| Production  | `dannibar-rapidaid`         | https://dannibar-rapidaid-1c3b6ba96b7b.herokuapp.com/ |
| Staging     | `dannibar-rapidaid-staging` | https://dannibar-rapidaid-staging-073f9159f86e.herokuapp.com/ |

- **Staging** (`dannibar-rapidaid-staging`) is the deploy target: `git push staging main`.
- **Production** (`dannibar-rapidaid`, the link at the top) is **never pushed directly** — it's promoted from staging deliberately once it looks good: `heroku pipelines:promote -a dannibar-rapidaid-staging`.
- ⚠️ Both environments share the **same Supabase project**, so staging and prod see the same live data. Use a separate Supabase project if you ever need them isolated.

## Architecture

A conventional Vite/React SPA: `App.jsx` wires the router and routes (`/` + `/submit` → submit page, `/dashboard` → responder dashboard); components live in `src/components/`, pages in `src/pages/`. Three service singletons in `src/services/` do the work — `geminiService.js` (categorization), `databaseService.js` (Supabase CRUD), and `supabaseClient.js` (the shared client). For the full architecture, data model, and RLS setup, see **[CLAUDE.md](CLAUDE.md)**, kept current with every architecture-level change.

## Origins

RapidAid started as a [ShellHacks] 2025 hackathon project. I forked it from my original team's repo, then extended it beyond the hackathon build — migrating the data layer to a shared Supabase Postgres backend, fixing production bugs, and deploying it to Heroku on a staging → production pipeline.
