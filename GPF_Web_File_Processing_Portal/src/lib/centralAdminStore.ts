import { CentralClaimRecord, SystemAnnouncement, AppMaintenanceControl, AuditLogEntry, ActiveSession, UserAccountStatus, UserSession } from '../types';
import { supabase } from './supabase';
import { findUpazilaByDefaultId } from '../data/upazilaData';
import { toBn, moneyCompact } from './format';

// Storage keys
const STORAGE_KEY_CENTRAL_CLAIMS = 'gpf_central_claims_v1';
const STORAGE_KEY_USER_STATUSES = 'gpf_admin_user_statuses_v1';
const STORAGE_KEY_AUDIT_LOGS = 'gpf_admin_audit_logs_v1';
const STORAGE_KEY_ACTIVE_SESSIONS = 'gpf_admin_active_sessions_v1';
const STORAGE_KEY_ANNOUNCEMENTS = 'gpf_admin_announcements_v1';
const STORAGE_KEY_APP_MAINTENANCE = 'gpf_admin_app_maintenance_v1';

// Initial default maintenance states
const DEFAULT_APP_MAINTENANCE: AppMaintenanceControl[] = [
  { appId: 'app1', appName: '১. ফেরতযোগ্য অগ্রিম উত্তোলন', isLocked: false, lockReason: '', updatedAt: new Date().toISOString() },
  { appId: 'app2', appName: '২. অফেরতযোগ্য অগ্রিম উত্তোলন', isLocked: false, lockReason: '', updatedAt: new Date().toISOString() },
  { appId: 'app3', appName: '৩. চূড়ান্ত উত্তোলন ও নো-ডিমান্ড', isLocked: false, lockReason: '', updatedAt: new Date().toISOString() },
  { appId: 'app4', appName: '৪. জিপিএফ মৃত্যুদাবী নিষ্পত্তি', isLocked: false, lockReason: '', updatedAt: new Date().toISOString() },
];

// Helper for safe localStorage access
const getLocal = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or disabled errors
  }
};

// ---------------------------------------------------------------------------
// 1. Central Claims Management (এ্যাপ ১-৪ এর ডেটা সংগ্রহ ও পর্যবেক্ষণ)
// ---------------------------------------------------------------------------
export const getCentralClaims = (): CentralClaimRecord[] => {
  const claims = getLocal<CentralClaimRecord[]>(STORAGE_KEY_CENTRAL_CLAIMS, []);
  if (claims.length === 0) {
    // Auto-discover / seed from local sub-apps if available
    const seeded = discoverExistingSubAppClaims();
    if (seeded.length > 0) {
      setLocal(STORAGE_KEY_CENTRAL_CLAIMS, seeded);
      return seeded;
    }
  }
  return claims;
};

/**
 * Pulls the hub's claim list from Supabase into the local mirror.
 *
 * `deleted_at` only exists once the trash migration has been applied, so the
 * filtered query is retried without the filter: an un-migrated project must still
 * show its claims instead of failing the whole panel.
 */
export const hydrateCentralClaims = async (): Promise<CentralClaimRecord[]> => {
  if (!supabase) return getCentralClaims();
  const client = supabase;
  const pageSize = 1000;

  const collect = async (skipTrashed: boolean): Promise<CentralClaimRecord[]> => {
    const records: CentralClaimRecord[] = [];
    for (let from = 0; ; from += pageSize) {
      const base = client
        .from('central_claims')
        .select('record')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      const { data, error } = await (skipTrashed ? base.is('deleted_at', null) : base);
      if (error) throw error;
      const page = (data || []).map((row) => row.record as CentralClaimRecord);
      records.push(...page);
      if (page.length < pageSize) break;
    }
    return records;
  };

  let records: CentralClaimRecord[];
  try {
    records = await collect(true);
  } catch {
    records = await collect(false);
  }
  setLocal(STORAGE_KEY_CENTRAL_CLAIMS, records);
  return records;
};

