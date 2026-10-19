import React, { useState, useEffect } from 'react';
import { LABELS } from '../app-shared/ui/tokens';
import { GpfDeathClaim, LockSettings, LockableField } from './types/gpf';
import { INITIAL_CLAIMS, INITIAL_LOCKS } from './utils/initialData';
import { PlusCircle } from 'lucide-react';
import { SubAppFooter, SubAppHeader } from '../app-shared/ui/SubAppChrome';
import { Toast, useToast } from '../app-shared/ui/Toast';
import { DeathClaimForm } from './components/DeathClaimForm';
import { ClaimsDataTable } from './components/ClaimsDataTable';
import { PrintDocumentEngine } from './components/PrintDocumentEngine';
import { readScoped, writeScoped } from '../src/lib/scopedStorage';
import type { SubAppProps } from '../app-shared/bootstrap';
import { syncClaimToCentral } from '../app-shared/centralClaimSync';
import { toBn } from '../src/lib/format';

// Base keys; every read/write is scoped to the signed-in upazila so two upazilas
// sharing one browser never see or overwrite each other's death-claim records.
const BASE_KEY_CLAIMS = 'gpf_death_claims_data_v3';
const BASE_KEY_LOCKS = 'gpf_death_locks_data_v3';

// Locks that always stay on: the upazila and district come from the session and
// must never be edited inside a claim.
const ALWAYS_LOCKED: Pick<LockSettings, 'upazilaName' | 'districtName'> = {
  upazilaName: true,
  districtName: true,
};

