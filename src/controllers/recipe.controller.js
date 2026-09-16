const recommendationService = require('../services/recommendation.service');
const aiService = require('../services/ai/ai.service');
const recipeRepository = require('../repositories/recipe.repository');
const { AppError } = require('../middlewares/error.middleware');

class RecipeController {
  async generate(req, res, next) {
    try {
      const preferences = req.body.preferences || req.body;
      const context = await recommendationService.buildRecommendationContext(preferences);
      
      if (context.availableIngredients.length === 0) {
        throw new AppError('No available ingredients in inventory', 400);
      }

      const generatedRecipes = await aiService.generateRecipes(context);
      const scoredRecipes = recommendationService.attachScores(generatedRecipes, context);
      
      scoredRecipes.sort((a, b) => b.recommendationScore - a.recommendationScore);
      
      const savedRecipes = [];
      for (const recipe of scoredRecipes) {
        const saved = await recipeRepository.create(recipe);
        savedRecipes.push({ ...saved, recommendationScore: recipe.recommendationScore });
      }

      res.json({ success: true, data: savedRecipes });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const data = await recipeRepository.findAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await recipeRepository.findById(req.params.id);
      if (!data) throw new AppError('Recipe not found', 404);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecipeController();
