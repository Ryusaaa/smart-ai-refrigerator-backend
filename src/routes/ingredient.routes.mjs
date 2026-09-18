import express from 'express';
import ingredientController from '../controllers/ingredient.controller.mjs';
import { validate } from '../middlewares/validation.middleware.mjs';
import { createIngredientSchema, updateIngredientSchema } from '../validators/ingredient.validator.mjs';

const router = express.Router();

router.get('/', ingredientController.getAll);
router.get('/:id', ingredientController.getById);
router.post('/', validate(createIngredientSchema), ingredientController.create);
router.put('/:id', validate(updateIngredientSchema), ingredientController.update);
router.delete('/:id', ingredientController.remove);

export default router;
