import React, { useState, useEffect } from 'react';
import { GpfDeathClaim, LockSettings, LockableField } from './types/gpf';
import { INITIAL_CLAIMS, INITIAL_LOCKS } from './utils/initialData';
import { Header } from './components/Header';
import { DeathClaimForm } from './components/DeathClaimForm';
import { ClaimsDataTable } from './components/ClaimsDataTable';
import { PrintDocumentEngine } from './components/PrintDocumentEngine';
import { readScoped, writeScoped } from '../src/lib/scopedStorage';
import type { SubAppProps } from '../app-shared/bootstrap';

// Base keys; every read/write is scoped to the signed-in upazila so two upazilas
// sharing one browser never see or overwrite each other's death-claim records.
const BASE_KEY_CLAIMS = 'gpf_death_claims_data_v3';
const BASE_KEY_LOCKS = 'gpf_death_locks_data_v3';

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
    return { ...stored, upazilaName: true, districtName: true };
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
  const handleSaveClaim = (claimData: Omit<GpfDeathClaim, 'id' | 'serialNo' | 'createdAt' | 'updatedAt'>) => {
    if (isEditing && currentClaim) {
      const updatedList = claims.map((c) =>
        c.id === currentClaim.id
          ? {
              ...claimData,
              id: currentClaim.id,
              serialNo: currentClaim.serialNo,
              createdAt: currentClaim.createdAt,
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      setClaims(updatedList);
      showToast(`"${claimData.deceasedEmployeeName}" এর ডেথ ক্লেইম তথ্য সফলভাবে আপডেট করা হয়েছে।`);
    } else {
      const newClaim: GpfDeathClaim = {
        ...claimData,
        id: `gpf-claim-${Date.now()}`,
        serialNo: claims.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setClaims([newClaim, ...claims]);
      showToast(`"${claimData.deceasedEmployeeName}" এর নতুন ডেথ ক্লেইম সফলভাবে সংরক্ষণ করা হয়েছে।`);

      const nextFormValues: Partial<GpfDeathClaim> = {
        year: lockSettings.year ? claimData.year : '2026',
        recipient: lockSettings.recipient ? claimData.recipient : '',
        ddoName: lockSettings.ddoName ? claimData.ddoName : '',
        ddoDesignation: lockSettings.ddoDesignation ? claimData.ddoDesignation : '',
        upazilaName: lockSettings.upazilaName ? claimData.upazilaName : '',
        districtName: lockSettings.districtName ? claimData.districtName : '',
        attachmentsCount: lockSettings.attachmentsCount ? claimData.attachmentsCount : '02(দুই) খানা',
        applicationDate: claimData.applicationDate,
        deceasedEmployeeName: '',
        deceasedDesignation: 'প্রাক্তন সহকারী শিক্ষক',
        schoolName: '',
        deathDate: '',
        applicantName: '',
        relationship: 'স্ত্রী',
        gpfAccountNo: '',
        depositedAmount: 0,
        depositedAmountInWords: '',
        status: 'খসড়া',
      };
      setCurrentClaim(nextFormValues as GpfDeathClaim);
      setIsEditing(false);
    }
  };

  // Reset form handler
  const handleResetForm = () => {
    const lockedReset: Partial<GpfDeathClaim> = {
      year: lockSettings.year ? currentClaim?.year || '2026' : '2026',
      recipient: lockSettings.recipient ? currentClaim?.recipient || '' : '',
      ddoName: lockSettings.ddoName ? currentClaim?.ddoName || 'নৃপেন্দ্র নাথ সরকার' : '',
      ddoDesignation: lockSettings.ddoDesignation ? currentClaim?.ddoDesignation || 'উপজেলা প্রাথমিক শিক্ষা অফিসার (চ:দা:)' : '',
      upazilaName: currentUser.upazila_name_bn || currentClaim?.upazilaName || 'বিয়ানীবাজার',
      districtName: currentUser.district_name_bn || currentClaim?.districtName || 'সিলেট',
      attachmentsCount: lockSettings.attachmentsCount ? currentClaim?.attachmentsCount || '02(দুই) খানা' : '02(দুই) খানা',
      applicationDate: '16/03/2026',
      deceasedEmployeeName: '',
      deceasedDesignation: 'প্রাক্তন সহকারী শিক্ষক',
      schoolName: '',
      deathDate: '',
      applicantName: '',
      relationship: 'স্ত্রী',
      gpfAccountNo: '',
      depositedAmount: 0,
      depositedAmountInWords: '',
      status: 'খসড়া',
    };
    setCurrentClaim(lockedReset as GpfDeathClaim);
    setIsEditing(false);
    showToast('ফর্ম রিসেট করা হয়েছে।');
  };

  const handleNewEntry = () => {
    handleResetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditClaim = (claim: GpfDeathClaim) => {
    setCurrentClaim(claim);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`"${claim.deceasedEmployeeName}" এর ফাইল লোড হয়েছে।`);
  };

  const handleDeleteClaim = (id: string) => {
    setClaims(claims.filter((c) => c.id !== id));
    showToast('ক্লেইম রেকর্ডটি মুছে ফেলা হয়েছে।');
  };

  const handleImportClaims = (importedClaims: GpfDeathClaim[]) => {
    const existingIds = new Set(claims.map((c) => c.id));
    const newItems = importedClaims.filter((c) => !existingIds.has(c.id));
    const merged = [...newItems, ...claims];
    setClaims(merged);
    showToast(`${newItems.length}টি ক্লেইম ফাইল সফলভাবে ইমপোর্ট করা হয়েছে।`);
  };

  return (
    /* এখানে print:block এবং print:min-h-0 যুক্ত করায় ফায়ারফক্সে আর ১৪ পাতা হবে না */
    <div className="min-h-screen bg-[
                    #0b1120] text-slate-100 flex flex-col font-['Hind_Siliguri',sans-serif] print:block print:min-h-0 print:h-auto print:bg-white print:text-black print:p-0 print:m-0">
      {/* App Header (Screen only) */}
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

      {/* Main Content Area (Screen only) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 print:hidden">
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
          />
        </section>
      </main>

      {/* Print Document Engine */}
      <PrintDocumentEngine claim={printTargetClaim} />

      {/* Footer (Screen only) */}
      <footer className="border-t border-slate-800/80 bg-[
                    #0a0f1d] py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-medium text-slate-400">
            জিপিএফ চূড়ান্ত উত্তোলন ফাইল প্রসেসিং সিস্টেম (ডেথ ক্লেইম ড্যাশবোর্ড)
          </p>
          <p>
            উপজেলা শিক্ষা অফিসারের কার্যালয়, {currentUser.upazila_name_bn}, {currentUser.district_name_bn} · প্রাথমিক শিক্ষা অধিদপ্তর (ডিপিই)
          </p>
        </div>
      </footer>
    </div>
  );
}
