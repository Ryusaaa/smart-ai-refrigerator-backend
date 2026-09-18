import prisma from '../config/prisma.mjs';

class IngredientRepository {
  async findAll(filters = {}) {
    const where = {};
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.search) {
      where.name = {
        contains: filters.search
      };
    }
    return prisma.ingredient.findMany({ where });
  }

  async findById(id) {
    return prisma.ingredient.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async create(data) {
    return prisma.ingredient.create({ data });
  }

  async update(id, data) {
    return prisma.ingredient.update({
      where: { id: parseInt(id) },
      data
    });
  }

  async remove(id) {
    return prisma.ingredient.delete({
      where: { id: parseInt(id) }
    });
  }
}

export default new IngredientRepository();
