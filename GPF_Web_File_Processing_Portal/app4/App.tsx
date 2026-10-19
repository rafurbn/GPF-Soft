import React, { useState, useEffect } from 'react';
import { GpfDeathClaim, LockSettings, LockableField } from './types/gpf';
import { INITIAL_CLAIMS, INITIAL_LOCKS } from './utils/initialData';
import { Header } from './components/Header';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
      showToast('উপজেলা ও জেলার নাম স্থায়ীভাবে ফিক্সড করা আছে।');
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
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col font-['Hind_Siliguri',sans-serif] print:block print:min-h-0 print:h-auto print:bg-white print:text-black print:p-0 print:m-0">
      {/* App Header (Screen only) - fixed at the top so it never scrolls away */}
      <div className="print:hidden">
        <Header
          onBack={onBack}
          onNewEntry={handleNewEntry}
          claimCount={claims.length}
          upazilaName={currentUser.upazila_name_bn}
          districtName={currentUser.district_name_bn}
        />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-bottom-2 print:hidden">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area (Screen only).
          `pt-28 sm:pt-20` clears the fixed header so nothing hides behind it. */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-28 sm:pt-20 pb-6 space-y-6 print:hidden">
        <section id="input-dashboard">
          <DeathClaimForm
            initialData={currentClaim}
            lockSettings={lockSettings}
            onToggleLock={handleToggleLock}
            onSaveClaim={handleSaveClaim}
            onReset={handleResetForm}
            isEditing={isEditing}
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

      {/* Footer (Screen only) */}
      <footer className="border-t border-slate-800/80 bg-[#0a0f1d] py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-medium text-slate-400">
            জিপিএফ চূড়ান্ত উত্তোলন ফাইল প্রসেসিং সিস্টেম (ডেথ ক্লেইম ড্যাশবোর্ড)
          </p>
          <p>
            উপজেলা শিক্ষা অফিসারের কার্যালয়, {currentUser.upazila_name_bn}, {currentUser.district_name_bn} · প্রাথমিক শিক্ষা অধিদপ্তর (ডিপিই)
          </p>
        </div>
      </footer>
    </div>
  );
}
