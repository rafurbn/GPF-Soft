import {
  SystemAnnouncement,
  AppMaintenanceControl,
  AuditLogEntry,
  ActiveSession,
  UserAccountStatus,
  UserSession,
  UpazilaUsageStat,
  PortalPublicState,
  UpazilaCheckinResult,
  HeartbeatResult,
} from '../types';
import { supabase } from './supabase';
import { toBn } from './format';
import { APP_VERSION } from './portalMeta';

// Storage keys
const STORAGE_KEY_USER_STATUSES = 'gpf_admin_user_statuses_v1';
const STORAGE_KEY_AUDIT_LOGS = 'gpf_admin_audit_logs_v1';
const STORAGE_KEY_ACTIVE_SESSIONS = 'gpf_admin_active_sessions_v1';
const STORAGE_KEY_ANNOUNCEMENTS = 'gpf_admin_announcements_v1';
const STORAGE_KEY_APP_MAINTENANCE = 'gpf_admin_app_maintenance_v1';
const STORAGE_KEY_USAGE_STATS = 'gpf_admin_usage_stats_v1';

export const ACTIVE_SESSION_STALE_MS = 5 * 60 * 1000;

export const DEFAULT_APP_MAINTENANCE: AppMaintenanceControl[] = [
  { appId: 'app1', appName: '১. ফেরতযোগ্য অগ্রিম উত্তোলন', isLocked: false, lockReason: '', updatedAt: new Date().toISOString() },
  { appId: 'app2', appName: '২. অফেরতযোগ্য অগ্রিম উত্তোলন', isLocked: false, lockReason: '', updatedAt: new Date().toISOString() },
  { appId: 'app3', appName: '৩. চূড়ান্ত উত্তোলন ও নো-ডিমান্ড', isLocked: false, lockReason: '', updatedAt: new Date().toISOString() },
  { appId: 'app4', appName: '৪. জিপিএফ মৃত্যুদাবী নিষ্পত্তি', isLocked: false, lockReason: '', updatedAt: new Date().toISOString() },
];

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

export const getCurrentSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    return window.sessionStorage.getItem('gpf-active-session-id') || '';
  } catch {
    return '';
  }
};

export const setCurrentSessionId = (sessionId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    if (sessionId) {
      window.sessionStorage.setItem('gpf-active-session-id', sessionId);
    } else {
      window.sessionStorage.removeItem('gpf-active-session-id');
    }
  } catch {
    // Ignore storage errors
  }
};

