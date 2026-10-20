import React, { useState, useEffect, useRef } from 'react';
import { 
  UserSession, 
  GpfApplication, 
  GpfFinalFormData, 
  FinalLockableFieldKey, 
  FinalFieldLocks, 
  FinalSavedApplicationRecord 
} from '../src/types';
import { GpfDashboardTable } from './components/GpfDashboardTable';
import { OfficialPrintPreview } from './components/OfficialPrintPreview';
import { PreviewModal } from './components/PreviewModal';
import { SavedRecordsTable } from '../app-shared/ui/SavedRecordsTable';
import { csvFileName, downloadCsv } from '../src/lib/exportCsv';
import { numberToBengaliWords, cleanNumberString, calculatePrlDate } from '../src/utils/bengaliConverter';
import { getCurrentBengaliDate } from '../src/utils/dateUtils';
import { createPdfFileName } from '../src/utils/pdfDownload';
import { loadUnlimitedRecords, saveUnlimitedRecords } from '../src/lib/unlimitedStore';
import { readScoped, writeScoped, scopedKey } from '../src/lib/scopedStorage';
import { syncClaimToCentral } from '../app-shared/centralClaimSync';
import { SubAppFooter, SubAppHeader } from '../app-shared/ui/SubAppChrome';
import { Toast, useToast } from '../app-shared/ui/Toast';

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
}

