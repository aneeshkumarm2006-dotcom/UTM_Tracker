const { ZodError } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Return 400 with field-level error message
        const firstError = error.errors[0];
        return res.status(400).json({
          error: firstError.message,
          field: firstError.path.join('.')
        });
      }
      return res.status(500).json({ error: 'Internal validation error' });
    }
  };
};

module.exports = validate;
