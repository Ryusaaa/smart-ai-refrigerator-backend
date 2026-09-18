import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

export function encrypt(buffer, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted.toString('hex')
  };
}

export function decrypt(encryptedObj, key) {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(encryptedObj.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedObj.encryptedData, 'hex')), decipher.final()]);
  return decrypted;
}
