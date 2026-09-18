import express from 'express';
import chatController from '../controllers/chat.controller.mjs';

const router = express.Router();

router.get('/stream', chatController.streamMessage);
router.post('/', chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversationById);
router.delete('/conversations/:id', chatController.deleteConversation);

export default router;
