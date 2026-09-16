const prisma = require('../config/prisma');

class ConversationRepository {
  async findAll() {
    return prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' }
    });
  }

  async findById(id) {
    return prisma.conversation.findUnique({
      where: { id: parseInt(id) },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async createConversation(title) {
    return prisma.conversation.create({
      data: { title }
    });
  }

  async addMessage(conversationId, role, content) {
    return prisma.message.create({
      data: {
        conversationId: parseInt(conversationId),
        role,
        content
      }
    });
  }

  async deleteConversation(id) {
    return prisma.conversation.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new ConversationRepository();
