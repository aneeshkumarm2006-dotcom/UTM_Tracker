# Design Document
## UTM Conversion Tracker — UI/UX Specification

> **Scope:** Home Page + Dashboard (MVP)  
> **Style:** Clean SaaS, dark-leaning, developer-friendly

---

## 1. Design Principles

- **Clarity over decoration** — every element has a job
- **Developer-friendly** — code snippets are first-class, monospace, copyable
- **Low friction** — user goes from register to paste-ready snippet in under 3 minutes
- **Data first** — the conversions table is the hero of the dashboard

---

## 2. Color & Typography

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#0F1117` | Page background |
| `--bg-surface` | `#1A1D27` | Cards, panels |
| `--bg-border` | `#2A2D3A` | Dividers, input borders |
| `--accent` | `#6366F1` | Indigo — CTA buttons, active states |
| `--accent-hover` | `#4F46E5` | Button hover |
| `--success` | `#22C55E` | Copy success, conversion badge |
| `--warn` | `#F59E0B` | Warnings |
| `--text-primary` | `#F1F5F9` | Headings, key content |
| `--text-muted` | `#64748B` | Labels, subtext, placeholders |
| `--code-bg` | `#141720` | Snippet block background |
| `--code-text` | `#A5F3FC` | Code syntax highlight |

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Page Heading | Inter | 36px | 700 |
| Section Heading | Inter | 22px | 600 |
| Body | Inter | 14px | 400 |
| Label | Inter | 12px | 500 |
| Code | JetBrains Mono | 13px | 400 |

---

## 3. Home Page

### 3.1 Layout

```
┌──────────────────────────────────────────────────┐
│  NAVBAR                                           │
│  Logo (left)   Docs  Pricing  Login  [Get Started]│
├──────────────────────────────────────────────────┤
│  HERO                                             │
│  H1: Know exactly which ad drove your leads       │
│  Sub: Paste one snippet. Track UTM-to-form        │
│       conversions across any WordPress site.      │
│  [Start Free]   [View Docs ↗]                    │
│                                                   │
│  ┌─────── Live snippet preview (code block) ────┐ │
│  │  <script>                                    │ │
│  │    const API_KEY = 'usr_demo...';            │ │
│  │    const CONFIG = { triggerPage: '/quote/'  │ │
│  │    ...                                       │ │
│  │  </script>                     [Copy]        │ │
│  └──────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│  HOW IT WORKS  (3-step horizontal)                │
│  1. Register → get API key                        │
│  2. Configure fields + trigger page               │
│  3. Paste snippet → see conversions               │
├──────────────────────────────────────────────────┤
│  FEATURES GRID (2×2)                              │
│  • Any form fields    • UTM attribution           │
│  • Session-safe       • CSV export                │
├──────────────────────────────────────────────────┤
│  CTA BANNER                                       │
│  "Start tracking in 5 minutes."                   │
│  [Create Free Account]                            │
├──────────────────────────────────────────────────┤
│  FOOTER                                           │
│  © Nexorel · Docs · Privacy · Contact             │
└──────────────────────────────────────────────────┘
```

### 3.2 Navbar

- Logo: wordmark `trackUTM` in `--text-primary` + small indigo dot
- Links: Docs, Pricing (greyed, "coming soon" tooltip), Login
- CTA button: `Get Started` — filled indigo, pill shape
- Sticky on scroll, slight backdrop blur + `--bg-surface` at 90% opacity

### 3.3 Hero Section

- Full-width, vertically centered
- H1 max-width: 680px, centered
- Subtext: 18px, `--text-muted`
- Two CTAs side by side: `[Start Free]` (filled) and `[View Docs ↗]` (ghost)
- Below CTAs: a real-looking, animated code block showing a sample snippet
  - Syntax highlighted (teal for strings, purple for keywords)
  - Typing animation on first load (typewriter, 30ms per char)
  - `Copy` button in top-right corner of block

### 3.4 How It Works

