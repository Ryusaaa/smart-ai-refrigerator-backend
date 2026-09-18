import * as cryptoUtils from './crypto.utils.mjs';
import env from '../../config/env.mjs';
import { AppError } from '../../middlewares/error.middleware.mjs';

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

export default new EncryptionService();
