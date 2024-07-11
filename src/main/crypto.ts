import crypto from 'crypto';

export function encrypt(key: Buffer, text: string): string {
  const plaintext = Buffer.from(text, 'utf8');

  const blockSize = 16; // AES block size
  const iv = crypto.randomBytes(blockSize);

  const cipher = crypto.createCipheriv('aes-128-cfb', key, iv);
  const encrypted = Buffer.concat([
    iv,
    cipher.update(plaintext),
    cipher.final(),
  ]);

  return encrypted.toString('base64');
}

export function decrypt(key: Buffer, encryptedText: string): string {
  const encryptedBuffer = Buffer.from(encryptedText, 'base64');

  const blockSize = 16; // AES block size
  const iv = encryptedBuffer.slice(0, blockSize);
  const ciphertext = encryptedBuffer.slice(blockSize);

  const decipher = crypto.createDecipheriv('aes-128-cfb', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
