const User = require('../models/User');

const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    if (!apiKey) {
      return res.status(401).json({ error: 'No API key provided' });
    }

    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('API Key Auth Error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

module.exports = apiKeyAuth;