export const persistAnnouncementToServer = async (announcement: SystemAnnouncement): Promise<void> => {
  if (!supabase) throw new Error('Supabase Auth is not configured.');
  const { error } = await supabase.from('system_announcements').upsert({
    id: announcement.id,
    target_upazila_code: announcement.targetUpazilaCode || null,
    is_active: announcement.isActive,
    payload: announcement,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
};

export const updateAnnouncementOnServer = async (id: string, patch: Partial<SystemAnnouncement>): Promise<void> => {
  if (!supabase) throw new Error('Supabase Auth is not configured.');
  const { data, error: readError } = await supabase
    .from('system_announcements')
    .select('payload')
    .eq('id', id)
    .single();
  if (readError) throw readError;
  const announcement = { ...(data.payload as SystemAnnouncement), ...patch };
  const { error } = await supabase
    .from('system_announcements')
    .update({ payload: announcement, is_active: announcement.isActive, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

export const deleteAnnouncementFromServer = async (id: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase Auth is not configured.');
  const { error } = await supabase.from('system_announcements').delete().eq('id', id);
  if (error) throw error;
};

export const hydrateAnnouncements = async (upazilaCode?: string): Promise<SystemAnnouncement[]> => {
  if (!supabase) return getActiveAnnouncementsForUser(upazilaCode);
  const { data, error } = await supabase
    .from('system_announcements')
    .select('payload')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const announcements = (data || []).map((row) => row.payload as SystemAnnouncement);
  setLocal(STORAGE_KEY_ANNOUNCEMENTS, announcements);
  return announcements.filter((item) => item.isActive && (!item.targetUpazilaCode || item.targetUpazilaCode === upazilaCode));
};

export const hydrateMaintenanceStates = async (): Promise<AppMaintenanceControl[]> => {
  if (!supabase) return getAppMaintenanceStates();
  const { data, error } = await supabase
    .from('app_maintenance_controls')
    .select('app_id,app_name,is_locked,lock_reason,updated_at');
  if (error) throw error;
  const remoteById = new Map((data || []).map((row) => [row.app_id, row]));
  const merged = DEFAULT_APP_MAINTENANCE.map((defaultState) => {
    const remote = remoteById.get(defaultState.appId);
    return remote ? {
      appId: defaultState.appId,
      appName: remote.app_name,
      isLocked: remote.is_locked,
      lockReason: remote.lock_reason,
      updatedAt: remote.updated_at,
    } : defaultState;
  });
  setLocal(STORAGE_KEY_APP_MAINTENANCE, merged);
  return merged;
};

export const persistMaintenanceStateToServer = async (state: AppMaintenanceControl): Promise<void> => {
  if (!supabase) throw new Error('Supabase Auth is not configured.');
  const { error } = await supabase.from('app_maintenance_controls').upsert({
    app_id: state.appId,
    app_name: state.appName,
    is_locked: state.isLocked,
    lock_reason: state.lockReason,
    updated_at: state.updatedAt,
  });
  if (error) throw error;
};

export const getRemoteMaintenanceState = async (appId: string): Promise<AppMaintenanceControl | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('app_maintenance_controls')
    .select('app_id,app_name,is_locked,lock_reason,updated_at')
    .eq('app_id', appId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    appId: data.app_id,
    appName: data.app_name,
    isLocked: data.is_locked,
    lockReason: data.lock_reason,
    updatedAt: data.updated_at,
  };
};

export const saveCentralClaim = (record: CentralClaimRecord): void => {
  const claims = getCentralClaims();
  const existingIdx = claims.findIndex((c) => c.id === record.id || (c.appType === record.appType && c.trackingNo === record.trackingNo && c.upazilaCode === record.upazilaCode));

  let updatedList: CentralClaimRecord[];
  if (existingIdx >= 0) {
    updatedList = [...claims];
    updatedList[existingIdx] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    updatedList = [{ ...record, createdAt: record.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }, ...claims];
  }

  setLocal(STORAGE_KEY_CENTRAL_CLAIMS, updatedList);

  addAuditLog({
    eventType: 'claim_saved',
    upazilaCode: record.upazilaCode,
    email: record.details?.email || 'upazila@dpe.gov.bd',
    description: `${record.appTitle}-এ কর্মচারীর (${record.employeeName}, জিপিএফ: ${record.gpfAccNo}) দাবি ফাইল সংরক্ষিত হয়েছে। পরিমাণ: ৳${moneyCompact(record.amount)}`,
    status: 'success',
  });
};



export const getClaimsStats = () => {
  const claims = getCentralClaims();
  const totalClaims = claims.length;
  const totalAmount = claims.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const byApp: Record<string, { count: number; amount: number; title: string }> = {
    app1: { count: 0, amount: 0, title: '১. ফেরতযোগ্য অগ্রিম' },
    app2: { count: 0, amount: 0, title: '২. অফেরতযোগ্য অগ্রিম' },
    app3: { count: 0, amount: 0, title: '৩. চূড়ান্ত উত্তোলন' },
    app4: { count: 0, amount: 0, title: '৪. মৃত্যুদাবী নিষ্পত্তি' },
  };

  const byDistrict: Record<string, number> = {};
  const byStatus: Record<string, number> = {
    'খসড়া': 0,
    'যাচাইকৃত': 0,
    'অনুমোদিত': 0,
    'প্রস্তুত': 0,
    'বাতিল': 0,
  };

  claims.forEach((c) => {
    if (byApp[c.appType]) {
      byApp[c.appType].count += 1;
      byApp[c.appType].amount += Number(c.amount) || 0;
    }
    const dist = c.districtNameBn || 'অন্যান্য';
    byDistrict[dist] = (byDistrict[dist] || 0) + 1;

    const st = c.status || 'প্রস্তুত';
    byStatus[st] = (byStatus[st] || 0) + 1;
  });

  return { totalClaims, totalAmount, byApp, byDistrict, byStatus };
};

// Scan this browser's localStorage for claims saved by App 1-4 so the hub is not
// empty when Supabase is unavailable. Records are described only by their own
// fields: nothing is invented, and a missing value stays missing.
const SUB_APP_CLAIM_SOURCES: { appType: CentralClaimRecord['appType']; baseKey: string; appTitle: string }[] = [
  { appType: 'app1', baseKey: 'gpf_advance_saved_records_v2', appTitle: '১. ফেরতযোগ্য অগ্রিম' },
  { appType: 'app2', baseKey: 'gpf_nonrefundable_records_v2', appTitle: '২. অফেরতযোগ্য অগ্রিম' },
  { appType: 'app3', baseKey: 'gpf_final_applet_records_v2', appTitle: '৩. চূড়ান্ত উত্তোলন' },
  { appType: 'app4', baseKey: 'gpf_death_claims_data_v3', appTitle: '৪. জিপিএফ মৃত্যুদাবী নিষ্পত্তি' },
];

const CLAIM_STATUS_VALUES: CentralClaimRecord['status'][] = ['খসড়া', 'যাচাইকৃত', 'অনুমোদিত', 'বাতিল', 'প্রস্তুত'];

/** First non-empty value among `keys`; camelCase and snake_case both accepted. */
const pickField = (item: Record<string, any>, keys: string[]): string => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return '';
};

const pickAmount = (item: Record<string, any>, keys: string[]): number =>
  Number(pickField(item, keys).replace(/[^\d.]/g, '')) || 0;

/** `gpf~~<scope>~~<baseKey>` -> scope + base key; unscoped legacy keys get a null scope. */
const splitStorageKey = (key: string): { scope: string | null; baseKey: string } | null => {
  if (key.startsWith('gpf~~')) {
    const parts = key.split('~~');
    if (parts.length < 3) return null;
    return { scope: parts[1], baseKey: parts.slice(2).join('~~') };
  }
  return { scope: null, baseKey: key };
};

function discoverExistingSubAppClaims(): CentralClaimRecord[] {
  if (typeof window === 'undefined') return [];

  const activeScope = window.localStorage.getItem('gpf-active-upazila-code') || '';
  const found: CentralClaimRecord[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const storageKey = window.localStorage.key(index);
    if (!storageKey) continue;
    const split = splitStorageKey(storageKey);
    if (!split) continue;
    const source = SUB_APP_CLAIM_SOURCES.find((item) => item.baseKey === split.baseKey);
    if (!source) continue;
    // An unscoped legacy key belongs to whichever upazila is using this browser now.
    const upazilaCode = split.scope && split.scope !== 'shared' ? split.scope : activeScope;
    const scopeUpazila = findUpazilaByDefaultId(upazilaCode);

    let parsed: unknown;
    try {
      parsed = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    } catch {
      continue;
    }
    const rows: Record<string, any>[] = Array.isArray(parsed)
      ? parsed as Record<string, any>[]
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as any).records)
        ? (parsed as any).records
        : [];

    rows.forEach((item, i) => {
      if (!item || typeof item !== 'object') return;
      const id = pickField(item, ['id']);
      const status = pickField(item, ['status']);
      const resolvedStatus = CLAIM_STATUS_VALUES.includes(status as CentralClaimRecord['status'])
        ? (status as CentralClaimRecord['status'])
        : 'প্রস্তুত';
      found.push({
        id: id || `local-${source.appType}-${upazilaCode || 'shared'}-${i}`,
        appType: source.appType,
        appTitle: source.appTitle,
        upazilaCode,
        upazilaNameBn: pickField(item, ['upazilaName', 'upazila_name', 'upazila_name_bn']) || scopeUpazila?.upazilaBn || '',
        districtNameBn: pickField(item, ['districtName', 'district_name', 'district_name_bn']) || scopeUpazila?.districtBn || '',
        trackingNo: pickField(item, ['trackingNo', 'tracking_no']) || id,
        employeeName: pickField(item, ['applicantName', 'applicant_name', 'deceasedEmployeeName', 'employeeName']),
        designation: pickField(item, ['designation', 'post']),
        gpfAccNo: pickField(item, ['gpfAccNo', 'gpf_acc_no', 'gpfAccountNo', 'gpf_account_no']),
        amount: pickAmount(item, ['requestedAmount', 'amount', 'depositedAmount', 'finalAmount', 'sanctionedAmount']),
        status: resolvedStatus,
        applyDate: pickField(item, ['applyDate', 'apply_date', 'applicationDate', 'application_date']),
        createdAt: pickField(item, ['createdAt', 'created_at']) || new Date().toISOString(),
        updatedAt: pickField(item, ['updatedAt', 'updated_at']) || new Date().toISOString(),
        details: item,
      });
    });
  }

  return found;
}

// ---------------------------------------------------------------------------
// 2. User & Access Control (অ্যাকাউন্ট স্ট্যাটাস, OTP, সাসপেন্ড ও আনলক)
// ---------------------------------------------------------------------------
export interface UserStatusMap {
  [upazilaCodeOrUserId: string]: {
    status: UserAccountStatus;
    suspendedReason?: string;
    updatedAt: string;
    lockedUntil?: string | null;
  };
}

export const getUserStatuses = (): UserStatusMap => {
  return getLocal<UserStatusMap>(STORAGE_KEY_USER_STATUSES, {});
};

export const getUserStatus = (key: string): UserAccountStatus => {
  const map = getUserStatuses();
  return map[key]?.status || 'active';
};

export const setUserAccountStatus = (
  upazilaCode: string,
  status: UserAccountStatus,
  suspendedReason?: string
): void => {
  const map = getUserStatuses();
  map[upazilaCode] = {
    status,
    suspendedReason: suspendedReason || (status === 'suspended' ? 'অ্যাডমিন কর্তৃক সাময়িকভাবে স্থগিত' : ''),
    updatedAt: new Date().toISOString(),
    lockedUntil: status === 'active' ? null : map[upazilaCode]?.lockedUntil,
  };
  setLocal(STORAGE_KEY_USER_STATUSES, map);

  addAuditLog({
    eventType: 'status_change',
    upazilaCode,
    email: 'admin@dpe.gov.bd',
    description: `উপজেলা (${upazilaCode}) এর অ্যাকাউন্ট স্ট্যাটাস পরিবর্তিত হয়েছে: ${status.toUpperCase()} ${suspendedReason ? `(${suspendedReason})` : ''}`,
    status: status === 'active' ? 'success' : status === 'suspended' ? 'warning' : 'danger',
  });
};

export const unlockUserAccount = (upazilaCode: string): void => {
  setUserAccountStatus(upazilaCode, 'active');

  addAuditLog({
    eventType: 'status_change',
    upazilaCode,
    email: 'admin@dpe.gov.bd',
    description: `সুপার অ্যাডমিন কর্তৃক উপজেলা (${upazilaCode}) এর অ্যাকাউন্ট আনলক এবং সক্রিয় করা হয়েছে।`,
    status: 'success',
  });
};

// ---------------------------------------------------------------------------
// 5. Audit Logging (লাইভ অডিট লগ ও নিরাপত্তা ট্র্যাকিং)
// ---------------------------------------------------------------------------
export const getAuditLogs = (): AuditLogEntry[] => {
  return getLocal<AuditLogEntry[]>(STORAGE_KEY_AUDIT_LOGS, []);
};

export const hydrateAuditLogs = async (): Promise<AuditLogEntry[]> => {
  if (!supabase) return getAuditLogs();
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('payload')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  const logs = (data || []).map((row) => row.payload as AuditLogEntry);
  setLocal(STORAGE_KEY_AUDIT_LOGS, logs);
  return logs;
};

export const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void => {
  const logs = getAuditLogs();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };

  const updated = [newEntry, ...logs.slice(0, 499)]; // Keep latest 500
  setLocal(STORAGE_KEY_AUDIT_LOGS, updated);
  const client = supabase;
  if (client) {
    void client.auth.getUser().then(({ data: userData }) => {
      if (!userData.user) return;
      return client.from('admin_audit_logs').insert({
        id: newEntry.id,
        upazila_code: newEntry.upazilaCode,
        user_id: userData.user.id,
        payload: newEntry,
      });
    }).then((result) => {
      if (result?.error) console.warn('[centralAdminStore] Audit log sync failed:', result.error.message);
    });
  }
};

