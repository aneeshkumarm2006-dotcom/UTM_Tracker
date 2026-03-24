# UTM Conversion Tracker

A multi-tenant SaaS platform for tracking UTM-to-form conversions across WordPress sites.

## Project Structure

```
site/
├── backend/          # Express + Node.js REST API
│   ├── models/       # Mongoose models (User, Conversion)
│   ├── routes/       # API routes (auth, track, dashboard)
│   ├── middleware/    # Auth & validation middleware
│   ├── lib/          # Utilities (snippet generator)
│   └── server.js     # Entry point
│
└── frontend/         # React + Vite Dashboard & Home Page
    └── src/
        ├── pages/        # Route pages
        ├── components/   # Reusable UI components
        ├── hooks/        # Custom React hooks
        └── lib/          # API client, auth store
```

## Local Development

### Prerequisites

- Node.js 20 LTS
- MongoDB (Atlas free tier or local)

### Backend

```bash
cd site/backend
npm install
cp .env.example .env   # Fill in MONGO_URI and JWT_SECRET
node server.js          # Runs on http://localhost:4000
```

### Frontend

```bash
cd site/frontend
npm install
cp .env.example .env.local   # Or use the existing one
npm run dev                   # Runs on http://localhost:5173
```

### Environment Variables

**Backend (`site/backend/.env`):**
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`) |
| `PORT` | Server port (default: `4000`) |
| `BASE_URL` | Public URL of the API |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |

**Frontend (`site/frontend/.env.local`):**
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | URL of the backend API |

## Deployment

- **Backend:** Railway or Render
- **Frontend:** Vercel
- **Database:** MongoDB Atlas (M0 free tier)

See `_ai_context/TODO.md` Stage 12 for the full deployment checklist.
