# Tech Stack & API Documentation
## UTM Conversion Tracker — v1.0

---

## Part 1 — Tech Stack

### 1.1 Overview

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────┐
│  React + Vite   │────▶│  Express + Node.js   │────▶│ MongoDB  │
│  (Dashboard +   │     │  (REST API)           │     │ (Atlas)  │
│   Home Page)    │◀────│                      │     │          │
└─────────────────┘     └─────────────────────┘     └──────────┘
         ▲
         │  JWT (dashboard)
         │  X-API-Key (snippet → track endpoint)
```

---

### 1.2 Frontend

| Layer | Choice | Reason |
|---|---|---|
| Framework | **React 18** | Familiar, fast, great ecosystem |
| Build Tool | **Vite** | Fast HMR, clean output |
| Routing | **React Router v6** | SPA routing with protected routes |
| Styling | **Tailwind CSS v3** | Utility-first, pairs well with dark theme |
| UI Components | **shadcn/ui** | Headless, unstyled by default, copy-paste approach |
| State | **Zustand** | Lightweight global state (auth token, user config) |
| Data Fetching | **React Query (TanStack)** | Caching, background refetch for conversions table |
| Code Display | **Shiki** | Syntax highlighting for the snippet block |
| Forms | **React Hook Form** | Minimal re-renders, easy validation |
| Icons | **Lucide React** | Consistent icon set |
| Notifications | **Sonner** | Toast library, minimal |

**Folder structure:**
```
/src
  /pages
    Home.jsx
    Login.jsx
    Register.jsx
    /dashboard
      Overview.jsx        ← conversions table
      Configure.jsx       ← field mapper
      Snippet.jsx         ← generated code block
      ApiKey.jsx
  /components
    CodeBlock.jsx
    FieldRow.jsx
    ConversionRow.jsx
    UtmBadge.jsx
    ConfirmModal.jsx
    Sidebar.jsx
  /hooks
    useAuth.js
    useConversions.js
    useConfig.js
  /lib
    api.js                ← axios instance with JWT header injection
    auth.js               ← token store (Zustand)
```

---

### 1.3 Backend

| Layer | Choice | Reason |
|---|---|---|
| Runtime | **Node.js 20 LTS** | Stable, async-native |
| Framework | **Express 4** | Minimal, fast to ship |
| Database ORM | **Mongoose** | Schema + validation on top of MongoDB |
| Database | **MongoDB Atlas** (free tier) | Flexible schema for dynamic captured fields |
| Auth | **bcrypt + JWT** | Standard, stateless |
| Validation | **Zod** | Schema validation on request bodies |
| CORS | **cors** npm | Open CORS for `/api/track` (snippet calls from client sites) |
| Env | **dotenv** | Local; use platform env vars in production |
| API Key Gen | **Node crypto** | `crypto.randomBytes(20).toString('hex')` |

**Folder structure:**
```
/api
  /models
    User.js
    Conversion.js
  /routes
    auth.js
    track.js
    dashboard.js
  /middleware
    apiKeyAuth.js
    jwtAuth.js
    validate.js
  /lib
    snippetGenerator.js
  server.js
  .env
```

---

### 1.4 Infrastructure

| Concern | Choice | Notes |
|---|---|---|
| Backend hosting | **Railway** or **Render** (free tier) | Simple Node deploy, env vars, auto-deploy from GitHub |
| Frontend hosting | **Vercel** | Free tier, instant deploys, edge CDN |
| Database | **MongoDB Atlas** M0 | Free 512MB, plenty for MVP |
| Domain | nexorel.co subdomain e.g. `track.nexorel.co` | Or a standalone domain later |
| SSL | Automatic via Vercel + Railway | No config needed |

---

### 1.5 WordPress Integration

No plugin needed in MVP. Two options for snippet installation:

**Option A — WPCode (recommended)**
1. Install WPCode (free, formerly "Insert Headers and Footers")
2. Add Snippet → Code Snippet → HTML/JavaScript
3. Paste the generated `<script>` block
4. Set Location: "Site Wide Header"
5. Activate

**Option B — functions.php**
```php
function utm_tracker_snippet() {
  echo '<script>/* paste snippet here */</script>';
}
add_action('wp_head', 'utm_tracker_snippet');
```

---

## Part 2 — API Documentation

**Base URL:** `https://api.trackutm.app` (or your Railway URL)  
**Content-Type:** `application/json` for all POST/PATCH requests  
**Auth methods:**
- **Dashboard routes:** `Authorization: Bearer <jwt_token>`
- **Tracking route:** `X-API-Key: <api_key>`

