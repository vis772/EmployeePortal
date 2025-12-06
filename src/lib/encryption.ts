import crypto from 'crypto';

// Encryption key should be 32 bytes for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!'; // Must be 32 chars
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts sensitive data using AES-256-GCM
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  const key = Buffer.from(ENCRYPTION_KEY, 'utf-8');
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV + Auth Tag + Encrypted data
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts data encrypted with the encrypt function
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'utf-8');
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) return encryptedText;
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return original if decryption fails
  }
}

/**
 * Masks a string, showing only the last N characters
 */
export function maskString(str: string, visibleChars: number = 4): string {
  if (!str || str.length <= visibleChars) return str;
  return '*'.repeat(str.length - visibleChars) + str.slice(-visibleChars);
}

/**
 * Check if a string appears to be encrypted (has our format)
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 3 && parts[0].length === 32 && parts[1].length === 32;
}

