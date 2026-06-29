# RapidAid

**RapidAid is live — just open it in your browser:**

### 👉 https://main.d2h3lh72uw4b1b.amplifyapp.com

No install, no setup, nothing to download. Create a free account (email + password) to sign in, then submit an aid request or work the responder dashboard. Everything below is for people who want to *develop* RapidAid; if you just want to *use* it, the link above is all you need.

---

## What it is

A disaster-relief aid-matching web app that connects people who need help with responders who can provide it:

- **Submit aid requests** — post a request with your location and a free-text description of what you need (name optional).
- **AI categorization** — Google Gemini reads each request server-side and tags it with one or more of Medical, Food, Water, Shelter, or Other.
- **Responder dashboard** — browse, filter, and sort every request, with live stats on response progress and completion rate.
- **Status workflow** — track each request through unclaimed → claimed → completed, with one-click status changes.
- **Directions** — open any request's location straight in Google Maps.

Requests are **shared across all signed-in users** — stored in DynamoDB behind an AppSync GraphQL API, with Amazon Cognito guarding access. Responders act on each other's requests, which is the point.

## Using it

1. **Create an account / sign in** at the link above — RapidAid is behind a login wall, so you'll verify your email once via a Cognito code.
2. **Submit a request** — enter your location and describe what you need; Gemini categorizes it automatically.
3. **Open the dashboard** to see every request, filter by category/status, and sort newest/oldest.
4. **Claim and complete** requests as a responder — claim one, mark it complete when done, or unclaim it to release it back.
5. **Get directions** to any request's location via the 📍 button.

---

## Local development

RapidAid is a **React 19 + Vite 7** single-page app on a **full AWS Amplify Gen 2 backend** (TypeScript, code-first under `amplify/`): Cognito auth, AppSync + DynamoDB for data, and a Lambda that runs Gemini categorization so the API key never reaches the browser.

Prereqs: Node 18+/20+/22, an AWS account with credentials configured (`aws sts get-caller-identity` must succeed), and `npx ampx --version` working.

```bash
npm install
```

The backend is deployed per-developer as a sandbox, which also generates the config the app needs:

```bash
# 1. Store the Gemini key as an Amplify secret (SSM SecureString — not a .env var):
npx ampx sandbox secret set GEMINI_API_KEY
# 2. Deploy a personal dev backend; this GENERATES amplify_outputs.json:
npx ampx sandbox --once   # first run in a new account/region triggers a one-time CDK bootstrap
```

> ⚠️ **`amplify_outputs.json` is generated and gitignored — the app won't compile without it.** It holds the live backend's Cognito/AppSync IDs. Run the sandbox (or let an Amplify build produce it) before `npm run dev`.

**Run the server:**

```bash
npm run dev          # dev server → http://localhost:5173
```

Other scripts: `npm run build` (production build to `dist/`), `npm run preview` (serve the build), `npm run lint` (ESLint).

> No automated test suite yet.

## Configuration (secrets)

The frontend reads **no `VITE_*` env vars** — all client config comes from the generated `amplify_outputs.json`. The only secret is the Gemini key, stored via `ampx` (not committed) and read by the Lambda as `process.env.GEMINI_API_KEY`.

| Secret | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Gemini key for AI categorization, used **only in the Lambda**. Set per environment: `npx ampx sandbox secret set GEMINI_API_KEY` (sandbox) or `npx ampx secret set GEMINI_API_KEY --branch <branch>` / the Amplify console (deployed branch). Get one from [Google AI Studio](https://makersuite.google.com/app/apikey). |

## Deployment & CI/CD

Hosted on **AWS Amplify**. Pushing to a connected GitHub branch triggers a build that runs the spec in **`amplify.yml`**: the backend phase deploys the Gen 2 backend with `ampx pipeline-deploy` (Cognito, AppSync, DynamoDB, the Gemini Lambda) and generates `amplify_outputs.json`; the frontend phase then builds the Vite app to `dist/`.

| Environment | Branch | URL |
|---|---|---|
| Production | `main` | https://main.d2h3lh72uw4b1b.amplifyapp.com |

- **Each Git branch gets fully isolated backend resources** — its own Cognito user pool, AppSync API, and DynamoDB tables. Accounts created against one branch don't exist on another.
- Connect the repo once in the Amplify console ("Deploy an app"); after that, **a push to `main` is the deploy** — Amplify auto-detects `amplify.yml` and rebuilds.
- Set the **`GEMINI_API_KEY`** secret per branch (see above) or the categorization Lambda fails.

## Architecture

A React/Vite SPA wrapped in Amplify's `<Authenticator>`, so nothing renders until a user signs in. `App.jsx` wires the router (`/` + `/submit` → submit page, `/dashboard` → responder dashboard); components live in `src/components/`, pages in `src/pages/`. Service singletons in `src/services/` do the work — `geminiService.js` (calls the server-side categorization mutation), `databaseService.js` (an adapter over the AppSync data client), and `amplifyClient.js` (the shared client). The TypeScript backend lives in `amplify/` (`auth`, `data`, and the `categorize-request` function). For the full architecture, data model, and authorization rules, see **[CLAUDE.md](CLAUDE.md)**, kept current with every architecture-level change.

## Origins

RapidAid started as a [ShellHacks](https://shellhacks.net/) 2025 hackathon project (IndexedDB). I forked it from my original team's repo and extended it well beyond the hackathon build — first migrating the data layer to a shared Supabase Postgres backend, then re-architecting the entire stack onto **AWS Amplify Gen 2**: Cognito authentication, an AppSync + DynamoDB shared data model, and server-side Gemini categorization in a Lambda, deployed via Amplify Hosting.
