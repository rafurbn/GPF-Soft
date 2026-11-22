import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import type { SubAppProps } from '../app-shared/bootstrap';
import { SubAppFooter, SubAppHeader } from '../app-shared/ui/SubAppChrome';
import { Toast, useToast } from '../app-shared/ui/Toast';
import { LABELS } from '../app-shared/ui/tokens';
import { readScoped, scopedKey, writeScoped } from '../src/lib/scopedStorage';
import { loadUnlimitedRecords, saveUnlimitedRecords } from '../src/lib/unlimitedStore';
import {
  deleteCloudRecord,
  hydrateAndSyncCloudRecords,
  loadCloudLocks,
  saveCloudLocks,
  upsertCloudRecord,
  upsertCloudRecordsBulk,
} from '../src/lib/cloudRecordSync';
import { toBengaliNumber } from './utils/bengaliWords';
import {
  ExBangladeshLeaveApplication,
  LeaveLockSettings,
  LeaveLockableField,
} from './types/leave';
import {
  INITIAL_LEAVE_LOCKS,
  getDefaultLeaveFormValues,
  resolveUserRegion,
} from './utils/leaveInitialData';
import { LeaveForm } from './components/LeaveForm';
import { LeaveDataTable } from './components/LeaveDataTable';
import { LeavePrintEngine } from './components/LeavePrintEngine';

const BASE_KEY_APPS = 'ex_bangladesh_leave_apps_v1';
const BASE_KEY_LOCKS = 'ex_bangladesh_leave_locks_v1';
const BASE_KEY_LOCKED_VALUES = 'ex_bangladesh_leave_locked_values_v1';

type LeaveDraft = Omit<
  ExBangladeshLeaveApplication,
  'id' | 'serialNo' | 'createdAt' | 'updatedAt'
> & { id?: string };

const LOCKABLE_KEYS: LeaveLockableField[] = [
  'designation',
  'schoolName',
  'upazilaName',
  'districtName',
  'divisionName',
  'destinationCountry',
  'leavePurpose',
  'expenseSource',
  'sanctionedPosts',
  'workingTeachers',
  'ddoName',
  'ddoDesignation',
];

function extractLockedValues(
  locks: LeaveLockSettings,
  source?: Partial<ExBangladeshLeaveApplication> | null,
): Partial<ExBangladeshLeaveApplication> {
  if (!source) return {};
  const vals: Partial<ExBangladeshLeaveApplication> = {};
  for (const key of LOCKABLE_KEYS) {
    if (locks[key] && source[key] !== undefined) {
      (vals as Record<string, unknown>)[key] = source[key];
    }
  }
  if (locks.workingTeachers && source.workingTeachersWords !== undefined) {
    vals.workingTeachersWords = source.workingTeachersWords;
  }
  return vals;
}

function buildNewFormDraft(
  locks: LeaveLockSettings,
  currentUser: SubAppProps['currentUser'],
  source?: Partial<ExBangladeshLeaveApplication> | null,
): LeaveDraft {
  const defaults = getDefaultLeaveFormValues(currentUser);
  const region = resolveUserRegion(currentUser);

  return {
    ...defaults,
    designation: locks.designation
      ? source?.designation || defaults.designation
      : defaults.designation,
    schoolName: locks.schoolName ? source?.schoolName || '' : '',
    upazilaName:
      region.upazilaName || (locks.upazilaName ? source?.upazilaName || '' : ''),
    districtName:
      region.districtName || (locks.districtName ? source?.districtName || '' : ''),
    divisionName:
      region.divisionName || (locks.divisionName ? source?.divisionName || '' : ''),
    destinationCountry: locks.destinationCountry
      ? source?.destinationCountry || defaults.destinationCountry
      : '',
    leavePurpose: locks.leavePurpose
      ? source?.leavePurpose || defaults.leavePurpose
      : defaults.leavePurpose,
    expenseSource: locks.expenseSource
      ? source?.expenseSource || defaults.expenseSource
      : '',
    sanctionedPosts: locks.sanctionedPosts ? source?.sanctionedPosts || '' : '',
    workingTeachers: locks.workingTeachers ? source?.workingTeachers || '' : '',
    workingTeachersWords: locks.workingTeachers
      ? source?.workingTeachersWords || ''
      : '',
    ddoName: locks.ddoName ? source?.ddoName || '' : '',
    ddoDesignation: locks.ddoDesignation
      ? source?.ddoDesignation || defaults.ddoDesignation
      : defaults.ddoDesignation,
    status: 'খসড়া',
  };
}

