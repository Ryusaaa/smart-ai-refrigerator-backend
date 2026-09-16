const prisma = require('../config/prisma');

class RecipeRepository {
  async findAll() {
    return prisma.recipe.findMany({
      include: { ingredients: true }
    });
  }

  async findById(id) {
    return prisma.recipe.findUnique({
      where: { id: parseInt(id) },
      include: { ingredients: true }
    });
  }

  async create(data) {
    const ingredientData = (data.ingredients || []).map(ing => ({
      ingredientName: ing.ingredientName || ing.name,
      quantity: Number(ing.quantity) || 0,
      unit: ing.unit || '',
      isOptional: Boolean(ing.isOptional) || (ing.available === false),
    }));

    return prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description || null,
        cookingTime: Number(data.cookingTime) || 30,
        difficulty: data.difficulty || 'medium',
        instructions: Array.isArray(data.instructions) ? data.instructions : [data.instructions],
        ingredients: {
          create: ingredientData
        }
      },
      include: { ingredients: true }
    });
  }

  async remove(id) {
    return prisma.recipe.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new RecipeRepository();
