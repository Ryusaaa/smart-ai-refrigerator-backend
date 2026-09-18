import inventoryService from './inventory.service.mjs';
import { getExpirationWeight } from '../utils/date.utils.mjs';

class RecommendationService {
  async buildRecommendationContext(preferences) {
    const availableIngredients = await inventoryService.getAvailableIngredients();
    const expiringIngredients = await inventoryService.getExpiringIngredients(7);

    const expirationWeights = {};
    availableIngredients.forEach(ing => {
      expirationWeights[ing.name.toLowerCase()] = getExpirationWeight(ing.expiryDate);
    });

    return {
      availableIngredients,
      expiringIngredients,
      preferences,
      expirationWeights
    };
  }

  calculateIngredientMatchScore(recipeIngredients, availableIngredients) {
    if (!recipeIngredients || recipeIngredients.length === 0) return 0;
    const availableNames = availableIngredients.map(i => i.name.toLowerCase());
    let matchCount = 0;
    recipeIngredients.forEach(ri => {
      if (availableNames.some(name => name.includes(ri.ingredientName.toLowerCase()) || ri.ingredientName.toLowerCase().includes(name))) {
        matchCount++;
      }
    });
    return (matchCount / recipeIngredients.length) * 100;
  }

  calculateExpirationScore(recipeIngredients, expirationWeights) {
    if (!recipeIngredients || recipeIngredients.length === 0) return 0;
    let totalWeight = 0;
    let count = 0;
    recipeIngredients.forEach(ri => {
      const name = ri.ingredientName.toLowerCase();
      const matchKey = Object.keys(expirationWeights).find(k => k.includes(name) || name.includes(k));
      if (matchKey) {
        totalWeight += expirationWeights[matchKey];
        count++;
      }
    });
    return count > 0 ? (totalWeight / count) * 100 : 0;
  }

  calculatePreferenceScore(recipe, preferences) {
    let score = 100;
    if (preferences.maxCookingTime && recipe.cookingTime > preferences.maxCookingTime) {
      score -= 50;
    }
    if (preferences.difficulty && preferences.difficulty !== 'any' && recipe.difficulty.toLowerCase() !== preferences.difficulty.toLowerCase()) {
      score -= 30;
    }
    return Math.max(0, score);
  }

  calculateFinalScore(ingredientMatch, expirationScore, preferenceScore) {
    return (0.50 * ingredientMatch) + (0.30 * expirationScore) + (0.20 * preferenceScore);
  }

  attachScores(recipes, context) {
    return recipes.map(recipe => {
      const ingredientMatch = this.calculateIngredientMatchScore(recipe.ingredients, context.availableIngredients);
      const expirationScore = this.calculateExpirationScore(recipe.ingredients, context.expirationWeights);
      const preferenceScore = this.calculatePreferenceScore(recipe, context.preferences);
      const recommendationScore = this.calculateFinalScore(ingredientMatch, expirationScore, preferenceScore);
      return { ...recipe, recommendationScore };
    });
  }
}

export default new RecommendationService();
