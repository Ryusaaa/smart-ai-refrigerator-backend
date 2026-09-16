const imageProvider = require('./image.provider');

class ImageService {
  async getRecipeImage(recipeTitle) {
    if (!recipeTitle) return null;
    return imageProvider.searchImage(`${recipeTitle} dish`);
  }

  async getIngredientImage(ingredientName) {
    if (!ingredientName) return null;
    return imageProvider.searchImage(`${ingredientName} fresh ingredient`);
  }
}

module.exports = new ImageService();
