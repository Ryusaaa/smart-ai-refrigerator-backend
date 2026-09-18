import * as sttProvider from './stt.provider.mjs';
import * as ttsProvider from './tts.provider.mjs';

class SpeechService {
  async transcribeAudio(audioBuffer, mimeType) {
    return sttProvider.transcribeAudio(audioBuffer, mimeType);
  }

  async synthesizeSpeech(text, voice) {
    return ttsProvider.synthesizeSpeech(text, voice);
  }
}

export default new SpeechService();