---

### 2.1 Authentication

#### `POST /api/auth/register`

Register a new user account. Returns the API key.

**Request body:**
```json
{
  "email": "you@example.com",
  "password": "yourpassword"
}
```

**Response `201`:**
```json
{
  "apiKey": "usr_4fa3b1c9d2e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4",
  "message": "Account created"
}
```

**Errors:**
```json
{ "error": "Email already registered" }         // 409
{ "error": "Email and password required" }       // 400
```

---

#### `POST /api/auth/login`

Login and receive a JWT token + API key.

**Request body:**
```json
{
  "email": "you@example.com",
  "password": "yourpassword"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "apiKey": "usr_4fa3b1c9d2e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4"
}
```

**Errors:**
```json
{ "error": "Invalid credentials" }              // 401
```

---

### 2.2 Conversion Tracking

#### `POST /api/track`

Fire a conversion event from the browser snippet. This is the endpoint your `<script>` calls.

**Auth:** `X-API-Key` header  
**CORS:** Open (any origin allowed — required for cross-site usage)

**Request body:**

The body is flexible. You must include UTM fields. Everything else is whatever your config captures.

```json
{
  "utm_source":   "google",
  "utm_medium":   "cpc",
  "utm_campaign": "summer-sale-2025",
  "utm_content":  "banner-v2",
  "utm_term":     "web design agency",
  "page_url":     "https://yourclient.com/get-a-quote/",
  "timestamp":    "2026-03-15T10:32:00.000Z",

  "name":         "Ravi Sharma",
  "email":        "ravi@example.com",
  "phone":        "+91 98765 43210",
  "company":      "Sharma Enterprises"
}
```

> The fields after `timestamp` are your **dynamic capture fields** — whatever you configured in the dashboard. Send any keys. They are all stored.

**Response `200`:**
```json
{ "ok": true }
```

**Errors:**
```json
{ "error": "No API key" }                        // 401
{ "error": "Invalid API key" }                   // 401
```

**Snippet example (how the script calls this):**
```javascript
fetch('https://api.trackutm.app/api/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'usr_4fa3...'
  },
  body: JSON.stringify({
    utm_source:   sessionStorage.getItem('utm_source') || '',
    utm_medium:   sessionStorage.getItem('utm_medium') || '',
    utm_campaign: sessionStorage.getItem('utm_campaign') || '',
    utm_content:  sessionStorage.getItem('utm_content') || '',
    utm_term:     sessionStorage.getItem('utm_term') || '',
    name:         document.getElementById('wpforms-7209-field_1')?.value || '',
    email:        document.getElementById('wpforms-7209-field_2')?.value || '',
    page_url:     window.location.href,
    timestamp:    new Date().toISOString()
  })
}).catch(() => {}); // always silent fail
```

---

### 2.3 Dashboard (JWT Protected)

All routes below require: `Authorization: Bearer <token>`

---

#### `GET /api/dashboard/conversions`

Fetch all conversions for the logged-in user.

**Query params (all optional):**

| Param | Type | Example | Description |
|---|---|---|---|
| `source` | string | `google` | Filter by utm_source |
| `from` | ISO date | `2026-01-01` | Start of date range |
| `to` | ISO date | `2026-03-31` | End of date range |
| `limit` | number | `50` | Records per page (default 50, max 500) |
| `page` | number | `2` | Page number |

**Response `200`:**
```json
{
  "total": 142,
  "page": 1,
  "limit": 50,
  "conversions": [
    {
      "_id": "6612a3f4b5e9c10012345678",
      "utm_source": "google",
      "utm_medium": "cpc",
      "utm_campaign": "summer-sale-2025",
      "utm_content": "banner-v2",
      "utm_term": "",
      "captured": {
        "name": "Ravi Sharma",
        "email": "ravi@example.com",
        "phone": "+91 98765 43210"
      },
      "page_url": "https://yourclient.com/get-a-quote/",
      "timestamp": "2026-03-15T10:32:00.000Z"
    }
  ]
}
```

> Note: `captured` is an object with whatever fields were sent. No fixed schema.

---

#### `GET /api/dashboard/conversions/export`

Download all conversions as a CSV file.

**Query params:** same as above (filters apply)

**Response:** `text/csv` file download

