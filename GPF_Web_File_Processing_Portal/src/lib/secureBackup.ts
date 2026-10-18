/**
 * Encrypted full-system backup (মডিউল ৬).
 *
 * A plain JSON backup contains every upazila's employee names, GPF account
 * numbers and amounts, so it cannot simply sit on a shared computer. The file is
 * sealed with AES-256-GCM using a key derived from the operator's password by
 * PBKDF2-SHA256. GCM's authentication tag doubles as the integrity check: a wrong
 * password, or an edited file, fails to decrypt instead of returning garbage.
 *
 * WebCrypto's `subtle` only exists in secure contexts, so this works on the HTTPS
 * deployment and on localhost and refuses elsewhere rather than silently writing a
 * plaintext file.
 */

const MAGIC = 'GPF-ENCRYPTED-BACKUP-v1';
const SALT_BYTES = 16;
const IV_BYTES = 12;
const GCM_TAG_BYTES = 16;
const PBKDF2_ITERATIONS = 210_000;
const KEY_LENGTH_BITS = 256;

const webCrypto = (): Crypto => {
  if (!globalThis.crypto?.subtle) throw new Error('SECURE_CONTEXT_REQUIRED');
  return globalThis.crypto;
};

/** Copies into a fresh ArrayBuffer, which is what WebCrypto's inputs require. */
const toBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
};

const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const subtle = webCrypto().subtle;
  const material = await subtle.importKey('raw', toBuffer(new TextEncoder().encode(password)), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey(
    { name: 'PBKDF2', salt: toBuffer(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: KEY_LENGTH_BITS },
    false,
    ['encrypt', 'decrypt'],
  );
};

/** True when a file came from `encryptBackup()` rather than being plain JSON. */
export const isEncryptedBackupFile = (text: string): boolean => text.trimStart().startsWith(MAGIC);

export const encryptBackup = async (json: string, password: string): Promise<string> => {
  if (!password || password.length < 8) throw new Error('WEAK_PASSWORD');

  const crypto = webCrypto();
  const subtle = crypto.subtle;
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, salt);
  const cipher = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv: toBuffer(iv) }, key, toBuffer(new TextEncoder().encode(json))));

  const payload = new Uint8Array(SALT_BYTES + IV_BYTES + cipher.length);
  payload.set(salt, 0);
  payload.set(iv, SALT_BYTES);
  payload.set(cipher, SALT_BYTES + IV_BYTES);

  return `${MAGIC}\n${toBase64(payload)}\n`;
};

export const decryptBackup = async (envelope: string, password: string): Promise<string> => {
  const [header, body] = envelope.trim().split('\n');
  if (header !== MAGIC || !body) throw new Error('NOT_AN_ENCRYPTED_BACKUP');

  const bytes = fromBase64(body);
  if (bytes.length < SALT_BYTES + IV_BYTES + GCM_TAG_BYTES) throw new Error('CORRUPTED_BACKUP');

  const salt = bytes.slice(0, SALT_BYTES);
  const iv = bytes.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const cipher = bytes.slice(SALT_BYTES + IV_BYTES);
  const key = await deriveKey(password, salt);

  try {
    const plain = await webCrypto().subtle.decrypt({ name: 'AES-GCM', iv: toBuffer(iv) }, key, toBuffer(cipher));
    return new TextDecoder().decode(plain);
  } catch {
    // GCM tag mismatch: wrong password, or the file was altered after export.
    throw new Error('DECRYPTION_FAILED');
  }
};

/** Human-readable Bengali message for the error codes thrown above. */
export const describeBackupError = (error: unknown): string => {
  const code = error instanceof Error ? error.message : String(error ?? '');
  switch (code) {
    case 'SECURE_CONTEXT_REQUIRED':
      return 'এই ডিভাইসে এনক্রিপশন সাপোর্ট নেই: সাইটটি HTTPS মাধ্যমে খুলুন।';
    case 'WEAK_PASSWORD':
      return 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।';
    case 'NOT_AN_ENCRYPTED_BACKUP':
      return 'এই ফাইলটি এই সিস্টেমের এনক্রিপ্টেড ব্যাকআপ ফাইল নয়।';
    case 'CORRUPTED_BACKUP':
      return 'ব্যাকআপ ফাইলটি অসম্পূর্ণ বা ক্ষতিগ্রস্ত।';
    case 'DECRYPTION_FAILED':
      return 'পাসওয়ার্ড ভুল, অথবা ফাইলটি পরিবর্তন করা হয়েছে।';
    case 'INVALID_BACKUP_JSON':
      return 'ব্যাকআপের ভেতরের ডাটা সাজানো অবস্থায় নেই।';
    default:
      return code || 'ব্যাকআপ প্রসেস করতে সমস্যা হয়েছে।';
  }
};

/**
 * Parses a backup file (plain JSON, or already decrypted) and rejects anything
 * that is not a portal backup.
 */
export const parseBackupPayload = <T = unknown,>(json: string): T => {
  const parsed = JSON.parse(json) as Partial<Record<'portal' | 'exportedAt', unknown>> | null;
  if (!parsed || typeof parsed !== 'object' || typeof parsed.portal !== 'string' || typeof parsed.exportedAt !== 'string') {
    throw new Error('INVALID_BACKUP_JSON');
  }
  return parsed as T;
};
