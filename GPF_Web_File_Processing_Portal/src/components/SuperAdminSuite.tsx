import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  FileCheck2,
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
  Filter,
  Activity,
  Layers,
  FileSpreadsheet,
  Clock,
  Sparkles,
  ChevronRight,
  LogOut,
  Send,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { UserSession, CentralClaimRecord, SystemAnnouncement, AppMaintenanceControl, AuditLogEntry, ActiveSession, UserAccountStatus, UserRole } from '../types';
import { toBn, moneyCompact, date, dateTime } from '../lib/format';
import { VERSION_LABEL } from '../lib/portalMeta';
import {
  getCentralClaims,
  hydrateCentralClaims,
  hydrateAnnouncements,
  hydrateMaintenanceStates,
  hydrateAuditLogs,
  hydrateActiveSessions,
  getClaimsStats,
  getUserStatuses,
  setUserAccountStatus,
  unlockUserAccount,
  getAuditLogs,
  clearAuditLogsOnServer,
  getActiveSessions,
  terminateSession,
  terminateSessionOnServer,
  getAnnouncements,
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
  generateClaimsCsv,
  purgeTestData,
  purgeTestDataOnServer,
  hydrateClaimTrash,
  getTrashedClaims,
  trashCentralClaim,
  restoreTrashedClaim,
  purgeClaimTrash,
  buildBackupPayload,
  applyBackupSnapshot,
  replayClaimsToServer,
  type BackupPayload,
} from '../lib/centralAdminStore';
import { getAllDivisions } from '../data/upazilaData';
import { supabase } from '../lib/supabase';
import {
  fetchLoginSecurity,
  securityAlertFor,
  unlockUpazilaOnServer,
  assignUpazilaRoleOnServer,
  describeRpcError,
  LoginSecurityRow,
} from '../lib/adminSecurity';

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
  onRefreshUsers?: () => void;
}

type SuiteTab = 'overview' | 'users' | 'claims' | 'security' | 'notices' | 'maintenance' | 'backup';

