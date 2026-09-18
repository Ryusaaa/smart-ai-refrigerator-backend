import express from 'express';
import multer from 'multer';
import voiceController from '../controllers/voice.controller.mjs';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/transcribe', upload.single('audio'), voiceController.transcribe);
router.post('/chat', upload.single('audio'), voiceController.chat);

export default router;
