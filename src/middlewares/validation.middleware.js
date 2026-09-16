const { validationResult } = require('express-validator');
const { ValidationError } = require('./error.middleware');

const validate = (schemas) => {
  return async (req, res, next) => {
    for (let schema of schemas) {
      await schema.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError(errors.array().map(e => e.msg).join(', ')));
    }
    next();
  };
};

module.exports = { validate };
