const { AppError } = require('../../middlewares/error.middleware');

async function transcribeAudio(audioBuffer, mimeType) {
  throw new AppError('STT provider not configured', 501);
}

module.exports = { transcribeAudio };
