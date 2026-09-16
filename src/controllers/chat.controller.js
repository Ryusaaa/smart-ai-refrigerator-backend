const chatService = require('../services/chat.service');
const conversationRepository = require('../repositories/conversation.repository');
const { AppError } = require('../middlewares/error.middleware');

class ChatController {
  async sendMessage(req, res, next) {
    try {
      const { conversationId, message } = req.body;
      if (!message) throw new AppError('Message is required', 400);
      
      const data = await chatService.sendMessage(conversationId, message);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getConversations(req, res, next) {
    try {
      const data = await conversationRepository.findAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getConversationById(req, res, next) {
    try {
      const data = await conversationRepository.findById(req.params.id);
      if (!data) throw new AppError('Conversation not found', 404);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteConversation(req, res, next) {
    try {
      await conversationRepository.deleteConversation(req.params.id);
      res.json({ success: true, data: { id: req.params.id } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