export const clearAuditLogs = (): void => {
  setLocal(STORAGE_KEY_AUDIT_LOGS, []);
};

export const clearAuditLogsOnServer = async (): Promise<void> => {
  if (!supabase) throw new Error('Supabase Auth is not configured.');
  const { error } = await supabase.from('admin_audit_logs').delete().gte('created_at', '1970-01-01T00:00:00.000Z');
  if (error) throw error;
  clearAuditLogs();
};

// ---------------------------------------------------------------------------
// 6. Active Session Control & Force Logout (সক্রিয় সেশন কন্ট্রোল)
// ---------------------------------------------------------------------------
export const getActiveSessions = (): ActiveSession[] => {
  return getLocal<ActiveSession[]>(STORAGE_KEY_ACTIVE_SESSIONS, []);
};

export const hydrateActiveSessions = async (): Promise<ActiveSession[]> => {
  if (!supabase) return getActiveSessions();
  const { data, error } = await supabase
    .from('active_sessions')
    .select('record,last_seen_at')
    .is('terminated_at', null)
    .order('last_seen_at', { ascending: false });
  if (error) throw error;
  const sessions = (data || []).map((row) => {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(row.last_seen_at).getTime()) / 60000));
    return {
      ...(row.record as ActiveSession),
      lastActiveTime: minutes === 0 ? 'এখনই সক্রিয়' : `${toBn(minutes)} মিনিট আগে`,
    };
  });
  setLocal(STORAGE_KEY_ACTIVE_SESSIONS, sessions);
  return sessions;
};

