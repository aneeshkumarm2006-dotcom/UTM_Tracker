# Product Requirements Document
## UTM Conversion Tracker — v1.0

> **Status:** Draft  
> **Last Updated:** 2026-03  
> **Scope:** MVP — Code Snippet Distribution, Dashboard, API

---

## 1. Problem Statement

Businesses running paid campaigns on Google Ads, Meta, ChatGPT, or other channels have no lightweight, self-serve way to tie a form submission or booking event back to the UTM source that drove it — without setting up GA4, GTM, or paying for a CRM integration. The existing workaround is a custom per-site code snippet that hardcodes a webhook URL and field IDs, which doesn't scale across multiple WordPress sites.

---

## 2. Goal

Build a multi-tenant SaaS platform where any user can:

1. Register and get an API key.
2. Configure which page to track, which button triggers the conversion, and which form fields to capture (fully dynamic — any combination of name, email, phone, company, or custom fields).
3. Paste one auto-generated `<script>` snippet into their WordPress site (or any HTML page).
4. View all captured conversions with UTM attribution in a clean dashboard.

The product ships **snippet-first** — no WordPress plugin, no marketplace listing. Just code.

---

## 3. Users

| Persona | Description |
|---|---|
| **Agency Owner** | Runs multiple client WordPress sites, wants UTM data per site without GA4 setup |
| **Solo Marketer** | Runs their own paid campaigns, wants to know which source drives form submissions |
| **Freelance Dev** | Builds WordPress sites for clients, adds the snippet as a value-add service |

---

## 4. Core Concepts

### 4.1 UTM Parameters Tracked

| Parameter | Example |
|---|---|
| `utm_source` | google, meta, chatgpt, claude |
| `utm_medium` | cpc, email, organic |
| `utm_campaign` | summer-sale-2025 |
| `utm_content` | banner-v2 |
| `utm_term` | keyword used |

### 4.2 Capture Fields (Fully Dynamic)

Users define their own field mappings. Each field mapping is:

```json
{ "key": "name",  "id": "wpforms-7209-field_1" }
{ "key": "email", "id": "wpforms-7209-field_2" }
{ "key": "phone", "id": "wpforms-7209-field_3" }
```

The `key` is what gets stored in the database. The `id` is the DOM element ID on the page. There is no fixed schema — a user can add as many fields as their form has.

### 4.3 Conversion Event

A conversion fires when:
- The user is on the configured **trigger page** (e.g., `/get-a-quote/`)
- The configured **submit button** is clicked (matched by DOM `id`)
- A UTM source exists in `sessionStorage` from the current session

### 4.4 Session Persistence

UTM parameters are saved to `sessionStorage` on any page load where they appear in the URL. This means a user can land on the homepage via a Google Ads link, navigate to the quote page, and the UTM data is still captured at conversion time.

---

## 5. Features — MVP Scope

### 5.1 Authentication
- Email + password registration
- JWT-based login (7-day token)
- No OAuth in MVP

### 5.2 API Key Management
- One API key per user, auto-generated on registration
- Displayed on dashboard, one-click copy
- Ability to regenerate (invalidates old key)

### 5.3 Configuration Builder
- Set trigger page (pathname)
- Set button DOM ID
- Add/remove field mappings (key label + DOM element ID)
- Config is saved server-side and used to generate the snippet

### 5.4 Snippet Generator
- Auto-generates the full `<script>` block from the saved config
- One-click copy button
- Shows instructions: "Paste this into WPCode > Add Snippet > Header/Footer"

### 5.5 Conversions Dashboard
- Table: Timestamp, UTM Source, Medium, Campaign, and all captured fields
- Filter by UTM source
- Filter by date range
- CSV export

### 5.6 API (for sending conversions)
- `POST /api/track` — authenticated via `X-API-Key` header
- Accepts any JSON body — UTM params + captured fields are all stored
- CORS-open so the browser snippet can call it

---

## 6. Features — Post-MVP (Not in v1)

- Multiple sites / configurations per account (multi-project)
- Email alert on conversion
- WordPress plugin (wraps the snippet behind a settings UI)
- Plan limits and Razorpay billing
- Webhook forwarding to n8n / Zapier
- Team members / shared access
- Conversion funnel analytics and charts

---

## 7. User Flows

### 7.1 Onboarding Flow

```
Register → Email + Password
    ↓
Dashboard loads → API Key shown
    ↓
Configure → Set trigger page + button ID + field mappings
    ↓
Snippet page → Copy <script> tag
    ↓
Paste into WordPress (WPCode) → Done
```

### 7.2 Conversion Flow (Runtime)

```
Visitor clicks a Google Ad → lands on /home/?utm_source=google&utm_medium=cpc
    ↓
Snippet fires saveUTM() → stores in sessionStorage
    ↓
Visitor navigates to /get-a-quote/
    ↓
Fills form → clicks Submit
    ↓
Snippet reads sessionStorage → reads configured DOM fields
    ↓
POST /api/track with { utm_*, captured fields, page_url, timestamp }
    ↓
Stored in DB → visible in dashboard
```

### 7.3 Returning to Dashboard

```
Login → JWT token
    ↓
Dashboard → Conversions table loads
    ↓
Filter / Export
```

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Reliability** | Snippet must never throw uncaught errors or break the host page |
| **Latency** | `POST /api/track` should respond in < 300ms |
| **CORS** | API must allow cross-origin requests from any domain (snippet runs on client sites) |
| **Silent Fail** | If tracking call fails, it logs to console only — no alerts to the end user |
| **Security** | API key in `X-API-Key` header; JWT for dashboard; passwords bcrypt-hashed |
| **Privacy** | No cookies set by the snippet — only `sessionStorage` (no consent banner required) |

---

## 9. Out of Scope (v1)

- Real-time push notifications
- Google Analytics / GTM integration
- Multi-step funnel tracking
- Mobile app
- Self-hosted / white-label version

---

## 10. Success Metrics (Internal)

- Snippets installed on 3+ WordPress sites within first month
- Average conversion tracking latency < 200ms
- Zero snippet-caused site crashes
