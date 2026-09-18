import { validationResult } from 'express-validator';
import { ValidationError } from './error.middleware.mjs';

export const validate = (schemas) => {
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