```
timestamp,utm_source,utm_medium,utm_campaign,utm_content,utm_term,page_url,name,email,phone
2026-03-15T10:32:00.000Z,google,cpc,summer-sale-2025,banner-v2,,https://...,Ravi Sharma,ravi@example.com,+91 98765 43210
```

> Columns for `captured` fields are dynamically added based on keys present in the dataset.

---

#### `POST /api/dashboard/config`

Save the site configuration (trigger page, button ID, field mappings).

**Request body:**
```json
{
  "triggerPage": "/get-a-quote/",
  "buttonId": "wpforms-submit-7209",
  "fields": [
    { "key": "name",    "id": "wpforms-7209-field_1" },
    { "key": "email",   "id": "wpforms-7209-field_2" },
    { "key": "phone",   "id": "wpforms-7209-field_3" },
    { "key": "company", "id": "wpforms-7209-field_4" }
  ]
}
```

**Field rules:**
- `key` — string, lowercase, no spaces (used as the property name in stored data)
- `id` — the exact HTML `id` attribute of the input element on your form
- `fields` — array, minimum 1 item, maximum 20 items

**Response `200`:**
```json
{ "ok": true, "message": "Configuration saved" }
```

**Errors:**
```json
{ "error": "triggerPage is required" }           // 400
{ "error": "At least one field mapping required" }// 400
```

---

#### `GET /api/dashboard/config`

Retrieve current configuration for the logged-in user.

**Response `200`:**
```json
{
  "triggerPage": "/get-a-quote/",
  "buttonId": "wpforms-submit-7209",
  "fields": [
    { "key": "name",  "id": "wpforms-7209-field_1" },
    { "key": "email", "id": "wpforms-7209-field_2" }
  ]
}
```

---

#### `GET /api/dashboard/snippet`

Get the generated, ready-to-paste `<script>` tag based on current config.

**Response `200`:**
```json
{
  "snippet": "<script>\n(function(){\n  const API_KEY='usr_4fa3...';\n  ...\n})();\n</script>"
}
```

Returns `400` if config has not been saved yet:
```json
{ "error": "Configure your settings before generating a snippet" }
```

---

#### `GET /api/dashboard/apikey`

Get the current API key (masked in display, full value returned here).

**Response `200`:**
```json
{
  "apiKey": "usr_4fa3b1c9d2e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4"
}
```

---

#### `POST /api/dashboard/apikey/regenerate`

Generate a new API key. The old key is immediately invalidated. Any snippet still using the old key will stop tracking.

**Request body:** empty `{}`

**Response `200`:**
```json
{
  "apiKey": "usr_9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b",
  "warning": "Update your snippet with the new key. Old key is now invalid."
}
```

---

### 2.4 Error Format

All errors follow this structure:

```json
{
  "error": "Human-readable message",
  "field": "email"           // optional, for validation errors
}
```

**Standard HTTP status codes used:**

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created (register) |
| 400 | Bad request / validation error |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict (duplicate email) |
| 500 | Server error |

---

### 2.5 Rate Limits

| Endpoint | Limit |
|---|---|
| `POST /api/track` | 100 req/min per API key |
| `POST /api/auth/login` | 10 req/min per IP |
| All dashboard routes | 60 req/min per user |

> Rate limits enforced via `express-rate-limit`. Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`.

---

## Part 3 — Environment Variables

```bash
# /api/.env

# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/utm-tracker

# Auth
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=4000
BASE_URL=https://api.trackutm.app

# CORS
ALLOWED_ORIGINS=https://trackutm.app,http://localhost:5173
```

```bash
# /dashboard/.env.local  (Vite)

VITE_API_BASE_URL=https://api.trackutm.app
```

---

## Part 4 — Local Dev Setup

```bash
# 1. Clone and install
git clone https://github.com/yourorg/utm-tracker
cd utm-tracker

# 2. Backend
cd api
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
node server.js          # runs on :4000

# 3. Frontend
cd ../dashboard
npm install
cp .env.example .env.local
npm run dev             # runs on :5173
```

---

## Part 5 — Deployment Checklist

- [ ] Push backend to Railway (or Render), set env vars
- [ ] Push frontend to Vercel, set `VITE_API_BASE_URL`
- [ ] Enable CORS for your Vercel domain in backend `ALLOWED_ORIGINS`
- [ ] Confirm MongoDB Atlas IP whitelist allows Railway server IP (or set `0.0.0.0/0` for MVP)
- [ ] Test full flow: UTM URL → session → form submit → `POST /api/track` → dashboard shows record
- [ ] Test snippet on a WordPress staging site via WPCode
