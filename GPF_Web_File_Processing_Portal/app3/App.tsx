import React, { useState, useEffect, useRef } from 'react';
import { 
  UserSession, 
  GpfApplication, 
  GpfFinalFormData, 
  FinalLockableFieldKey, 
  FinalFieldLocks, 
  FinalSavedApplicationRecord 
} from '../src/types';
import { DesktopHeader } from './components/DesktopHeader';
import { GpfDashboardTable } from './components/GpfDashboardTable';
import { OfficialPrintPreview } from './components/OfficialPrintPreview';
import { PreviewModal } from './components/PreviewModal';
import { SavedRecordsTable } from './components/SavedRecordsTable';
import { numberToBengaliWords, cleanNumberString, calculatePrlDate } from '../src/utils/bengaliConverter';
import { createPdfFileName } from '../src/utils/pdfDownload';
import { loadUnlimitedRecords, saveUnlimitedRecords } from '../src/lib/unlimitedStore';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_FORM_KEY = 'gpf_final_applet_draft_v3';
const STORAGE_LOCKS_KEY = 'gpf_final_applet_locks_v3';
const STORAGE_RECORDS_KEY = 'gpf_final_applet_records_v2';

const DEFAULT_LOCKS: FinalFieldLocks = {
  yearSession: true,
  recipient: false,
  ddoName: false,
  ddoDesignation: false,
  upazila: true,
  district: true,
};

interface GpfFinalWithdrawalAppProps {
  currentUser: UserSession;
  onBack: () => void;
  onSaveApplication: (app: GpfApplication) => void;
}

