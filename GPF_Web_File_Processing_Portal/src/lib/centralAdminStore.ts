import { CentralClaimRecord, SystemAnnouncement, AppMaintenanceControl, AuditLogEntry, ActiveSession, UserAccountStatus, UserSession } from '../types';
import { supabase } from './supabase';

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

export const hydrateCentralClaims = async (): Promise<CentralClaimRecord[]> => {
  if (!supabase) return getCentralClaims();
  const records: CentralClaimRecord[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('central_claims')
      .select('record')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const page = (data || []).map((row) => row.record as CentralClaimRecord);
    records.push(...page);
    if (page.length < pageSize) break;
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
    description: `${record.appTitle}-এ কর্মচারীর (${record.employeeName}, জিপিএফ: ${record.gpfAccNo}) দাবি ফাইল সংরক্ষিত হয়েছে। পরিমাণ: ৳${record.amount.toLocaleString('en-US')}`,
    status: 'success',
  });
};

export const deleteCentralClaim = (id: string): void => {
  const claims = getCentralClaims();
  const target = claims.find((c) => c.id === id);
  const filtered = claims.filter((c) => c.id !== id);
  setLocal(STORAGE_KEY_CENTRAL_CLAIMS, filtered);

  if (target) {
    addAuditLog({
      eventType: 'claim_deleted',
      upazilaCode: target.upazilaCode,
      email: 'admin@dpe.gov.bd',
      description: `সেন্ট্রাল ফাইল হাব থেকে ফাইল ডিলিট করা হয়েছে: ${target.trackingNo} (${target.employeeName})`,
      status: 'warning',
    });
  }
};

export const deleteCentralClaimFromServer = async (id: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase Auth is not configured.');
  const { error } = await supabase.from('central_claims').delete().eq('id', id);
  if (error) throw error;
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

// Scan localStorage for any existing claims from App1, App2, App3, App4
function discoverExistingSubAppClaims(): CentralClaimRecord[] {
  if (typeof window === 'undefined') return [];
  const found: CentralClaimRecord[] = [];

  try {
    // App 1 (Refundable)
    const app1Raw = window.localStorage.getItem('gpf_advance_saved_records_v2');
    if (app1Raw) {
      const arr = JSON.parse(app1Raw);
      if (Array.isArray(arr)) {
        arr.forEach((item: any, i: number) => {
          found.push({
            id: item.id || `app1-${i}`,
            appType: 'app1',
            appTitle: '১. ফেরতযোগ্য অগ্রিম',
            upazilaCode: item.upazila_code || '10101',
            upazilaNameBn: item.upazilaName || 'বিয়ানীবাজার',
            districtNameBn: item.districtName || 'সিলেট',
            trackingNo: item.trackingNo || `REF-${item.year || '2026'}-${i + 101}`,
            employeeName: item.applicantName || 'মো: আব্দুল মতিন',
            designation: item.designation || 'প্রধান শিক্ষক',
            gpfAccNo: item.gpfAccNo || 'SYL-45892',
            amount: parseFloat(item.requestedAmount || '180000') || 180000,
            status: 'অনুমোদিত',
            applyDate: item.applyDate || '১৫/০৯/২০২৬',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            details: item,
          });
        });
      }
    }

    // App 4 (Death Claim)
    const app4Raw = window.localStorage.getItem('gpf_death_claims_v1');
    if (app4Raw) {
      const arr = JSON.parse(app4Raw);
      if (Array.isArray(arr)) {
        arr.forEach((item: any, i: number) => {
          found.push({
            id: item.id || `app4-${i}`,
            appType: 'app4',
            appTitle: '৪. জিপিএফ মৃত্যুদাবী নিষ্পত্তি',
            upazilaCode: item.upazilaCode || '10101',
            upazilaNameBn: item.upazilaName || 'বিয়ানীবাজার',
            districtNameBn: item.districtName || 'সিলেট',
            trackingNo: item.trackingNo || `DTH-${item.year || '2026'}-${i + 201}`,
            employeeName: item.deceasedEmployeeName || 'মরহুম রমিজ উদ্দিন',
            designation: item.deceasedDesignation || 'প্রাক্তন সহকারী শিক্ষক',
            gpfAccNo: item.gpfAccountNo || 'SYL-33109',
            amount: parseFloat(item.depositedAmount || '300000') || 300000,
            status: item.status || 'অনুমোদিত',
            applyDate: item.applicationDate || '১০/১০/২০২৬',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            details: item,
          });
        });
      }
    }
  } catch {
    // Ignore parse errors
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
      lastActiveTime: minutes === 0 ? 'এখনই সক্রিয়' : `${minutes} মিনিট আগে`,
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
export const generateFullBackupJson = (registeredUsers: UserSession[]): string => {
  const backupData = {
    exportedAt: new Date().toISOString(),
    version: '2.0.0-PROD',
    authority: 'Government of the People\'s Republic of Bangladesh',
    portal: 'GPF Online File Processing Hub',
    superAdmin: 'রফিকুল ইসলাম',
    statistics: getClaimsStats(),
    registeredUsers,
    userStatuses: getUserStatuses(),
    centralClaims: getCentralClaims(),
    announcements: getAnnouncements(),
    appMaintenance: getAppMaintenanceStates(),
    auditLogs: getAuditLogs(),
    activeSessions: getActiveSessions(),
  };

  addAuditLog({
    eventType: 'backup',
    upazilaCode: '00000',
    email: 'admin@dpe.gov.bd',
    description: 'সারাদেশের সকল উপজেলার সম্পূর্ণ ডাটা ব্যাকআপ ডাউনলোড করা হয়েছে।',
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
