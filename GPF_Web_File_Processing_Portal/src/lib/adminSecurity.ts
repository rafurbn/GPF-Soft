import { supabase } from './supabase';
import type { UserAccountStatus, UserRole } from '../types';

/**
 * Server-side lockout and role control for the Super Admin Suite.
 *
 * The panel used to judge an account from its own localStorage map, which meant a
 * lockout created by the sign-in Edge Function (stored in `login_security_state`
 * and `profiles.account_status`) was invisible here. Everything in this module
 * reads or writes the database instead, through RPCs gated on `is_super_admin()`.
 */

export interface LoginSecurityRow {
  upazilaCode: string;
  failedAttempts: number;
  lockedUntil: string | null;
  autoLocked: boolean;
  accountStatus: UserAccountStatus;
}

const RPC_ERRORS: Record<string, string> = {
  SUPER_ADMIN_REQUIRED: 'এই কাজটি শুধুমাত্র সুপার এডমিন করতে পারবেন।',
  UPAZILA_PROFILE_NOT_FOUND: 'এই উপজেলা আইডি জন্য কোনো প্রোফাইল পাওয়া যায়নি।',
  INVALID_ROLE: 'অনুমোদিত ভূমিকা নয়।',
  CANNOT_CHANGE_OWN_ROLE: 'নিজের ভূমিকা নিজে পরিবর্তন করা যাবে না।',
  LAST_SUPER_ADMIN_PROTECTED: 'সর্বশেষ সক্রিয় সুপার এডমিনের ভূমিকা সরানো যাবে না।',
};

export const describeRpcError = (error: { message?: string; code?: string } | null): string => {
  const message = error?.message || '';
  const match = Object.keys(RPC_ERRORS).find((code) => message.includes(code));
  return match ? RPC_ERRORS[match] : message || 'সার্ভারে পরিবর্তন করা যায়নি।';
};

/** Failed-login counters and lock state for every account, straight from the database. */
export const fetchLoginSecurity = async (): Promise<LoginSecurityRow[]> => {
  if (!supabase) throw new Error('Supabase কনফিগার করা হয়নি।');
  const { data, error } = await supabase.rpc('admin_get_login_security');
  if (error) throw error;
  return ((data || []) as any[]).map((row) => ({
    upazilaCode: row.upazila_code as string,
    failedAttempts: Number(row.failed_attempts) || 0,
    lockedUntil: (row.locked_until as string | null) ?? null,
    autoLocked: Boolean(row.auto_locked),
    accountStatus: row.account_status as UserAccountStatus,
  }));
};

/** True while the temporary password lock is still in force. */
export const isLockActive = (row: LoginSecurityRow | undefined): boolean =>
  Boolean(row?.lockedUntil && new Date(row.lockedUntil).getTime() > Date.now());

export const remainingLockMinutes = (row: LoginSecurityRow): number =>
  Math.max(0, Math.ceil((new Date(row.lockedUntil as string).getTime() - Date.now()) / 60000));

/** Short human explanation of why an account is unusable, or null when it is healthy. */
export const securityAlertFor = (row: LoginSecurityRow | undefined): string | null => {
  if (!row) return null;
  if (isLockActive(row)) {
    return `ভুল পাসওয়ার্ডের কারণে ${remainingLockMinutes(row)} মিনিট লক (চেষ্টা: ${row.failedAttempts}/৫)`;
  }
  if (row.accountStatus === 'suspended') {
    return row.autoLocked
      ? 'ভুল পাসওয়ার্ডের কারণে স্বয়ংক্রিয়ভাবে স্থগিত'
      : 'অ্যাডমিন কর্তৃক সাময়িকভাবে স্থগিত';
  }
  if (row.accountStatus === 'deactivated') return 'স্থায়ীভাবে নিষ্ক্রিয় করা হয়েছে';
  if (row.failedAttempts > 0) return `ব্যর্থ লগইন চেষ্টা: ${row.failedAttempts}/৫`;
  return null;
};

/** Clears the failed-login counter and re-activates the account. May target a super_admin. */
export const unlockUpazilaOnServer = async (upazilaCode: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase কনফিগার করা হয়নি।');
  const { error } = await supabase.rpc('admin_unlock_upazila_account', {
    requested_upazila_code: upazilaCode,
  });
  if (error) throw new Error(describeRpcError(error));
};

export const assignUpazilaRoleOnServer = async (
  upazilaCode: string,
  role: UserRole,
): Promise<void> => {
  if (!supabase) throw new Error('Supabase কনফিগার করা হয়নি।');
  const { error } = await supabase.rpc('admin_set_upazila_role', {
    requested_upazila_code: upazilaCode,
    requested_role: role,
  });
  if (error) throw new Error(describeRpcError(error));
};
