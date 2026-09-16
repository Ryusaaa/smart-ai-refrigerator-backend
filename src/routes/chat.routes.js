const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.get('/stream', chatController.streamMessage);
router.post('/', chatController.sendMessage);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversationById);
router.delete('/conversations/:id', chatController.deleteConversation);

module.exports = router;
