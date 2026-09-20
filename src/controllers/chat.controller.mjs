import chatService from "../services/chat.service.mjs";
import conversationRepository from "../repositories/conversation.repository.mjs";
import { AppError } from "../middlewares/error.middleware.mjs";

class ChatController {
  async sendMessage(req, res, next) {
    try {
      const { conversationId, message } = req.body;
      if (!message) throw new AppError("Message is required", 400);

      const data = await chatService.sendMessage(conversationId, message);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async streamMessage(req, res, next) {
    try {
      const message = req.query.message;
      const conversationId = req.query.conversationId
        ? parseInt(req.query.conversationId)
        : null;

      if (!message) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Message query parameter is required",
          });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      const result = await chatService.sendMessageStream(
        conversationId,
        message,
        {
          onStatus: (statusText) => {
            res.write(
              `event: status\ndata: ${JSON.stringify({ status: statusText })}\n\n`,
            );
          },
          onChunk: (chunkText) => {
            res.write(
              `event: token\ndata: ${JSON.stringify({ token: chunkText })}\n\n`,
            );
          },
          onRecipePending: () => {
            res.write(
              `event: recipe_pending\ndata: ${JSON.stringify({ pending: true })}\n\n`,
            );
          },
          onRecipe: (savedRecipe) => {
            res.write(
              `event: recipe\ndata: ${JSON.stringify(savedRecipe)}\n\n`,
            );
          },
          onRecipeFailed: (reason) => {
            res.write(
              `event: recipe_failed\ndata: ${JSON.stringify({ reason })}\n\n`,
            );
          },
        },
      );

      res.write(
        `event: done\ndata: ${JSON.stringify({ conversationId: result.conversationId })}\n\n`,
      );
      res.end();
    } catch (error) {
      console.error("SSE Error:", error);
      res.write(
        `event: error\ndata: ${JSON.stringify({ error: error.message || "Stream error" })}\n\n`,
      );
      res.end();
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
      if (!data) throw new AppError("Conversation not found", 404);
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

export default new ChatController();
