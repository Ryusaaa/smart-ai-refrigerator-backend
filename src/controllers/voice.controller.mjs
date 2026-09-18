import speechService from '../services/speech/speech.service.mjs';
import chatService from '../services/chat.service.mjs';

class VoiceController {
  async transcribe(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Audio file required' });
      }
      const text = await speechService.transcribeAudio(req.file.buffer, req.file.mimetype);
      res.json({ success: true, data: { text } });
    } catch (error) {
      next(error);
    }
  }

  async chat(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Audio file required' });
      }
      const conversationId = req.body.conversationId;

      const transcript = await speechService.transcribeAudio(req.file.buffer, req.file.mimetype);
      const chatResponse = await chatService.sendMessage(conversationId, transcript);
      const audioResponse = await speechService.synthesizeSpeech(chatResponse.message, 'default');

      res.json({
        success: true,
        data: {
          transcript,
          response: chatResponse.message,
          audio: audioResponse
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new VoiceController();
