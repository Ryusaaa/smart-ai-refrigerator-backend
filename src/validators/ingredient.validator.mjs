import { body } from 'express-validator';
import { IngredientSource } from '../constants/enums.mjs';

export const createIngredientSchema = [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('category').isString().notEmpty().withMessage('Category is required'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
  body('unit').isString().notEmpty().withMessage('Unit is required'),
  body('expiryDate').optional({ nullable: true }).isISO8601().toDate().withMessage('Valid expiry date required'),
  body('source').optional().isIn(Object.values(IngredientSource)).withMessage('Invalid source')
];

export const updateIngredientSchema = [
  body('name').optional().isString().notEmpty().withMessage('Name cannot be empty'),
  body('category').optional().isString().notEmpty().withMessage('Category cannot be empty'),
  body('quantity').optional().isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
  body('unit').optional().isString().notEmpty().withMessage('Unit cannot be empty'),
  body('expiryDate').optional({ nullable: true }).isISO8601().toDate().withMessage('Valid expiry date required'),
  body('source').optional().isIn(Object.values(IngredientSource)).withMessage('Invalid source')
];
