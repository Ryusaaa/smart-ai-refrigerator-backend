const cryptoUtils = require('./crypto.utils');
const env = require('../../config/env');
const { AppError } = require('../../middlewares/error.middleware');

class EncryptionService {
  encryptAudio(buffer) {
    if (!env.AUDIO_ENCRYPTION_KEY) throw new AppError('Encryption key not configured', 500);
    return cryptoUtils.encrypt(buffer, env.AUDIO_ENCRYPTION_KEY);
  }

  decryptAudio(encryptedObj) {
    if (!env.AUDIO_ENCRYPTION_KEY) throw new AppError('Encryption key not configured', 500);
    return cryptoUtils.decrypt(encryptedObj, env.AUDIO_ENCRYPTION_KEY);
  }
}

module.exports = new EncryptionService();
