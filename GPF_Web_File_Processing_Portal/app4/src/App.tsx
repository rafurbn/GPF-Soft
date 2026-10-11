import React, { useState, useEffect } from 'react';
import { GpfDeathClaim, LockSettings, LockableField } from './types/gpf';
import { INITIAL_CLAIMS, INITIAL_LOCKS } from './utils/initialData';
import { Header } from './components/Header';
import { DeathClaimForm } from './components/DeathClaimForm';
import { ClaimsDataTable } from './components/ClaimsDataTable';
import { PrintDocumentEngine } from './components/PrintDocumentEngine';

export default function App() {
  // Claims state with localStorage persistence
  const [claims, setClaims] = useState<GpfDeathClaim[]>(() => {
    try {
      const saved = localStorage.getItem('gpf_death_claims_data_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CLAIMS;
  });

  // Lock settings with localStorage persistence
  const [lockSettings, setLockSettings] = useState<LockSettings>(() => {
    try {
      const saved = localStorage.getItem('gpf_death_locks_data_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_LOCKS;
  });

  // Current claim being edited or filled
  const [currentClaim, setCurrentClaim] = useState<GpfDeathClaim | null>(INITIAL_CLAIMS[0]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Target claim for print engine
  const [printTargetClaim, setPrintTargetClaim] = useState<GpfDeathClaim | null>(INITIAL_CLAIMS[0]);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gpf_death_claims_data_v3', JSON.stringify(claims));
    } catch {
      // storage error
    }
  }, [claims]);

  useEffect(() => {
    try {
      localStorage.setItem('gpf_death_locks_data_v3', JSON.stringify(lockSettings));
    } catch {
      // storage error
    }
  }, [lockSettings]);

  // Toggle lock handler
  const handleToggleLock = (field: LockableField) => {
    setLockSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Save Claim Handler
  const handleSaveClaim = (claimData: Omit<GpfDeathClaim, 'id' | 'serialNo' | 'createdAt' | 'updatedAt'>) => {
    if (isEditing && currentClaim) {
      // Update existing
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
      // Create new
      const newClaim: GpfDeathClaim = {
        ...claimData,
        id: `gpf-claim-${Date.now()}`,
        serialNo: claims.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setClaims([newClaim, ...claims]);
      showToast(`"${claimData.deceasedEmployeeName}" এর নতুন ডেথ ক্লেইম সফলভাবে সংরক্ষণ করা হয়েছে।`);

      // Prepare form for next entry preserving locked fields
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
      upazilaName: lockSettings.upazilaName ? currentClaim?.upazilaName || 'বিয়ানীবাজার' : '',
      districtName: lockSettings.districtName ? currentClaim?.districtName || 'সিলেট' : '',
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
    showToast('ফর্ম রিসেট করা হয়েছে (লক করা ফিল্ডের মান বজায় রাখা হয়েছে)।');
  };

  // Start new entry
  const handleNewEntry = () => {
    handleResetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Edit claim
  const handleEditClaim = (claim: GpfDeathClaim) => {
    setCurrentClaim(claim);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`"${claim.deceasedEmployeeName}" এর ফাইল সম্পাদনা মোডে লোড হয়েছে।`);
  };

  // Delete claim
  const handleDeleteClaim = (id: string) => {
    setClaims(claims.filter((c) => c.id !== id));
    showToast('ক্লেইম রেকর্ডটি তালিকা থেকে মুছে ফেলা হয়েছে।');
  };

  // Import claims (unlimited save files support)
  const handleImportClaims = (importedClaims: GpfDeathClaim[]) => {
    const existingIds = new Set(claims.map((c) => c.id));
    const newItems = importedClaims.filter((c) => !existingIds.has(c.id));
    const merged = [...newItems, ...claims];
    setClaims(merged);
    showToast(`${newItems.length}টি ক্লেইম ফাইল সফলভাবে ইমপোর্ট করা হয়েছে (মোট ${merged.length}টি)।`);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col font-['Hind_Siliguri',sans-serif]">
      {/* App Header (Screen only) */}
      <Header
        onNewEntry={handleNewEntry}
        claimCount={claims.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-bottom-2 print:hidden">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area (Screen only - Graphical widgets removed as requested) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 print:hidden">
        {/* Death Claim Input Dashboard Form (Zero print button inside form as requested) */}
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

        {/* Saved Claims Data Table Section (Row action has: [Print] [Edit] [Delete] [Download]) */}
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
      <footer className="border-t border-slate-800/80 bg-[#0a0f1d] py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-medium text-slate-400">
            জিপিএফ চূড়ান্ত উত্তোলন ফাইল প্রসেসিং সিস্টেম (ডেথ ক্লেইম ড্যাশবোর্ড)
          </p>
          <p>
            উপজেলা শিক্ষা অফিসারের কার্যালয়, বিয়ানীবাজার, সিলেট · প্রাথমিক শিক্ষা অধিদপ্তর (ডিপিই)
          </p>
        </div>
      </footer>
    </div>
  );
}
