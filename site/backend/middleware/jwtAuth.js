const jwt = require('jsonwebtoken');

const jwtAuth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error('JWT Auth Error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = jwtAuth;