export const SuperAdminSuite: React.FC<SuperAdminSuiteProps> = ({
  users,
  currentUser,
  onBackToDashboard,
  onRefreshUsers,
}) => {
  const [activeTab, setActiveTab] = useState<SuiteTab>('overview');
  const [stats, setStats] = useState(getClaimsStats());
  const [claims, setClaims] = useState<CentralClaimRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [appMaintenance, setAppMaintenance] = useState<AppMaintenanceControl[]>([]);
  const [userStatusMap, setUserStatusMap] = useState(getUserStatuses());
  const [loginSecurity, setLoginSecurity] = useState<Record<string, LoginSecurityRow>>({});
  const [claimTrash, setClaimTrash] = useState<CentralClaimRecord[]>([]);
  const [backupPassword, setBackupPassword] = useState('');
  const [restoreFileName, setRestoreFileName] = useState('');
  const [restoreFileText, setRestoreFileText] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [restoreIncludesClaims, setRestoreIncludesClaims] = useState(true);
  const [isBackupBusy, setIsBackupBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Filter states for Users tab
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserAccountStatus>('all');
  const [divisionFilter, setDivisionFilter] = useState('all');

  // Filter states for Claims tab
  const [claimSearch, setClaimSearch] = useState('');
  const [claimAppFilter, setClaimAppFilter] = useState('all');
  const [claimStatusFilter, setClaimStatusFilter] = useState('all');
  const [selectedClaimDetail, setSelectedClaimDetail] = useState<CentralClaimRecord | null>(null);

  // New announcement form state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annSeverity, setAnnSeverity] = useState<'info' | 'warning' | 'critical'>('info');
  const [annTargetUpazila, setAnnTargetUpazila] = useState<string>('all');

  // Maintenance form state
  const [maintenanceReasons, setMaintenanceReasons] = useState<Record<string, string>>({});

  // Active OTP display modal
  const [otpModalData, setOtpModalData] = useState<{ upazilaCode: string; email: string; code: string; expiresAt: string } | null>(null);

  // Refresh all stores
  const reloadData = async () => {
    let allRemoteDataLoaded = true;
    try {
      await onRefreshUsers?.();
    } catch {
      allRemoteDataLoaded = false;
      showToast('উপজেলা অ্যাকাউন্টের তালিকা হালনাগাদ করা যায়নি।', 'error');
    }
    try {
      await hydrateCentralClaims();
      await hydrateClaimTrash();
    } catch {
      allRemoteDataLoaded = false;
      showToast('সেন্ট্রাল দাবি ডেটাবেজ লোড করা যায়নি। Supabase schema ও সংযোগ যাচাই করুন।', 'error');
    }
    try {
      const remoteAnnouncements = await hydrateAnnouncements(currentUser.upazila_code);
      const remoteMaintenance = await hydrateMaintenanceStates();
      const remoteAuditLogs = await hydrateAuditLogs();
      const remoteSessions = await hydrateActiveSessions();
      setAnnouncements(remoteAnnouncements);
      setAppMaintenance(remoteMaintenance);
      setAuditLogs(remoteAuditLogs);
      setActiveSessions(remoteSessions);
    } catch {
      allRemoteDataLoaded = false;
      showToast('নোটিশ বা রক্ষণাবেক্ষণের কেন্দ্রীয় সেটিংস লোড করা যায়নি।', 'error');
    }

    if (supabase) {
      try {
        const remoteSecurity = await fetchLoginSecurity();
        setLoginSecurity(Object.fromEntries(remoteSecurity.map((row) => [row.upazilaCode, row])));
      } catch {
        showToast('লগইন নিরাপত্তার তথ্য (ব্যর্থ চেষ্টা ও লক) লোড করা যায়নি।', 'error');
      }
    }
    setStats(getClaimsStats());
    setClaims(getCentralClaims());
    setClaimTrash(getTrashedClaims());
    setAuditLogs(getAuditLogs());
    setActiveSessions(getActiveSessions());
    setAnnouncements(getAnnouncements());
    const maint = getAppMaintenanceStates();
    setAppMaintenance(maint);
    setUserStatusMap(getUserStatuses());

    const reasons: Record<string, string> = {};
    maint.forEach((m) => {
      reasons[m.appId] = m.lockReason;
    });
    setMaintenanceReasons(reasons);
    return allRemoteDataLoaded;
  };

  useEffect(() => {
    void reloadData();
    const interval = window.setInterval(() => void reloadData(), 30000);
    return () => window.clearInterval(interval);
  }, [currentUser.upazila_code]);

  const showToast = (msg: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // -------------------------------------------------------------------------
  // User Management Actions (মডিউল ১)
  // -------------------------------------------------------------------------
  const handleToggleStatus = async (upazilaCode: string, newStatus: UserAccountStatus) => {
    if (!supabase) {
      showToast('Supabase Auth সংযোগ প্রস্তুত নয়; অ্যাকাউন্টের স্ট্যাটাস বদলানো যায়নি।', 'error');
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
    setUserAccountStatus(upazilaCode, newStatus);
    setUserStatusMap(getUserStatuses());
    try {
      await onRefreshUsers?.();
    } catch {
      showToast('স্ট্যাটাস বদলেছে, তবে অ্যাকাউন্ট তালিকা রিফ্রেশ হয়নি।', 'warning');
    }

    // The RPC answers with void, so re-read the row from the database: if the
    // deployed schema differs from this repo the status would silently stay put.
    let confirmed: UserAccountStatus | undefined;
    try {
      const rows = await fetchLoginSecurity();
      setLoginSecurity(Object.fromEntries(rows.map((row) => [row.upazilaCode, row])));
      confirmed = rows.find((row) => row.upazilaCode === upazilaCode)?.accountStatus;
    } catch {
      confirmed = undefined;
    }
    if (confirmed && confirmed !== newStatus) {
      showToast(`সার্ভার এখনও '${confirmed}' দেখাচ্ছে; '${newStatus}' প্রয়োগ হয়নি। Supabase-এর schema আবার প্রয়োগ করুন।`, 'warning');
    } else {
      showToast(`উপজেলা (${upazilaCode}) এর স্ট্যাটাস '${newStatus.toUpperCase()}' করা হয়েছে।`, newStatus === 'active' ? 'success' : 'warning');
    }
    reloadData();
  };

  const handleGenerateOtp = async (upazilaCode: string, email: string) => {
    if (!supabase) {
      showToast('Supabase Auth সংযোগ প্রস্তুত নয়; OTP পাঠানো যায়নি।', 'error');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      showToast('নিবন্ধিত ইমেইলে OTP পাঠানো যায়নি। ইমেইল ও SMTP সেটিংস যাচাই করুন।', 'error');
      return;
    }
    setOtpModalData({ upazilaCode, email, code: '', expiresAt: '' });
    showToast(`উপজেলা (${upazilaCode}) এর নিবন্ধিত ইমেইলে recovery OTP পাঠানো হয়েছে।`, 'success');
    reloadData();
  };

  const handleUnlockUser = async (upazilaCode: string) => {
    if (!supabase) {
      showToast('Supabase Auth সংযোগ প্রস্তুত নয়; অ্যাকাউন্ট আনলক করা যায়নি।', 'error');
      return;
    }
    try {
      await unlockUpazilaOnServer(upazilaCode);
    } catch (unlockError) {
      showToast((unlockError as Error).message || 'সার্ভারে অ্যাকাউন্ট আনলক করা যায়নি।', 'error');
      return;
    }
    unlockUserAccount(upazilaCode);
    showToast(`উপজেলা (${upazilaCode}) এর লকআউট ও ব্যর্থ লগইন গণনা রিসেট করা হয়েছে।`, 'success');
    try {
      await onRefreshUsers?.();
    } catch {
      showToast('অ্যাকাউন্ট আনলক হয়েছে, তবে তালিকা রিফ্রেশ হয়নি।', 'warning');
    }
    reloadData();
  };

  const handleAssignRole = async (upazilaCode: string, role: UserRole) => {
    if (!supabase) {
      showToast('Supabase Auth সংযোগ প্রস্তুত নয়; ভূমিকা পরিবর্তন করা যায়নি।', 'error');
      return;
    }
    const label = role === 'super_admin' ? 'সুপার এডমিন' : 'উপজেলা ইউজার';
    if (!window.confirm(`${upazilaCode} এর ভূমিকা "${label}" করা হবে? নিশ্চিত হলে এগিয়ে যান `)) return;
    try {
      await assignUpazilaRoleOnServer(upazilaCode, role);
    } catch (roleError) {
      showToast((roleError as Error).message || 'ভূমিকা পরিবর্তন করা যায়নি।', 'error');
      return;
    }
    showToast(`ভূমিকা পরিবর্তন সম্পন্ন: ${label}`, 'success');
    try {
      await onRefreshUsers?.();
    } catch {
      showToast('ভূমিকা বদলেছে, তবে তালিকা রিফ্রেশ হয়নি।', 'warning');
    }
    reloadData();
  };

  // -------------------------------------------------------------------------
  // Central Claims Actions (মডিউল ২)
  // -------------------------------------------------------------------------
  const handleDeleteClaim = async (id: string, name: string) => {
    if (!window.confirm(`দাবিটি ট্র্যাশে নেওয়া হবে: "${name}"। প্রয়োজনে ব্যাকআপ ও রিস্টোর ট্যাব থেকে ফিরিয়ে আনা যাবে। এগিয়ে যাবেন?`)) {
      return;
    }
    try {
      await trashCentralClaim(id);
    } catch {
      showToast('দাবিটি ট্র্যাশে নেওয়া যায়নি।', 'error');
      return;
    }
    showToast('দাবিটি ট্র্যাশে নেওয়া হয়েছে।', 'warning');
    reloadData();
  };

  const handleRestoreTrashedClaim = async (id: string, name: string) => {
    if (!window.confirm(`ট্র্যাশ থেকে ফিরিয়ে আনা হবে: "${name}"। এগিয়ে যাবেন?`)) {
      return;
    }
    try {
      await restoreTrashedClaim(id);
    } catch {
      showToast('দাবিটি পুনরুদ্ধার করা যায়নি।', 'error');
      return;
    }
    showToast('দাবিটি কেন্দ্রীয় হাবে ফিরিয়ে আনা হয়েছে।', 'success');
    reloadData();
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('সাবধান! ট্র্যাশ খালি করলে দাবিগুলো স্থায়ীভাবে মুছে যাবে; শুধু ব্যাকআপ ফাইল থেকে ফেরানো যাবে। এগিয়ে যাবেন?')) {
      return;
    }
    let destroyed = 0;
    try {
      destroyed = await purgeClaimTrash();
    } catch {
      showToast('ট্র্যাশ খালি করা যায়নি।', 'error');
      return;
    }
    showToast(`${destroyed} টি দাবি স্থায়ীভাবে মুছে ফেলা হয়েছে।`, 'warning');
    reloadData();
  };

  // -------------------------------------------------------------------------
  // Encrypted backup & recovery (মডিউল ৬)
  // -------------------------------------------------------------------------
  const downloadTextFile = (content: string, fileName: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadEncryptedBackup = async () => {
    if (!(await reloadData())) return;
    setIsBackupBusy(true);
    try {
      const sealed = await encryptBackup(JSON.stringify(buildBackupPayload(users)), backupPassword);
      downloadTextFile(
        sealed,
        `GPF_Encrypted_Backup_${new Date().toISOString().slice(0, 10)}.json`,
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

    let payload: BackupPayload;
    try {
      payload = parseBackupPayload<BackupPayload>(json);
    } catch {
      showToast('ফাইলটি এই পোর্টালের ব্যাকআপ ফাইল নয়।', 'error');
      return;
    }

    const claimNote = restoreIncludesClaims
      ? ` ${toBn(payload.centralClaims?.length || 0)} টি দাবি সহ (বর্তমান তালিকা প্রতিস্থাপিত হবে)`
      : ' দাবির তালিকা বাদ দিয়ে';
    if (!window.confirm(`ব্যাকআপ (${payload.exportedAt}) থেকে রিস্টোর করবেন${claimNote}?`)) {
      return;
    }

    setIsBackupBusy(true);
    try {
      applyBackupSnapshot(payload, { includeClaims: restoreIncludesClaims });
      if (restoreIncludesClaims && supabase && payload.centralClaims?.length) {
        await replayClaimsToServer(payload.centralClaims, payload.claimTrash || []);
      }
    } catch {
      setIsBackupBusy(false);
      showToast('ব্যাকআপ পুনরুদ্ধার সম্পূর্ণ হয়নি।', 'error');
      return;
    }

    setIsBackupBusy(false);
    setRestoreFileText('');
    setRestoreFileName('');
    setRestorePassword('');
    showToast('ব্যাকআপ থেকে সিস্টেম পুনরুদ্ধার হয়েছে।', 'success');
    reloadData();
  };

  // -------------------------------------------------------------------------
  // Session Actions (মডিউল ৩)
  // -------------------------------------------------------------------------
  const handleTerminateSession = async (sessionId: string, upazilaName: string) => {
    if (window.confirm(`আপনি কি "${upazilaName}" এর সক্রিয় সেশনটি জোরপূর্বক বন্ধ (Force Logout) করতে চান?`)) {
      try {
        await terminateSessionOnServer(sessionId);
      } catch {
        showToast('সার্ভারে সেশন বন্ধ করা যায়নি।', 'error');
        return;
      }
      terminateSession(sessionId);
      showToast(`${upazilaName}-এর সেশন ফোর্স লগআউট করা হয়েছে।`, 'error');
      reloadData();
    }
  };

  // -------------------------------------------------------------------------
  // Announcement Actions (মডিউল ৪)
  // -------------------------------------------------------------------------
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      showToast('শিরোনাম ও বার্তার বিবরণ প্রদান করুন।', 'error');
      return;
    }

    const targetCode = annTargetUpazila === 'all' ? null : annTargetUpazila;
    const targetName = annTargetUpazila === 'all' ? 'সারাদেশ (সকল উপজেলা)' : `উপজেলা কোড: ${annTargetUpazila}`;

    const savedAnnouncement = saveAnnouncement({
      title: annTitle.trim(),
      message: annMessage.trim(),
      severity: annSeverity,
      targetUpazilaCode: targetCode,
      targetUpazilaName: targetName,
      isActive: true,
      createdBy: `${currentUser.email || 'সুপার এডমিন'} (রফিকুল ইসলাম)`,
    });
    try {
      await persistAnnouncementToServer(savedAnnouncement);
    } catch {
      showToast('নোটিশটি সেন্ট্রাল ডেটাবেজে সংরক্ষণ করা যায়নি।', 'error');
      return;
    }

    setAnnTitle('');
    setAnnMessage('');
    showToast('নতুন কেন্দ্রীয় নোটিশ সফলভাবে জারি করা হয়েছে।', 'success');
    reloadData();
  };

  const handleToggleNotice = async (id: string, currentActive: boolean) => {
    try {
      await updateAnnouncementOnServer(id, { isActive: !currentActive });
    } catch {
      showToast('নোটিশের অবস্থা সার্ভারে হালনাগাদ করা যায়নি।', 'error');
      return;
    }
    toggleAnnouncement(id, !currentActive);
    showToast(`নোটিশটি ${!currentActive ? 'চালু' : 'স্থগিত'} করা হয়েছে।`, 'success');
    reloadData();
  };

  const handleDeleteNotice = async (id: string) => {
    if (window.confirm('আপনি কি এই নোটিশটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
      try {
        await deleteAnnouncementFromServer(id);
      } catch {
        showToast('নোটিশটি সার্ভার থেকে মুছে ফেলা যায়নি।', 'error');
        return;
      }
      deleteAnnouncement(id);
      showToast('নোটিশটি মুছে ফেলা হয়েছে।', 'warning');
      reloadData();
    }
  };

  // -------------------------------------------------------------------------
  // App Lock Actions (মডিউল ৫)
  // -------------------------------------------------------------------------
  const handleToggleAppLock = async (appId: 'app1' | 'app2' | 'app3' | 'app4', currentLocked: boolean) => {
    const newLocked = !currentLocked;
    const reason = maintenanceReasons[appId] || 'সার্ভার রক্ষণাবেক্ষণ ও ডাটা আপগ্রেডের জন্য এই এ্যাপটি সাময়িক বন্ধ আছে।';
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
      showToast('কেন্দ্রীয় সার্ভারে অ্যাপের অবস্থা হালনাগাদ করা যায়নি।', 'error');
      return;
    }
    setAppMaintenanceState(appId, newLocked, reason);
    showToast(`${appId.toUpperCase()} ${newLocked ? 'লক (Under Maintenance)' : 'সচল (উন্মুক্ত)'} করা হয়েছে।`, newLocked ? 'warning' : 'success');
    reloadData();
  };

  // -------------------------------------------------------------------------
  // Backup & Purge Actions (মডিউল ৬)
  // -------------------------------------------------------------------------
  const handleDownloadBackup = async () => {
    if (!(await reloadData())) return;
    downloadTextFile(
      generateFullBackupJson(users),
      `GPF_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json;charset=utf-8;',
    );
    showToast('সম্পূর্ণ ডাটাবেজ ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে।', 'success');
    reloadData();
  };

  const handleDownloadCsv = async () => {
    if (!(await reloadData())) return;
    downloadTextFile(
      generateClaimsCsv(),
      `GPF_Claims_Report_${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;',
    );
    showToast('সকল জিপিএফ দাবি CSV এক্সপোর্ট ডাউনলোড হয়েছে।', 'success');
    reloadData();
  };

  const handlePurgeTestData = async () => {
    if (window.confirm('সাবধান! এটি ডেটাবেজ থেকে টেস্ট হিসেবে চিহ্নিত দাবি ও অডিট লগ স্থায়ীভাবে মুছে ফেলবে। আপনি কি এগিয়ে যেতে চান?')) {
      let res: { claimsRemoved: number; logsRemoved: number };
      try {
        res = await purgeTestDataOnServer();
      } catch {
        showToast('সার্ভারের টেস্ট ডেটা পরিষ্কার করা যায়নি।', 'error');
        return;
      }
      purgeTestData();
      showToast(`ক্লিনআপ সম্পন্ন: ${res.claimsRemoved} টি টেস্ট ফাইল এবং ${res.logsRemoved} টি টেস্ট লগ মুছে ফেলা হয়েছে।`, 'success');
      reloadData();
    }
  };

  // -------------------------------------------------------------------------
  // Filtered lists
  // -------------------------------------------------------------------------
  // The badge and the filter must resolve a status the same way, otherwise the
  // table can list an account as active while the suspended filter hides it.
  const accountStatusFor = (
    upazilaCode: string,
    fallback: UserAccountStatus | undefined,
  ): UserAccountStatus =>
    loginSecurity[upazilaCode]?.accountStatus
    || fallback
    || userStatusMap[upazilaCode]?.status
    || 'active';

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.role === 'super_admin' && activeTab === 'users') return true; // show admin too
      const status = accountStatusFor(u.upazila_code, u.account_status);
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (divisionFilter !== 'all' && u.division_name_bn !== divisionFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchesCode = u.upazila_code?.toLowerCase().includes(q);
        const matchesName = u.upazila_name_bn?.toLowerCase().includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesDistrict = u.district_name_bn?.toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesEmail && !matchesDistrict) return false;
      }
      return true;
    });
  }, [users, userStatusMap, loginSecurity, statusFilter, divisionFilter, userSearch, activeTab]);

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      if (claimAppFilter !== 'all' && c.appType !== claimAppFilter) return false;
      if (claimStatusFilter !== 'all' && c.status !== claimStatusFilter) return false;
      if (claimSearch.trim()) {
        const q = claimSearch.toLowerCase();
        const matchesName = c.employeeName?.toLowerCase().includes(q);
        const matchesGpf = c.gpfAccNo?.toLowerCase().includes(q);
        const matchesTrack = c.trackingNo?.toLowerCase().includes(q);
        const matchesUpazila = c.upazilaNameBn?.toLowerCase().includes(q);
        if (!matchesName && !matchesGpf && !matchesTrack && !matchesUpazila) return false;
      }
      return true;
    });
  }, [claims, claimAppFilter, claimStatusFilter, claimSearch]);

  const divisions = getAllDivisions();

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen text-slate-100 py-4 px-2 sm:px-4 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold transition-all border ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-600/80'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 text-amber-200 border-amber-600/80'
              : 'bg-rose-950/90 text-rose-200 border-rose-600/80'
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
            <span className="text-slate-400 text-xs font-mono">
              সার্ভার স্ট্যাটাস: <span className="text-emerald-400 font-semibold">সক্রিয় ও সুরক্ষিত ●</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
            জিপিএফ সার্বিক প্রশাসনিক ও ইউজার কন্ট্রোল হাব
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            প্রধান তত্ত্বাবধায়ক: <strong className="text-white">রফিকুল ইসলাম</strong> • দেশের সকল উপজেলার জিপিএফ ফাইল প্রসেসিং, সিকিউরিটি অডিট, লাইভ সেশন ও কেন্দ্রীয় পলিসি পর্যবেক্ষণ।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={reloadData}
            title="সব ডেটা রিফ্রেশ করুন"
            className="p-3 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 rounded-2xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">রিফ্রেশ</span>
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

      {/* Tab Navigation Menu */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/90 scrollbar-thin">
        {[
          { id: 'overview', label: 'সার্বিক ড্যাশবোর্ড', icon: Activity, badge: null },
          { id: 'users', label: 'ইউজার ও অ্যাক্সেস কন্ট্রোল', icon: Users, badge: users.length },
          { id: 'claims', label: 'কেন্দ্রীয় ফাইল হাব', icon: FileCheck2, badge: stats.totalClaims },
          { id: 'security', label: 'লাইভ অডিট ও সিকিউরিটি', icon: ShieldCheck, badge: activeSessions.length },
          { id: 'notices', label: 'ঘোষণা ও ব্রডকাস্ট', icon: Radio, badge: announcements.filter(a => a.isActive).length },
          { id: 'maintenance', label: 'এ্যাপ লক ও পলিসি', icon: Lock, badge: appMaintenance.filter(a => a.isLocked).length || null },
          { id: 'backup', label: 'ব্যাকআপ ও এক্সপোর্ট', icon: Download, badge: null },
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
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 scale-102 border border-indigo-400/50'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
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

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-indigo-900/30 border border-indigo-800/50 shadow-md">
              <div className="flex items-center justify-between text-indigo-400 mb-2">
                <span className="text-xs font-semibold">মোট প্রসেসকৃত দাবি ফাইল</span>
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {toBn(stats.totalClaims)} <span className="text-sm font-normal text-slate-400 font-sans">টি ফাইল</span>
              </div>
              <p className="text-[11px] text-indigo-300/80 mt-1">সারাদেশের ৪টি এ্যাপে প্রস্তুতকৃত</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-emerald-900/30 border border-emerald-800/50 shadow-md">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="text-xs font-semibold">দাবীকৃত মোট অর্থের পরিমাণ</span>
                <span className="text-base font-bold">৳</span>
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                ৳{moneyCompact(stats.totalAmount)}
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-1">সর্বমোট জিপিএফ নিষ্পত্তিকৃত অর্থ</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-purple-900/30 border border-purple-800/50 shadow-md">
              <div className="flex items-center justify-between text-purple-400 mb-2">
                <span className="text-xs font-semibold">নিবন্ধিত উপজেলা ও আইডি</span>
                <Users className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {toBn(users.length)} <span className="text-sm font-normal text-slate-400 font-sans">উপজেলা</span>
              </div>
              <p className="text-[11px] text-purple-300/80 mt-1">সক্রিয় ইউজার অ্যাকাউন্ট</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/70 via-slate-900 to-amber-900/30 border border-amber-800/50 shadow-md">
              <div className="flex items-center justify-between text-amber-400 mb-2">
                <span className="text-xs font-semibold">সক্রিয় লাইভ সেশন</span>
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-tight">
                {toBn(activeSessions.length)} <span className="text-sm font-normal text-slate-400 font-sans">ডিভাইস</span>
              </div>
              <p className="text-[11px] text-amber-300/80 mt-1">বর্তমানে অনলাইনে কর্মরত</p>
            </div>
          </div>

          {/* Breakdown by 4 Apps */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>৪টি এ্যাপের কেন্দ্রীয় ফাইল ও আর্থিক বিবরণী:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'app1', name: '১. ফেরতযোগ্য অগ্রিম', color: 'border-emerald-600/60 bg-emerald-950/20 text-emerald-400' },
                { id: 'app2', name: '২. অফেরতযোগ্য অগ্রিম', color: 'border-amber-600/60 bg-amber-950/20 text-amber-400' },
                { id: 'app3', name: '৩. চূড়ান্ত উত্তোলন', color: 'border-rose-600/60 bg-rose-950/20 text-rose-400' },
                { id: 'app4', name: '৪. মৃত্যুদাবী নিষ্পত্তি', color: 'border-blue-600/60 bg-blue-950/20 text-blue-400' },
              ].map((app) => {
                const data = stats.byApp[app.id] || { count: 0, amount: 0 };
                return (
                  <div key={app.id} className={`p-4 rounded-xl border ${app.color} space-y-2`}>
                    <div className="text-xs font-bold text-slate-200">{app.name}</div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black font-mono text-white">{toBn(data.count)}</span>
                      <span className="text-xs font-mono font-bold text-slate-300">৳{moneyCompact(data.amount)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      গড় নিষ্পত্তিকৃত অর্থ: ৳{data.count > 0 ? moneyCompact(Math.round(data.amount / data.count)) : '০'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Audit Activities Feed */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span>সাম্প্রতিক প্রশাসনিক ও নিরাপত্তা কার্যক্রম (Live Feed):</span>
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

            <div className="divide-y divide-slate-800/80 overflow-hidden">
              {auditLogs.slice(0, 5).map((log) => (
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
                      <span className="text-[11px] text-slate-500 font-mono">উপজেলা: {log.upazilaCode} • {log.email}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('bn-BD')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER & ACCESS CONTROL (মডিউল ১) */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>উপজেলা শিক্ষা অফিস অ্যাকাউন্ট ও অ্যাক্সেস নিয়ন্ত্রণ</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                এক ক্লিকে উপজেলার অ্যাকাউন্ট সক্রিয়, সাময়িক স্থগিত (Suspend) বা নিষ্ক্রিয় করুন এবং ওটিপি (OTP) জেনারেট করুন।
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="উপজেলা, কোড বা ইমেইল খুঁজুন..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
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

          {/* User Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">উপজেলা ও কোড</th>
                  <th className="p-3.5">অফিসিয়াল ইমেইল</th>
                  <th className="p-3.5">জেলা ও বিভাগ</th>
                  <th className="p-3.5">রোল (RBAC)</th>
                  <th className="p-3.5">বর্তমান স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">পদক্ষেপ (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((u) => {
                  const security = loginSecurity[u.upazila_code];
                  const currentStatus = accountStatusFor(u.upazila_code, u.account_status);
                  const lockAlert = securityAlertFor(security);

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-white">
                        <div>{u.upazila_name_bn}</div>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-800/40">
                          {u.upazila_code}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-300 text-[11px]">{u.email}</td>
                      <td className="p-3.5 text-slate-400">
                        {u.district_name_bn}, {u.division_name_bn || '—'}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'super_admin'
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role === 'super_admin' ? 'সুপার এডমিন' : 'উপজেলা ইউজার'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                            currentStatus === 'active'
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                              : currentStatus === 'suspended'
                              ? 'bg-amber-950/70 text-amber-300 border-amber-700/60'
                              : 'bg-rose-950/70 text-rose-300 border-rose-700/60'
                          }`}
                        >
                          {currentStatus === 'active' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                          )}
                          <span>
                            {currentStatus === 'active'
                              ? 'সক্রিয় (Active)'
                              : currentStatus === 'suspended'
                              ? 'স্থগিত (Suspended)'
                              : 'নিষ্ক্রিয় (Deactivated)'}
                          </span>
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {lockAlert && (
                          <button
                            type="button"
                            onClick={() => handleUnlockUser(u.upazila_code)}
                            title="ব্যর্থ লগইন গণনা রিসেট করে অ্যাকাউন্ট সক্রিয় করুন"
                            className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>আনলক</span>
                          </button>
                        )}
                        {u.role !== 'super_admin' && (
                          <>
                            {currentStatus === 'active' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u.upazila_code, 'suspended')}
                                title="অ্যাকাউন্টটি সাময়িক স্থগিত করুন"
                                className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 text-[11px] font-semibold cursor-pointer"
                              >
                                স্থগিত করুন
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u.upazila_code, 'active')}
                                title="অ্যাকাউন্টটি সক্রিয় করুন"
                                className="px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[11px] font-semibold cursor-pointer"
                              >
                                সক্রিয় করুন
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleGenerateOtp(u.upazila_code, u.email)}
                              title="নিবন্ধিত ইমেইলে রিকভারি OTP পাঠান"
                              className="px-2 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>OTP দিন</span>
                            </button>
                          </>
                        )}

                        {currentUser.upazila_code !== u.upazila_code && (
                          <button
                            type="button"
                            onClick={() => handleAssignRole(u.upazila_code, u.role === 'super_admin' ? 'upazila_user' : 'super_admin')}
                            title={u.role === 'super_admin' ? 'এই অ্যাকাউন্টকে উপজেলা ইউজারে নামান' : 'এই অ্যাকাউন্টকে সুপার এডমিন করুন'}
                            className="px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/60 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{u.role === 'super_admin' ? 'ইউজারে নামান' : 'সুপার এডমিন করুন'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CENTRAL CLAIMS HUB (মডিউল ২) */}
      {activeTab === 'claims' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-400" />
                <span>কেন্দ্রীয় ফাইল হাব ও দাবি ট্র্যাকিং (All Apps Sync)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                এ্যাপ ১, এ্যাপ ২, এ্যাপ ৩ এবং এ্যাপ ৪ এ সংরক্ষিত সমস্ত দাবির কেন্দ্রীভূত ডেটাবেজ।
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="কর্মচারীর নাম বা জিপিএফ নং..."
                  value={claimSearch}
                  onChange={(e) => setClaimSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
                />
              </div>

              <select
                value={claimAppFilter}
                onChange={(e) => setClaimAppFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">সকল এ্যাপ (১-৪)</option>
                <option value="app1">১. ফেরতযোগ্য অগ্রিম</option>
                <option value="app2">২. অফেরতযোগ্য অগ্রিম</option>
                <option value="app3">৩. চূড়ান্ত উত্তোলন</option>
                <option value="app4">৪. মৃত্যুদাবী নিষ্পত্তি</option>
              </select>

              <select
                value={claimStatusFilter}
                onChange={(e) => setClaimStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">সকল স্ট্যাটাস</option>
                <option value="অনুমোদিত">অনুমোদিত</option>
                <option value="যাচাইকৃত">যাচাইকৃত</option>
                <option value="প্রস্তুত">প্রস্তুত</option>
                <option value="খসড়া">খসড়া</option>
              </select>
            </div>
          </div>

          {/* Claims Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">ট্র্যাকিং নং ও এ্যাপ</th>
                  <th className="p-3.5">কর্মচারীর নাম ও পদবী</th>
                  <th className="p-3.5">জিপিএফ হিসাব নং</th>
                  <th className="p-3.5">টাকার পরিমাণ (৳)</th>
                  <th className="p-3.5">উপজেলা ও জেলা</th>
                  <th className="p-3.5">স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      কোনো দাবি ফাইল পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-indigo-300">{c.trackingNo}</div>
                        <span className="text-[10px] text-slate-400">{c.appTitle}</span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-white">{c.employeeName}</div>
                        <div className="text-[11px] text-slate-400">{c.designation}</div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-300">{c.gpfAccNo}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        ৳{moneyCompact(c.amount)}
                      </td>

                      <td className="p-3.5 text-slate-300">
                        {c.upazilaNameBn}, {c.districtNameBn}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                          {c.status || 'প্রস্তুত'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedClaimDetail(c)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-indigo-400" />
                          <span>বিস্তারিত</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClaim(c.id, c.employeeName)}
                          className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS & LIVE SESSIONS (মডিউল ৩) */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Active Sessions Panel */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>সক্রিয় সেশন কন্ট্রোল (Active Sessions & Force Logout)</span>
            </h3>
            <p className="text-xs text-slate-400">
              বর্তমানে কোন কোন ডিভাইস থেকে কোন উপজেলা আইডি লগইন রয়েছে তা পর্যবেক্ষণ করুন এবং সন্দেহজনক সেশন দূর থেকেই ফোর্স লগআউট করুন।
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSessions.map((s) => (
                <div
                  key={s.sessionId}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-white text-xs">{s.upazilaNameBn}</span>
                      {s.isCurrentSession && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-700 font-semibold">
                          আপনার বর্তমান সেশন
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{s.email}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      আইপি: {s.ipAddress} • {s.browser} • লগইন: {s.loginTime}
                    </div>
                  </div>

                  {!s.isCurrentSession && (
                    <button
                      type="button"
                      onClick={() => handleTerminateSession(s.sessionId, s.upazilaNameBn)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ফোর্স লগআউট</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>নিরাপত্তা ও অ্যাক্টিভিটি অডিট ট্রেইল (Audit Trail)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('আপনি কি সমস্ত অডিট হিস্ট্রি পরিষ্কার করতে চান?')) {
                    void clearAuditLogsOnServer().then(() => {
                      showToast('সার্ভারের অডিট হিস্ট্রি পরিষ্কার করা হয়েছে।', 'success');
                      return reloadData();
                    }).catch(() => showToast('সার্ভারের অডিট লগ মুছে ফেলা যায়নি।', 'error'));
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>লগ ক্লিয়ার করুন</span>
              </button>
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
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition text-[11px]">
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        {dateTime(log.timestamp)}
                      </td>
                      <td className="p-3 uppercase font-bold text-indigo-300">{log.eventType}</td>
                      <td className="p-3 text-slate-300">
                        {log.upazilaCode} ({log.email})
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: NOTICE & BROADCAST SYSTEM (মডিউল ৪) */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Announcement Form */}
          <div className="lg:col-span-1 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-400" />
              <span>নতুন কেন্দ্রীয় নোটিশ জারি করুন</span>
            </h3>
            <p className="text-xs text-slate-400">
              এখানে নোটিশ প্রকাশ করলে তা সকল উপজেলার স্ক্রিনে স্ক্রলিং বা সতর্কবার্তা হিসেবে প্রদর্শিত হবে।
            </p>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">নোটিশের শিরোনাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সার্ভার মেইনটেন্যান্স বা নতুন অর্থ বছরের বিধি..."
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
                    <option value="all">সারাদেশ (সকল উপজেলা)</option>
                    {users
                      .filter((u) => u.role !== 'super_admin')
                      .map((u) => (
                        <option key={u.id} value={u.upazila_code}>
                          {u.upazila_name_bn} ({u.upazila_code})
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

          {/* Active Announcements List */}
          <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>চলমান নোটিশ ও ব্রডকাস্টের তালিকা ({toBn(announcements.length)})</span>
            </h3>

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
                        onClick={() => handleToggleNotice(ann.id, ann.isActive)}
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
                        onClick={() => handleDeleteNotice(ann.id)}
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
          </div>
        </div>
      )}

      {/* TAB 6: POLICY & APP LOCK CONTROL (মডিউল ৫) */}
      {activeTab === 'maintenance' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              <span>এ্যাপ-ভিত্তিক লক/আনলক ও সিস্টেম রক্ষণাবেক্ষণ (App Lock Control)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              যেকোনো নির্দিষ্ট এ্যাপে রক্ষণাবেক্ষণ বা বিধি পরিবর্তন চলাকালে সাময়িকভাবে লক করে ইউজারদের প্রবেশ সীমিত করুন।
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
                    {app.isLocked ? 'রক্ষণাবেক্ষণে সাময়িক বন্ধ' : 'সচল ও উন্মুক্ত'}
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
                      placeholder="যেমন: হিসাব সমাপনীর জন্য সাময়িক বন্ধ..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      আপডেট: {new Date(app.updatedAt).toLocaleTimeString('bn-BD')}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleAppLock(app.appId, app.isLocked)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        app.isLocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                      }`}
                    >
                      {app.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      <span>{app.isLocked ? 'এ্যাপ উন্মুক্ত করুন' : 'এ্যাপ সাময়িক বন্ধ করুন'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: BACKUP & DATA PURGING (মডিউল ৬) */}
      {activeTab === 'backup' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-400" />
              <span>এক ক্লিকে ফুল ব্যাকআপ, এক্সপোর্ট ও ডাটা ক্লিনিং (Backup & Export)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              সারা দেশের সকল উপজেলার প্রসেসকৃত দাবি, ইউজার তালিকা ও অডিট লগ নিরাপদে এক্সপোর্ট ও ব্যাকআপ রাখুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Complete JSON Backup */}
            <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-800/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/60 flex items-center justify-center text-indigo-300">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">সম্পূর্ণ সিস্টেম ব্যাকআপ (JSON)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                সকল উপজেলা অ্যাকাউন্ট, ৪টি এ্যাপের সমস্ত দাবি ডেটা, নোটিশ এবং সম্পূর্ণ অডিট লগসহ একটি সমন্বিত JSON ব্যাকআপ।
              </p>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>ফুল ব্যাকআপ ডাউনলোড করুন</span>
              </button>
            </div>

            {/* 2. CSV / Excel Claims Export */}
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 flex items-center justify-center text-emerald-300">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">জিপিএফ দাবি এক্সেল/CSV রিপোর্ট</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                দেশের সকল উপজেলার তৈরি করা সকল জিপিএফ দাবির তালিকা UTF-8 এনকোডিংয়ে এক্সেল বা স্প্রেডশীটে খোলার উপযোগী।
              </p>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>দাবি তালিকা (CSV) ডাউনলোড</span>
              </button>
            </div>

            {/* 3. Safe Test Data Purging */}
            <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-800/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-900/60 flex items-center justify-center text-rose-300">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm">টেস্ট ডেটা ও ক্যাশ ক্লিনআপ (Purge)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                টেস্ট হিসেবে চিহ্নিত দাবি ও অডিট লগ সরিয়ে পরীক্ষামূলক ডেটা পরিষ্কার করুন।
              </p>
              <button
                type="button"
                onClick={handlePurgeTestData}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>টেস্ট ডেটা ক্লিনআপ করুন</span>
              </button>
            </div>
          </div>

          {/* Encrypted backup + restore + trash (মডিউল ৬) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
            {/* Encrypted JSON backup */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-violet-900/60 flex items-center justify-center text-violet-300">
                  <Lock className="w-4 h-4" />
                </span>
                <h4 className="font-bold text-white text-sm">এনক্রিপ্টেড ব্যাকআপ (AES-256)</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                কর্মচারীর নাম ও জিপিএফ হিসাব নম্বর সংবেদনশীল তথ্য, তাই পাসওয়ার্ড দিয়ে সিল করা ব্যাকআপ ফাইল তৈরি করুন। ভুল পাসওয়ার্ডে ফাইল খুলবে না।
              </p>
              <input
                type="password"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder="ব্যাকআপ পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={handleDownloadEncryptedBackup}
                disabled={isBackupBusy}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>এনক্রিপ্টেড ব্যাকআপ ডাউনলোড</span>
              </button>
            </div>

            {/* Restore from backup */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-emerald-900/60 flex items-center justify-center text-emerald-300">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <h4 className="font-bold text-white text-sm">ব্যাকআপ থেকে পুনরুদ্ধার (Recovery)</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                সাধারণ বা এনক্রিপ্টেড ব্যাকআপ ফাইল বেছে নিন। এনক্রিপ্টেড ফাইলের পাসওয়ার্ডও দিন।
              </p>
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
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreIncludesClaims}
                  onChange={(e) => setRestoreIncludesClaims(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
                <span>দাবির ডেটাও ফিরিয়ে আনুন (সার্ভারের বর্তমান দাবির তালিকা প্রতিস্থাপিত হবে)</span>
              </label>
              <button
                type="button"
                onClick={handleRestoreBackup}
                disabled={isBackupBusy || !restoreFileName}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ব্যাকআপ থেকে রিস্টোর করুন</span>
              </button>
            </div>
          </div>

          {/* Claim trash */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>ডিলিট করা দাবির ট্র্যাশ ({toBn(claimTrash.length)})</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  হাব থেকে মুছে যাওয়া প্রতিটি দাবি এখানে থাকে; খালি করার আগে পর্যন্ত যেকোনো সময় ফেরানো যায়।
                </p>
              </div>
              {claimTrash.length > 0 && (
                <button
                  type="button"
                  onClick={handleEmptyTrash}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ট্র্যাশ স্থায়ীভাবে খালি করুন</span>
                </button>
              )}
            </div>

            {claimTrash.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3">
                ট্র্যাশ খালি আছে।
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="px-4 py-2 font-semibold">ট্র্যাকিং নং</th>
                      <th className="px-4 py-2 font-semibold">কর্মচারী</th>
                      <th className="px-4 py-2 font-semibold">এ্যাপ</th>
                      <th className="px-4 py-2 font-semibold">উপজেলা</th>
                      <th className="px-4 py-2 font-semibold text-right">ক্রিয়া</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {claimTrash.map((item) => (
                      <tr key={item.id} className="bg-slate-900/50">
                        <td className="px-4 py-2 font-mono text-indigo-300">{item.trackingNo}</td>
                        <td className="px-4 py-2 text-white">{item.employeeName}</td>
                        <td className="px-4 py-2 text-slate-300">{item.appTitle}</td>
                        <td className="px-4 py-2 text-slate-300">{item.upazilaNameBn || item.upazilaCode}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => void handleRestoreTrashedClaim(item.id, item.employeeName)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold cursor-pointer"
                          >
                            ফিরিয়ে আনুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OTP Display Modal */}
      {otpModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-700/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-scale-up text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-600 mx-auto flex items-center justify-center text-indigo-400">
              <KeyRound className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">ইমেইল OTP পাঠানো হয়েছে</h4>
              <p className="text-xs text-slate-400 mt-1">
                উপজেলা: <strong>{otpModalData.upazilaCode}</strong> • {otpModalData.email}
              </p>
            </div>

            <div className="py-4 px-6 bg-slate-950 border border-indigo-800/80 rounded-2xl">
              <p className="text-sm text-emerald-300 font-semibold">
                Supabase Auth-এর recovery code ব্যবহারকারীর নিবন্ধিত ইমেইলে পাঠানো হয়েছে। নিরাপত্তার জন্য কোডটি এখানে দেখানো হয় না।
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

      {/* Claim Detail Modal */}
      {selectedClaimDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-400">{selectedClaimDetail.appTitle}</span>
                <h4 className="text-base font-bold text-white">{selectedClaimDetail.trackingNo}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClaimDetail(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">কর্মচারীর নাম:</span>
                <span className="font-bold text-white">{selectedClaimDetail.employeeName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">পদবী:</span>
                <span>{selectedClaimDetail.designation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">জিপিএফ হিসাব নং:</span>
                <span className="font-mono text-indigo-300">{selectedClaimDetail.gpfAccNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">দাবীকৃত টাকার পরিমাণ:</span>
                <span className="font-bold font-mono text-emerald-400">
                  ৳{moneyCompact(selectedClaimDetail.amount)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">উপজেলা ও জেলা:</span>
                <span>{selectedClaimDetail.upazilaNameBn}, {selectedClaimDetail.districtNameBn}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">আবেদনের তারিখ:</span>
                <span>{date(selectedClaimDetail.applyDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">স্ট্যাটাস:</span>
                <span className="text-emerald-400 font-bold">{selectedClaimDetail.status}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedClaimDetail(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer mt-2"
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
