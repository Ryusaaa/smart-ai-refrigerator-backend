const conversationRepository = require('../repositories/conversation.repository');
const inventoryService = require('./inventory.service');
const aiService = require('./ai/ai.service');
const { MessageRole } = require('../constants/enums');

class ChatService {
  async sendMessage(conversationId, userMessage) {
    let convId = conversationId;
    if (!convId) {
      const conv = await conversationRepository.createConversation('New Conversation');
      convId = conv.id;
    }

    const conversation = await conversationRepository.findById(convId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const history = conversation.messages.slice(-10);
    const inventory = await inventoryService.getAvailableIngredients();

    await conversationRepository.addMessage(convId, MessageRole.USER, userMessage);

    const assistantResponse = await aiService.generateChat(inventory, history, userMessage);

    await conversationRepository.addMessage(convId, MessageRole.ASSISTANT, assistantResponse);

    return {
      conversationId: convId,
      message: assistantResponse
    };
  }
}

module.exports = new ChatService();
