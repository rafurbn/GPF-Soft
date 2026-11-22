import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  Radio,
  Lock,
  Unlock,
  Download,
  Trash2,
  RotateCcw,
  KeyRound,
  CheckCircle2,
  Search,
  Activity,
  Layers,
  FileSpreadsheet,
  Clock,
  Sparkles,
  LogOut,
  Send,
  RefreshCw,
  Globe,
  Ban,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import {
  UserSession,
  SystemAnnouncement,
  AppMaintenanceControl,
  AuditLogEntry,
  ActiveSession,
  UserAccountStatus,
  UserRole,
  UpazilaUsageStat,
} from '../types';
import { toBn, dateTime } from '../lib/format';
import { VERSION_LABEL } from '../lib/portalMeta';
import {
  computeUsageSummary,
  fetchUpazilaUsageStats,
  getUpazilaUsageStats,
  hydrateAllAnnouncementsForAdmin,
  hydrateMaintenanceStates,
  hydrateAuditLogs,
  hydrateActiveSessions,
  setUserAccountStatus,
  unlockUserAccount,
  getAuditLogs,
  clearAuditLogsOnServer,
  getActiveSessions,
  terminateSession,
  terminateSessionOnServer,
  getAnnouncements,
  createAnnouncementObject,
  saveAnnouncement,
  persistAnnouncementToServer,
  toggleAnnouncement,
  updateAnnouncementOnServer,
  deleteAnnouncement,
  deleteAnnouncementFromServer,
  getAppMaintenanceStates,
  setAppMaintenanceState,
  persistMaintenanceStateToServer,
  generateFullBackupJson,
  generateUsageStatsCsv,
  purgeTestData,
  purgeTestDataOnServer,
  buildBackupPayload,
  applyBackupSnapshot,
  type AdminBackupPayload,
} from '../lib/centralAdminStore';
import { getAllDivisions, getAllUpazilas } from '../data/upazilaData';
import { supabase } from '../lib/supabase';
import {
  fetchLoginSecurity,
  isLockActive,
  securityAlertFor,
  unlockUpazilaOnServer,
  assignUpazilaRoleOnServer,
  describeRpcError,
  LoginSecurityRow,
} from '../lib/adminSecurity';
import { buildUnifiedUpazilaDirectory } from '../lib/adminDirectory';
import {
  encryptBackup,
  decryptBackup,
  isEncryptedBackupFile,
  parseBackupPayload,
  describeBackupError,
} from '../lib/secureBackup';

interface SuperAdminSuiteProps {
  users: UserSession[];
  currentUser: UserSession;
  onBackToDashboard: () => void;
  onRefreshUsers?: () => Promise<void> | void;
}

type SuiteTab = 'overview' | 'users' | 'security' | 'notices' | 'maintenance';

const TOTAL_UPAZILAS_BD = 504;

