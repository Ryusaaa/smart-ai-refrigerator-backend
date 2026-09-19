import prisma from '../config/prisma.mjs';

class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return prisma.user.findUnique({ where: { id: parseInt(id) } });
  }

  async create({ name, email, passwordHash }) {
    return prisma.user.create({ data: { name, email, passwordHash } });
  }
}

export default new UserRepository();