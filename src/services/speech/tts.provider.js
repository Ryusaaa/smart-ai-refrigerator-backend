const { AppError } = require('../../middlewares/error.middleware');

async function synthesizeSpeech(text, voice) {
  throw new AppError('TTS provider not configured', 501);
}

module.exports = { synthesizeSpeech };
