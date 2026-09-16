const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredient.controller');
const { validate } = require('../middlewares/validation.middleware');
const { createIngredientSchema, updateIngredientSchema } = require('../validators/ingredient.validator');

router.get('/', ingredientController.getAll);
router.get('/:id', ingredientController.getById);
router.post('/', validate(createIngredientSchema), ingredientController.create);
router.put('/:id', validate(updateIngredientSchema), ingredientController.update);
router.delete('/:id', ingredientController.remove);

module.exports = router;
