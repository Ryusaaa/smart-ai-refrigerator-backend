import * as imageProvider from './image.provider.mjs';

class ImageService {
  async getRecipeImage(recipeTitle) {
    if (!recipeTitle) return null;
    return imageProvider.searchImage(`${recipeTitle} dish`);
  }

  async getIngredientImage(ingredientName) {
    if (!ingredientName) return null;
    return imageProvider.searchImage(`${ingredientName} food icon flat illustration`);
  }
}

export default new ImageService();