export const registerActiveSession = (session: Omit<ActiveSession, 'sessionId' | 'lastActiveTime'>): string => {
  const sessions = getActiveSessions();
  let sessionId = '';
  if (typeof window !== 'undefined') {
    try {
      sessionId = window.sessionStorage.getItem('gpf-active-session-id') || '';
    } catch {
      // Generate a new id below when session storage is unavailable.
    }
  }
  if (!sessionId) {
    sessionId = `sess-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`}`;
  }
  const newSession: ActiveSession = {
    ...session,
    sessionId,
    lastActiveTime: 'সবেমাত্র সক্রিয়',
  };

  // Filter out duplicate sessions for same upazila
  const filtered = sessions.filter((s) => s.upazilaCode !== session.upazilaCode || s.isCurrentSession);
  setLocal(STORAGE_KEY_ACTIVE_SESSIONS, [newSession, ...filtered]);
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem('gpf-active-session-id', sessionId);
    } catch {
      // Session registration still proceeds if browser storage is unavailable.
    }
  }
  if (supabase) {
    void supabase.from('active_sessions').upsert({
      session_id: sessionId,
      user_id: session.userId,
      upazila_code: session.upazilaCode,
      record: newSession,
      terminated_at: null,
      last_seen_at: new Date().toISOString(),
    }, { onConflict: 'session_id' }).then(({ error }) => {
      if (error) console.warn('[centralAdminStore] Session registration failed:', error.message);
    });
  }
  return sessionId;
};

export const terminateSessionOnServer = async (sessionId: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase Auth is not configured.');
  const { error } = await supabase.from('active_sessions')
    .update({ terminated_at: new Date().toISOString() })
    .eq('session_id', sessionId);
  if (error) throw error;
};

export const isCurrentSessionTerminated = async (): Promise<boolean> => {
  if (!supabase || typeof window === 'undefined') return false;
  const sessionId = window.sessionStorage.getItem('gpf-active-session-id');
  if (!sessionId) return false;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return true;
  const { data, error } = await supabase.from('active_sessions')
    .select('terminated_at')
    .eq('session_id', sessionId)
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.terminated_at);
};

export const touchCurrentSession = async (): Promise<void> => {
  if (!supabase || typeof window === 'undefined') return;
  const sessionId = window.sessionStorage.getItem('gpf-active-session-id');
  if (!sessionId) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  const session = getActiveSessions().find((item) => item.sessionId === sessionId);
  if (!session) return;
  const now = new Date().toISOString();
  const { error } = await supabase.from('active_sessions')
    .update({
      last_seen_at: now,
      record: { ...session, lastActiveTime: 'এখনই সক্রিয়' },
    })
    .eq('session_id', sessionId)
    .eq('user_id', userData.user.id);
  if (error) throw error;
};

export const isCurrentAccountActive = async (): Promise<boolean> => {
  if (!supabase) return false;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;
  const { data, error } = await supabase.from('profiles')
    .select('account_status')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (error) throw error;
  return data?.account_status === 'active';
};

export const endCurrentSessionOnServer = async (): Promise<void> => {
  if (!supabase || typeof window === 'undefined') return;
  const sessionId = window.sessionStorage.getItem('gpf-active-session-id');
  if (!sessionId) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  const { error } = await supabase.from('active_sessions')
    .update({ terminated_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .eq('user_id', userData.user.id);
  if (error) throw error;
  window.sessionStorage.removeItem('gpf-active-session-id');
};

export const terminateSession = (sessionId: string): void => {
  const sessions = getActiveSessions();
  const target = sessions.find((s) => s.sessionId === sessionId);
  const remaining = sessions.filter((s) => s.sessionId !== sessionId);
  setLocal(STORAGE_KEY_ACTIVE_SESSIONS, remaining);

  if (target) {
    addAuditLog({
      eventType: 'force_logout',
      upazilaCode: target.upazilaCode,
      email: target.email,
      description: `সুপার এডমিন কর্তৃক সেশন ফোর্স লগআউট (Terminate Session) করা হয়েছে: ${target.upazilaNameBn}`,
      status: 'danger',
    });
  }
};

// ---------------------------------------------------------------------------
// 7. Central Notice & Broadcast System (কেন্দ্রীয় নোটিশ ও ব্রডকাস্ট)
// ---------------------------------------------------------------------------
export const getAnnouncements = (): SystemAnnouncement[] => {
  return getLocal<SystemAnnouncement[]>(STORAGE_KEY_ANNOUNCEMENTS, []);
};

export const getActiveAnnouncementsForUser = (userUpazilaCode?: string): SystemAnnouncement[] => {
  const all = getAnnouncements();
  return all.filter((a) => {
    if (!a.isActive) return false;
    if (!a.targetUpazilaCode) return true; // targeted to all
    return a.targetUpazilaCode === userUpazilaCode;
  });
};

export const saveAnnouncement = (data: Omit<SystemAnnouncement, 'id' | 'createdAt'>): SystemAnnouncement => {
  const all = getAnnouncements();
  const newAnn: SystemAnnouncement = {
    ...data,
    id: `ann-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  setLocal(STORAGE_KEY_ANNOUNCEMENTS, [newAnn, ...all]);

  addAuditLog({
    eventType: 'announcement',
    upazilaCode: data.targetUpazilaCode || 'ALL',
    email: 'admin@dpe.gov.bd',
    description: `নতুন কেন্দ্রীয় নোটিশ জারি করা হয়েছে: "${data.title}" (প্রাপক: ${data.targetUpazilaName || 'সারাদেশ'})`,
    status: 'success',
  });

  return newAnn;
};

