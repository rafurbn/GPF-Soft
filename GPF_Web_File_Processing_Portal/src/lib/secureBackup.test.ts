import { describe, expect, it } from 'vitest';
import {
  decryptBackup,
  describeBackupError,
  encryptBackup,
  isEncryptedBackupFile,
  parseBackupPayload,
} from './secureBackup';

const SAMPLE = JSON.stringify({ portal: 'GPF Online File Processing Hub', exportedAt: '2026-10-18T00:00:00.000Z', centralClaims: [{ id: 'c1' }] });

describe('encrypted backup', () => {
  it('round-trips a backup through AES-GCM', async () => {
    const sealed = await encryptBackup(SAMPLE, 's0me-long-pass');
    expect(isEncryptedBackupFile(sealed)).toBe(true);
    expect(sealed).not.toContain('GPF Online File Processing Hub');
    expect(await decryptBackup(sealed, 's0me-long-pass')).toBe(SAMPLE);
  });

  it('refuses a weak password', async () => {
    await expect(encryptBackup(SAMPLE, 'short')).rejects.toThrow('WEAK_PASSWORD');
  });

  it('uses a fresh key per file so identical backups differ', async () => {
    const a = await encryptBackup(SAMPLE, 's0me-long-pass');
    const b = await encryptBackup(SAMPLE, 's0me-long-pass');
    expect(a).not.toBe(b);
  });

  it('detects a wrong password or a tampered file through the GCM tag', async () => {
    const sealed = await encryptBackup(SAMPLE, 's0me-long-pass');
    await expect(decryptBackup(sealed, 'wrong-password')).rejects.toThrow('DECRYPTION_FAILED');

    const [magic, body] = sealed.trim().split('\n');
    const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
    bytes[bytes.length - 1] ^= 0xff;
    const tampered = `${magic}\n${btoa(String.fromCharCode(...bytes))}\n`;
    await expect(decryptBackup(tampered, 's0me-long-pass')).rejects.toThrow('DECRYPTION_FAILED');
  });

  it('rejects files that are not backups', async () => {
    expect(isEncryptedBackupFile('{"hello":1}')).toBe(false);
    await expect(decryptBackup('not a backup', 's0me-long-pass')).rejects.toThrow('NOT_AN_ENCRYPTED_BACKUP');
    expect(() => parseBackupPayload('{}')).toThrow('INVALID_BACKUP_JSON');
    expect(() => parseBackupPayload('{"portal":"x","exportedAt":"y"}')).not.toThrow();
  });

  it('explains every failure in Bengali', () => {
    expect(describeBackupError(new Error('DECRYPTION_FAILED'))).toContain('পাসওয়ার্ড');
    expect(describeBackupError(new Error('WEAK_PASSWORD'))).toContain('৮');
  });
});
