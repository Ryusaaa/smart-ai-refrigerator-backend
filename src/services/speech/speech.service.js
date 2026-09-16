const sttProvider = require('./stt.provider');
const ttsProvider = require('./tts.provider');

class SpeechService {
  async transcribeAudio(audioBuffer, mimeType) {
    return sttProvider.transcribeAudio(audioBuffer, mimeType);
  }

  async synthesizeSpeech(text, voice) {
    return ttsProvider.synthesizeSpeech(text, voice);
  }
}

module.exports = new SpeechService();
