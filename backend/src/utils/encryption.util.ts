import crypto from 'crypto';
import { env } from '../config/env.config';

/**
 * Enterprise PII Field-Level Encryption Utility using AES-256-GCM
 *
 * Designed to ensure strict HIPAA compliance for protected health information (PHI)
 * such as Date of Birth (DOB), Social Security Number (SSN), and Insurance ID.
 *
 * Format of encrypted payload:
 *   enc:v1:<iv_hex>:<tag_hex>:<encrypted_data_hex>
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12; // NIST standard recommendation for GCM
const AUTH_TAG_LENGTH_BYTES = 16;
const ENCRYPTION_VERSION_PREFIX = 'enc:v1:';

const keyBuffer = Buffer.from(env.ENCRYPTION_KEY_PII, 'hex');

if (keyBuffer.length !== 32) {
  throw new Error('FATAL: ENCRYPTION_KEY_PII must resolve to exactly 32 bytes for AES-256-GCM.');
}

/**
 * Encrypts a plaintext string into a tamper-proof AES-256-GCM string representation.
 */
export function encryptPII(plainText: string | null | undefined): string | null {
  if (plainText === null || plainText === undefined || plainText === '') {
    return null;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv, {
      authTagLength: AUTH_TAG_LENGTH_BYTES,
    });

    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const ivHex = iv.toString('hex');
    const authTagHex = authTag.toString('hex');
    const encryptedHex = encrypted.toString('hex');

    return `${ENCRYPTION_VERSION_PREFIX}${ivHex}:${authTagHex}:${encryptedHex}`;
  } catch (err) {
    console.error('PII Encryption Error:', err);
    throw new Error('Encryption failed for sensitive field');
  }
}

/**
 * Decrypts an AES-256-GCM encrypted string back to plaintext.
 * Detects tampering or corruption via GCM authentication tag verification.
 */
export function decryptPII(cipherTextWithMeta: string | null | undefined): string | null {
  if (!cipherTextWithMeta) {
    return null;
  }

  // If data is not encrypted (e.g., legacy or mock data not prefixed), return as is or handle safely
  if (!cipherTextWithMeta.startsWith(ENCRYPTION_VERSION_PREFIX)) {
    return cipherTextWithMeta;
  }

  try {
    const parts = cipherTextWithMeta.slice(ENCRYPTION_VERSION_PREFIX.length).split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv, {
      authTagLength: AUTH_TAG_LENGTH_BYTES,
    });

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    console.error('PII Decryption Failure (Possible tampering or wrong key):', err);
    throw new Error('Decryption failed for sensitive field');
  }
}

/**
 * Utility to mask decrypted PII for logging or partial display (e.g. SSN ***-**-1234)
 */
export function maskSensitive(value: string | null | undefined, visibleTrailingChars = 4): string {
  if (!value) return '';
  if (value.length <= visibleTrailingChars) return '*'.repeat(value.length);
  const maskedLength = value.length - visibleTrailingChars;
  return '*'.repeat(maskedLength) + value.slice(-visibleTrailingChars);
}
