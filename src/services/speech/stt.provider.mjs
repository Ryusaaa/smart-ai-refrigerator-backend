import { AppError } from '../../middlewares/error.middleware.mjs';

export async function transcribeAudio(audioBuffer, mimeType) {
  throw new AppError('STT provider not configured', 501);
}
