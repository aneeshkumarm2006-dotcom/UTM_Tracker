const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const apiKeyAuth = require('../middleware/apiKeyAuth');
const Conversion = require('../models/Conversion');

const router = express.Router();

// Fully open CORS on this route only (snippet calls come from client sites)
router.use(cors({ origin: '*' }));

// Rate limit: 100 req/min per API key
const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.header('X-API-Key') || req.ip,
  message: { error: 'Rate limit exceeded. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false }
});

// --- POST /api/track ---
router.post('/', trackLimiter, apiKeyAuth, async (req, res) => {
  try {
    const {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      page_url,
      timestamp,
      ...captured  // Everything else goes into captured
    } = req.body;

    const conversion = new Conversion({
      userId: req.user._id,
      utm_source: utm_source || '',
      utm_medium: utm_medium || '',
      utm_campaign: utm_campaign || '',
      utm_content: utm_content || '',
      utm_term: utm_term || '',
      captured,
      page_url: page_url || '',
      timestamp: timestamp || new Date().toISOString()
    });

    await conversion.save();

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Track Error:', error);
    res.status(500).json({ error: 'Server error while tracking conversion' });
  }
});

module.exports = router;