export const ensureClientSessionId = (): string => {
  const existing = getCurrentSessionId();
  if (existing) return existing;
  const created = `sess-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`}`;
  setCurrentSessionId(created);
  return created;
};

// Pure helper for hydrating & classifying server sessions on the client
export const normalizeRemoteActiveSessions = (
  rows: Array<{ session_id?: string; upazila_code?: string; record?: Partial<ActiveSession>; last_seen_at: string }>,
  currentSessionId: string,
  nowMs: number = Date.now(),
  staleMs: number = ACTIVE_SESSION_STALE_MS,
): ActiveSession[] => {
  return rows
    .filter((row) => {
      const seenMs = new Date(row.last_seen_at).getTime();
      return Number.isFinite(seenMs) && nowMs - seenMs <= staleMs;
    })
    .map((row) => {
      const rec = (row.record || {}) as Partial<ActiveSession>;
      const sid = row.session_id || rec.sessionId || '';
      const minutes = Math.max(0, Math.floor((nowMs - new Date(row.last_seen_at).getTime()) / 60000));
      return {
        sessionId: sid,
        userId: rec.userId || '',
        upazilaCode: row.upazila_code || rec.upazilaCode || '',
        upazilaNameBn: rec.upazilaNameBn || '',
        email: rec.email || '',
        role: rec.role || 'upazila_user',
        loginTime: rec.loginTime || '—',
        lastActiveTime: minutes === 0 ? 'এখনই সক্রিয়' : `${toBn(minutes)} মিনিট আগে`,
        ipAddress: rec.ipAddress || 'পোর্টাল',
        browser: rec.browser || 'Browser',
        isCurrentSession: Boolean(currentSessionId && sid === currentSessionId),
      };
    });
};

// ---------------------------------------------------------------------------
// 1. Upazila Usage & Activity Statistics (কেন্দ্রীয় ব্যবহার পরিসংখ্যান)
// ---------------------------------------------------------------------------
export const getUpazilaUsageStats = (): UpazilaUsageStat[] =>
  getLocal<UpazilaUsageStat[]>(STORAGE_KEY_USAGE_STATS, []);

const mapUsageRow = (row: Record<string, any>): UpazilaUsageStat => ({
  upazilaCode: String(row.upazila_code || ''),
  upazilaNameBn: String(row.upazila_name_bn || ''),
  districtNameBn: String(row.district_name_bn || ''),
  divisionNameBn: String(row.division_name_bn || ''),
  recoveryEmail: String(row.recovery_email || ''),
  accountStatus: (row.account_status as UserAccountStatus) || 'active',
  loginCount: Number(row.login_count) || 0,
  app1Opens: Number(row.app1_opens) || 0,
  app2Opens: Number(row.app2_opens) || 0,
  app3Opens: Number(row.app3_opens) || 0,
  app4Opens: Number(row.app4_opens) || 0,
  firstSeenAt: String(row.first_seen_at || ''),
  lastSeenAt: String(row.last_seen_at || ''),
  lastBrowser: String(row.last_browser || ''),
  updatedAt: String(row.updated_at || ''),
});

export const fetchUpazilaUsageStats = async (): Promise<UpazilaUsageStat[]> => {
  if (!supabase) return getUpazilaUsageStats();
  const { data, error } = await supabase
    .from('upazila_usage_stats')
    .select('upazila_code,upazila_name_bn,district_name_bn,division_name_bn,recovery_email,account_status,login_count,app1_opens,app2_opens,app3_opens,app4_opens,first_seen_at,last_seen_at,last_browser,updated_at')
    .order('last_seen_at', { ascending: false });
  if (error) throw error;
  const stats = ((data || []) as Record<string, any>[]).map(mapUsageRow);
  setLocal(STORAGE_KEY_USAGE_STATS, stats);
  return stats;
};

export interface UsageSummary {
  totalActiveUpazilas: number;
  activeToday: number;
  activeLast7Days: number;
  activeLast30Days: number;
  totalLogins: number;
  appOpens: { app1: number; app2: number; app3: number; app4: number; total: number };
}

export const computeUsageSummary = (
  stats: UpazilaUsageStat[],
  nowMs: number = Date.now(),
): UsageSummary => {
  const dayMs = 24 * 60 * 60 * 1000;
  let activeToday = 0;
  let activeLast7Days = 0;
  let activeLast30Days = 0;
  let totalLogins = 0;
  let app1 = 0;
  let app2 = 0;
  let app3 = 0;
  let app4 = 0;

  for (const row of stats) {
    totalLogins += row.loginCount || 0;
    app1 += row.app1Opens || 0;
    app2 += row.app2Opens || 0;
    app3 += row.app3Opens || 0;
    app4 += row.app4Opens || 0;
    const seen = new Date(row.lastSeenAt).getTime();
    if (Number.isFinite(seen)) {
      const age = nowMs - seen;
      if (age <= dayMs) activeToday += 1;
      if (age <= 7 * dayMs) activeLast7Days += 1;
      if (age <= 30 * dayMs) activeLast30Days += 1;
    }
  }

  return {
    totalActiveUpazilas: stats.length,
    activeToday,
    activeLast7Days,
    activeLast30Days,
    totalLogins,
    appOpens: { app1, app2, app3, app4, total: app1 + app2 + app3 + app4 },
  };
};

// ---------------------------------------------------------------------------
// 2. Instant Upazila Check-in, Heartbeat, App Open & Public State RPCs
// ---------------------------------------------------------------------------
export const recordUpazilaCheckin = async (params: {
  upazilaCode: string;
  upazilaNameBn: string;
  districtNameBn: string;
  divisionNameBn?: string;
  recoveryEmail?: string;
  browser?: string;
}): Promise<UpazilaCheckinResult> => {
  const sessionId = ensureClientSessionId();
  if (!supabase) {
    return { allowed: true, accountStatus: 'active', sessionId };
  }

  try {
    const { data, error } = await supabase.rpc('record_upazila_checkin', {
      p_upazila_code: params.upazilaCode,
      p_upazila_name_bn: params.upazilaNameBn,
      p_district_name_bn: params.districtNameBn,
      p_division_name_bn: params.divisionNameBn || '',
      p_recovery_email: params.recoveryEmail || '',
      p_session_id: sessionId,
      p_browser: params.browser || 'Browser',
    });

    if (error) {
      // Missing RPC (un-migrated DB) or network glitch must not lock regular users out.
      console.warn('[centralAdminStore] record_upazila_checkin skipped:', error.message);
      return { allowed: true, accountStatus: 'active', sessionId };
    }

    const payload = (data || {}) as { allowed?: boolean; account_status?: string; session_id?: string | null };
    if (payload.session_id) setCurrentSessionId(payload.session_id);
    return {
      allowed: payload.allowed !== false,
      accountStatus: payload.account_status || 'active',
      sessionId: payload.session_id ?? sessionId,
    };
  } catch (err) {
    console.warn('[centralAdminStore] record_upazila_checkin error:', err);
    return { allowed: true, accountStatus: 'active', sessionId };
  }
};

export const heartbeatUpazilaSession = async (upazilaCode: string): Promise<HeartbeatResult> => {
  if (!supabase) return { terminated: false, accountStatus: 'active' };
  const sessionId = getCurrentSessionId();
  const { data, error } = await supabase.rpc('heartbeat_upazila_session', {
    p_session_id: sessionId,
    p_upazila_code: upazilaCode,
  });
  if (error) throw error;
  const payload = (data || {}) as { terminated?: boolean; account_status?: string };
  return {
    terminated: Boolean(payload.terminated),
    accountStatus: payload.account_status || 'active',
  };
};

export const endUpazilaSessionOnServer = async (): Promise<void> => {
  const sessionId = getCurrentSessionId();
  if (!sessionId) return;
  if (supabase) {
    try {
      await supabase.rpc('end_upazila_session', { p_session_id: sessionId });
    } catch {
      // Always clear local session id even on transient error.
    }
  }
  setCurrentSessionId('');
};

export const recordUpazilaAppOpen = async (
  seed: { upazila_code: string; upazila_name_bn?: string; district_name_bn?: string; division_name_bn?: string },
  appId: 'app1' | 'app2' | 'app3' | 'app4',
): Promise<void> => {
  if (!supabase || !seed.upazila_code) return;
  try {
    await supabase.rpc('record_upazila_app_open', {
      p_upazila_code: seed.upazila_code,
      p_app_id: appId,
      p_upazila_name_bn: seed.upazila_name_bn || '',
      p_district_name_bn: seed.district_name_bn || '',
      p_division_name_bn: seed.division_name_bn || '',
    });
  } catch {
    // Non-blocking telemetry
  }
};

const mergeMaintenanceWithDefaults = (rows: AppMaintenanceControl[]): AppMaintenanceControl[] => {
  const byId = new Map(rows.map((r) => [r.appId, r]));
  return DEFAULT_APP_MAINTENANCE.map((def) => byId.get(def.appId) || def);
};

export const fetchPortalPublicState = async (upazilaCode?: string): Promise<PortalPublicState> => {
  const fallback: PortalPublicState = {
    announcements: getActiveAnnouncementsForUser(upazilaCode),
    maintenance: getAppMaintenanceStates(),
  };
  if (!supabase) return fallback;

  const { data, error } = await supabase.rpc('get_portal_public_state', {
    p_upazila_code: upazilaCode || null,
  });
  if (error) throw error;

  const parsed = (data || {}) as {
    announcements?: SystemAnnouncement[];
    maintenance?: AppMaintenanceControl[];
  };
  const announcements = Array.isArray(parsed.announcements) ? parsed.announcements : [];
  const maintenance = mergeMaintenanceWithDefaults(
    Array.isArray(parsed.maintenance) ? parsed.maintenance : [],
  );

  setLocal(STORAGE_KEY_APP_MAINTENANCE, maintenance);
  return { announcements, maintenance };
};

// ---------------------------------------------------------------------------
// 3. Notices & Maintenance States
// ---------------------------------------------------------------------------
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
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    const publicState = await fetchPortalPublicState(upazilaCode);
    return publicState.announcements;
  }

  const { data, error } = await supabase
    .from('system_announcements')
    .select('payload')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const announcements = (data || []).map((row) => row.payload as SystemAnnouncement);
  setLocal(STORAGE_KEY_ANNOUNCEMENTS, announcements);
  return announcements.filter((item) => item.isActive && (!item.targetUpazilaCode || item.targetUpazilaCode === upazilaCode));
};

export const hydrateAllAnnouncementsForAdmin = async (): Promise<SystemAnnouncement[]> => {
  if (!supabase) return getAnnouncements();
  const { data, error } = await supabase
    .from('system_announcements')
    .select('payload')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const announcements = (data || []).map((row) => row.payload as SystemAnnouncement);
  setLocal(STORAGE_KEY_ANNOUNCEMENTS, announcements);
  return announcements;
};

export const hydrateMaintenanceStates = async (): Promise<AppMaintenanceControl[]> => {
  if (!supabase) return getAppMaintenanceStates();
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    const publicState = await fetchPortalPublicState();
    return publicState.maintenance;
  }

  const { data, error } = await supabase
    .from('app_maintenance_controls')
    .select('app_id,app_name,is_locked,lock_reason,updated_at');
  if (error) throw error;
  const remoteById = new Map((data || []).map((row) => [row.app_id, row]));
  const merged = DEFAULT_APP_MAINTENANCE.map((defaultState) => {
    const remote = remoteById.get(defaultState.appId);
    return remote
      ? {
          appId: defaultState.appId,
          appName: remote.app_name,
          isLocked: remote.is_locked,
          lockReason: remote.lock_reason,
          updatedAt: remote.updated_at,
        }
      : defaultState;
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
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    const publicState = await fetchPortalPublicState();
    return publicState.maintenance.find((m) => m.appId === appId) || null;
  }

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

// ---------------------------------------------------------------------------
// 4. User & Access Control (অ্যাকাউন্ট স্ট্যাটাস, সাসপেন্ড ও আনলক)
// ---------------------------------------------------------------------------
export interface UserStatusMap {
  [upazilaCodeOrUserId: string]: {
    status: UserAccountStatus;
    suspendedReason?: string;
    updatedAt: string;
    lockedUntil?: string | null;
  };
}

export const getUserStatuses = (): UserStatusMap =>
  getLocal<UserStatusMap>(STORAGE_KEY_USER_STATUSES, {});

export const getUserStatus = (key: string): UserAccountStatus => {
  const map = getUserStatuses();
  return map[key]?.status || 'active';
};

export const setUserAccountStatus = (
  upazilaCode: string,
  status: UserAccountStatus,
  suspendedReason?: string,
  actorEmail: string = 'super_admin',
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
    email: actorEmail,
    description: `উপজেলা (${upazilaCode}) এর অ্যাকাউন্ট স্ট্যাটাস পরিবর্তিত হয়েছে: ${status.toUpperCase()} ${suspendedReason ? `(${suspendedReason})` : ''}`,
    status: status === 'active' ? 'success' : status === 'suspended' ? 'warning' : 'danger',
  });
};

export const unlockUserAccount = (upazilaCode: string, actorEmail: string = 'super_admin'): void => {
  setUserAccountStatus(upazilaCode, 'active', undefined, actorEmail);

  addAuditLog({
    eventType: 'status_change',
    upazilaCode,
    email: actorEmail,
    description: `সুপার অ্যাডমিন কর্তৃক উপজেলা (${upazilaCode}) এর অ্যাকাউন্ট আনলক এবং সক্রিয় করা হয়েছে।`,
    status: 'success',
  });
};

// ---------------------------------------------------------------------------
// 5. Audit Logging (লাইভ অডিট লগ ও নিরাপত্তা ট্র্যাকিং)
// ---------------------------------------------------------------------------
export const getAuditLogs = (): AuditLogEntry[] =>
  getLocal<AuditLogEntry[]>(STORAGE_KEY_AUDIT_LOGS, []);

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

  const updated = [newEntry, ...logs.slice(0, 499)];
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
  const currentId = getCurrentSessionId();
  return getLocal<ActiveSession[]>(STORAGE_KEY_ACTIVE_SESSIONS, []).map((s) => ({
    ...s,
    isCurrentSession: Boolean(currentId && s.sessionId === currentId),
  }));
};

export const hydrateActiveSessions = async (): Promise<ActiveSession[]> => {
  if (!supabase) return getActiveSessions();
  const cutoffIso = new Date(Date.now() - ACTIVE_SESSION_STALE_MS).toISOString();
  const { data, error } = await supabase
    .from('active_sessions')
    .select('session_id,upazila_code,record,last_seen_at')
    .is('terminated_at', null)
    .gte('last_seen_at', cutoffIso)
    .order('last_seen_at', { ascending: false });
  if (error) throw error;
  const sessions = normalizeRemoteActiveSessions((data || []) as any[], getCurrentSessionId());
  setLocal(STORAGE_KEY_ACTIVE_SESSIONS, sessions);
  return sessions;
};

export const registerActiveSession = (
  session: Omit<ActiveSession, 'sessionId' | 'lastActiveTime' | 'isCurrentSession'>,
): string => {
  const sessions = getActiveSessions();
  const sessionId = ensureClientSessionId();

  // Never store `isCurrentSession: true` into the shared remote DB row.
  const remoteRecord: ActiveSession = {
    ...session,
    sessionId,
    lastActiveTime: 'এখনই সক্রিয়',
  };

  const filtered = sessions.filter((s) => s.sessionId !== sessionId);
  setLocal(STORAGE_KEY_ACTIVE_SESSIONS, [{ ...remoteRecord, isCurrentSession: true }, ...filtered]);

  if (supabase && session.userId && !session.userId.startsWith('upazila-')) {
    void supabase.from('active_sessions').upsert({
      session_id: sessionId,
      user_id: session.userId,
      upazila_code: session.upazilaCode,
      record: remoteRecord,
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
  const sessionId = getCurrentSessionId();
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
  const sessionId = getCurrentSessionId();
  if (!sessionId) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  const session = getActiveSessions().find((item) => item.sessionId === sessionId);
  const now = new Date().toISOString();
  const payload = session
    ? { last_seen_at: now, record: { ...session, isCurrentSession: undefined, lastActiveTime: 'এখনই সক্রিয়' } }
    : { last_seen_at: now };
  const { error } = await supabase.from('active_sessions')
    .update(payload)
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
  const sessionId = getCurrentSessionId();
  if (!sessionId) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  const { error } = await supabase.from('active_sessions')
    .update({ terminated_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .eq('user_id', userData.user.id);
  if (error) throw error;
  setCurrentSessionId('');
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
      description: `সুপার এডমিন কর্তৃক সেশন ফোর্স লগআউট (Terminate Session) করা হয়েছে: ${target.upazilaNameBn || target.upazilaCode}`,
      status: 'danger',
    });
  }
};

// ---------------------------------------------------------------------------
// 7. Central Notice & Broadcast System (কেন্দ্রীয় নোটিশ ও ব্রডকাস্ট)
// ---------------------------------------------------------------------------
export const getAnnouncements = (): SystemAnnouncement[] =>
  getLocal<SystemAnnouncement[]>(STORAGE_KEY_ANNOUNCEMENTS, []);

export const getActiveAnnouncementsForUser = (userUpazilaCode?: string): SystemAnnouncement[] => {
  const all = getAnnouncements();
  return all.filter((a) => {
    if (!a.isActive) return false;
    if (!a.targetUpazilaCode) return true;
    return a.targetUpazilaCode === userUpazilaCode;
  });
};

export const createAnnouncementObject = (
  data: Omit<SystemAnnouncement, 'id' | 'createdAt'>,
): SystemAnnouncement => ({
  ...data,
  id: `ann-${Date.now()}`,
  createdAt: new Date().toISOString(),
});

export const saveAnnouncement = (
  data: Omit<SystemAnnouncement, 'id' | 'createdAt'>,
  actorEmail: string = 'super_admin',
): SystemAnnouncement => {
  const all = getAnnouncements();
  const newAnn = createAnnouncementObject(data);
  setLocal(STORAGE_KEY_ANNOUNCEMENTS, [newAnn, ...all]);

  addAuditLog({
    eventType: 'announcement',
    upazilaCode: data.targetUpazilaCode || 'ALL',
    email: actorEmail,
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
export const getAppMaintenanceStates = (): AppMaintenanceControl[] =>
  getLocal<AppMaintenanceControl[]>(STORAGE_KEY_APP_MAINTENANCE, DEFAULT_APP_MAINTENANCE);

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
  lockReason: string = '',
  actorEmail: string = 'super_admin',
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
    email: actorEmail,
    description: `${appId.toUpperCase()} এর রক্ষণাবেক্ষণ স্ট্যাটাস পরিবর্তিত হয়েছে: ${isLocked ? 'লকড (সাময়িক বন্ধ)' : 'সচল (উন্মুক্ত)'}. কারণ: ${lockReason || 'স্বাভাবিক অপারেশন'}`,
    status: isLocked ? 'warning' : 'success',
  });
};

// ---------------------------------------------------------------------------
// 9. Privacy-Safe Admin Backup & Statistics Export (ব্যক্তিগত ও আর্থিক তথ্যমুক্ত)
// ---------------------------------------------------------------------------
export interface AdminBackupPayload {
  exportedAt: string;
  version: string;
  authority: string;
  portal: string;
  registeredUsers: UserSession[];
  usageStats: UpazilaUsageStat[];
  userStatuses: UserStatusMap;
  announcements: SystemAnnouncement[];
  appMaintenance: AppMaintenanceControl[];
  auditLogs: AuditLogEntry[];
}

export const buildBackupPayload = (registeredUsers: UserSession[]): AdminBackupPayload => ({
  exportedAt: new Date().toISOString(),
  version: APP_VERSION,
  authority: "Government of the People's Republic of Bangladesh",
  portal: 'GPF Online File Processing Hub',
  registeredUsers,
  usageStats: getUpazilaUsageStats(),
  userStatuses: getUserStatuses(),
  announcements: getAnnouncements(),
  appMaintenance: getAppMaintenanceStates(),
  auditLogs: getAuditLogs(),
});

export const applyBackupSnapshot = (
  payload: AdminBackupPayload,
  actorEmail: string = 'super_admin',
): void => {
  setLocal(STORAGE_KEY_USER_STATUSES, payload.userStatuses || {});
  setLocal(STORAGE_KEY_ANNOUNCEMENTS, payload.announcements || []);
  setLocal(STORAGE_KEY_APP_MAINTENANCE, payload.appMaintenance?.length ? payload.appMaintenance : DEFAULT_APP_MAINTENANCE);
  setLocal(STORAGE_KEY_AUDIT_LOGS, payload.auditLogs || []);
  if (Array.isArray(payload.usageStats)) {
    setLocal(STORAGE_KEY_USAGE_STATS, payload.usageStats);
  }

  addAuditLog({
    eventType: 'backup',
    upazilaCode: '00000',
    email: actorEmail,
    description: `ব্যাকআপ ফাইল থেকে সিস্টেম সেটিংস ও অডিট লগ পুনরুদ্ধার করা হয়েছে (ব্যাকআপের তারিখ: ${payload.exportedAt})।`,
    status: 'warning',
  });
};

export const generateFullBackupJson = (
  registeredUsers: UserSession[],
  actorEmail: string = 'super_admin',
): string => {
  const backupData = buildBackupPayload(registeredUsers);
  addAuditLog({
    eventType: 'backup',
    upazilaCode: '00000',
    email: actorEmail,
    description: 'অ্যাডমিন সেটিংস, অডিট লগ ও উপজেলা ব্যবহার পরিসংখ্যান ব্যাকআপ ডাউনলোড করা হয়েছে।',
    status: 'success',
  });
  return JSON.stringify(backupData, null, 2);
};

export const generateUsageStatsCsv = (stats: UpazilaUsageStat[]): string => {
  const BOM = '\uFEFF';
  const headers = [
    'ক্রমিক',
    'উপজেলা কোড',
    'উপজেলা',
    'জেলা',
    'বিভাগ',
    'স্ট্যাটাস',
    'মোট লগইন',
    'অ্যাপ-১ (ফেরতযোগ্য)',
    'অ্যাপ-২ (অফেরতযোগ্য)',
    'অ্যাপ-৩ (চূড়ান্ত)',
    'অ্যাপ-৪ (মৃত্যুদাবী)',
    'সর্বশেষ সক্রিয়',
  ];

  const rows = stats.map((u, i) => [
    i + 1,
    `"${u.upazilaCode}"`,
    `"${u.upazilaNameBn}"`,
    `"${u.districtNameBn}"`,
    `"${u.divisionNameBn}"`,
    `"${u.accountStatus}"`,
    u.loginCount,
    u.app1Opens,
    u.app2Opens,
    u.app3Opens,
    u.app4Opens,
    `"${u.lastSeenAt ? new Date(u.lastSeenAt).toLocaleString('bn-BD') : '—'}"`,
  ]);

  return BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
};

export const purgeTestData = (actorEmail: string = 'super_admin'): { logsRemoved: number } => {
  const logs = getAuditLogs();
  const keptLogs = logs.filter((entry) => !entry.isTestData);
  const removedLogs = logs.length - keptLogs.length;
  setLocal(STORAGE_KEY_AUDIT_LOGS, keptLogs);

  addAuditLog({
    eventType: 'status_change',
    upazilaCode: '00000',
    email: actorEmail,
    description: `লগ অপটিমাইজেশন: ${removedLogs} টি টেস্ট লগ পরিষ্কার করা হয়েছে।`,
    status: 'success',
  });

  return { logsRemoved: removedLogs };
};

export const purgeTestDataOnServer = async (): Promise<{ logsRemoved: number }> => {
  if (!supabase) throw new Error('Supabase Auth is not configured.');
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
  return { logsRemoved: logIds.length };
};
