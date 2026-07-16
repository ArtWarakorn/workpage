import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPT_SECRET || process.env.NEXT_PUBLIC_ENCRYPT_SECRET;

/**
 * เข้ารหัส userId → ได้ ciphertext สำหรับใช้ใน URL
 * ใช้ encodeURIComponent() เพื่อให้ URL-safe (แทน +, /, = ใน AES output)
 */
export function encryptId(userId) {
  const encrypted = CryptoJS.AES.encrypt(String(userId), SECRET_KEY).toString();
  return encodeURIComponent(encrypted);
}

/**
 * ถอดรหัส ciphertext จาก URL → ได้ userId จริง (เป็น string)
 * ถ้าถอดรหัสไม่ได้ คืนค่า null
 */
export function decryptId(encryptedId) {
  try {
    const decoded = decodeURIComponent(encryptedId);
    const bytes = CryptoJS.AES.decrypt(decoded, SECRET_KEY);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result || null;
  } catch {
    return null;
  }
}
