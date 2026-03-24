# AI Agent Build Plan
## UTM Conversion Tracker — Complete Site

> Feed this file to your AI coding agent. Each task is self-contained and sequentially ordered.
> Complete one stage fully before moving to the next. Tick off tasks as done.
> Reference docs: `PRD.md`, `DESIGN.md`, `TECH_STACK_AND_API.md`

---

## STAGE 0 — Project Scaffold

Goal: Monorepo structure with both apps initialized and wired up.

- [x] **0.1** Create root folder `site/` with two subfolders: `backend/` and `frontend/`
- [x] **0.2** In `backend/`: run `npm init -y`, install dependencies:
  ```
  express mongoose bcrypt jsonwebtoken cors dotenv zod express-rate-limit crypto
  ```
- [x] **0.3** In `backend/`: create `.env` file with keys: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `BASE_URL`, `ALLOWED_ORIGINS`
- [x] **0.4** In `backend/`: create `.env.example` with the same keys but empty values (safe to commit)
- [x] **0.5** In `frontend/`: scaffold a **Vite + React** project (`npm create vite@latest`)
- [x] **0.6** In `frontend/`: install dependencies:
  ```
  tailwindcss @tailwindcss/vite react-router-dom zustand @tanstack/react-query axios lucide-react sonner shiki react-hook-form
  ```
- [x] **0.7** In `frontend/`: install and configure `shadcn/ui` (`npx shadcn@latest init`) — dark theme, CSS variables on, zinc base color
- [x] **0.8** In `frontend/`: create `.env.local` with `VITE_API_BASE_URL=http://localhost:4000`
- [x] **0.9** In root `site/`: create `README.md` with local dev startup instructions for both apps
- [x] **0.10** Init a git repo in `site/`, create `.gitignore` covering `node_modules/`, `.env`, `.env.local`, `dist/`

---

## STAGE 1 — Backend: Models & Database

Goal: All Mongoose models defined and connected.

- [x] **1.1** In `backend/`: create `server.js` — sets up Express app, connects Mongoose, loads env, mounts routes, starts server on `PORT`
- [x] **1.2** Create `backend/models/User.js`:
  - Fields: `email` (unique), `password` (bcrypt), `apiKey` (unique, prefixed `usr_`), `config` object (`triggerPage`, `buttonId`, `fields` array of `{ key, id }`)
  - Include `createdAt` timestamp