export const GpfFinalWithdrawalApp: React.FC<GpfFinalWithdrawalAppProps> = ({
  currentUser,
  onBack,
}) => {
  const defaultInitialData: GpfFinalFormData = {
    yearSession: '২০২৬',
    applicationDate: getCurrentBengaliDate(),
    recipient: '',
    applicantName: '',
    designation: 'প্রধান শিক্ষক (অবসরপ্রাপ্ত)',
    schoolName: 'সরকারি প্রাথমিক বিদ্যালয়',
    birthDate: '',
    gpfAccountNo: '',
    totalDepositedAmount: '',
    requestedAmountNumber: '',
    requestedAmountWords: '',
    basicSalary: '',
    nidNumber: '',
    ddoName: '',
    ddoDesignation: '',
    upazila: currentUser.upazila_name_bn || '',
    district: currentUser.district_name_bn || '',
    prlDate: '',
  };

  // Active Draft Form Data
  const [formData, setFormData] = useState<GpfFinalFormData>(() => {
    const saved = readScoped(currentUser.upazila_code, STORAGE_FORM_KEY);
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
    const saved = readScoped(currentUser.upazila_code, STORAGE_LOCKS_KEY);
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
    const saved = readScoped(currentUser.upazila_code, STORAGE_RECORDS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved final records', e);
      }
    }
    return [];
  });

  // IndexedDB scope + localStorage mirror key for this app and upazila.
  const recordsScope = scopedKey(currentUser.upazila_code, STORAGE_RECORDS_KEY);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [autoDownloadPdf, setAutoDownloadPdf] = useState(false);
  const [isHtmlEditModalOpen, setIsHtmlEditModalOpen] = useState(false);
  const [activePrintData, setActivePrintData] = useState<GpfFinalFormData>(formData);

  const { toast, showToast } = useToast();

  const dashboardRef = useRef<HTMLDivElement>(null);

  // Auto-persist active form data
  useEffect(() => {
    writeScoped(currentUser.upazila_code, STORAGE_FORM_KEY, JSON.stringify(formData));
  }, [formData]);

  // Auto-persist lock states
  useEffect(() => {
    writeScoped(currentUser.upazila_code, STORAGE_LOCKS_KEY, JSON.stringify(locks));
  }, [locks]);

  // Hydrate from the unlimited (IndexedDB) store once the page mounts, so the
  // full uncapped record set replaces the localStorage first-paint copy.
  useEffect(() => {
    let active = true;
    void loadUnlimitedRecords<FinalSavedApplicationRecord>(recordsScope).then((stored) => {
      if (active && stored && stored.length > 0) setSavedRecords(stored);
    });
    return () => {
      active = false;
    };
  }, [recordsScope]);

  // Auto-persist saved records to the unlimited (IndexedDB) store.
  useEffect(() => {
    void saveUnlimitedRecords(savedRecords, recordsScope).then((result) => {
      if (!result.ok) {
        showToast('সংরক্ষণ করা যায়নি — ব্রাউজার স্টোরেজ পূর্ণ। পুরনো আবেদন মুছে আবার চেষ্টা করুন।', 'error');
      }
    });
  }, [savedRecords, recordsScope]);

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
      writeScoped(currentUser.upazila_code, STORAGE_LOCKS_KEY, JSON.stringify(updatedLocks));
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
      showToast('অনুগ্রহ করে আবেদনকারীর নাম অথবা জিপিএফ হিসাব নম্বর পূরণ করুন।', 'error');
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
    showToast('আবেদনটি সফলভাবে তালিকায় সংরক্ষণ করা হয়েছে!', 'success');

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
      apply_date: formData.applicationDate || getCurrentBengaliDate(),
      upazila_code: currentUser.upazila_code,
      gpf_type: 'final',
      reason: 'চাকরি হতে অবসর (PRL) ও চূড়ান্ত নিষ্পত্তিকরণ'
    };
    void syncClaimToCentral('app3', {
      id: parentApp.id,
      trackingNo: parentApp.tracking_no,
      employeeName: formData.applicantName || 'নামবিহীন',
      designation: formData.designation || 'শিক্ষক',
      gpfAccNo: formData.gpfAccountNo || '',
      amount: cleanAmount,
      status: parentApp.status,
      applyDate: parentApp.apply_date,
      upazilaCode: currentUser.upazila_code,
      upazilaName: currentUser.upazila_name_bn,
      districtName: currentUser.district_name_bn,
      rawDetails: newRecord,
    }).then((synced) => {
      if (synced) return;
      showToast('আবেদনটি এই ডিভাইসে সেভ হয়েছে, তবে কেন্দ্রীয় ডেটাবেজে সিঙ্ক হয়নি।', 'warning');
    });
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

  const handleExportCSV = () => {
    if (savedRecords.length === 0) return;
    const headers = [
      'ক্র.নং',
      'আবেদনকারীর নাম',
      'পদবী',
      'বিদ্যালয়',
      'জিপিএফ হিসাব নং',
      'সর্বশেষ জমাকৃত টাকা',
      'প্রার্থীত টাকা (অংকে)',
      'প্রার্থীত টাকা (কথায়)',
      'মূল বেতন',
      'এনআইডি',
      'সন',
      'তারিখ',
      'আয়ন ব্যয়ন কর্মকর্তা',
      'উপজেলা',
      'জেলা'
    ];
    const rows = savedRecords.map((r, i) => [
      i + 1,
      r.applicantName || '',
      r.designation || '',
      r.schoolName || '',
      r.gpfAccountNo || '',
      r.totalDepositedAmount || '',
      r.requestedAmountNumber || '',
      r.requestedAmountWords || '',
      r.basicSalary || '',
      r.nidNumber || '',
      r.yearSession || '',
      r.applicationDate || '',
      r.ddoName || '',
      r.upazila || '',
      r.district || ''
    ]);
    downloadCsv(csvFileName('GPF_Final_Records'), headers, rows);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      <Toast toast={toast} />
      <SubAppHeader
        appNumber={3}
        title="জিপিএফ চূড়ান্ত উত্তোলন ফাইল প্রসেসিং"
        onBack={onBack}
        currentUser={currentUser}
        savedCount={savedRecords.length}
        savedCountUnit="টি আবেদন সংরক্ষিত"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6 print:hidden">
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
            onOpenHtmlEditor={handleOpenHtmlEdit}
            onShowToast={showToast}
            onSaveRecord={handleSaveRecord}
          />
        </div>

        {/* Section 2: Saved Records Table Card */}
        <SavedRecordsTable
          records={savedRecords}
          title="সংরক্ষিত জিপিএফ চূড়ান্ত উত্তোলনের তালিকা"
          columns={{
            name: (r) => r.applicantName,
            designation: (r) => r.designation,
            school: (r) => r.schoolName,
            account: (r) => r.gpfAccountNo,
            amount: (r) => r.requestedAmountNumber,
            applicationDate: (r) => r.applicationDate,
            searchable: (r) => [r.applicantName, r.gpfAccountNo, r.schoolName, r.nidNumber, r.upazila, r.district],
            id: (r) => r.id,
          }}
          onEditRecord={handleEditRecord}
          onPrintRecord={handlePrintRecord}
          onDownloadPdfRecord={handleDownloadPdfRecord}
          onDeleteRecord={handleDeleteRecord}
          onNewRecord={handleNewApplication}
          onExportCSV={handleExportCSV}
        />
      </main>

      <SubAppFooter appNumber={3} appShortName="চূড়ান্ত উত্তোলন ও অদাবী" currentUser={currentUser} />


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
        onShowToast={showToast}
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

      {/* Dedicated Print Container for Direct Browser Printing. */}
      <div className="print-only hidden print:block bg-white text-black">
        <OfficialPrintPreview formData={activePrintData} embedded />
      </div>
    </div>
  );
};

// MPA entry: `app3/main.tsx` imports this component as the page root.
export default GpfFinalWithdrawalApp;