export default function App({ currentUser, onBack }: SubAppProps) {
  const upazilaCode = currentUser.upazila_code;
  const region = resolveUserRegion(currentUser);
  const fixedRegionFields = {
    upazilaName: Boolean(region.upazilaName),
    districtName: Boolean(region.districtName),
    divisionName: Boolean(region.divisionName),
  };

  const appsScope = scopedKey(upazilaCode, BASE_KEY_APPS);

  const [leaveApps, setLeaveApps] = useState<ExBangladeshLeaveApplication[]>(() => {
    try {
      const saved = readScoped(upazilaCode, BASE_KEY_APPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const defaults = getDefaultLeaveFormValues(currentUser);
          return parsed.map((item) => ({
            ...defaults,
            ...item,
            upazilaName: region.upazilaName || item.upazilaName || '',
            districtName: region.districtName || item.districtName || '',
            divisionName: region.divisionName || item.divisionName || '',
            leaveTakenYears: item.leaveTakenYears || '০০',
            leaveTakenMonths: item.leaveTakenMonths || '০০',
            leaveTakenDays: item.leaveTakenDays || '০০',
          }));
        }
      }
    } catch {
      // fallback to empty list
    }
    return [];
  });

  const [leaveLocks, setLeaveLocks] = useState<LeaveLockSettings>(() => {
    let base = INITIAL_LEAVE_LOCKS;
    try {
      const saved = readScoped(upazilaCode, BASE_KEY_LOCKS);
      if (saved) {
        base = { ...INITIAL_LEAVE_LOCKS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return {
      ...base,
      ...(fixedRegionFields.upazilaName ? { upazilaName: true } : {}),
      ...(fixedRegionFields.districtName ? { districtName: true } : {}),
      ...(fixedRegionFields.divisionName ? { divisionName: true } : {}),
    };
  });

  const [currentFormDraft, setCurrentFormDraft] = useState<LeaveDraft>(() => {
    let lockedVals: Partial<ExBangladeshLeaveApplication> | null = null;
    try {
      const savedVals = readScoped(upazilaCode, BASE_KEY_LOCKED_VALUES);
      if (savedVals) lockedVals = JSON.parse(savedVals);
    } catch {
      // ignore
    }
    return buildNewFormDraft(leaveLocks, currentUser, lockedVals || leaveApps[0]);
  });

  const [editingRecord, setEditingRecord] = useState<ExBangladeshLeaveApplication | null>(null);
  const [formVersion, setFormVersion] = useState(1);
  const [printTargetLeaveApp, setPrintTargetLeaveApp] =
    useState<ExBangladeshLeaveApplication | null>(leaveApps[0] || null);
  const { toast, showToast } = useToast();

  // Hydrate from IndexedDB + Supabase Cloud on mount (zero-data-loss across devices)
  useEffect(() => {
    let active = true;
    void (async () => {
      const stored = await loadUnlimitedRecords<ExBangladeshLeaveApplication>(appsScope);
      const defaults = getDefaultLeaveFormValues(currentUser);
      const normalize = (arr: ExBangladeshLeaveApplication[]) =>
        arr.map((item) => ({
          ...defaults,
          ...item,
          upazilaName: region.upazilaName || item.upazilaName || '',
          districtName: region.districtName || item.districtName || '',
          divisionName: region.divisionName || item.divisionName || '',
          leaveTakenYears: item.leaveTakenYears || '০০',
          leaveTakenMonths: item.leaveTakenMonths || '০০',
          leaveTakenDays: item.leaveTakenDays || '০০',
        }));

      const baseLocal = normalize(stored && stored.length > 0 ? stored : leaveApps);
      if (active && stored && stored.length > 0) {
        setLeaveApps(baseLocal);
        setPrintTargetLeaveApp((prev) => prev || baseLocal[0] || null);
      }

      const merged = await hydrateAndSyncCloudRecords<ExBangladeshLeaveApplication>(
        'app6',
        upazilaCode,
        baseLocal,
      );
      if (active && merged) {
        const normalizedMerged = normalize(merged);
        setLeaveApps(normalizedMerged);
        setPrintTargetLeaveApp((prev) => prev || normalizedMerged[0] || null);
      }

      const cloudLocks = await loadCloudLocks('app6', upazilaCode);
      if (active && cloudLocks && Object.keys(cloudLocks.locksData || {}).length > 0) {
        const mergedLocks: LeaveLockSettings = {
          ...leaveLocks,
          ...(cloudLocks.locksData as Partial<LeaveLockSettings>),
          ...(fixedRegionFields.upazilaName ? { upazilaName: true } : {}),
          ...(fixedRegionFields.districtName ? { districtName: true } : {}),
          ...(fixedRegionFields.divisionName ? { divisionName: true } : {}),
        };
        setLeaveLocks(mergedLocks);
        writeScoped(upazilaCode, BASE_KEY_LOCKS, JSON.stringify(mergedLocks));

        const cloudVals = (cloudLocks.valuesData || {}) as Partial<ExBangladeshLeaveApplication>;
        if (Object.keys(cloudVals).length > 0) {
          writeScoped(upazilaCode, BASE_KEY_LOCKED_VALUES, JSON.stringify(cloudVals));
          setCurrentFormDraft((prev) => ({
            ...prev,
            ...(mergedLocks.designation && cloudVals.designation && !prev.designation ? { designation: cloudVals.designation } : {}),
            ...(mergedLocks.schoolName && cloudVals.schoolName && !prev.schoolName ? { schoolName: cloudVals.schoolName } : {}),
            ...(mergedLocks.destinationCountry && cloudVals.destinationCountry ? { destinationCountry: cloudVals.destinationCountry } : {}),
            ...(mergedLocks.leavePurpose && cloudVals.leavePurpose ? { leavePurpose: cloudVals.leavePurpose } : {}),
            ...(mergedLocks.expenseSource && cloudVals.expenseSource ? { expenseSource: cloudVals.expenseSource } : {}),
            ...(mergedLocks.sanctionedPosts && cloudVals.sanctionedPosts && !prev.sanctionedPosts ? { sanctionedPosts: cloudVals.sanctionedPosts } : {}),
            ...(mergedLocks.workingTeachers && cloudVals.workingTeachers && !prev.workingTeachers
              ? {
                  workingTeachers: cloudVals.workingTeachers,
                  workingTeachersWords: cloudVals.workingTeachersWords || prev.workingTeachersWords,
                }
              : {}),
            ...(mergedLocks.ddoName && cloudVals.ddoName && !prev.ddoName ? { ddoName: cloudVals.ddoName } : {}),
            ...(mergedLocks.ddoDesignation && cloudVals.ddoDesignation ? { ddoDesignation: cloudVals.ddoDesignation } : {}),
            upazilaName: region.upazilaName || cloudVals.upazilaName || prev.upazilaName,
            districtName: region.districtName || cloudVals.districtName || prev.districtName,
            divisionName: region.divisionName || cloudVals.divisionName || prev.divisionName,
          }));
          setFormVersion((v) => v + 1);
        }
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appsScope, upazilaCode]);

  // Persist records to IndexedDB + localStorage
  useEffect(() => {
    writeScoped(upazilaCode, BASE_KEY_APPS, JSON.stringify(leaveApps));
    void saveUnlimitedRecords(leaveApps, appsScope);
  }, [leaveApps, upazilaCode, appsScope]);

  // Persist lock settings to localStorage
  useEffect(() => {
    writeScoped(upazilaCode, BASE_KEY_LOCKS, JSON.stringify(leaveLocks));
  }, [leaveLocks, upazilaCode]);

  const handleToggleLeaveLock = (field: LeaveLockableField) => {
    if (
      (field === 'upazilaName' && fixedRegionFields.upazilaName) ||
      (field === 'districtName' && fixedRegionFields.districtName) ||
      (field === 'divisionName' && fixedRegionFields.divisionName)
    ) {
      showToast(LABELS.fixedFieldToast, 'info');
      return;
    }

    setLeaveLocks((prev) => {
      const next = { ...prev, [field]: !prev[field] };
      const vals = extractLockedValues(next, editingRecord || currentFormDraft);
      writeScoped(upazilaCode, BASE_KEY_LOCKED_VALUES, JSON.stringify(vals));
      void saveCloudLocks('app6', upazilaCode, next, vals);
      showToast(
        next[field]
          ? 'ফিল্ডটি লক করা হয়েছে — নতুন ফর্মে স্বয়ংক্রিয়ভাবে থাকবে।'
          : 'ফিল্ডটি আনলক করা হয়েছে।',
        'info',
      );
      return next;
    });
  };

  const handleSaveLeaveApplication = (
    data: Omit<ExBangladeshLeaveApplication, 'id' | 'serialNo' | 'createdAt' | 'updatedAt'>,
  ) => {
    const enforcedData = {
      ...data,
      upazilaName: region.upazilaName || data.upazilaName,
      districtName: region.districtName || data.districtName,
      divisionName: region.divisionName || data.divisionName,
    };

    const lockedVals = extractLockedValues(leaveLocks, enforcedData);
    writeScoped(upazilaCode, BASE_KEY_LOCKED_VALUES, JSON.stringify(lockedVals));
    void saveCloudLocks('app6', upazilaCode, leaveLocks, lockedVals);

    if (editingRecord) {
      const updatedApp: ExBangladeshLeaveApplication = {
        ...enforcedData,
        id: editingRecord.id,
        serialNo: editingRecord.serialNo,
        createdAt: editingRecord.createdAt,
        updatedAt: new Date().toISOString(),
      };
      setLeaveApps((prev) => prev.map((a) => (a.id === editingRecord.id ? updatedApp : a)));
      setPrintTargetLeaveApp(updatedApp);
      setEditingRecord(null);
      setCurrentFormDraft(buildNewFormDraft(leaveLocks, currentUser, updatedApp));
      setFormVersion((v) => v + 1);
      void upsertCloudRecord('app6', upazilaCode, updatedApp);
      showToast(`"${enforcedData.applicantName}" এর বহি:বাংলাদেশ ছুটি ফাইল আপডেট করা হয়েছে।`);
    } else {
      const nextSerial = leaveApps.reduce((max, a) => Math.max(max, a.serialNo || 0), 0) + 1;
      const newApp: ExBangladeshLeaveApplication = {
        ...enforcedData,
        id: `leave-app-${Date.now()}`,
        serialNo: nextSerial,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLeaveApps((prev) => [newApp, ...prev]);
      setPrintTargetLeaveApp(newApp);
      setCurrentFormDraft(buildNewFormDraft(leaveLocks, currentUser, newApp));
      setFormVersion((v) => v + 1);
      void upsertCloudRecord('app6', upazilaCode, newApp);
      showToast(
        `"${enforcedData.applicantName}" এর নতুন ছুটি ফাইল সংরক্ষণ করা হয়েছে (ক্রমিক: ${toBengaliNumber(nextSerial)})।`,
      );
    }
  };

  const handleEditLeaveApplication = (app: ExBangladeshLeaveApplication) => {
    setEditingRecord(app);
    setCurrentFormDraft({
      ...app,
      upazilaName: region.upazilaName || app.upazilaName,
      districtName: region.districtName || app.districtName,
      divisionName: region.divisionName || app.divisionName,
    });
    setFormVersion((v) => v + 1);
    setPrintTargetLeaveApp(app);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`"${app.applicantName}" এর তথ্য সম্পাদনার জন্য লোড হয়েছে।`, 'info');
  };

  const handleDeleteLeaveApplication = (id: string) => {
    setLeaveApps((prev) => prev.filter((a) => a.id !== id));
    void deleteCloudRecord('app6', upazilaCode, id);
    showToast('বহি:বাংলাদেশ ছুটি ফাইলটি তালিকা থেকে মুছে ফেলা হয়েছে।', 'info');
  };

  const handleResetLeaveForm = () => {
    const source = editingRecord || leaveApps[0] || currentFormDraft;
    setEditingRecord(null);
    setCurrentFormDraft(buildNewFormDraft(leaveLocks, currentUser, source));
    setFormVersion((v) => v + 1);
    showToast('নতুন ফরম প্রস্তুত (লক করা তথ্যসমূহ সংরক্ষিত আছে)।', 'info');
  };

  const handleImportLeaveApplications = (imported: ExBangladeshLeaveApplication[]) => {
    const existingIds = new Set(leaveApps.map((a) => a.id));
    const newItems = imported.filter((a) => !existingIds.has(a.id));
    let runningMax = leaveApps.reduce((max, a) => Math.max(max, a.serialNo || 0), 0);
    const renumbered = newItems.map((a) => {
      runningMax += 1;
      return {
        ...a,
        serialNo: runningMax,
        upazilaName: region.upazilaName || a.upazilaName,
        districtName: region.districtName || a.districtName,
        divisionName: region.divisionName || a.divisionName,
      };
    });
    setLeaveApps((prev) => [...renumbered, ...prev]);
    void upsertCloudRecordsBulk('app6', upazilaCode, renumbered);
    showToast(`${toBengaliNumber(renumbered.length)}টি ছুটি ফাইল সফলভাবে ইমপোর্ট করা হয়েছে।`);
  };

  return (
    <div
      className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col print:block print:min-h-0 print:h-auto print:bg-white print:text-black print:p-0 print:m-0"
      style={{ fontFamily: "'SolaimanLipi', 'NikoshBAN', 'Nikosh', 'Siyam Rupali', sans-serif" }}
    >
      <SubAppHeader
        appNumber={6}
        title="বহি:বাংলাদেশ ছুটি ও বিদেশ ভ্রমণ ফাইল প্রসেসিং"
        onBack={onBack}
        currentUser={currentUser}
        savedCount={leaveApps.length}
        savedCountUnit="টি ফাইল সংরক্ষিত"
        actions={
          <button
            type="button"
            onClick={handleResetLeaveForm}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>নতুন আবেদন ফরম</span>
          </button>
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 print:hidden">
        <div id="leave-dashboard">
          <LeaveForm
            initialData={currentFormDraft}
            formVersion={formVersion}
            lockSettings={leaveLocks}
            onToggleLock={handleToggleLeaveLock}
            onSaveApplication={handleSaveLeaveApplication}
            onReset={handleResetLeaveForm}
            isEditing={Boolean(editingRecord)}
            fixedRegionFields={fixedRegionFields}
          />
        </div>

        <div id="leave-table">
          <LeaveDataTable
            applications={leaveApps}
            onEditApplication={handleEditLeaveApplication}
            onDeleteApplication={handleDeleteLeaveApplication}
            onNewApplication={handleResetLeaveForm}
            onSelectPrintApplication={setPrintTargetLeaveApp}
            onShowToast={(msg) => showToast(msg)}
            onImportApplications={handleImportLeaveApplications}
            currentUser={currentUser}
          />
        </div>
      </main>

      <SubAppFooter
        appNumber={6}
        appShortName="বহি:বাংলাদেশ ছুটি ও বিদেশ ভ্রমণ"
        currentUser={currentUser}
      />

      <LeavePrintEngine application={printTargetLeaveApp} />
      <Toast toast={toast} />
    </div>
  );
}
