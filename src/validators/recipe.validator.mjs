import { body } from 'express-validator';

export const generateRecipeSchema = [
  body('maxCookingTime').optional().isInt({ min: 1, max: 240 }).withMessage('maxCookingTime must be between 1 and 240'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'any']).withMessage('Invalid difficulty'),
  body('cuisine').optional().isString(),
  body('maxMissingIngredients').optional().isInt({ min: 0, max: 5 }).withMessage('maxMissingIngredients must be between 0 and 5')
];
