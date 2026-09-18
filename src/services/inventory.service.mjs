import ingredientRepository from '../repositories/ingredient.repository.mjs';
import { getExpirationStatus, getDaysUntilExpiry } from '../utils/date.utils.mjs';
import { NotFoundError } from '../middlewares/error.middleware.mjs';
import { ExpirationStatus } from '../constants/enums.mjs';
import imageService from './image/image.service.mjs';

class InventoryService {
  async getAll(query = {}) {
    let ingredients = await ingredientRepository.findAll(query);

    ingredients = ingredients.map(ing => ({
      ...ing,
      expirationStatus: getExpirationStatus(ing.expiryDate),
      daysUntilExpiry: getDaysUntilExpiry(ing.expiryDate)
    }));

    if (query.expiryStatus) {
      ingredients = ingredients.filter(ing => ing.expirationStatus === query.expiryStatus);
    }

    return ingredients;
  }

  async getById(id) {
    const ing = await ingredientRepository.findById(id);
    if (!ing) throw new NotFoundError('Ingredient not found');
    return {
      ...ing,
      expirationStatus: getExpirationStatus(ing.expiryDate),
      daysUntilExpiry: getDaysUntilExpiry(ing.expiryDate)
    };
  }

  async create(data) {
    if (!data.imageUrl && data.name) {
      try {
        data.imageUrl = await imageService.getIngredientImage(data.name);
      } catch (err) {
        console.warn('Failed to fetch ingredient image:', err.message);
      }
    }
    return ingredientRepository.create(data);
  }

  async update(id, data) {
    const exists = await ingredientRepository.findById(id);
    if (!exists) throw new NotFoundError('Ingredient not found');
    return ingredientRepository.update(id, data);
  }

  async remove(id) {
    const exists = await ingredientRepository.findById(id);
    if (!exists) throw new NotFoundError('Ingredient not found');
    return ingredientRepository.remove(id);
  }

  async getAvailableIngredients() {
    const all = await this.getAll();
    return all.filter(ing => ing.quantity > 0 && ing.expirationStatus !== ExpirationStatus.EXPIRED);
  }

  async getExpiringIngredients(days = 7) {
    const all = await this.getAll();
    return all.filter(ing => ing.daysUntilExpiry !== null && ing.daysUntilExpiry >= 0 && ing.daysUntilExpiry <= days);
  }
}

export default new InventoryService();
