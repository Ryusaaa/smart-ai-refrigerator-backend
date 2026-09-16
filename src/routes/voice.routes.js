const express = require('express');
const router = express.Router();
const multer = require('multer');
const voiceController = require('../controllers/voice.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/transcribe', upload.single('audio'), voiceController.transcribe);
router.post('/chat', upload.single('audio'), voiceController.chat);

module.exports = router;
