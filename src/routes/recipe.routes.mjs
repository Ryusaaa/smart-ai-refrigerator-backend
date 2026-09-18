import express from 'express';
import recipeController from '../controllers/recipe.controller.mjs';
import { validate } from '../middlewares/validation.middleware.mjs';
import { generateRecipeSchema } from '../validators/recipe.validator.mjs';

const router = express.Router();

router.post('/generate', validate(generateRecipeSchema), recipeController.generate);
router.get('/', recipeController.getAll);
router.get('/:id', recipeController.getById);

export default router;