export const GpfFinalWithdrawalApp: React.FC<GpfFinalWithdrawalAppProps> = ({
  currentUser,
  onBack,
  onSaveApplication,
}) => {
  const defaultInitialData: GpfFinalFormData = {
    yearSession: '২০২৬',
    applicationDate: '২১/০৯/২০২৬',
    recipient: '',
    applicantName: '',
    designation: 'প্রধান শিক্ষক (অবসরপ্রাপ্ত)',
    schoolName: 'সরকারি প্রাথমিক বিদ্যালয়',
    birthDate: '',
    gpfAccountNo: '',
    totalDepositedAmount: '',
    requestedAmountNumber: '1480000',
    requestedAmountWords: 'চৌদ্দ লক্ষ আশি হাজার টাকা মাত্র',
    basicSalary: '',
    nidNumber: '19659112345000999',
    ddoName: '',
    ddoDesignation: '',
    upazila: currentUser.upazila_name_bn || 'বিয়ানীবাজার',
    district: currentUser.district_name_bn || 'সিলেট',
    prlDate: '',
  };

  const defaultSavedRecords: FinalSavedApplicationRecord[] = [
    {
      ...defaultInitialData,
      id: 'seed-record-final-saleh',
      savedAt: new Date().toISOString(),
    }
  ];

  // Active Draft Form Data
  const [formData, setFormData] = useState<GpfFinalFormData>(() => {
    const saved = localStorage.getItem(STORAGE_FORM_KEY);
    if (saved) {
      try {
        return {
          ...defaultInitialData,
          ...JSON.parse(saved),
          // রেজিস্ট্রেশনে নিশ্চিত করা উপজেলা ও জেলার নামই স্থায়ীভাবে ব্যবহৃত হয়
          upazila: currentUser.upazila_name_bn || defaultInitialData.upazila,
          district: currentUser.district_name_bn || defaultInitialData.district,
        };
      } catch (e) {
        console.error('Error loading saved final form data', e);
      }
    }
    return defaultInitialData;
  });

  // Locks State
  const [locks, setLocks] = useState<FinalFieldLocks>(() => {
    let stored = DEFAULT_LOCKS;
    const saved = localStorage.getItem(STORAGE_LOCKS_KEY);
    if (saved) {
      try {
        stored = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved final locks', e);
      }
    }
    // উপজেলা ও জেলার নাম উপজেলা আইডি খোলার সময়েই স্থায়ীভাবে ফিক্সড হয়ে যায়
    return { ...stored, upazila: true, district: true };
  });

  // Saved Records
  const [savedRecords, setSavedRecords] = useState<FinalSavedApplicationRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_RECORDS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved final records', e);
      }
    }
    return defaultSavedRecords;
  });

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [autoDownloadPdf, setAutoDownloadPdf] = useState(false);
  const [isHtmlEditModalOpen, setIsHtmlEditModalOpen] = useState(false);
  const [activePrintData, setActivePrintData] = useState<GpfFinalFormData>(formData);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);

  const dashboardRef = useRef<HTMLDivElement>(null);

  // Auto-persist active form data
  useEffect(() => {
    localStorage.setItem(STORAGE_FORM_KEY, JSON.stringify(formData));
  }, [formData]);

  // Auto-persist lock states
  useEffect(() => {
    localStorage.setItem(STORAGE_LOCKS_KEY, JSON.stringify(locks));
  }, [locks]);

  // Hydrate from the unlimited (IndexedDB) store once the page mounts, so the
  // full uncapped record set replaces the localStorage first-paint copy.
  useEffect(() => {
    let active = true;
    void loadUnlimitedRecords<FinalSavedApplicationRecord>().then((stored) => {
      if (active && stored && stored.length > 0) setSavedRecords(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  // Auto-persist saved records to the unlimited (IndexedDB) store.
  useEffect(() => {
    void saveUnlimitedRecords(savedRecords, STORAGE_RECORDS_KEY).then((result) => {
      if (!result.ok) {
        alert('সংরক্ষণ করা যায়নি — ব্রাউজার স্টোরেজ পূর্ণ। পুরনো আবেদন মুছে আবার চেষ্টা করুন।');
      }
    });
  }, [savedRecords]);

  // Form field change handler - strictly protects locked fields
  const handleFieldChange = (field: keyof GpfFinalFormData, value: string) => {
    if (locks[field as FinalLockableFieldKey]) {
      return; // Locked data is protected until unlocked!
    }
    if (field === 'birthDate') {
      const autoPrl = calculatePrlDate(value);
      setFormData((prev) => ({
        ...prev,
        birthDate: value,
        prlDate: autoPrl || prev.prlDate || '',
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Lock toggle handler
  const handleToggleLock = (field: FinalLockableFieldKey, lockState: boolean) => {
    if (field === 'upazila' || field === 'district') {
      return; // উপজেলা ও জেলার নাম স্থায়ীভাবে ফিক্সড
    }
    setLocks((prev) => {
      const updatedLocks = {
        ...prev,
        [field]: lockState,
      };
      localStorage.setItem(STORAGE_LOCKS_KEY, JSON.stringify(updatedLocks));
      return updatedLocks;
    });
  };

  // Re-generate Bengali words for requested amount
  const handleAutoGenerateWords = () => {
    if (formData.requestedAmountNumber) {
      const words = numberToBengaliWords(formData.requestedAmountNumber);
      if (words) {
        handleFieldChange('requestedAmountWords', words);
      }
    }
  };

  // New Application: Strictly keeps all locked fields until unlocked
  const handleNewApplication = () => {
    setFormData((prev) => ({
      ...prev,
      id: undefined,
      applicantName: '',
      designation: 'প্রধান শিক্ষক (অবসরপ্রাপ্ত)',
      schoolName: 'সরকারি প্রাথমিক বিদ্যালয়',
      birthDate: '',
      prlDate: '',
      gpfAccountNo: '',
      totalDepositedAmount: '',
      requestedAmountNumber: '',
      requestedAmountWords: '',
      basicSalary: '',
      nidNumber: '',
      // Strictly retain locked fields as long as they remain locked
      yearSession: locks.yearSession ? prev.yearSession : defaultInitialData.yearSession,
      recipient: locks.recipient ? prev.recipient : defaultInitialData.recipient,
      ddoName: locks.ddoName ? prev.ddoName : defaultInitialData.ddoName,
      ddoDesignation: locks.ddoDesignation ? prev.ddoDesignation : defaultInitialData.ddoDesignation,
      upazila: locks.upazila ? prev.upazila : defaultInitialData.upazila,
      district: locks.district ? prev.district : defaultInitialData.district,
      applicationDate: prev.applicationDate || defaultInitialData.applicationDate,
    }));

    dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save current application to records list
  const handleSaveRecord = () => {
    if (!formData.applicantName && !formData.gpfAccountNo) {
      alert('অনুগ্রহ করে আবেদনকারীর নাম অথবা জিপিএফ হিসাব নম্বর পূরণ করুন।');
      return;
    }

    let words = formData.requestedAmountWords;
    if (!words && formData.requestedAmountNumber) {
      words = numberToBengaliWords(formData.requestedAmountNumber);
    }

    const recordId = formData.id || Date.now().toString();
    const newRecord: FinalSavedApplicationRecord = {
      ...formData,
      id: recordId,
      requestedAmountWords: words,
      savedAt: new Date().toISOString(),
    };

    setSavedRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === recordId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newRecord;
        return updated;
      }
      return [newRecord, ...prev];
    });

    setFormData((prev) => ({ ...prev, id: recordId, requestedAmountWords: words }));
    setSaveSuccessNotification(true);
    setTimeout(() => setSaveSuccessNotification(false), 2500);

    // Sync to parent portal application tracking
    const cleanAmount = cleanNumberString(formData.requestedAmountNumber);
    const parentApp: GpfApplication = {
      id: `gpf-final-${recordId}`,
      tracking_no: `GPF-FIN-${currentUser.upazila_code}-${Math.floor(100 + Math.random() * 900)}`,
      applicant_name: formData.applicantName || 'নামবিহীন',
      designation: formData.designation || 'শিক্ষক',
      school_name: formData.schoolName || '',
      gpf_acc_no: formData.gpfAccountNo || '',
      nid_no: formData.nidNumber || 'N/A',
      amount: cleanAmount,
      status: 'অনুমোদিত',
      apply_date: formData.applicationDate || '২০২৬-০৯-২৩',
      upazila_code: currentUser.upazila_code,
      gpf_type: 'final',
      reason: 'চাকরি হতে অবসর (PRL) ও চূড়ান্ত নিষ্পত্তিকরণ'
    };
    onSaveApplication(parentApp);
  };

  // Edit record - preserves any currently locked fields
  const handleEditRecord = (rec: FinalSavedApplicationRecord) => {
    setFormData((prev) => {
      const merged: GpfFinalFormData = { ...rec };
      const lockKeys: FinalLockableFieldKey[] = ['yearSession', 'recipient', 'ddoName', 'ddoDesignation', 'upazila', 'district'];
      lockKeys.forEach((key) => {
        if (locks[key]) {
          merged[key] = prev[key]; // Preserve locked data!
        }
      });
      return merged;
    });
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Prints the given data straight through the browser print dialog.
  // A hidden `print-only` container below renders the document, so the preview
  // modal is never opened — one click = one print.
  const printDirectly = (data: GpfFinalFormData) => {
    setActivePrintData(data);
    // Let React commit the print-only container before invoking print().
    requestAnimationFrame(() => {
      window.setTimeout(() => window.print(), 50);
    });
  };

  // Print single record
  const handlePrintRecord = (rec: FinalSavedApplicationRecord) => {
    printDirectly(rec);
  };

  const handleDownloadPdfRecord = (rec: FinalSavedApplicationRecord) => {
    setActivePrintData(rec);
    setAutoDownloadPdf(true);
    setIsPrintModalOpen(true);
  };

  // Print current working draft
  const handlePrintCurrentDraft = () => {
    printDirectly(formData);
  };

  // Open Template HTML Editor
  const handleOpenHtmlEdit = () => {
    setActivePrintData(formData);
    setIsHtmlEditModalOpen(true);
  };

  // Delete record
  const handleDeleteRecord = (id: string) => {
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Navigation matching image.png */}
      <DesktopHeader
        onBack={onBack}
        onNewApplication={handleNewApplication}
        onSave={handleSaveRecord}
        onOpenPrint={handlePrintCurrentDraft}
        onOpenHtmlEdit={handleOpenHtmlEdit}
        savedCount={savedRecords.length}
      />

      {/* Save Success Toast */}
      {saveSuccessNotification && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>আবেদনটি সফলভাবে তালিকায় সংরক্ষণ করা হয়েছে!</span>
        </div>
      )}

      {/* Section 1: Dashboard Table Card */}
      <div ref={dashboardRef} className="w-full">
        <GpfDashboardTable
          formData={formData}
          onChange={handleFieldChange}
          locks={locks}
          onToggleLock={handleToggleLock}
          onAutoGenerateWords={handleAutoGenerateWords}
          onOpenPrintPreview={handlePrintCurrentDraft}
          onNewApplication={handleNewApplication}
          onSaveRecord={handleSaveRecord}
        />
      </div>

      {/* Section 2: Saved Records Table Card */}
      <div id="saved-records-section" className="w-full">
        <SavedRecordsTable
          records={savedRecords}
          onEditRecord={handleEditRecord}
          onPrintRecord={handlePrintRecord}
          onDownloadPdfRecord={handleDownloadPdfRecord}
          onDeleteRecord={handleDeleteRecord}
          onNewApplication={handleNewApplication}
        />
      </div>

      {/* 5-Page Official Print Preview Modal */}
      <PreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={{
          formData: activePrintData,
          applicant_name: activePrintData.applicantName,
          school_name: activePrintData.schoolName,
        }}
        autoDownload={autoDownloadPdf}
        downloadFileName={createPdfFileName('GPF_Final', activePrintData.applicantName || '')}
        onAutoDownloadComplete={() => {
          setAutoDownloadPdf(false);
          setIsPrintModalOpen(false);
        }}
      />

      {/* Template HTML Editor Modal */}
      {isHtmlEditModalOpen && (
        <OfficialPrintPreview
          formData={activePrintData}
          onClose={() => setIsHtmlEditModalOpen(false)}
          initialEditMode={true}
        />
      )}

      {/* Dedicated Print Container for Direct Browser Printing.
          The preview modal and the HTML editor must not reach the printed page,
          so they are hidden via `no-print` in the @media print block. */}
      <div className="print-only hidden print:block bg-white text-black">
        <OfficialPrintPreview formData={activePrintData} embedded />
      </div>
    </div>
  );
};

// MPA entry: `app3/main.tsx` imports this component as the page root.
export default GpfFinalWithdrawalApp;