Three cards in a horizontal row (stack on mobile):

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  01       │  │  02       │  │  03       │
│  Register │  │ Configure │  │  Paste   │
│  get key  │  │  + fields │  │ & track  │
└──────────┘  └──────────┘  └──────────┘
```

- Step number in large `--text-muted` behind card (watermark style)
- Icon (Heroicons outline): key, sliders, code-bracket
- 1-line description below

### 3.5 Features Grid

2-column, 2-row card grid:

| Feature | Description |
|---|---|
| **Any Form Fields** | Map DOM element IDs to keys. Name, email, phone, custom — your schema. |
| **UTM Attribution** | Source, medium, campaign, content, term — all 5 params captured. |
| **Session-Safe Tracking** | UTMs saved to sessionStorage — survives multi-page navigation. |
| **CSV Export** | Download all conversions with one click. No lock-in. |

### 3.6 Footer

- Single row, `--bg-surface`, border-top `--bg-border`
- Left: © 2026 Nexorel
- Right: Docs · Privacy · hi@nexorel.co

---

## 4. Auth Pages (Login / Register)

### Layout

```
┌──────────────────────────────────────────┐
│  Center card, 420px wide                  │
│  Logo top                                 │
│  H2: Create your account                  │
│  ──────────────────────────────────────   │
│  Email ___________________________________│
│  Password ________________________________│
│  [Create Account]                         │
│  Already have an account? Log in          │
└──────────────────────────────────────────┘
```

- Full-page dark background with subtle grid pattern (CSS `background-image`)
- Card: `--bg-surface`, 1px border `--bg-border`, `border-radius: 12px`
- Input: dark fill `--bg-base`, border `--bg-border`, focus ring `--accent`
- Error states: red border + small error text below field

---

## 5. Dashboard Layout

### 5.1 Shell

```
┌────────────┬─────────────────────────────────────┐
│  SIDEBAR   │  MAIN CONTENT AREA                   │
│  120px     │                                      │
│            │                                      │
│  Overview  │                                      │
│  Configure │                                      │
│  Snippet   │                                      │
│  API Key   │                                      │
│            │                                      │
│  ──────    │                                      │
│  Logout    │                                      │
└────────────┴─────────────────────────────────────┘
```

- Sidebar: `--bg-surface`, borderRight `--bg-border`
- Active nav item: indigo left border + `--accent` text
- Top bar: breadcrumb + user email (right)

---

### 5.2 Overview Page (Conversions Table)

```
┌────────────────────────────────────────────────────────────┐
│  Conversions                            [Filter ▾] [Export CSV] │
├──────────────────────────────────────────────────────────────┤
│  Filters: [Source ▾] [Date Range ▾]                          │
├──────────────────────────────────────────────────────────────┤
│  Timestamp    │ Source  │ Medium │ Campaign    │ Captured ↗  │
│  ─────────────┼─────────┼────────┼─────────────┼─────────── │
│  2h ago       │ google  │ cpc    │ summer-sale │ name, email │
│  5h ago       │ meta    │ cpc    │ retarget-v2 │ name, email │
│  Yesterday    │ chatgpt │ ref    │ —           │ name, phone │
└──────────────────────────────────────────────────────────────┘
```

- "Captured" column expands on row click → shows all captured key-value pairs in a sub-row
- UTM source shown as a colored badge: google = blue, meta = indigo, chatgpt = teal, others = grey
- Empty state: illustration + "No conversions yet. Paste your snippet to start tracking."
- Pagination: 25 rows per page, simple prev/next

### 5.3 Configure Page

```
┌──────────────────────────────────────────────────┐
│  Configuration                                    │
├──────────────────────────────────────────────────┤
│  Trigger Page Pathname                            │
│  [ /get-a-quote/                               ]  │
│                                                   │
│  Submit Button DOM ID                             │
│  [ wpforms-submit-7209                         ]  │
│                                                   │
│  Field Mappings                                   │
│  ┌──────────────────┬──────────────────┬───┐      │
│  │ Key (your label) │ DOM Element ID   │ × │      │
│  ├──────────────────┼──────────────────┼───┤      │
│  │ name             │ wpforms-...-1    │ × │      │
│  │ email            │ wpforms-...-2    │ × │      │
│  │ phone            │ wpforms-...-3    │ × │      │
│  └──────────────────┴──────────────────┴───┘      │
│  [+ Add Field]                                    │
│                                                   │
│                              [Save Configuration] │
└──────────────────────────────────────────────────┘
```

- Rows are dynamically added/removed
- `Key` is a free-text input (e.g., "phone", "company", "postcode")
- `DOM Element ID` is the HTML `id` attribute from the form
- Trash icon removes the row
- Save button POSTs to `/api/dashboard/config`
- Success toast: "Configuration saved ✓"

### 5.4 Snippet Page

```
┌──────────────────────────────────────────────────┐
│  Your Snippet                                     │
├──────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐  │
│  │ <script>                                   │  │
│  │ (function(){                               │  │
│  │   const API_KEY='usr_abc123...';           │  │
│  │   const TRACK_URL='https://...';           │  │
│  │   const CONFIG={                           │  │
│  │     triggerPage:'/get-a-quote/',           │  │
│  │     buttonId:'wpforms-submit-7209',        │  │
│  │     fields:[{key:'name',id:'...'},...]     │  │
│  │   };                                       │  │
│  │   /* full script */                        │  │
│  │ })();                                      │  │
│  │ </script>               [Copy Snippet ✓]  │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  How to install                                   │
│  1. Install WPCode plugin (free) in WordPress     │
│  2. Add Snippet → Paste above code                │
│  3. Set Location: "Site Wide Header"              │
│  4. Activate                                      │
└──────────────────────────────────────────────────┘
```

- Code block: `--code-bg`, monospace, syntax highlighted
- Copy button: shows "Copied!" for 2 seconds on click
- Warning banner if config is incomplete: "⚠ Save your configuration first"

### 5.5 API Key Page

```
┌──────────────────────────────────────────────────┐
│  API Key                                          │
├──────────────────────────────────────────────────┤
│  Your key is embedded in your snippet             │
│  automatically. Keep this private.                │
│                                                   │
│  ┌──────────────────────────────────┬──────────┐  │
│  │ usr_4fa3...b91c  (masked)        │ [Copy]   │  │
│  └──────────────────────────────────┴──────────┘  │
│                                                   │
│  [Regenerate Key]  ← destructive, confirm modal   │
└──────────────────────────────────────────────────┘
```

- Key shown masked (`usr_4fa3...b91c`) with eye icon toggle to reveal
- Regenerate shows confirmation modal: "This will break any existing snippets. Continue?"

---

## 6. Component Inventory

| Component | Description |
|---|---|
| `<CodeBlock>` | Syntax-highlighted, copyable code display |
| `<FieldRow>` | Single key + id row in configure table |
| `<ConversionRow>` | Table row, expandable for captured fields |
| `<UtmBadge>` | Colored source label (google, meta, etc.) |
| `<Toast>` | Success / error notification, auto-dismiss 3s |
| `<ConfirmModal>` | Destructive action confirmation |
| `<ApiKeyDisplay>` | Masked key with reveal + copy |

---

## 7. Responsive Behavior

| Breakpoint | Change |
|---|---|
| < 768px | Sidebar collapses to bottom nav bar (4 icons) |
| < 640px | Hero stacks vertically, code block hidden on mobile home |
| < 480px | Table switches to card view per conversion |
