import { AppError } from '../../middlewares/error.middleware.mjs';

export async function synthesizeSpeech(text, voice) {
  throw new AppError('TTS provider not configured', 501);
}
