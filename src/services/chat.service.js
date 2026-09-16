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

  async sendMessageStream(conversationId, userMessage, { onStatus, onChunk }) {
    let convId = conversationId;
    if (!convId) {
      const conv = await conversationRepository.createConversation('New Conversation');
      convId = conv.id;
    }

    const conversation = await conversationRepository.findById(convId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (onStatus) onStatus('Mengecek stok kulkas...');
    const inventory = await inventoryService.getAvailableIngredients();

    if (onStatus) onStatus('Menyusun konteks percakapan...');
    const history = conversation.messages.slice(-10);

    await conversationRepository.addMessage(convId, MessageRole.USER, userMessage);

    let fullAssistantResponse = '';
    await aiService.generateChatStream(inventory, history, userMessage, (chunk) => {
      fullAssistantResponse += chunk;
      if (onChunk) onChunk(chunk);
    });

    if (fullAssistantResponse) {
      await conversationRepository.addMessage(convId, MessageRole.ASSISTANT, fullAssistantResponse);
    }

    return {
      conversationId: convId,
      message: fullAssistantResponse
    };
  }
}

module.exports = new ChatService();
