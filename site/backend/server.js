require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());

// Serve static test files (for snippet testing only — not for production)
app.use('/test', express.static(path.join(__dirname, 'test')));

// Apply global CORS allowing only strictly explicitly set trusted origins (for dashboard). 
// The fully open CORS for snippet tracking will be added later onto its specific route.
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
app.use(cors({ origin: allowedOrigins }));

// --- Mount routes ---
const authRoutes = require('./routes/auth');
const trackRoutes = require('./routes/track');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/track', trackRoutes);
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