export const toggleAnnouncement = (id: string, isActive: boolean): void => {
  const all = getAnnouncements();
  const updated = all.map((a) => (a.id === id ? { ...a, isActive } : a));
  setLocal(STORAGE_KEY_ANNOUNCEMENTS, updated);
};

export const deleteAnnouncement = (id: string): void => {
  const all = getAnnouncements();
  const updated = all.filter((a) => a.id !== id);
  setLocal(STORAGE_KEY_ANNOUNCEMENTS, updated);
};

// ---------------------------------------------------------------------------
// 8. Policy & App Maintenance Control (এ্যাপ-ভিত্তিক লক/আনলক)
// ---------------------------------------------------------------------------
export const getAppMaintenanceStates = (): AppMaintenanceControl[] => {
  return getLocal<AppMaintenanceControl[]>(STORAGE_KEY_APP_MAINTENANCE, DEFAULT_APP_MAINTENANCE);
};

export const isAppLocked = (appId: string): { isLocked: boolean; reason: string; appName: string } => {
  const list = getAppMaintenanceStates();
  const found = list.find((a) => a.appId === appId);
  if (found && found.isLocked) {
    return {
      isLocked: true,
      reason: found.lockReason || 'সার্ভার রক্ষণাবেক্ষণ ও ডাটা আপগ্রেডের জন্য এই এ্যাপটি সাময়িক বন্ধ আছে।',
      appName: found.appName,
    };
  }
  return { isLocked: false, reason: '', appName: found?.appName || '' };
};

