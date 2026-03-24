const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  utm_source: { type: String, default: '' },
  utm_medium: { type: String, default: '' },
  utm_campaign: { type: String, default: '' },
  utm_content: { type: String, default: '' },
  utm_term: { type: String, default: '' },
  captured: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  page_url: { type: String, default: '' },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index to optimize dashboard fetch queries sorting by recent conversions per user
conversionSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Conversion', conversionSchema);
