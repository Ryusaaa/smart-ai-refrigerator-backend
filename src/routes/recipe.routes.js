const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe.controller');
const { validate } = require('../middlewares/validation.middleware');
const { generateRecipeSchema } = require('../validators/recipe.validator');

router.post('/generate', validate(generateRecipeSchema), recipeController.generate);
router.get('/', recipeController.getAll);
router.get('/:id', recipeController.getById);

module.exports = router;
