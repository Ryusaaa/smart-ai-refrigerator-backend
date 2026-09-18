import prisma from '../config/prisma.mjs';

class RecipeRepository {
  async findAll() {
    return prisma.recipe.findMany({
      include: { ingredients: true, sources: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    return prisma.recipe.findUnique({
      where: { id: parseInt(id) },
      include: { ingredients: true, sources: true }
    });
  }

  async create(data) {
    const ingredientData = (data.ingredients || []).map(ing => ({
      ingredientName: ing.ingredientName || ing.name,
      quantity: Number(ing.quantity) || 0,
      unit: ing.unit || '',
      isOptional: Boolean(ing.isOptional) || (ing.available === false),
    }));

    const sourceData = (data.sources || []).map(src => ({
      title: src.title,
      url: src.url,
      note: src.note || null,
    }));

    return prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description || null,
        cookingTime: Number(data.cookingTime) || 30,
        difficulty: data.difficulty || 'medium',
        imageUrl: data.imageUrl || null,
        instructions: Array.isArray(data.instructions) ? data.instructions : [data.instructions],
        ingredients: {
          create: ingredientData
        },
        sources: {
          create: sourceData
        }
      },
      include: { ingredients: true, sources: true }
    });
  }

  async remove(id) {
    return prisma.recipe.delete({
      where: { id: parseInt(id) }
    });
  }
}

export default new RecipeRepository();