export default function App({ currentUser, onBack }: SubAppProps) {
  const upazilaCode = currentUser.upazila_code;

  // Claims state with localStorage persistence (scoped per upazila)
  const [claims, setClaims] = useState<GpfDeathClaim[]>(() => {
    try {
      const saved = readScoped(upazilaCode, BASE_KEY_CLAIMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_CLAIMS;
  });

  // Lock settings with localStorage persistence (scoped per upazila)
  const [lockSettings, setLockSettings] = useState<LockSettings>(() => {
    let stored = INITIAL_LOCKS;
    try {
      const saved = readScoped(upazilaCode, BASE_KEY_LOCKS);
      if (saved) stored = JSON.parse(saved);
    } catch {
      // fallback
    }
    return { ...stored, ...ALWAYS_LOCKED };
  });

  // Current claim being edited or filled
  const [currentClaim, setCurrentClaim] = useState<GpfDeathClaim | null>(() => {
    const seed = INITIAL_CLAIMS[0];
    if (!seed) return null;
    return {
      ...seed,
      upazilaName: currentUser.upazila_name_bn || seed.upazilaName,
      districtName: currentUser.district_name_bn || seed.districtName,
    };
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Target claim for print engine
  const [printTargetClaim, setPrintTargetClaim] = useState<GpfDeathClaim | null>(() => {
    const seed = INITIAL_CLAIMS[0];
    if (!seed) return null;
    return {
      ...seed,
      upazilaName: currentUser.upazila_name_bn || seed.upazilaName,
      districtName: currentUser.district_name_bn || seed.districtName,
    };
  });

  // Notification toast
  const { toast, showToast } = useToast();


  // Sync claims to localStorage (upazila-scoped)
  useEffect(() => {
    writeScoped(upazilaCode, BASE_KEY_CLAIMS, JSON.stringify(claims));
  }, [claims, upazilaCode]);

  // Sync lock settings to localStorage (upazila-scoped)
  useEffect(() => {
    writeScoped(upazilaCode, BASE_KEY_LOCKS, JSON.stringify(lockSettings));
  }, [lockSettings, upazilaCode]);

  const handleToggleLock = (field: LockableField) => {
    if (field === 'upazilaName' || field === 'districtName') {
      showToast(LABELS.fixedFieldToast, 'info');
      return;
    }
    setLockSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Save Claim Handler
  // - When editing an existing record (isEditing && the loaded claim has an id)
  //   the matching row is updated in place.
  // - Otherwise the entry is treated as brand new and pushed to the top of the
  //   list, so typing data and pressing save WITHOUT the "নতুন এন্ট্রি" button
  //   still increments the saved-claim counter.
  // Save Claim Handler
  // - If forceNew === true, OR if the employee name or GPF account number differs
  //   from currentClaim, treat as a brand new record (নতুন এন্ট্রি বাটন ছাড়াই নতুন
  //   ডাটা হিসেবে কাউন্ট).
  // - Otherwise if isEditing && currentClaim?.id matches, update in place.
  const handleSaveClaim = (
    claimData: Omit<GpfDeathClaim, 'id' | 'serialNo' | 'createdAt' | 'updatedAt'>,
    forceNew: boolean = false,
  ) => {
    const isSamePerson =
      currentClaim &&
      claimData.deceasedEmployeeName.trim() === (currentClaim.deceasedEmployeeName || '').trim() &&
      claimData.gpfAccountNo.trim() === (currentClaim.gpfAccountNo || '').trim();

    const editingExisting = !forceNew && isEditing && !!currentClaim?.id && isSamePerson;

    if (editingExisting && currentClaim) {
      const updatedList = claims.map((c) =>
        c.id === currentClaim.id
          ? {
            ...claimData,
            id: currentClaim.id,
            serialNo: currentClaim.serialNo,
            createdAt: currentClaim.createdAt,
            updatedAt: new Date().toISOString(),
          }
          : c,
      );
      setClaims(updatedList);
      setIsEditing(false);
      const updatedClaim: GpfDeathClaim = {
        ...claimData,
        id: currentClaim.id,
        serialNo: currentClaim.serialNo,
        createdAt: currentClaim.createdAt,
        updatedAt: new Date().toISOString(),
      };
      setCurrentClaim(updatedClaim);
      setPrintTargetClaim(updatedClaim);
      showToast(`"${claimData.deceasedEmployeeName}" এর ডেথ ক্লেইম তথ্য সফলভাবে আপডেট করা হয়েছে।`);
      void syncClaimToCentral('app4', {
        id: updatedClaim.id,
        trackingNo: updatedClaim.id,
        employeeName: updatedClaim.deceasedEmployeeName,
        designation: updatedClaim.deceasedDesignation,
        gpfAccNo: updatedClaim.gpfAccountNo,
        amount: updatedClaim.depositedAmount,
        status: 'যাচাইকৃত',
        applyDate: updatedClaim.applicationDate,
        upazilaCode: currentUser.upazila_code,
        upazilaName: currentUser.upazila_name_bn,
        districtName: currentUser.district_name_bn,
        rawDetails: updatedClaim,
      }).then((synced) => {
        if (!synced) showToast('এই ডিভাইসে সেভ হয়েছে, তবে কেন্দ্রীয় ডেটাবেজে সিঙ্ক হয়নি।');
      });
      return;
    }

    // Brand new record (either clicked new save or entered new employee/GPF without resetting)
    const nextSerial = claims.reduce((max, c) => Math.max(max, c.serialNo || 0), 0) + 1;
    const newClaim: GpfDeathClaim = {
      ...claimData,
      id: `gpf-claim-${Date.now()}`,
      serialNo: nextSerial,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClaims([newClaim, ...claims]);
    setPrintTargetClaim(newClaim);
    showToast(`"${claimData.deceasedEmployeeName}" এর নতুন ডেথ ক্লেইম সফলভাবে সংরক্ষণ করা হয়েছে (ক্রমিক: ${nextSerial})।`);
    void syncClaimToCentral('app4', {
      id: newClaim.id,
      trackingNo: newClaim.id,
      employeeName: newClaim.deceasedEmployeeName,
      designation: newClaim.deceasedDesignation,
      gpfAccNo: newClaim.gpfAccountNo,
      amount: newClaim.depositedAmount,
      status: 'যাচাইকৃত',
      applyDate: newClaim.applicationDate,
      upazilaCode: currentUser.upazila_code,
      upazilaName: currentUser.upazila_name_bn,
      districtName: currentUser.district_name_bn,
      rawDetails: newClaim,
    }).then((synced) => {
      if (!synced) showToast('এই ডিভাইসে সেভ হয়েছে, তবে কেন্দ্রীয় ডেটাবেজে সিঙ্ক হয়নি।');
    });

    // Keep the locked values for the next entry, but clear the per-applicant ones.
    const nextFormValues: GpfDeathClaim = {
      id: `gpf-claim-${Date.now() + 1}`,
      serialNo: nextSerial + 1,
      year: lockSettings.year ? claimData.year : '২০২৬',
      recipient: lockSettings.recipient ? claimData.recipient : '',
      ddoName: lockSettings.ddoName ? claimData.ddoName : 'নৃপেন্দ্র নাথ সরকার',
      ddoDesignation: lockSettings.ddoDesignation ? claimData.ddoDesignation : 'উপজেলা প্রাথমিক শিক্ষা অফিসার (চ:দা:)',
      upazilaName: currentUser.upazila_name_bn || (lockSettings.upazilaName ? claimData.upazilaName : 'বিয়ানীবাজার'),
      districtName: currentUser.district_name_bn || (lockSettings.districtName ? claimData.districtName : 'সিলেট'),
      attachmentsCount: lockSettings.attachmentsCount ? claimData.attachmentsCount : '০২(দুই) খানা',
      applicationDate: claimData.applicationDate || '১৬/০৩/২০২৬',
      deceasedEmployeeName: '',
      deceasedDesignation: 'প্রাক্তন সহকারী শিক্ষক',
      schoolName: '',
      deathDate: '',
      applicantName: '',
      relationship: 'স্ত্রী',
      gpfAccountNo: '',
      depositedAmount: 0,
      depositedAmountInWords: '',
      sanctionMemoNo: '',
      sanctionDate: '',
      forwardingMemoNo: `উশিঅ/বিবা/সিল/${claimData.year || '২০২৬'}/`,
      forwardingDate: claimData.applicationDate || '১৬/০৩/২০২৬',
      lastDeductionAmount: 0,
      lastVoucherNo: '',
      treasuryOffice: claimData.treasuryOffice || `উপজেলা হিসাবরক্ষণ অফিস, ${currentUser.upazila_name_bn || 'বিয়ানীবাজার'}, ${currentUser.district_name_bn || 'সিলেট'}`,
      status: 'খসড়া',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentClaim(nextFormValues);
    setIsEditing(false);
  };

  // Reset form handler
  const handleResetForm = () => {
    const nextSerial = claims.reduce((max, c) => Math.max(max, c.serialNo || 0), 0) + 1;
    const lockedReset: GpfDeathClaim = {
      id: `gpf-claim-${Date.now()}`,
      serialNo: nextSerial,
      year: lockSettings.year ? currentClaim?.year || '২০২৬' : '২০২৬',
      recipient: lockSettings.recipient ? currentClaim?.recipient || '' : '',
      ddoName: lockSettings.ddoName ? currentClaim?.ddoName || 'নৃপেন্দ্র নাথ সরকার' : 'নৃপেন্দ্র নাথ সরকার',
      ddoDesignation: lockSettings.ddoDesignation
        ? currentClaim?.ddoDesignation || 'উপজেলা প্রাথমিক শিক্ষা অফিসার (চ:দা:)'
        : 'উপজেলা প্রাথমিক শিক্ষা অফিসার (চ:দা:)',
      upazilaName: currentUser.upazila_name_bn || currentClaim?.upazilaName || 'বিয়ানীবাজার',
      districtName: currentUser.district_name_bn || currentClaim?.districtName || 'সিলেট',
      attachmentsCount: lockSettings.attachmentsCount
        ? currentClaim?.attachmentsCount || '০২(দুই) খানা'
        : '০২(দুই) খানা',
      applicationDate: '১৬/০৩/২০২৬',
      deceasedEmployeeName: '',
      deceasedDesignation: 'প্রাক্তন সহকারী শিক্ষক',
      schoolName: '',
      deathDate: '',
      applicantName: '',
      relationship: 'স্ত্রী',
      gpfAccountNo: '',
      depositedAmount: 0,
      depositedAmountInWords: '',
      sanctionMemoNo: '',
      sanctionDate: '',
      forwardingMemoNo: `উশিঅ/বিবা/সিল/${currentClaim?.year || '২০২৬'}/`,
      forwardingDate: '১৬/০৩/২০২৬',
      lastDeductionAmount: 0,
      lastVoucherNo: '',
      treasuryOffice: `উপজেলা হিসাবরক্ষণ অফিস, ${currentUser.upazila_name_bn || 'বিয়ানীবাজার'}, ${currentUser.district_name_bn || 'সিলেট'}`,
      status: 'খসড়া',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentClaim(lockedReset);
    setIsEditing(false);
    showToast('নতুন ক্লেইম ফর্ম প্রস্তুত করা হয়েছে।');
  };

  const handleNewEntry = () => {
    handleResetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditClaim = (claim: GpfDeathClaim) => {
    setCurrentClaim(claim);
    setIsEditing(true);
    setPrintTargetClaim(claim);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`"${claim.deceasedEmployeeName}" এর ফাইল লোড হয়েছে।`);
  };

  const handleDeleteClaim = (id: string) => {
    setClaims(claims.filter((c) => c.id !== id));
    showToast('ক্লেইম রেকর্ডটি মুছে ফেলা হয়েছে।');
  };

  const handleImportClaims = (importedClaims: GpfDeathClaim[]) => {
    const existingIds = new Set(claims.map((c) => c.id));
    const newItems = importedClaims.filter((c) => !existingIds.has(c.id));
    let runningMax = claims.reduce((max, c) => Math.max(max, c.serialNo || 0), 0);
    // Re-number the imported rows so two upazila exports never collide.
    const renumbered = newItems.map((c) => {
      runningMax += 1;
      return { ...c, serialNo: runningMax };
    });
    const merged = [...renumbered, ...claims];
    setClaims(merged);
    showToast(`${toBn(renumbered.length)}টি ক্লেইম ফাইল সফলভাবে ইমপোর্ট করা হয়েছে।`);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col print:block print:min-h-0 print:h-auto print:bg-white print:text-black print:p-0 print:m-0">
      <SubAppHeader
        appNumber={4}
        title="জিপিএফ চূড়ান্ত উত্তোলন ফাইল প্রসেসিং (ডেথ ক্লেইম)"
        onBack={onBack}
        currentUser={currentUser}
        savedCount={claims.length}
        savedCountUnit="টি ফাইল সংরক্ষিত"
        actions={
          <button
            onClick={handleNewEntry}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-900/40 transition-colors border border-emerald-500"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>নতুন ক্লেইম ফর্ম</span>
          </button>
        }
      />

      <Toast toast={toast} />
      {/* Main content area. The header is sticky, so no top padding offset is needed. */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6 print:hidden">
        <section id="input-dashboard">
          <DeathClaimForm
            initialData={currentClaim}
            lockSettings={lockSettings}
            onToggleLock={handleToggleLock}
            onSaveClaim={handleSaveClaim}
            onReset={handleResetForm}
            isEditing={isEditing}
            onShowToast={showToast}
          />
        </section>

        <section id="claims-table">
          <ClaimsDataTable
            claims={claims}
            onEditClaim={handleEditClaim}
            onDeleteClaim={handleDeleteClaim}
            onNewClaim={handleNewEntry}
            onShowToast={showToast}
            onImportClaims={handleImportClaims}
            onSetPrintTarget={setPrintTargetClaim}
          />
        </section>
      </main>

      {/* Print Document Engine */}
      <PrintDocumentEngine claim={printTargetClaim} />

      <SubAppFooter appNumber={4} appShortName="ডেথ ক্লেইম চূড়ান্ত উত্তোলন" currentUser={currentUser} />

    </div>
  );
}