export const setAppMaintenanceState = (
  appId: 'app1' | 'app2' | 'app3' | 'app4',
  isLocked: boolean,
  lockReason: string = ''
): void => {
  const list = getAppMaintenanceStates();
  const updated = list.map((a) => {
    if (a.appId === appId) {
      return {
        ...a,
        isLocked,
        lockReason: isLocked ? lockReason : '',
        updatedAt: new Date().toISOString(),
      };
    }
    return a;
  });

  setLocal(STORAGE_KEY_APP_MAINTENANCE, updated);

  addAuditLog({
    eventType: 'app_lock',
    upazilaCode: 'ALL',
    email: 'admin@dpe.gov.bd',
    description: `${appId.toUpperCase()} এর রক্ষণাবেক্ষণ স্ট্যাটাস পরিবর্তিত হয়েছে: ${isLocked ? 'লকড (সাময়িক বন্ধ)' : 'সচল (উন্মুক্ত)'}. কারণ: ${lockReason || 'স্বাভাবিক অপারেশন'}`,
    status: isLocked ? 'warning' : 'success',
  });
};

// ---------------------------------------------------------------------------
// 9. Backup, Export & Purge System (এক ক্লিকে ফুল ব্যাকআপ ও ক্লিনআপ)
// ---------------------------------------------------------------------------
/**
 * The one shape every backup (plain or encrypted) is written from, and the shape
 * a restore reads back. Defining it once is what keeps the two in agreement.
 */
export interface BackupPayload {
  exportedAt: string;
  version: string;
  authority: string;
  portal: string;
  statistics: ReturnType<typeof getClaimsStats>;
  registeredUsers: UserSession[];
  userStatuses: UserStatusMap;
  centralClaims: CentralClaimRecord[];
  claimTrash: CentralClaimRecord[];
  announcements: SystemAnnouncement[];
  appMaintenance: AppMaintenanceControl[];
  auditLogs: AuditLogEntry[];
  activeSessions: ActiveSession[];
}

export const buildBackupPayload = (registeredUsers: UserSession[]): BackupPayload => ({
  exportedAt: new Date().toISOString(),
  version: '2.1.0-PROD',
  authority: "Government of the People's Republic of Bangladesh",
  portal: 'GPF Online File Processing Hub',
  statistics: getClaimsStats(),
  registeredUsers,
  userStatuses: getUserStatuses(),
  centralClaims: getCentralClaims(),
  claimTrash: getTrashedClaims(),
  announcements: getAnnouncements(),
  appMaintenance: getAppMaintenanceStates(),
  auditLogs: getAuditLogs(),
  activeSessions: getActiveSessions(),
});

/**
 * Writes a backup payload back into every local store.
 *
 * `centralClaims` and `claimTrash` are the lists a caller may choose to skip:
 * restoring them overwrites work that happened after the backup was taken, so
 * the panel asks for that decision instead of assuming it.
 */
export const applyBackupSnapshot = (
  payload: BackupPayload,
  options: { includeClaims?: boolean } = {},
): void => {
  const includeClaims = options.includeClaims !== false;

  setLocal(STORAGE_KEY_USER_STATUSES, payload.userStatuses || {});
  setLocal(STORAGE_KEY_ANNOUNCEMENTS, payload.announcements || []);
  setLocal(STORAGE_KEY_APP_MAINTENANCE, payload.appMaintenance?.length ? payload.appMaintenance : DEFAULT_APP_MAINTENANCE);
  setLocal(STORAGE_KEY_AUDIT_LOGS, payload.auditLogs || []);
  setLocal(STORAGE_KEY_ACTIVE_SESSIONS, payload.activeSessions || []);

  if (includeClaims) {
    setLocal(STORAGE_KEY_CENTRAL_CLAIMS, payload.centralClaims || []);
    setLocal(STORAGE_KEY_CLAIM_TRASH, payload.claimTrash || []);
  }

  addAuditLog({
    eventType: 'backup',
    upazilaCode: '00000',
    email: 'admin@dpe.gov.bd',
    description: `ব্যাকআপ ফাইল থেকে সিস্টেম পুনরুদ্ধার করা হয়েছে (ব্যাকআপের তারিখ: ${payload.exportedAt})${includeClaims ? '' : ' - দাবি ডাটা বাদ দেওয়া হয়েছে'}।`,
    status: 'warning',
  });
};

/**
 * Writes one claim row back to the central database.
 *
 * `deleted_at` only exists after the trash migration, so a rejected write is
 * retried without that column instead of failing the restore.
 */