- [x] **1.3** Create `backend/models/Conversion.js`:
  - Fields: `userId` (ref to User), `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `captured` (Mixed — stores any key-value pairs from form), `page_url`, `timestamp`
  - Index on `userId` + `timestamp` for fast dashboard queries

---

## STAGE 2 — Backend: Middleware

Goal: Reusable auth and validation middleware.

- [x] **2.1** Create `api/middleware/apiKeyAuth.js` — reads `X-API-Key` header, looks up User, attaches to `req.user`, returns 401 if missing or invalid
- [x] **2.2** Create `api/middleware/jwtAuth.js` — reads `Authorization: Bearer` header, verifies JWT, attaches `req.user` (contains `id`), returns 401 on failure
- [x] **2.3** Create `api/middleware/validate.js` — takes a Zod schema, validates `req.body`, returns 400 with field-level error message on failure

---

## STAGE 3 — Backend: Routes

Goal: All API endpoints implemented and tested.

- [x] **3.1** Create `api/routes/auth.js`:
  - `POST /api/auth/register` — validate email+password, bcrypt hash, generate `usr_` API key via `crypto.randomBytes(20).toString('hex')`, create User, return `{ apiKey }`
  - `POST /api/auth/login` — validate credentials, return `{ token, apiKey }`
  - Rate limit login to 10 req/min per IP

- [x] **3.2** Create `api/routes/track.js`:
  - `POST /api/track` — protected by `apiKeyAuth`
  - Destructure `utm_*`, `page_url`, `timestamp` from body; put everything else into `captured` object
  - Save new Conversion document
  - Return `{ ok: true }`
  - Apply CORS fully open on this route only (any origin — snippet calls come from client sites)
  - Rate limit to 100 req/min per API key

- [x] **3.3** Create `api/routes/dashboard.js` — all routes protected by `jwtAuth`:
  - `GET /api/dashboard/conversions` — supports query params: `source`, `from`, `to`, `limit` (default 50, max 500), `page`; returns `{ total, page, limit, conversions[] }`
  - `GET /api/dashboard/conversions/export` — same filters, returns CSV response with dynamic columns for all captured field keys found in the dataset
  - `GET /api/dashboard/config` — returns user's current config object
  - `POST /api/dashboard/config` — validates and saves `{ triggerPage, buttonId, fields[] }` to User document
  - `GET /api/dashboard/snippet` — calls `snippetGenerator.js`, returns `{ snippet }`, returns 400 if config not yet saved
  - `GET /api/dashboard/apikey` — returns `{ apiKey }`
  - `POST /api/dashboard/apikey/regenerate` — generates new API key, saves, invalidates old, returns `{ apiKey, warning }`

- [x] **3.4** Create `api/lib/snippetGenerator.js`:
  - Takes `(apiKey, config, baseUrl)` as arguments
  - Returns the full IIFE `<script>` string with values interpolated
  - The script must include: `saveUTM()` on every page, `DOMContentLoaded` listener, trigger page check, button click listener, silent `fetch` POST to `/api/track`

- [x] **3.5** Mount all routes in `server.js` at correct paths, apply global CORS (allow `ALLOWED_ORIGINS`), apply `express.json()`

---

## STAGE 4 — Backend: Verification

Goal: Confirm every endpoint works before touching the frontend.

- [x] **4.1** Start server locally, connect to MongoDB Atlas (or local MongoDB)
- [x] **4.2** Test `POST /api/auth/register` — creates user, returns API key
- [x] **4.3** Test `POST /api/auth/login` — returns JWT + API key
- [x] **4.4** Test `POST /api/track` with `X-API-Key` header and a mix of UTM + custom captured fields
- [x] **4.5** Test `GET /api/dashboard/conversions` — verify the conversion from 4.4 appears with correct `captured` object
- [x] **4.6** Test `POST /api/dashboard/config` — save a config with 3 field mappings
- [x] **4.7** Test `GET /api/dashboard/snippet` — confirm the returned script contains the API key, triggerPage, buttonId, and field IDs
- [x] **4.8** Test `GET /api/dashboard/conversions/export` — confirm CSV downloads with correct columns
- [x] **4.9** Test `POST /api/dashboard/apikey/regenerate` — confirm old key stops working, new key works

---

## STAGE 5 — Frontend: Foundation

Goal: React app routing, auth state, and API client wired up.

- [x] **5.1** Create `dashboard/src/lib/api.js` — Axios instance with:
  - `baseURL` from `VITE_API_BASE_URL`
  - Request interceptor: injects `Authorization: Bearer <token>` from Zustand store on every request
  - Response interceptor: on 401, clears auth state and redirects to `/login`

- [x] **5.2** Create `dashboard/src/lib/auth.js` — Zustand store with:
  - State: `token`, `apiKey`, `isAuthenticated`
  - Actions: `login(token, apiKey)`, `logout()`, `setApiKey(key)`
  - Persist to `localStorage`

- [x] **5.3** Create `dashboard/src/hooks/useAuth.js` — exposes store state + actions, adds `isLoading` for initial hydration

- [x] **5.4** Create `dashboard/src/hooks/useConversions.js` — React Query hook wrapping `GET /api/dashboard/conversions`, supports filter params

- [x] **5.5** Create `dashboard/src/hooks/useConfig.js` — React Query hooks for `GET` and `POST /api/dashboard/config`

- [x] **5.6** Set up React Router in `App.jsx`:
  - Public routes: `/`, `/login`, `/register`
  - Protected routes (redirect to `/login` if not authenticated): `/dashboard`, `/dashboard/configure`, `/dashboard/snippet`, `/dashboard/apikey`
  - Create `<ProtectedRoute>` wrapper component

---

## STAGE 6 — Frontend: Home Page

Goal: Complete public home page. Refer to DESIGN.md Section 3.

- [ ] **6.1** Create `src/pages/Home.jsx` as the root layout with Navbar, sections, and Footer

- [ ] **6.2** Build **Navbar**:
  - Logo: wordmark + small indigo dot
  - Links: Docs, Pricing (disabled with "Coming soon" tooltip), Login
  - `Get Started` button → `/register`
  - Sticky, backdrop blur on scroll

- [ ] **6.3** Build **Hero section**:
  - H1 (max 680px, centered): "Know exactly which ad drove your leads"
  - Subtext in muted color
  - Two CTA buttons: `Start Free` → `/register`, `View Docs ↗` → scrolls to API section on home or links to `/docs`
  - Animated code block below CTAs showing a fake sample snippet
    - Syntax highlighted (strings teal, keywords purple)
    - Typewriter animation on load (use `useEffect` + `setInterval`, 18ms per char)
    - Copy button in top-right

- [ ] **6.4** Build **How It Works** section (3 horizontal cards):
  - Cards: "Register + get key", "Configure fields", "Paste + track"
  - Large muted step number watermark behind each card
  - Icons from Lucide: `Key`, `Sliders`, `Code2`

- [ ] **6.5** Build **Features Grid** (2×2):
  - Any Form Fields, UTM Attribution, Session-Safe Tracking, CSV Export
  - Icon + title + 1-line description per card
  - Cards use `--bg-surface` with subtle border

- [ ] **6.6** Build **CTA Banner** section:
  - "Start tracking in 5 minutes."
  - Single `Create Free Account` button → `/register`

- [ ] **6.7** Build **Footer**:
  - Left: © 2026 Nexorel
  - Right: Docs · Privacy · contact email
  - Single row, border top

- [ ] **6.8** Apply global CSS variables from DESIGN.md Section 2 in `index.css` or Tailwind config — colors, font (use a characterful font, NOT Inter/Roboto/Arial, pick something fitting for a dev-tool SaaS)

---

## STAGE 7 — Frontend: Auth Pages

Goal: Login and Register pages, wired to API.

- [ ] **7.1** Create `src/pages/Register.jsx`:
  - Centered card, 420px
  - Email + password fields using React Hook Form
  - On success: save token + apiKey to Zustand, redirect to `/dashboard`
  - Show field-level errors (from API 400 responses)

- [ ] **7.2** Create `src/pages/Login.jsx`:
  - Same layout as Register
  - On success: same Zustand + redirect flow
  - "Don't have an account? Register" link

- [ ] **7.3** Create shared `src/components/AuthCard.jsx` — reusable wrapper used by both pages (card container, logo, heading slot, form slot)

---

## STAGE 8 — Frontend: Dashboard Shell

Goal: Sidebar navigation layout wrapping all dashboard pages.

- [ ] **8.1** Create `src/components/Sidebar.jsx`:
  - Nav items: Overview, Configure, Snippet, API Key
  - Active state: indigo left border + accent text color
  - Bottom: user email + Logout button (calls `logout()` from Zustand, redirects to `/`)
  - Width: 220px, fixed

- [ ] **8.2** Create `src/layouts/DashboardLayout.jsx`:
  - Sidebar (left) + main content area (right)
  - Top bar: breadcrumb based on current route + user email (right-aligned)
  - Wraps all `/dashboard/*` routes

- [ ] **8.3** Collapse sidebar to icon-only bottom bar on mobile (< 768px)

---

## STAGE 9 — Frontend: Dashboard Pages

Goal: All four dashboard views functional.

### Overview (Conversions Table)

- [ ] **9.1** Create `src/pages/dashboard/Overview.jsx`:
  - Page heading: "Conversions" + `Export CSV` button (right)
  - Filter bar: Source dropdown, Date Range picker (from/to)
  - Table with columns: Timestamp, Source (badge), Medium, Campaign, Captured ↗
  - Clicking a row expands a sub-row showing all `captured` key-value pairs as pills
  - Pagination: prev/next, 50 rows per page

- [ ] **9.2** Create `src/components/UtmBadge.jsx`:
  - Renders colored badge per source: google=blue, meta=indigo, chatgpt=teal, others=grey
  - Lowercase, pill shape, small

- [ ] **9.3** Create `src/components/ConversionRow.jsx`:
  - Table row + expandable captured fields sub-row
  - Expand/collapse toggle on row click

- [ ] **9.4** Empty state: illustration (SVG inline) + "No conversions yet. Paste your snippet to start tracking."

- [ ] **9.5** Wire `Export CSV` button to `GET /api/dashboard/conversions/export` — trigger file download via creating a blob URL

### Configure

- [ ] **9.6** Create `src/pages/dashboard/Configure.jsx`:
  - Load current config via `useConfig` hook on mount (pre-fill fields)
  - Input: Trigger Page Pathname
  - Input: Submit Button DOM ID
  - Dynamic field mapping table:
    - Each row: Key input + DOM Element ID input + trash icon button
    - `Add Field` button appends a new empty row
    - Minimum 1 row enforced
  - `Save Configuration` button → `POST /api/dashboard/config`
  - Success toast: "Configuration saved ✓"
  - Warn if saved while fields are empty

- [ ] **9.7** Create `src/components/FieldRow.jsx`:
  - Single row in the field mapping table
  - Two text inputs (key, id) + trash `X` button
  - On key input: auto-lowercase, no spaces (enforce on change)

### Snippet

- [ ] **9.8** Create `src/pages/dashboard/Snippet.jsx`:
  - Fetch snippet from `GET /api/dashboard/snippet`
  - Show warning banner if config not saved: "⚠ Save your configuration first"
  - Code block: full snippet, syntax highlighted, monospace, dark background
  - `Copy Snippet` button — on click: `navigator.clipboard.writeText(snippet)`, show "Copied! ✓" for 2s
  - "How to install" section (static):
    1. Install WPCode plugin in WordPress
    2. Add Snippet → paste code
    3. Set Location: Site Wide Header
    4. Activate

- [ ] **9.9** Create `src/components/CodeBlock.jsx`:
  - Reusable: takes `code` string + optional `language` prop
  - Uses Shiki for syntax highlighting (or Prism as fallback)
  - Copy button in top-right corner
  - Monospace font, dark bg, padding, border-radius

### API Key

- [ ] **9.10** Create `src/pages/dashboard/ApiKey.jsx`:
  - Load key from `GET /api/dashboard/apikey`
  - Masked display: `usr_4fa3...b91c` with eye toggle to reveal full key
  - Copy button
  - `Regenerate Key` button → opens `<ConfirmModal>`

- [ ] **9.11** Create `src/components/ConfirmModal.jsx`:
  - shadcn `AlertDialog` wrapper
  - Takes `title`, `description`, `onConfirm`, `onCancel` props
  - Used for API key regeneration — body text: "This will break any existing snippets using the old key."

---

## STAGE 10 — Frontend: Shared Components & Polish

Goal: Global UX polish, shared utilities.

- [ ] **10.1** Create `src/components/Toast.jsx` — configure Sonner `<Toaster>` globally in `App.jsx`, expose `toast.success()` / `toast.error()` helper
- [ ] **10.2** Add loading skeletons to Conversions table (show while React Query is fetching)
- [ ] **10.3** Add loading spinner to all submit buttons (disable button + show spinner while API call is in-flight)
- [ ] **10.4** Make entire dashboard responsive:
  - Sidebar → bottom icon bar on < 768px
  - Table → card-per-row layout on < 480px
  - Configure field rows → stack vertically on mobile
- [ ] **10.5** Add `<title>` meta tags per page using React Router's approach or `react-helmet-async`
- [ ] **10.6** Test all error states: wrong password, duplicate email, expired JWT, invalid API key, config not saved

---

## STAGE 11 — The Snippet (Final Version)

Goal: The production-ready `<script>` that users paste into WordPress.

- [ ] **11.1** Write the final IIFE snippet in `api/lib/snippetGenerator.js`. It must:
  - Save all 5 UTM params to `sessionStorage` on every page load if present in URL
  - Only attach click listener on the configured `triggerPage` (pathname match)
  - Read all configured field IDs from DOM at click time
  - Send `POST /api/track` with `X-API-Key` header, all UTMs, all captured fields, `page_url`, `timestamp`
  - Wrap everything in try-catch — never throw, always silent-fail
  - Fire only if `utm_source` exists in session (skip untracked visitors — configurable comment in code)
  - Be minification-safe (no reliance on whitespace)

- [ ] **11.2** Manually test the snippet on a WordPress staging site:
  - Add UTM params to a page URL, navigate to another page, submit form
  - Confirm conversion appears in dashboard with correct UTMs and captured fields
  - Confirm snippet does NOT break the page when UTMs are absent
  - Confirm snippet does NOT break the page when configured field IDs don't exist in the DOM

---

## STAGE 12 — Deployment

Goal: Both apps live on public URLs.

- [ ] **12.1** Push `api/` to **Railway**:
  - Set all env vars from `.env` in Railway dashboard
  - Confirm `PORT` is set to Railway's auto-assigned port (use `process.env.PORT`)
  - Confirm MongoDB Atlas IP whitelist includes Railway server IP (or set `0.0.0.0/0` for MVP)

- [ ] **12.2** Push `dashboard/` to **Vercel**:
  - Set `VITE_API_BASE_URL` to the Railway public URL
  - Confirm build passes (`npm run build`)

- [ ] **12.3** Update `ALLOWED_ORIGINS` in Railway env to include the Vercel production URL

- [ ] **12.4** Smoke test the full flow on production:
  - Register → get API key
  - Configure fields + page
  - Copy snippet → paste into WordPress (WPCode)
  - Visit site with `?utm_source=google&utm_medium=cpc&utm_campaign=test`
  - Submit the configured form
  - Open dashboard → confirm conversion row appears with correct data

- [ ] **12.5** Test `Export CSV` on production — download and verify column headers match captured fields

---

## Summary

| Stage | What Gets Built | Output |
|---|---|---|
| 0 | Monorepo scaffold | Folder structure, deps, env files |
| 1 | DB models | `User.js`, `Conversion.js` |
| 2 | Middleware | API key auth, JWT auth, Zod validation |
| 3 | API routes | All endpoints + snippet generator |
| 4 | API verification | Every endpoint tested locally |
| 5 | Frontend foundation | Routing, auth store, API client, hooks |
| 6 | Home page | Full public landing page |
| 7 | Auth pages | Login + Register |
| 8 | Dashboard shell | Sidebar + layout |
| 9 | Dashboard pages | Overview, Configure, Snippet, API Key |
| 10 | Polish | Skeletons, mobile, errors, toasts |
| 11 | Final snippet | Production IIFE + WordPress test |
| 12 | Deploy | Railway + Vercel, smoke test |

**Total tasks: 58**
