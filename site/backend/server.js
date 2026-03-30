require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());

// Serve static test files (for snippet testing only — not for production)
app.use('/test', express.static(path.join(__dirname, 'test')));

// Mount the tracking route BEFORE global CORS so its own open cors('*') takes effect.
// External sites (snippet callers) must be able to POST here without origin restrictions.
const trackRoutes = require('./routes/track');
app.use('/api/track', trackRoutes);

// Apply global CORS allowing only strictly explicitly set trusted origins (for dashboard).
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
app.use(cors({ origin: allowedOrigins }));

// --- Health check (wakes Render free tier before form submit) ---
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// --- Mount remaining routes ---
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });