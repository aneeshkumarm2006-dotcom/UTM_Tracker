const { ZodError } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod v4 uses .issues instead of .errors
        const issues = error.issues || error.errors || [];
        const firstError = issues[0];
        if (firstError) {
          return res.status(400).json({
            error: firstError.message,
            field: (firstError.path || []).join('.')
          });
        }
        return res.status(400).json({ error: 'Validation failed' });
      }
      return res.status(500).json({ error: 'Internal validation error' });
    }
  };
};

module.exports = validate;
