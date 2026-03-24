const express = require('express');
const crypto = require('crypto');
const { z } = require('zod');
const jwtAuth = require('../middleware/jwtAuth');
const validate = require('../middleware/validate');
const User = require('../models/User');
const Conversion = require('../models/Conversion');
const generateSnippet = require('../lib/snippetGenerator');

const router = express.Router();

// All dashboard routes require JWT auth
router.use(jwtAuth);

// --- Zod schema for config ---
const configSchema = z.object({
  triggerPage: z.string().min(1, 'triggerPage is required'),
  buttonId: z.string().min(1, 'buttonId is required'),
  fields: z
    .array(
      z.object({
        key: z.string().min(1, 'Field key is required'),
        id: z.string().min(1, 'Field DOM ID is required')
      })
    )
    .min(1, 'At least one field mapping required')
    .max(20, 'Maximum 20 field mappings allowed')
});

// --- GET /api/dashboard/conversions ---
router.get('/conversions', async (req, res) => {
  try {
    const { source, from, to, limit: rawLimit, page: rawPage } = req.query;

    // Parse pagination
    let limit = parseInt(rawLimit) || 50;
    if (limit > 500) limit = 500;
    if (limit < 1) limit = 1;

    let page = parseInt(rawPage) || 1;
    if (page < 1) page = 1;

    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId: req.user.id };

    if (source) {
      filter.utm_source = source;
    }

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    // Query
    const [total, conversions] = await Promise.all([
      Conversion.countDocuments(filter),
      Conversion.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    res.status(200).json({
      total,
      page,
      limit,
      conversions
    });
  } catch (error) {
    console.error('Conversions Fetch Error:', error);
    res.status(500).json({ error: 'Server error fetching conversions' });
  }
});

// --- GET /api/dashboard/conversions/export ---
router.get('/conversions/export', async (req, res) => {
  try {
    const { source, from, to } = req.query;

    // Build filter (same as above, minus pagination)
    const filter = { userId: req.user.id };

    if (source) {
      filter.utm_source = source;
    }

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const conversions = await Conversion.find(filter)
      .sort({ timestamp: -1 })
      .lean();

    if (conversions.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="conversions.csv"');
      return res.status(200).send('timestamp,utm_source,utm_medium,utm_campaign,utm_content,utm_term,page_url\n');
    }

    // Collect all unique captured field keys across the dataset
    const capturedKeys = new Set();
    conversions.forEach((c) => {
      if (c.captured && typeof c.captured === 'object') {
        Object.keys(c.captured).forEach((key) => capturedKeys.add(key));
      }
    });

    const capturedKeysArr = Array.from(capturedKeys).sort();

    // Build CSV header
    const fixedColumns = ['timestamp', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'page_url'];
    const allColumns = [...fixedColumns, ...capturedKeysArr];
    const headerRow = allColumns.join(',');

    // Build CSV rows
    const rows = conversions.map((c) => {
      const values = allColumns.map((col) => {
        let val;
        if (fixedColumns.includes(col)) {
          val = c[col] != null ? String(c[col]) : '';
        } else {
          val = c.captured && c.captured[col] != null ? String(c.captured[col]) : '';
        }
        // Escape CSV: wrap in quotes if contains comma, quote, or newline
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      });
      return values.join(',');
    });

    const csv = headerRow + '\n' + rows.join('\n') + '\n';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="conversions.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({ error: 'Server error during CSV export' });
  }
});

// --- GET /api/dashboard/config ---
router.get('/config', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      triggerPage: user.config?.triggerPage || '',
      buttonId: user.config?.buttonId || '',
      fields: user.config?.fields || []
    });
  } catch (error) {
    console.error('Get Config Error:', error);
    res.status(500).json({ error: 'Server error fetching configuration' });
  }
});

// --- POST /api/dashboard/config ---
router.post('/config', validate(configSchema), async (req, res) => {
  try {
    const { triggerPage, buttonId, fields } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      config: { triggerPage, buttonId, fields }
    });

    res.status(200).json({ ok: true, message: 'Configuration saved' });
  } catch (error) {
    console.error('Save Config Error:', error);
    res.status(500).json({ error: 'Server error saving configuration' });
  }
});

// --- GET /api/dashboard/snippet ---
router.get('/snippet', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if config has been saved
    if (
      !user.config ||
      !user.config.triggerPage ||
      !user.config.buttonId ||
      !user.config.fields ||
      user.config.fields.length === 0
    ) {
      return res.status(400).json({ error: 'Configure your settings before generating a snippet' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    const snippet = generateSnippet(user.apiKey, user.config, baseUrl);

    res.status(200).json({ snippet });
  } catch (error) {
    console.error('Snippet Generation Error:', error);
    res.status(500).json({ error: 'Server error generating snippet' });
  }
});

// --- GET /api/dashboard/apikey ---
router.get('/apikey', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ apiKey: user.apiKey });
  } catch (error) {
    console.error('Get API Key Error:', error);
    res.status(500).json({ error: 'Server error fetching API key' });
  }
});

// --- POST /api/dashboard/apikey/regenerate ---
router.post('/apikey/regenerate', async (req, res) => {
  try {
    const newApiKey = 'usr_' + crypto.randomBytes(20).toString('hex');

    await User.findByIdAndUpdate(req.user.id, { apiKey: newApiKey });

    res.status(200).json({
      apiKey: newApiKey,
      warning: 'Update your snippet with the new key. Old key is now invalid.'
    });
  } catch (error) {
    console.error('Regenerate API Key Error:', error);
    res.status(500).json({ error: 'Server error regenerating API key' });
  }
});

module.exports = router;
