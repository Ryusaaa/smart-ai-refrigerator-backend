import { body } from 'express-validator';

export const registerSchema = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

export const loginSchema = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];