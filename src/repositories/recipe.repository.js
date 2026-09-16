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
    return prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description,
        cookingTime: data.cookingTime,
        difficulty: data.difficulty,
        instructions: data.instructions,
        ingredients: {
          create: data.ingredients
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
