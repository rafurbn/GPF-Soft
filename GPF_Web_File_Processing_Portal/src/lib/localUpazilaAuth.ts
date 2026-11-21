import type { UpazilaRecord } from '../data/upazilaData';
import type { UserSession } from '../types';

export const INSTANT_UPAZILA_SESSION_KEY = 'gpf-instant-upazila-session-v1';
const LOCAL_RECOVERY_STORAGE_KEY = 'gpf-upazila-local-recovery-v1';

interface LocalRecoveryEntry {
  email: string;
  password: string;
  updatedAt: string;
}

export const isInstantSession = (session: UserSession | null | undefined): boolean =>
  Boolean(session?.id?.startsWith('upazila-'));

export const buildInstantUpazilaSession = (
  record: UpazilaRecord,
  recoveryEmail?: string,
): UserSession => {
  const cleanEmail = (recoveryEmail || '').trim();
  return {
    id: `upazila-${record.defaultId}`,
    email: cleanEmail || record.email,
    upazila_code: record.defaultId,
    upazila_name_bn: record.upazilaBn,
    district_name_bn: record.districtBn,
    division_name_bn: record.divisionBn,
    region_edit_until: null,
    role: 'upazila_user',
    account_status: 'active',
    is_first_login: false,
    phone: '',
    last_login: new Date().toLocaleTimeString('bn-BD'),
  };
};

export const saveInstantUpazilaSession = (session: UserSession): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(INSTANT_UPAZILA_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage quota or private mode failures.
  }
};

export const readInstantUpazilaSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(INSTANT_UPAZILA_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserSession>;
    if (!parsed.upazila_code || !parsed.id) return null;
    return {
      id: parsed.id,
      email: parsed.email || '',
      upazila_code: parsed.upazila_code,
      upazila_name_bn: parsed.upazila_name_bn || '',
      district_name_bn: parsed.district_name_bn || '',
      division_name_bn: parsed.division_name_bn || '',
      region_edit_until: parsed.region_edit_until ?? null,
      role: parsed.role || 'upazila_user',
      account_status: parsed.account_status || 'active',
      is_first_login: Boolean(parsed.is_first_login),
      phone: parsed.phone || '',
      last_login: parsed.last_login || '—',
    };
  } catch {
    return null;
  }
};

export const clearInstantUpazilaSession = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(INSTANT_UPAZILA_SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
};

export const saveLocalRecoveryInfo = (
  upazilaCode: string,
  email: string,
  password: string,
): void => {
  if (typeof window === 'undefined' || !upazilaCode) return;
  try {
    const raw = window.localStorage.getItem(LOCAL_RECOVERY_STORAGE_KEY);
    const map = (raw ? JSON.parse(raw) : {}) as Record<string, LocalRecoveryEntry>;
    map[upazilaCode] = {
      email: email.trim(),
      password,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(LOCAL_RECOVERY_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures.
  }
};