const upsertClaimRow = async (claim: CentralClaimRecord, deletedAt: string | null): Promise<void> => {
  if (!supabase) throw new Error('Supabase Auth is not configured.');
  const base = {
    id: claim.id,
    app_type: claim.appType,
    upazila_code: claim.upazilaCode,
    tracking_no: claim.trackingNo,
    record: claim,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('central_claims').upsert({ ...base, deleted_at: deletedAt }, { onConflict: 'id' });
  if (!error) return;
  const retry = await supabase.from('central_claims').upsert(base, { onConflict: 'id' });
  if (retry.error) throw retry.error;
};

/**
 * Pushes the claims inside a backup file back into the central database.
 *
 * A plain upsert would resurrect trashed rows, so those keep their `deleted_at`
 * timestamp and the live ones have it cleared.
 */
export const replayClaimsToServer = async (
  liveClaims: CentralClaimRecord[],
  trashedClaims: CentralClaimRecord[],
): Promise<number> => {
  if (!supabase) throw new Error('Supabase Auth is not configured.');
  let replayed = 0;
  for (const claim of liveClaims) {
    await upsertClaimRow(claim, null);
    replayed += 1;
  }
  for (const claim of trashedClaims) {
    await upsertClaimRow(claim, claim.updatedAt || new Date().toISOString());
    replayed += 1;
  }
  return replayed;
};

export const generateFullBackupJson = (registeredUsers: UserSession[]): string => {
  const backupData = buildBackupPayload(registeredUsers);

  addAuditLog({
    eventType: 'backup',
    upazilaCode: '00000',
    email: 'admin@dpe.gov.bd',
    description: 'সারাদেশের সকল উপজেলার সম্পূর্ণ ডাটা ব্যাকআপ ডাউনলোড করা হয়েছে।',
    status: 'success',
  });

  return JSON.stringify(backupData, null, 2);
};


export const generateClaimsCsv = (): string => {
  const claims = getCentralClaims();
  // Include UTF-8 BOM so Bangla displays perfectly in Microsoft Excel
  const BOM = '\uFEFF';
  const headers = ['ক্রমিক', 'এ্যাপের নাম', 'ট্র্যাকিং নং', 'কর্মচারীর নাম', 'পদবী', 'জিপিএফ হিসাব নং', 'টাকার পরিমাণ (৳)', 'আবেদনের তারিখ', 'উপজেলা', 'জেলা', 'স্ট্যাটাস'];

  const rows = claims.map((c, i) => [
    i + 1,
    `"${c.appTitle}"`,
    `"${c.trackingNo}"`,
    `"${c.employeeName}"`,
    `"${c.designation}"`,
    `"${c.gpfAccNo}"`,
    c.amount,
    `"${c.applyDate}"`,
    `"${c.upazilaNameBn}"`,
    `"${c.districtNameBn}"`,
    `"${c.status}"`,
  ]);

  return BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
};

export const purgeTestData = (): { claimsRemoved: number; logsRemoved: number } => {
  const claims = getCentralClaims();
  const isTestClaim = (claim: CentralClaimRecord) => /test|demo|sample/i.test(claim.trackingNo)
    || claim.details?.isTestData === true
    || claim.details?.testData === true;
  const nonTest = claims.filter((claim) => !isTestClaim(claim));
  const removedClaims = claims.length - nonTest.length;
  setLocal(STORAGE_KEY_CENTRAL_CLAIMS, nonTest);

  const logs = getAuditLogs();
  const keptLogs = logs.filter((entry) => !entry.isTestData);
  const removedLogs = logs.length - keptLogs.length;
  setLocal(STORAGE_KEY_AUDIT_LOGS, keptLogs);

  addAuditLog({
    eventType: 'status_change',
    upazilaCode: '00000',
    email: 'admin@dpe.gov.bd',
    description: `ডেটাবেজ অপটিমাইজেশন: ${removedClaims} টি টেস্ট দাবি এবং ${removedLogs} টি টেস্ট লগ পার্জ করা হয়েছে।`,
    status: 'success',
  });

  return { claimsRemoved: removedClaims, logsRemoved: removedLogs };
};

export const purgeTestDataOnServer = async (): Promise<{ claimsRemoved: number; logsRemoved: number }> => {
  if (!supabase) throw new Error('Supabase Auth is not configured.');
  const { data: claimRows, error: claimsError } = await supabase
    .from('central_claims')
    .select('id,tracking_no,record');
  if (claimsError) throw claimsError;
  const testIds = (claimRows || [])
    .filter((row) => /test|demo|sample/i.test(row.tracking_no)
      || row.record?.details?.isTestData === true
      || row.record?.details?.testData === true)
    .map((row) => row.id);
  if (testIds.length > 0) {
    const { error } = await supabase.from('central_claims').delete().in('id', testIds);
    if (error) throw error;
  }

  const { data: testLogs, error: logsReadError } = await supabase
    .from('admin_audit_logs')
    .select('id,payload');
  if (logsReadError) throw logsReadError;
  const logIds = (testLogs || [])
    .filter((row) => row.payload?.isTestData === true)
    .map((row) => row.id);
  if (logIds.length > 0) {
    const { error } = await supabase.from('admin_audit_logs').delete().in('id', logIds);
    if (error) throw error;
  }
  return { claimsRemoved: testIds.length, logsRemoved: logIds.length };
};

/**
 * Trash API (মডিউল ৬) - deleting a claim must be reversible.
 *
 * A claim is an everyday government document, so removal parks it in
 * `deleted_at` on the server and in a local trash mirror. Only an explicit purge
 * destroys rows, and anything purged is still recoverable from a backup file.
 *
 * Every call degrades when the schema has not been migrated yet: the panel keeps
 * working the old way (hard delete) instead of blocking the operator.
 */
const STORAGE_KEY_CLAIM_TRASH = 'gpf_central_claims_trash_v1';

export const getTrashedClaims = (): CentralClaimRecord[] =>
  getLocal<CentralClaimRecord[]>(STORAGE_KEY_CLAIM_TRASH, []);

/** Server-side trash list; the hub query hides those rows, so this is the only view of them. */
export const hydrateClaimTrash = async (): Promise<CentralClaimRecord[]> => {
  if (!supabase) return getTrashedClaims();
  try {
    const { data, error } = await supabase
      .from('central_claims')
      .select('record')
      .not('deleted_at', 'is', null)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    const trashed = (data || []).map((row) => row.record as CentralClaimRecord);
    setLocal(STORAGE_KEY_CLAIM_TRASH, trashed);
    return trashed;
  } catch {
    // No trash column yet: keep whatever the local mirror holds.
    return getTrashedClaims();
  }
};

const moveToTrash = (record: CentralClaimRecord): void => {
  setLocal(STORAGE_KEY_CENTRAL_CLAIMS, getCentralClaims().filter((c) => c.id !== record.id));
  setLocal(STORAGE_KEY_CLAIM_TRASH, [record, ...getTrashedClaims().filter((c) => c.id !== record.id)]);
};

/** True when the server rejected a trash RPC because the column/function is missing. */
const isMissingTrashSchema = (error: { code?: string; message?: string } | null): boolean => {
  const text = `${error?.code || ''} ${error?.message || ''}`.toLowerCase();
  return text.includes('deleted_at') || text.includes('does not exist') || text.includes('could not find the function');
};

/** Moves one claim out of the hub, on the server and in the local mirror. */
export const trashCentralClaim = async (id: string): Promise<void> => {
  const target = getCentralClaims().find((c) => c.id === id);
  if (!target) throw new Error('CLAIM_NOT_FOUND');

  if (supabase) {
    const { error } = await supabase.rpc('admin_soft_delete_central_claim', { requested_id: id });
    if (error) {
      if (!isMissingTrashSchema(error)) throw error;
      // Un-migrated project: fall back to the old hard delete, nothing else to try.
      const fallback = await supabase.from('central_claims').delete().eq('id', id);
      if (fallback.error) throw fallback.error;
    }
  }

  moveToTrash(target);
  addAuditLog({
    eventType: 'claim_deleted',
    upazilaCode: target.upazilaCode,
    email: 'admin@dpe.gov.bd',
    description: `সেন্ট্রাল ফাইল হাব থেকে দাবি ট্র্যাশে নেওয়া হয়েছে: ${target.trackingNo} (${target.employeeName})। প্রয়োজনে পুনরুদ্ধার করা যাবে।`,
    status: 'warning',
  });
};

/** Brings a trashed claim back into the hub, locally and on the server. */
export const restoreTrashedClaim = async (id: string): Promise<void> => {
  const target = getTrashedClaims().find((c) => c.id === id);
  if (!target) throw new Error('CLAIM_NOT_IN_TRASH');

  if (supabase) {
    const { error } = await supabase.rpc('admin_restore_central_claim', { requested_id: id });
    // Restoring from a pre-migration project re-inserts the row through the
    // upsert path, which clears `deleted_at` when the column does exist.
    if (error) {
      if (!isMissingTrashSchema(error)) throw error;
      await upsertClaimRow(target, null);
    }
  }

  setLocal(STORAGE_KEY_CLAIM_TRASH, getTrashedClaims().filter((c) => c.id !== id));
  setLocal(STORAGE_KEY_CENTRAL_CLAIMS, [target, ...getCentralClaims().filter((c) => c.id !== target.id)]);
  addAuditLog({
    eventType: 'claim_saved',
    upazilaCode: target.upazilaCode,
    email: 'admin@dpe.gov.bd',
    description: `ট্র্যাশ থেকে দাবি পুনরুদ্ধার করা হয়েছে: ${target.trackingNo} (${target.employeeName})`,
    status: 'success',
  });
};

/** Empties the trash. Returns how many records the operator lost. */
export const purgeClaimTrash = async (): Promise<number> => {
  let destroyed = getTrashedClaims().length;
  if (supabase) {
    const { data, error } = await supabase.rpc('admin_purge_trashed_central_claims');
    if (error && !isMissingTrashSchema(error)) throw error;
    if (!error) destroyed = Number(data) || destroyed;
  }
  setLocal(STORAGE_KEY_CLAIM_TRASH, []);
  addAuditLog({
    eventType: 'backup',
    upazilaCode: '00000',
    email: 'admin@dpe.gov.bd',
    description: `ট্র্যাশ খালি করা হয়েছে: ${destroyed} টি দাবি স্থায়ীভাবে মুছে ফেলা হয়েছে।`,
    status: 'danger',
  });
  return destroyed;
};