export const SuperAdminSuite: React.FC<SuperAdminSuiteProps> = ({
  users,
  currentUser,
  onBackToDashboard,
  onRefreshUsers,
}) => {
  const [activeTab, setActiveTab] = useState<SuiteTab>('overview');
  const [usageStats, setUsageStats] = useState<UpazilaUsageStat[]>(getUpazilaUsageStats());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(getAuditLogs());
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(getActiveSessions());
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(getAnnouncements());
  const [appMaintenance, setAppMaintenance] = useState<AppMaintenanceControl[]>(getAppMaintenanceStates());
  const [loginSecurity, setLoginSecurity] = useState<Record<string, LoginSecurityRow>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Backup / restore local settings state
  const [backupPassword, setBackupPassword] = useState('');
  const [restoreFileName, setRestoreFileName] = useState('');
  const [restoreFileText, setRestoreFileText] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [isBackupBusy, setIsBackupBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Filter states for Users tab
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserAccountStatus | 'locked'>('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState<'all' | 'registered' | 'instant'>('all');
  const [divisionFilter, setDivisionFilter] = useState('all');

  // Filter states for Security tab
  const [auditSearch, setAuditSearch] = useState('');

  // New announcement form state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annSeverity, setAnnSeverity] = useState<'info' | 'warning' | 'critical'>('info');
  const [annTargetUpazila, setAnnTargetUpazila] = useState<string>('all');

  // Maintenance reason inputs — initialized once so 30s background polls never wipe edits
  const [maintenanceReasons, setMaintenanceReasons] = useState<Record<string, string>>({});
  const initializedReasonsRef = useRef(false);

  // OTP confirmation modal
  const [otpModalData, setOtpModalData] = useState<{ upazilaCode: string; email: string } | null>(null);

  const showToast = (msg: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 4500);
  };

  const reloadData = async (options: { notifyOnError?: boolean } = {}): Promise<boolean> => {
    const notify = options.notifyOnError ?? false;
    setIsRefreshing(true);
    let allRemoteOk = true;

    try {
      await onRefreshUsers?.();
    } catch {
      allRemoteOk = false;
      if (notify) showToast('নিবন্ধিত অ্যাকাউন্টের তালিকা হালনাগাদ করা যায়নি।', 'error');
    }

    try {
      const remoteStats = await fetchUpazilaUsageStats();
      setUsageStats(remoteStats);
    } catch {
      allRemoteOk = false;
      setUsageStats(getUpazilaUsageStats());
      if (notify) showToast('উপজেলা ব্যবহার পরিসংখ্যান (upazila_usage_stats) লোড করা যায়নি।', 'warning');
    }

    try {
      const remoteAnnouncements = await hydrateAllAnnouncementsForAdmin();
      setAnnouncements(remoteAnnouncements);
    } catch {
      allRemoteOk = false;
      setAnnouncements(getAnnouncements());
      if (notify) showToast('নোটিশ তালিকা লোড করা যায়নি।', 'error');
    }

    try {
      const remoteMaintenance = await hydrateMaintenanceStates();
      setAppMaintenance(remoteMaintenance);
      if (!initializedReasonsRef.current) {
        const nextReasons: Record<string, string> = {};
        remoteMaintenance.forEach((m) => {
          nextReasons[m.appId] = m.lockReason || '';
        });
        setMaintenanceReasons(nextReasons);
        initializedReasonsRef.current = true;
      }
    } catch {
      allRemoteOk = false;
      const cachedMaint = getAppMaintenanceStates();
      setAppMaintenance(cachedMaint);
      if (!initializedReasonsRef.current) {
        const nextReasons: Record<string, string> = {};
        cachedMaint.forEach((m) => {
          nextReasons[m.appId] = m.lockReason || '';
        });
        setMaintenanceReasons(nextReasons);
        initializedReasonsRef.current = true;
      }
    }

    try {
      const remoteLogs = await hydrateAuditLogs();
      setAuditLogs(remoteLogs);
    } catch {
      allRemoteOk = false;
      setAuditLogs(getAuditLogs());
    }

    try {
      const remoteSessions = await hydrateActiveSessions();
      setActiveSessions(remoteSessions);
    } catch {
      allRemoteOk = false;
      setActiveSessions(getActiveSessions());
    }

    if (supabase) {
      try {
        const remoteSecurity = await fetchLoginSecurity();
        setLoginSecurity(Object.fromEntries(remoteSecurity.map((row) => [row.upazilaCode, row])));
      } catch {
        allRemoteOk = false;
        if (notify) showToast('লগইন নিরাপত্তা তথ্য (লক/ব্যর্থ চেষ্টা) লোড করা যায়নি।', 'warning');
      }
    }

    setIsRefreshing(false);
    return allRemoteOk;
  };

  useEffect(() => {
    void reloadData({ notifyOnError: true });
    const interval = window.setInterval(() => void reloadData({ notifyOnError: false }), 30000);
    return () => window.clearInterval(interval);
  }, [currentUser.upazila_code]);

  // -------------------------------------------------------------------------
  // Unified Upazila Directory & Summary Metrics
  // -------------------------------------------------------------------------
  const directoryRows = useMemo(
    () =>
      buildUnifiedUpazilaDirectory({
        registeredUsers: users,
        usageStats,
        loginSecurity,
      }),
    [users, usageStats, loginSecurity],
  );

  const summary = useMemo(() => computeUsageSummary(usageStats), [usageStats]);
  const coverageCount = directoryRows.filter((r) => r.role !== 'super_admin').length;
  const coveragePct = Math.min(100, Math.round((coverageCount / TOTAL_UPAZILAS_BD) * 100));

  const securityAlertRows = useMemo(
    () =>
      directoryRows.filter((row) => {
        const alert = securityAlertFor(row.security);
        return Boolean(alert) || row.accountStatus !== 'active';
      }),
    [directoryRows],
  );

  // -------------------------------------------------------------------------
  // Actions: Account Status, Unlock, OTP, Role
  // -------------------------------------------------------------------------
  const handleToggleStatus = async (upazilaCode: string, newStatus: UserAccountStatus) => {
    if (!supabase) {
      showToast('Supabase সংযোগ প্রস্তুত নয়; স্ট্যাটাস পরিবর্তন করা যায়নি।', 'error');
      return;
    }
    const { error } = await supabase.rpc('set_upazila_account_status', {
      requested_upazila_code: upazilaCode,
      requested_status: newStatus,
    });
    if (error) {
      showToast(`সার্ভারে স্ট্যাটাস সংরক্ষিত হয়নি: ${describeRpcError(error)}`, 'error');
      return;
    }
    setUserAccountStatus(upazilaCode, newStatus, undefined, currentUser.email);
    showToast(
      `উপজেলা (${upazilaCode}) এর স্ট্যাটাস '${newStatus.toUpperCase()}' করা হয়েছে।`,
      newStatus === 'active' ? 'success' : 'warning',
    );
    await reloadData();
  };

  const handleUnlockUser = async (upazilaCode: string) => {
    if (!supabase) {
      showToast('Supabase সংযোগ প্রস্তুত নয়; অ্যাকাউন্ট আনলক করা যায়নি।', 'error');
      return;
    }
    try {
      await unlockUpazilaOnServer(upazilaCode);
    } catch (unlockError) {
      showToast((unlockError as Error).message || 'সার্ভারে অ্যাকাউন্ট আনলক করা যায়নি।', 'error');
      return;
    }
    unlockUserAccount(upazilaCode, currentUser.email);
    showToast(`উপজেলা (${upazilaCode}) এর লকআউট ও ব্যর্থ লগইন গণনা রিসেট করা হয়েছে।`, 'success');
    await reloadData();
  };

  const handleGenerateOtp = async (upazilaCode: string, email: string) => {
    if (!supabase) {
      showToast('Supabase Auth সংযোগ প্রস্তুত নয়; OTP পাঠানো যায়নি।', 'error');
      return;
    }
    if (!email || !email.includes('@')) {
      showToast('এই উপজেলার কোনো বৈধ রিকভারি ইমেইল সংরক্ষিত নেই।', 'warning');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      showToast('ইমেইলে OTP পাঠানো যায়নি। SMTP সেটিংস বা ইমেইল যাচাই করুন।', 'error');
      return;
    }
    setOtpModalData({ upazilaCode, email });
    showToast(`উপজেলা (${upazilaCode}) এর ইমেইলে recovery OTP পাঠানো হয়েছে।`, 'success');
    await reloadData();
  };

  const handleAssignRole = async (upazilaCode: string, role: UserRole) => {
    if (!supabase) {
      showToast('Supabase Auth সংযোগ প্রস্তুত নয়; ভূমিকা পরিবর্তন করা যায়নি।', 'error');
      return;
    }
    const label = role === 'super_admin' ? 'সুপার এডমিন' : 'উপজেলা ইউজার';
    if (!window.confirm(`${upazilaCode} এর ভূমিকা "${label}" করা হবে? নিশ্চিত হলে এগিয়ে যান`)) return;
    try {
      await assignUpazilaRoleOnServer(upazilaCode, role);
    } catch (roleError) {
      showToast((roleError as Error).message || 'ভূমিকা পরিবর্তন করা যায়নি।', 'error');
      return;
    }
    showToast(`ভূমিকা পরিবর্তন সম্পন্ন: ${label}`, 'success');
    await reloadData();
  };

  // -------------------------------------------------------------------------
  // Actions: Live Sessions & Audit Logs
  // -------------------------------------------------------------------------
  const handleTerminateSession = async (sessionId: string, upazilaName: string) => {
    if (window.confirm(`আপনি কি "${upazilaName}" এর সক্রিয় সেশনটি জোরপূর্বক বন্ধ (Force Logout) করতে চান?`)) {
      try {
        await terminateSessionOnServer(sessionId);
      } catch {
        showToast('সার্ভারে সেশন বন্ধ করা যায়নি।', 'error');
        return;
      }
      terminateSession(sessionId);
      showToast(`${upazilaName}-এর সেশন ফোর্স লগআউট করা হয়েছে।`, 'warning');
      await reloadData();
    }
  };

  // -------------------------------------------------------------------------
  // Actions: Broadcast Notices (Server-First)
  // -------------------------------------------------------------------------
  const allUpazilasList = useMemo(() => getAllUpazilas(), []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      showToast('শিরোনাম ও বার্তার বিবরণ প্রদান করুন।', 'error');
      return;
    }

    const targetCode = annTargetUpazila === 'all' ? null : annTargetUpazila;
    const matchedTarget = targetCode ? allUpazilasList.find((u) => u.defaultId === targetCode) : null;
    const targetName = targetCode
      ? `${matchedTarget?.upazilaBn || targetCode} (${targetCode})`
      : 'সারাদেশ (সকল উপজেলা)';

    const draft = createAnnouncementObject({
      title: annTitle.trim(),
      message: annMessage.trim(),
      severity: annSeverity,
      targetUpazilaCode: targetCode,
      targetUpazilaName: targetName,
      isActive: true,
      createdBy: `${currentUser.email || 'সুপার এডমিন'} (রফিকুল ইসলাম)`,
    });

    try {
      await persistAnnouncementToServer(draft);
    } catch {
      showToast('নোটিশটি সেন্ট্রাল ডেটাবেজে সংরক্ষণ করা যায়নি।', 'error');
      return;
    }

    saveAnnouncement(
      {
        title: draft.title,
        message: draft.message,
        severity: draft.severity,
        targetUpazilaCode: draft.targetUpazilaCode,
        targetUpazilaName: draft.targetUpazilaName,
        isActive: draft.isActive,
        createdBy: draft.createdBy,
      },
      currentUser.email,
    );
    setAnnTitle('');
    setAnnMessage('');
    showToast('নতুন কেন্দ্রীয় নোটিশ সফলভাবে জারি করা হয়েছে।', 'success');
    await reloadData();
  };

  const handleToggleNotice = async (id: string, currentActive: boolean) => {
    try {
      await updateAnnouncementOnServer(id, { isActive: !currentActive });
    } catch {
      showToast('নোটিশের অবস্থা সার্ভারে হালনাগাদ করা যায়নি।', 'error');
      return;
    }
    toggleAnnouncement(id, !currentActive);
    showToast(`নোটিশটি ${!currentActive ? 'চালু' : 'স্থগিত'} করা হয়েছে।`, 'success');
    await reloadData();
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('আপনি কি এই নোটিশটি স্থায়ীভাবে মুছে ফেলতে চান?')) return;
    try {
      await deleteAnnouncementFromServer(id);
    } catch {
      showToast('নোটিশটি সার্ভার থেকে মুছে ফেলা যায়নি।', 'error');
      return;
    }
    deleteAnnouncement(id);
    showToast('নোটিশটি মুছে ফেলা হয়েছে।', 'warning');
    await reloadData();
  };

  // -------------------------------------------------------------------------
  // Actions: Maintenance Locks & Privacy-Safe Settings Backup
  // -------------------------------------------------------------------------
  const handleToggleAppLock = async (appId: 'app1' | 'app2' | 'app3' | 'app4', currentLocked: boolean) => {
    const newLocked = !currentLocked;
    const reason = (maintenanceReasons[appId] || '').trim() || 'সার্ভার রক্ষণাবেক্ষণ ও ডাটা আপগ্রেডের জন্য এই এ্যাপটি সাময়িক বন্ধ আছে।';
    const nextState = appMaintenance.find((item) => item.appId === appId);
    if (!nextState) return;
    try {
      await persistMaintenanceStateToServer({
        ...nextState,
        isLocked: newLocked,
        lockReason: newLocked ? reason : '',
        updatedAt: new Date().toISOString(),
      });
    } catch {
      showToast('কেন্দ্রীয় সার্ভারে অ্যাপের অবস্থা হালনাগাদ করা যায়নি।', 'error');
      return;
    }
    setAppMaintenanceState(appId, newLocked, reason, currentUser.email);
    setMaintenanceReasons((prev) => ({ ...prev, [appId]: newLocked ? reason : '' }));
    showToast(`${appId.toUpperCase()} ${newLocked ? 'লক (Under Maintenance)' : 'সচল (উন্মুক্ত)'} করা হয়েছে।`, newLocked ? 'warning' : 'success');
    await reloadData();
  };

  const downloadTextFile = (content: string, fileName: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBackup = async () => {
    await reloadData();
    downloadTextFile(
      generateFullBackupJson(users, currentUser.email),
      `GPF_Admin_Settings_Backup_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json;charset=utf-8;',
    );
    showToast('অ্যাডমিন সেটিংস ও পরিসংখ্যান ব্যাকআপ ডাউনলোড হয়েছে।', 'success');
    await reloadData();
  };

  const handleDownloadUsageCsv = async () => {
    await reloadData();
    downloadTextFile(
      generateUsageStatsCsv(usageStats),
      `GPF_Upazila_Usage_Stats_${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;',
    );
    showToast('উপজেলা ব্যবহার পরিসংখ্যান (CSV) ডাউনলোড হয়েছে।', 'success');
  };

  const handleDownloadEncryptedBackup = async () => {
    await reloadData();
    setIsBackupBusy(true);
    try {
      const sealed = await encryptBackup(JSON.stringify(buildBackupPayload(users)), backupPassword);
      downloadTextFile(
        sealed,
        `GPF_Encrypted_Settings_Backup_${new Date().toISOString().slice(0, 10)}.json`,
        'application/json;charset=utf-8;',
      );
      showToast('এনক্রিপ্টেড (AES-256) ব্যাকআপ ডাউনলোড হয়েছে।', 'success');
    } catch (err) {
      showToast(describeBackupError(err), 'error');
    } finally {
      setIsBackupBusy(false);
    }
  };

  const handleRestoreFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreFileText(await file.text());
    setRestoreFileName(file.name);
  };

  const handleRestoreBackup = async () => {
    if (!restoreFileText.trim()) {
      showToast('প্রথমে একটি ব্যাকআপ ফাইল বেছে নিন।', 'error');
      return;
    }

    let json = restoreFileText;
    if (isEncryptedBackupFile(restoreFileText)) {
      try {
        json = await decryptBackup(restoreFileText, restorePassword);
      } catch (err) {
        showToast(describeBackupError(err), 'error');
        return;
      }
    }

    let payload: AdminBackupPayload;
    try {
      payload = parseBackupPayload<AdminBackupPayload>(json);
    } catch {
      showToast('ফাইলটি এই পোর্টালের ব্যাকআপ ফাইল নয়।', 'error');
      return;
    }

    if (!window.confirm(`ব্যাকআপ (${payload.exportedAt}) থেকে পোর্টাল সেটিংস ও লগ পুনরুদ্ধার করবেন?`)) return;

    setIsBackupBusy(true);
    try {
      applyBackupSnapshot(payload, currentUser.email);
    } catch {
      setIsBackupBusy(false);
      showToast('ব্যাকআপ পুনরুদ্ধার সম্পূর্ণ হয়নি।', 'error');
      return;
    }

    setIsBackupBusy(false);
    setRestoreFileText('');
    setRestoreFileName('');
    setRestorePassword('');
    showToast('ব্যাকআপ থেকে সিস্টেম সেটিংস পুনরুদ্ধার হয়েছে।', 'success');
    await reloadData();
  };

  const handlePurgeTestLogs = async () => {
    if (!window.confirm('ডেটাবেজ থেকে টেস্ট হিসেবে চিহ্নিত অডিট লগ স্থায়ীভাবে মুছে ফেলবেন?')) return;
    let removed = 0;
    try {
      const res = await purgeTestDataOnServer();
      removed = res.logsRemoved;
    } catch {
      showToast('সার্ভারের টেস্ট লগ পরিষ্কার করা যায়নি।', 'error');
      return;
    }
    purgeTestData(currentUser.email);
    showToast(`ক্লিনআপ সম্পন্ন: ${toBn(removed)} টি টেস্ট লগ মুছে ফেলা হয়েছে।`, 'success');
    await reloadData();
  };

  // -------------------------------------------------------------------------
  // Filtered Collections
  // -------------------------------------------------------------------------
  const filteredUsers = useMemo(() => {
    return directoryRows.filter((row) => {
      const locked = isLockActive(row.security) || Boolean(row.security?.failedAttempts);
      if (statusFilter === 'locked') {
        if (!locked && row.accountStatus !== 'suspended') return false;
      } else if (statusFilter !== 'all' && row.accountStatus !== statusFilter) {
        return false;
      }
      if (accountTypeFilter === 'registered' && !row.isRegistered) return false;
      if (accountTypeFilter === 'instant' && row.isRegistered) return false;
      if (divisionFilter !== 'all' && row.divisionNameBn !== divisionFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matches =
          row.upazilaCode.toLowerCase().includes(q) ||
          row.upazilaNameBn.toLowerCase().includes(q) ||
          row.districtNameBn.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [directoryRows, statusFilter, accountTypeFilter, divisionFilter, userSearch]);

  const filteredAuditLogs = useMemo(() => {
    if (!auditSearch.trim()) return auditLogs;
    const q = auditSearch.toLowerCase();
    return auditLogs.filter(
      (log) =>
        log.upazilaCode?.toLowerCase().includes(q) ||
        log.email?.toLowerCase().includes(q) ||
        log.description?.toLowerCase().includes(q) ||
        log.eventType?.toLowerCase().includes(q),
    );
  }, [auditLogs, auditSearch]);

  const divisions = useMemo(() => getAllDivisions(), []);

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen text-slate-100 py-4 px-2 sm:px-4 space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold transition-all border ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-200 border-emerald-600/80'
              : toast.type === 'warning'
              ? 'bg-amber-950/95 text-amber-200 border-amber-600/80'
              : 'bg-rose-950/95 text-rose-200 border-rose-600/80'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0d1627] via-[#12213d] to-[#0a1529] border border-indigo-700/50 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/40 inline-flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Super Admin Control Suite</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-[11px] font-mono border border-emerald-700/60">
              {VERSION_LABEL}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            ইউজার পরিসংখ্যান, লগইন সাপোর্ট ও কেন্দ্রীয় কন্ট্রোল প্যানেল
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            প্রধান তত্ত্বাবধায়ক: <strong className="text-white">রফিকুল ইসলাম</strong> • দেশের ৫০৪টি উপজেলার সক্রিয়তা, লগইন সহায়তা, লাইভ সেশন ও কেন্দ্রীয় নোটিশ নিয়ন্ত্রণ।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => void reloadData({ notifyOnError: true })}
            disabled={isRefreshing}
            title="সব ডেটা রিফ্রেশ করুন"
            className="p-3 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 rounded-2xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'রিফ্রেশ হচ্ছে...' : 'রিফ্রেশ'}</span>
          </button>

          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-900/30 flex items-center gap-2 text-xs"
          >
            <span>← মূল ড্যাশবোর্ডে ফিরুন</span>
          </button>
        </div>
      </div>

      {/* 5 Focused Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/90 scrollbar-thin">
        {[
          { id: 'overview', label: 'সার্বিক পরিসংখ্যান', icon: Activity, badge: null },
          { id: 'users', label: 'উপজেলা ও লগইন সাপোর্ট', icon: Users, badge: coverageCount },
          { id: 'security', label: 'লাইভ সেশন ও অডিট ট্রেইল', icon: ShieldCheck, badge: activeSessions.length },
          { id: 'notices', label: 'ঘোষণা ও ব্রডকাস্ট', icon: Radio, badge: announcements.filter((a) => a.isActive).length },
          { id: 'maintenance', label: 'অ্যাপ লক ও সিস্টেম সেটিংস', icon: Lock, badge: appMaintenance.filter((a) => a.isLocked).length || null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SuiteTab)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/50'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {toBn(tab.badge)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & USER STATISTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-emerald-900/30 border border-emerald-800/50 shadow-md">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="text-xs font-semibold">উপজেলা ব্যবহার কভারেজ</span>
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {toBn(coverageCount)} <span className="text-sm font-normal text-slate-400 font-sans">/ {toBn(TOTAL_UPAZILAS_BD)}</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${coveragePct}%` }} />
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-1.5">দেশের {toBn(coveragePct)}% উপজেলা পোর্টালে যুক্ত</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-indigo-900/30 border border-indigo-800/50 shadow-md">
              <div className="flex items-center justify-between text-indigo-400 mb-2">
                <span className="text-xs font-semibold">আজ ও এই মাসে সক্রিয়</span>
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {toBn(summary.activeToday)} <span className="text-sm font-normal text-slate-400 font-sans">আজ</span>
              </div>
              <p className="text-[11px] text-indigo-300/80 mt-2">
                ৭ দিনে: {toBn(summary.activeLast7Days)} • ৩০ দিনে: {toBn(summary.activeLast30Days)} উপজেলা
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/70 via-slate-900 to-amber-900/30 border border-amber-800/50 shadow-md">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <span className="text-xs font-semibold">সক্রিয় লাইভ সেশন</span>
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {toBn(activeSessions.length)} <span className="text-sm font-normal text-slate-400 font-sans">ডিভাইস</span>
              </div>
              <p className="text-[11px] text-amber-300/80 mt-2">মোট লগইন প্রবেশ: {toBn(summary.totalLogins)} বার</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-rose-900/20 border border-purple-800/50 shadow-md">
              <div className="flex items-center justify-between text-purple-300 mb-2">
                <span className="text-xs font-semibold">লগইন সতর্কতা / স্থগিত</span>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {toBn(securityAlertRows.length)} <span className="text-sm font-normal text-slate-400 font-sans">উপজেলা</span>
              </div>
              <p className="text-[11px] text-slate-300/80 mt-2">
                অ্যাপ ওপেন: মোট {toBn(summary.appOpens.total)} বার
              </p>
            </div>
          </div>

          {/* Login alerts / locked or suspended upazilas */}
          {securityAlertRows.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-700/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>লগইন সমস্যা / স্থগিত বা লক থাকা উপজেলা ({toBn(securityAlertRows.length)} টি)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('locked');
                    setActiveTab('users');
                  }}
                  className="text-xs text-amber-300 hover:text-amber-200 font-bold cursor-pointer inline-flex items-center gap-1"
                >
                  <span>সমাধানের জন্য তালিকা দেখুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {securityAlertRows.slice(0, 6).map((row) => (
                  <div
                    key={row.upazilaCode}
                    className="p-3 rounded-xl bg-slate-950/80 border border-amber-800/40 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">
                        {row.upazilaNameBn} ({row.upazilaCode})
                      </div>
                      <div className="text-[11px] text-amber-300 truncate">
                        {securityAlertFor(row.security) || row.accountStatus}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleUnlockUser(row.upazilaCode)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold cursor-pointer shrink-0"
                    >
                      সক্রিয়/আনলক
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4 Apps Usage Counts (No Financial Data) */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>৪টি অ্যাপের ব্যবহারের পরিসংখ্যান (অ্যাপ ওপেন সংখ্যা):</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'app1', count: summary.appOpens.app1, name: '১. ফেরতযোগ্য অগ্রিম', color: 'border-emerald-600/60 bg-emerald-950/20 text-emerald-400' },
                { id: 'app2', count: summary.appOpens.app2, name: '২. অফেরতযোগ্য অগ্রিম', color: 'border-amber-600/60 bg-amber-950/20 text-amber-400' },
                { id: 'app3', count: summary.appOpens.app3, name: '৩. চূড়ান্ত উত্তোলন', color: 'border-rose-600/60 bg-rose-950/20 text-rose-400' },
                { id: 'app4', count: summary.appOpens.app4, name: '৪. মৃত্যুদাবী নিষ্পত্তি', color: 'border-blue-600/60 bg-blue-950/20 text-blue-400' },
              ].map((app) => (
                <div key={app.id} className={`p-4 rounded-xl border ${app.color} space-y-2`}>
                  <div className="text-xs font-bold text-slate-200">{app.name}</div>
                  <div className="text-3xl font-black font-mono text-white">
                    {toBn(app.count)} <span className="text-xs font-sans font-normal text-slate-400">বার ব্যবহার</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Feed */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span>সাম্প্রতিক প্রবেশ ও প্রশাসনিক কার্যক্রম (Live Feed):</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                <span>সকল লগ দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">এখনো কোনো লগ রেকর্ড হয়নি।</p>
            ) : (
              <div className="divide-y divide-slate-800/80 overflow-hidden">
                {auditLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                          log.status === 'success'
                            ? 'bg-emerald-400'
                            : log.status === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-slate-200">{log.description}</p>
                        <span className="text-[11px] text-slate-500 font-mono">
                          উপজেলা: {log.upazilaCode} • {log.email || '—'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                      {dateTime(log.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: UPAZILA DIRECTORY & LOGIN SUPPORT */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>সক্রিয় উপজেলা তালিকা ও লগইন সাপোর্ট</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                নিবন্ধিত ও তাৎক্ষণিক (Instant) — উভয় ধরনের উপজেলার সক্রিয়তা, লক/স্থগিত নিয়ন্ত্রণ, OTP ও লগইন সমস্যা সমাধান।
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="উপজেলা, কোড বা ইমেইল..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-52"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="active">সক্রিয় (Active)</option>
                <option value="suspended">স্থগিত (Suspended)</option>
                <option value="deactivated">নিষ্ক্রিয় (Deactivated)</option>
                <option value="locked">লক / ব্যর্থ চেষ্টা</option>
              </select>

              <select
                value={accountTypeFilter}
                onChange={(e) => setAccountTypeFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">সব ধরন</option>
                <option value="registered">নিবন্ধিত অ্যাকাউন্ট</option>
                <option value="instant">সহজ প্রবেশ (Instant)</option>
              </select>

              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">সব বিভাগ</option>
                {divisions.map((d) => (
                  <option key={d.en} value={d.bn}>
                    {d.bn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">উপজেলা ও কোড</th>
                  <th className="p-3.5">জেলা ও বিভাগ</th>
                  <th className="p-3.5">ধরন ও রোল</th>
                  <th className="p-3.5">ব্যবহার পরিসংখ্যান</th>
                  <th className="p-3.5">স্ট্যাটাস ও সতর্কতা</th>
                  <th className="p-3.5 text-right">পদক্ষেপ (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      নির্বাচিত ফিল্টারে কোনো উপজেলা পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((row) => {
                    const lockAlert = securityAlertFor(row.security);
                    const hasValidEmail = Boolean(row.email && row.email.includes('@') && row.email !== 'instant-upazila');
                    const canUnlock = Boolean(lockAlert) || row.accountStatus !== 'active';

                    return (
                      <tr key={row.upazilaCode} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-bold text-white">
                          <div>{row.upazilaNameBn}</div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-800/40">
                              {row.upazilaCode}
                            </span>
                            {hasValidEmail && (
                              <span className="text-[10px] font-mono text-slate-400">{row.email}</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-300">
                          <div>{row.districtNameBn}</div>
                          <div className="text-[11px] text-slate-500">{row.divisionNameBn}</div>
                        </td>

                        <td className="p-3.5 space-y-1">
                          <div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                row.role === 'super_admin'
                                  ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                                  : row.isRegistered
                                  ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/50'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {row.role === 'super_admin'
                                ? 'সুপার এডমিন'
                                : row.isRegistered
                                ? 'নিবন্ধিত ইউজার'
                                : 'সহজ প্রবেশ (Instant)'}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                          <div>প্রবেশ: {toBn(row.loginCount)} বার • অ্যাপ: {toBn(row.appOpensTotal)} বার</div>
                          <div className="text-[10px] text-slate-500">
                            সর্বশেষ: {row.lastSeenAt ? dateTime(row.lastSeenAt) : '—'}
                          </div>
                        </td>

                        <td className="p-3.5 space-y-1">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                              row.accountStatus === 'active'
                                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                                : row.accountStatus === 'suspended'
                                ? 'bg-amber-950/70 text-amber-300 border-amber-700/60'
                                : 'bg-rose-950/70 text-rose-300 border-rose-700/60'
                            }`}
                          >
                            {row.accountStatus === 'active' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                            )}
                            <span>
                              {row.accountStatus === 'active'
                                ? 'সক্রিয় (Active)'
                                : row.accountStatus === 'suspended'
                                ? 'স্থগিত (Suspended)'
                                : 'নিষ্ক্রিয় (Deactivated)'}
                            </span>
                          </span>
                          {lockAlert && (
                            <div className="text-[10px] text-rose-300 font-medium">{lockAlert}</div>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {canUnlock && (
                            <button
                              type="button"
                              onClick={() => void handleUnlockUser(row.upazilaCode)}
                              title="লকআউট রিসেট ও সক্রিয় করুন"
                              className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>সক্রিয় / আনলক</span>
                            </button>
                          )}

                          {row.role !== 'super_admin' && (
                            <>
                              {row.accountStatus !== 'suspended' && (
                                <button
                                  type="button"
                                  onClick={() => void handleToggleStatus(row.upazilaCode, 'suspended')}
                                  className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 text-[11px] font-semibold cursor-pointer"
                                >
                                  স্থগিত
                                </button>
                              )}
                              {row.accountStatus !== 'deactivated' && (
                                <button
                                  type="button"
                                  onClick={() => void handleToggleStatus(row.upazilaCode, 'deactivated')}
                                  title="উপজেলার প্রবেশ স্থায়ীভাবে নিষ্ক্রিয় করুন"
                                  className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>নিষ্ক্রিয়</span>
                                </button>
                              )}
                            </>
                          )}

                          {hasValidEmail && (
                            <button
                              type="button"
                              onClick={() => void handleGenerateOtp(row.upazilaCode, row.email)}
                              title="ইমেইলে পাসওয়ার্ড রিকভারি OTP পাঠান"
                              className="px-2 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>OTP</span>
                            </button>
                          )}

                          {row.isRegistered && currentUser.upazila_code !== row.upazilaCode && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleAssignRole(
                                  row.upazilaCode,
                                  row.role === 'super_admin' ? 'upazila_user' : 'super_admin',
                                )
                              }
                              className="px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/60 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>{row.role === 'super_admin' ? 'ইউজারে নামান' : 'অ্যাডমিন'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE SESSIONS & AUDIT TRAIL */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>সক্রিয় সেশন কন্ট্রোল (Active Sessions & Force Logout)</span>
            </h3>
            <p className="text-xs text-slate-400">
              সর্বশেষ ৫ মিনিটে সক্রিয় থাকা উপজেলা ও অ্যাডমিন সেশনসমূহ এখানে প্রদর্শিত হচ্ছে। অন্য যেকোনো সেশন দূর থেকেই ফোর্স লগআউট করা যাবে।
            </p>

            {activeSessions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">বর্তমানে কোনো সক্রিয় সেশন নেই।</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSessions.map((s) => (
                  <div
                    key={s.sessionId}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="font-bold text-white text-xs truncate">
                          {s.upazilaNameBn || s.upazilaCode} ({s.upazilaCode})
                        </span>
                        {s.isCurrentSession && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-700 font-semibold">
                            আপনার বর্তমান সেশন
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">{s.email || 'instant-upazila'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {s.browser} • সক্রিয়: {s.lastActiveTime} • লগইন: {s.loginTime}
                      </div>
                    </div>

                    {!s.isCurrentSession && (
                      <button
                        type="button"
                        onClick={() => void handleTerminateSession(s.sessionId, s.upazilaNameBn || s.upazilaCode)}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>ফোর্স লগআউট</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>নিরাপত্তা ও অ্যাক্টিভিটি অডিট ট্রেইল (Audit Trail)</span>
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="লগ খুঁজুন..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('আপনি কি সমস্ত অডিট হিস্ট্রি পরিষ্কার করতে চান?')) {
                      void clearAuditLogsOnServer()
                        .then(() => {
                          showToast('সার্ভারের অডিট হিস্ট্রি পরিষ্কার করা হয়েছে।', 'success');
                          return reloadData();
                        })
                        .catch(() => showToast('সার্ভারের অডিট লগ মুছে ফেলা যায়নি।', 'error'));
                    }
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>লগ ক্লিয়ার</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[11px]">
                  <tr>
                    <th className="p-3">টাইমস্ট্যাম্প</th>
                    <th className="p-3">ইভেন্ট</th>
                    <th className="p-3">উপজেলা / ইউজার</th>
                    <th className="p-3">বিবরণ</th>
                    <th className="p-3">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 font-sans">
                        কোনো অডিট লগ পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition text-[11px]">
                        <td className="p-3 text-slate-400 whitespace-nowrap">{dateTime(log.timestamp)}</td>
                        <td className="p-3 uppercase font-bold text-indigo-300">{log.eventType}</td>
                        <td className="p-3 text-slate-300">
                          {log.upazilaCode} ({log.email || '—'})
                        </td>
                        <td className="p-3 text-slate-200 font-sans">{log.description}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'success'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : log.status === 'warning'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTICES & BROADCAST */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-400" />
              <span>নতুন কেন্দ্রীয় নোটিশ জারি করুন</span>
            </h3>
            <p className="text-xs text-slate-400">
              এখানে নোটিশ প্রকাশ করলে তা সকল উপজেলার (অথবা নির্বাচিত নির্দিষ্ট উপজেলার) ড্যাশবোর্ডে প্রদর্শিত হবে।
            </p>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">নোটিশের শিরোনাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: নতুন অর্থবছরের আপডেট..."
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">বার্তা বা নোটিশের বিস্তারিত</label>
                <textarea
                  required
                  rows={4}
                  placeholder="বিস্তারিত বার্তা এখানে লিখুন..."
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">মাত্রা (Severity)</label>
                  <select
                    value={annSeverity}
                    onChange={(e) => setAnnSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="info">তথ্যমূলক (Info)</option>
                    <option value="warning">সতর্কতামূলক (Warning)</option>
                    <option value="critical">অতীব জরুরি (Critical)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">প্রাপক উপজেলা</label>
                  <select
                    value={annTargetUpazila}
                    onChange={(e) => setAnnTargetUpazila(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">সারাদেশ (সকল ৫০৪ উপজেলা)</option>
                    {allUpazilasList.map((u) => (
                      <option key={u.defaultId} value={u.defaultId}>
                        {u.upazilaBn} — {u.districtBn} ({u.defaultId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>নোটিশ সম্প্রচার করুন</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>চলমান নোটিশ ও ব্রডকাস্টের তালিকা ({toBn(announcements.length)})</span>
            </h3>

            {announcements.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">কোনো নোটিশ জারি করা নেই।</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-4 rounded-xl border transition ${
                      ann.isActive
                        ? ann.severity === 'critical'
                          ? 'bg-rose-950/40 border-rose-800/80 text-rose-100'
                          : ann.severity === 'warning'
                          ? 'bg-amber-950/40 border-amber-800/80 text-amber-100'
                          : 'bg-indigo-950/40 border-indigo-800/80 text-indigo-100'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ann.severity === 'critical'
                                ? 'bg-rose-900 text-rose-200'
                                : ann.severity === 'warning'
                                ? 'bg-amber-900 text-amber-200'
                                : 'bg-indigo-900 text-indigo-200'
                            }`}
                          >
                            {ann.severity}
                          </span>
                          <h4 className="font-bold text-white text-sm">{ann.title}</h4>
                        </div>
                        <p className="text-xs text-slate-300">{ann.message}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                          <span>প্রাপক: <strong>{ann.targetUpazilaName || 'সারাদেশ'}</strong></span>
                          <span>•</span>
                          <span>তারিখ: {new Date(ann.createdAt).toLocaleDateString('bn-BD')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => void handleToggleNotice(ann.id, ann.isActive)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold border cursor-pointer ${
                            ann.isActive
                              ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                          }`}
                        >
                          {ann.isActive ? 'স্থগিত করুন' : 'চালু করুন'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteNotice(ann.id)}
                          className="p-1 rounded text-rose-400 hover:text-rose-200 cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: APP LOCKS & SYSTEM SETTINGS (NO FINANCIAL / PII CLAIMS) */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                <span>অ্যাপ-ভিত্তিক লক/আনলক নিয়ন্ত্রণ (App Maintenance Control)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                যেকোনো নির্দিষ্ট অ্যাপে রক্ষণাবেক্ষণ বা ফর্ম আপডেট চলাকালে সাময়িকভাবে লক করে সকল উপজেলার প্রবেশ বন্ধ রাখতে পারেন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appMaintenance.map((app) => (
                <div
                  key={app.appId}
                  className={`p-5 rounded-2xl border transition-all ${
                    app.isLocked
                      ? 'bg-rose-950/20 border-rose-800/80 shadow-lg shadow-rose-950/20'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {app.isLocked ? (
                        <Lock className="w-5 h-5 text-rose-400" />
                      ) : (
                        <Unlock className="w-5 h-5 text-emerald-400" />
                      )}
                      <h4 className="font-bold text-white text-sm">{app.appName}</h4>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        app.isLocked
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {app.isLocked ? 'রক্ষণাবেক্ষণে সাময়িক বন্ধ' : 'সচল ও উন্মুক্ত'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">লক করার কারণ / ইউজার মেসেজ:</label>
                      <input
                        type="text"
                        value={maintenanceReasons[app.appId] || ''}
                        onChange={(e) =>
                          setMaintenanceReasons({ ...maintenanceReasons, [app.appId]: e.target.value })
                        }
                        placeholder="যেমন: ফর্ম আপডেটের জন্য সাময়িক বন্ধ..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-500 font-mono">
                        আপডেট: {dateTime(app.updatedAt)}
                      </span>

                      <button
                        type="button"
                        onClick={() => void handleToggleAppLock(app.appId, app.isLocked)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          app.isLocked
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                        }`}
                      >
                        {app.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        <span>{app.isLocked ? 'অ্যাপ উন্মুক্ত করুন' : 'অ্যাপ সাময়িক বন্ধ করুন'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy-safe Settings Backup, CSV Usage Export & Test Log Cleanup */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-400" />
                <span>পোর্টাল সেটিংস ব্যাকআপ ও পরিসংখ্যান এক্সপোর্ট</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                গোপনীয়তার স্বার্থে এখানে কোনো কর্মচারীর ব্যক্তিগত বা আর্থিক তথ্য সংগ্রহ করা হয় না — কেবল উপজেলা সক্রিয়তা, নোটিশ ও সিস্টেম লগ এক্সপোর্ট/ব্যাকআপ করা যায়।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-800/60 space-y-3">
                <h4 className="font-bold text-white text-sm">সেটিংস ও লগ ব্যাকআপ (JSON)</h4>
                <p className="text-xs text-slate-300">
                  উপজেলা তালিকা, ব্যবহার পরিসংখ্যান, নোটিশ, অ্যাপ লক ও অডিট লগের ব্যাকআপ।
                </p>
                <button
                  type="button"
                  onClick={() => void handleDownloadBackup()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>সেটিংস ব্যাকআপ ডাউনলোড</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 space-y-3">
                <h4 className="font-bold text-white text-sm">উপজেলা ব্যবহার রিপোর্ট (CSV)</h4>
                <p className="text-xs text-slate-300">
                  কোন উপজেলা কতবার পোর্টাল ও অ্যাপ ১–৪ ব্যবহার করেছে তার এক্সেল উপযোগী CSV রিপোর্ট।
                </p>
                <button
                  type="button"
                  onClick={() => void handleDownloadUsageCsv()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>পরিসংখ্যান CSV ডাউনলোড</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-800/60 space-y-3">
                <h4 className="font-bold text-white text-sm">টেস্ট লগ ক্লিনআপ</h4>
                <p className="text-xs text-slate-300">
                  পরীক্ষামূলক (Test) হিসেবে চিহ্নিত অডিট লগ সার্ভার থেকে পরিষ্কার করুন।
                </p>
                <button
                  type="button"
                  onClick={() => void handlePurgeTestLogs()}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>টেস্ট লগ পরিষ্কার করুন</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-slate-800">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-violet-400" />
                  <span>এনক্রিপ্টেড সেটিংস ব্যাকআপ (AES-256)</span>
                </h4>
                <input
                  type="password"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  placeholder="ব্যাকআপ পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => void handleDownloadEncryptedBackup()}
                  disabled={isBackupBusy}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>এনক্রিপ্টেড ব্যাকআপ ডাউনলোড</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  <span>ব্যাকআপ থেকে সেটিংস পুনরুদ্ধার</span>
                </h4>
                <input
                  type="file"
                  accept=".json,.txt,application/json"
                  onChange={handleRestoreFileChosen}
                  className="w-full text-xs text-slate-300 file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:bg-slate-800 file:text-white file:cursor-pointer bg-slate-900 border border-slate-700 rounded-xl py-2 px-2"
                />
                {restoreFileName && (
                  <p className="text-[11px] text-slate-400 font-mono truncate">নির্বাচিত ফাইল: {restoreFileName}</p>
                )}
                <input
                  type="password"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  placeholder="ফাইলের পাসওয়ার্ড (এনক্রিপ্টেড হলে)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => void handleRestoreBackup()}
                  disabled={isBackupBusy || !restoreFileName}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ব্যাকআপ থেকে রিস্টোর করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Confirmation Modal */}
      {otpModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-700/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-600 mx-auto flex items-center justify-center text-indigo-400">
              <KeyRound className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">ইমেইল OTP পাঠানো হয়েছে</h4>
              <p className="text-xs text-slate-400 mt-1">
                উপজেলা: <strong>{otpModalData.upazilaCode}</strong> • {otpModalData.email}
              </p>
            </div>

            <div className="py-4 px-6 bg-slate-950 border border-indigo-800/80 rounded-2xl">
              <p className="text-sm text-emerald-300 font-semibold">
                পাসওয়ার্ড রিকভারি কোড ব্যবহারকারীর নিবন্ধিত ইমেইলে পাঠানো হয়েছে।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOtpModalData(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSuite;
