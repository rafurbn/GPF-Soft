import React, { useState, useEffect } from 'react';
import { LABELS } from '../app-shared/ui/tokens';
import { Code2, CheckCircle2, AlertCircle, Info, Sparkles, FileText, Layers } from 'lucide-react';
import { UserSession, GpfApplication, GpfFormData, LockedFieldsConfig, LockableFieldKey } from '../src/types';
import {
  DEFAULT_INITIAL_FORM,
  DEFAULT_LOCKED_CONFIG,
  SAMPLE_RECORDS,
  getSavedRecords,
  getLockedConfig,
  saveLockedConfig,
  getLockedValues,
  saveLockedValues,
} from '../src/utils/storage';
import { InputFormTable } from './components/InputFormTable';
import { RecordsTable } from './components/RecordsTable';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { DesktopGuideModal } from './components/DesktopGuideModal';
import { HtmlEditorModal } from './components/HtmlEditorModal';
import { PrintTemplates } from './components/PrintTemplates';
import { toBanglaDigits, cleanNumberString } from '../src/utils/numberToBanglaWords';
import { createPdfFileName } from '../src/utils/pdfDownload';
import { loadUnlimitedRecords, saveUnlimitedRecords } from '../src/lib/unlimitedStore';
import { syncClaimToCentral } from '../app-shared/centralClaimSync';
import { SubAppFooter, SubAppHeader } from '../app-shared/ui/SubAppChrome';
import { Toast, useToast } from '../app-shared/ui/Toast';

// localStorage key that app1 mirrors its records into (see src/utils/storage.ts).
const RECORDS_STORAGE_KEY = 'gpf_advance_saved_records_v2';

interface GpfRefundableAppProps {
  currentUser: UserSession;
  onBack: () => void;
}

export const GpfRefundableApp: React.FC<GpfRefundableAppProps> = ({
  currentUser,
  onBack,
}) => {
  // উপজেলা ও জেলার নাম উপজেলা আইডি খোলার সময়েই স্থায়ীভাবে ফিক্সড হয়ে যায়
  const [lockedConfig, setLockedConfig] = useState<LockedFieldsConfig>(() => ({
    ...getLockedConfig(),
    upazilaName: true,
    districtName: true,
  }));

  const [formData, setFormData] = useState<GpfFormData>(() => {
    const lockedVals = getLockedValues();
    return {
      ...DEFAULT_INITIAL_FORM,
      ...lockedVals,
      upazilaName: currentUser.upazila_name_bn || lockedVals.upazilaName || 'বিয়ানীবাজার',
      districtName: currentUser.district_name_bn || lockedVals.districtName || 'সিলেট',
    };
  });

  const [records, setRecords] = useState<GpfFormData[]>(() => getSavedRecords());

  // Hydrate from the unlimited (IndexedDB) store once the page mounts. The
  // synchronous localStorage read above gives us instant first paint; this then
  // replaces it with the full, uncapped record set.
  useEffect(() => {
    let active = true;
    void loadUnlimitedRecords<GpfFormData>().then((stored) => {
      if (active && stored && stored.length > 0) setRecords(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persists records to IndexedDB (uncapped) and mirrors to localStorage.
  const persistRecords = (next: GpfFormData[]) => {
    void saveUnlimitedRecords(next, RECORDS_STORAGE_KEY).then((result) => {
      if (!result.ok) {
        showToast('সংরক্ষণ করা যায়নি — ব্রাউজার স্টোরেজ পূর্ণ। পুরনো আবেদন মুছে আবার চেষ্টা করুন।', 'error');
      }
    });
  };

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [autoDownloadPdf, setAutoDownloadPdf] = useState(false);
  const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState(false);
  const [previewData, setPreviewData] = useState<GpfFormData>(formData);
  const [isDesktopGuideOpen, setIsDesktopGuideOpen] = useState(false);
  const { toast, showToast } = useToast();

  // Sync locked values to persistent storage
  useEffect(() => {
    const valuesToLock: Partial<GpfFormData> = {};
    if (lockedConfig.year) valuesToLock.year = formData.year;
    if (lockedConfig.receiverInfo) valuesToLock.receiverInfo = formData.receiverInfo;
    if (lockedConfig.ddoName) valuesToLock.ddoName = formData.ddoName;
    if (lockedConfig.ddoDesignation) valuesToLock.ddoDesignation = formData.ddoDesignation;
    if (lockedConfig.upazilaName) valuesToLock.upazilaName = formData.upazilaName;
    if (lockedConfig.districtName) valuesToLock.districtName = formData.districtName;

    saveLockedValues(valuesToLock);
  }, [formData, lockedConfig]);

  // Toggle lock for a specific field
  const toggleLock = (field: LockableFieldKey) => {
    if (field === 'upazilaName' || field === 'districtName') {
      showToast(LABELS.fixedFieldToast, 'info');
      return;
    }

    const nextState = !lockedConfig[field];
    const updated = {
      ...lockedConfig,
      [field]: nextState,
    };
    setLockedConfig(updated);
    saveLockedConfig(updated);

    if (nextState) {
      const currentLocked = getLockedValues();
      const newLocked = { ...currentLocked, [field]: formData[field as keyof GpfFormData] };
      saveLockedValues(newLocked);
    }

    showToast(
      nextState ? `ফিল্ডটি সফলভাবে লক করা হয়েছে (সংরক্ষিত থাকবে)` : `ফিল্ডটি আনলক করা হয়েছে (এখন পরিবর্তনযোগ্য)`,
      'info'
    );
  };

  // Reset unlocked fields for a new clean entry
  const handleResetUnlocked = () => {
    const lockedVals = getLockedValues();
    setFormData((prev) => ({
      ...DEFAULT_INITIAL_FORM,
      id: undefined,
      applicantName: '',
      schoolName: '',
      gpfAccNo: '',
      gpfTotalBalance: '',
      requestedAmount: '',
      requestedAmountWords: '',
      basicSalary: '',
      installmentAmount: '',
      year: lockedConfig.year ? (prev.year || lockedVals.year || DEFAULT_INITIAL_FORM.year) : DEFAULT_INITIAL_FORM.year,
      receiverInfo: lockedConfig.receiverInfo ? (prev.receiverInfo || lockedVals.receiverInfo || DEFAULT_INITIAL_FORM.receiverInfo) : DEFAULT_INITIAL_FORM.receiverInfo,
      ddoName: lockedConfig.ddoName ? (prev.ddoName || lockedVals.ddoName || DEFAULT_INITIAL_FORM.ddoName) : DEFAULT_INITIAL_FORM.ddoName,
      ddoDesignation: lockedConfig.ddoDesignation ? (prev.ddoDesignation || lockedVals.ddoDesignation || DEFAULT_INITIAL_FORM.ddoDesignation) : DEFAULT_INITIAL_FORM.ddoDesignation,
      upazilaName: lockedConfig.upazilaName ? (prev.upazilaName || lockedVals.upazilaName || currentUser.upazila_name_bn) : currentUser.upazila_name_bn,
      districtName: lockedConfig.districtName ? (prev.districtName || lockedVals.districtName || currentUser.district_name_bn) : currentUser.district_name_bn,
      createdAt: new Date().toISOString(),
    }));
    showToast('নতুন এন্ট্রি ফরম প্রস্তুত! লক করা ফিল্ডগুলো অক্ষুণ্ণ রাখা হয়েছে।', 'success');
  };

  // Save record to local records list and sync with parent app
  const handleSaveRecord = () => {
    if (!formData.applicantName.trim()) {
      showToast('অনুগ্রহ করে আবেদনকারীর নাম প্রদান করুন', 'error');
      return;
    }

    const recordToSave: GpfFormData = {
      ...formData,
      id: formData.id || 'rec-' + Date.now().toString(),
      createdAt: formData.createdAt || new Date().toISOString(),
    };

    let updatedRecords: GpfFormData[];
    const existingIndex = records.findIndex((r) => r.id === recordToSave.id);

    if (existingIndex >= 0) {
      updatedRecords = [...records];
      updatedRecords[existingIndex] = recordToSave;
      showToast('আবেদনটি সফলভাবে আপডেট করা হয়েছে', 'success');
    } else {
      updatedRecords = [recordToSave, ...records];
      showToast('নতুন আবেদনটি সফলভাবে তালিকায় যুক্ত ও সেভ হয়েছে', 'success');
    }

    setRecords(updatedRecords);
    persistRecords(updatedRecords);
    setFormData(recordToSave);

    // Sync to portal session applications
    const cleanAmount = cleanNumberString(recordToSave.requestedAmount);
    const count = cleanNumberString(recordToSave.installmentCount) || 24;
    const parentApp: GpfApplication = {
      id: recordToSave.id || `gpf-ref-${Date.now()}`,
      tracking_no: `GPF-REF-${currentUser.upazila_code}-${Math.floor(100 + Math.random() * 900)}`,
      applicant_name: recordToSave.applicantName,
      designation: recordToSave.designation,
      school_name: recordToSave.schoolName,
      gpf_acc_no: recordToSave.gpfAccNo,
      nid_no: 'N/A',
      amount: cleanAmount,
      installment_count: count,
      monthly_deduction: Math.ceil(cleanAmount / count),
      status: 'অনুমোদিত',
      apply_date: recordToSave.applyDate,
      upazila_code: currentUser.upazila_code,
      gpf_type: 'refundable',
      reason: recordToSave.purpose || 'গৃহমেরামত'
    };
    void syncClaimToCentral('app1', {
      id: parentApp.id,
      trackingNo: parentApp.tracking_no,
      employeeName: recordToSave.applicantName,
      designation: recordToSave.designation,
      gpfAccNo: recordToSave.gpfAccNo,
      amount: cleanAmount,
      status: parentApp.status,
      applyDate: recordToSave.applyDate,
      upazilaCode: currentUser.upazila_code,
      upazilaName: currentUser.upazila_name_bn,
      districtName: currentUser.district_name_bn,
      rawDetails: recordToSave,
    }).then((synced) => {
      if (!synced) showToast('আবেদনটি এই ডিভাইসে সেভ হয়েছে, তবে কেন্দ্রীয় ডেটাবেজে সিঙ্ক হয়নি।', 'info');
    });
  };

  const handleSelectRecordToEdit = (record: GpfFormData) => {
    const lockedVals = getLockedValues();
    const mergedRecord: GpfFormData = {
      ...record,
      year: lockedConfig.year ? (formData.year || lockedVals.year || record.year) : record.year,
      receiverInfo: lockedConfig.receiverInfo ? (formData.receiverInfo || lockedVals.receiverInfo || record.receiverInfo) : record.receiverInfo,
      ddoName: lockedConfig.ddoName ? (formData.ddoName || lockedVals.ddoName || record.ddoName) : record.ddoName,
      ddoDesignation: lockedConfig.ddoDesignation ? (formData.ddoDesignation || lockedVals.ddoDesignation || record.ddoDesignation) : record.ddoDesignation,
      upazilaName: lockedConfig.upazilaName ? (formData.upazilaName || lockedVals.upazilaName || record.upazilaName) : record.upazilaName,
      districtName: lockedConfig.districtName ? (formData.districtName || lockedVals.districtName || record.districtName) : record.districtName,
    };

    setFormData(mergedRecord);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`${record.applicantName}-এর তথ্য সম্পাদনার জন্য ফর্মে লোড করা হয়েছে`, 'info');
  };

  // Print handler shared by the form toolbar and the records table.
  // Prints the dedicated `print-only` container directly via the browser print
  // dialog — no preview modal is opened, so one click = one print.
  const handlePrint = (data: GpfFormData) => {
    setPreviewData(data);
    // Let React commit the print-only container before invoking print().
    requestAnimationFrame(() => {
      window.setTimeout(() => window.print(), 50);
    });
  };

  const handleSelectRecordToPrint = (record: GpfFormData) => {
    handlePrint(record);
  };

  const handleDownloadPdfRecord = (record: GpfFormData) => {
    setPreviewData(record);
    setAutoDownloadPdf(true);
    setIsPreviewOpen(true);
  };

  const handleOpenCurrentPreview = () => {
    setPreviewData(formData);
    setIsPreviewOpen(true);
  };

  const handlePrintCurrentForm = () => {
    handlePrint(formData);
  };

  const handleDeleteRecord = (id: string) => {
    // বাটন নিজেই মুছুন/না জিজ্ঞেস করে, তাই এখানে confirm() নেই।
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    persistRecords(updated);
    showToast('আবেদনটি তালিকা থেকে মুছে ফেলা হয়েছে', 'info');
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['ক্র.নং', 'আবেদনকারীর নাম', 'পদবী', 'বিদ্যালয়', 'জিপিএফ হিসাব নং', 'প্রার্থীত অর্থ (টাকা)', 'তারিখ'];
    const rows = records.map((r, i) => [
      i + 1,
      `"${r.applicantName || ''}"`,
      `"${r.designation || ''}"`,
      `"${r.schoolName || ''}"`,
      `"${r.gpfAccNo || ''}"`,
      `"${r.requestedAmount || ''}"`,
      `"${r.applyDate || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GPF_Advance_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    showToast('এক্সেল (CSV) ফাইল সফলভাবে ডাউনলোড হয়েছে', 'success');
  };

  const handleNewRecord = () => {
    handleResetUnlocked();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('নতুন আবেদন এন্ট্রি করার জন্য ফরম প্রস্তুত করা হয়েছে', 'info');
  };

  const handleLoadSampleData = () => {
    setRecords(SAMPLE_RECORDS);
    persistRecords(SAMPLE_RECORDS);
    showToast('নমুনা তথ্য সফলভাবে লোড হয়েছে', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      {/* Toast Notification */}
      <Toast toast={toast} />

      <SubAppHeader
        appNumber={1}
        title="জিপিএফ ফেরতযোগ্য অগ্রিম উত্তোলন ফাইল প্রসেসিং"
        onBack={onBack}
        currentUser={currentUser}
        savedCount={records.length}
        savedCountUnit="টি আবেদন সংরক্ষিত"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6 print:hidden">
        {/* 20-Row Input Demand Form Table */}
        <InputFormTable
          formData={formData}
          setFormData={setFormData}
          lockedConfig={lockedConfig}
          toggleLock={toggleLock}
          onSaveRecord={handleSaveRecord}
          onResetUnlocked={handleResetUnlocked}
          onOpenPreview={handlePrintCurrentForm}
          onOpenHtmlEditor={() => setIsHtmlEditorOpen(true)}
        />

        {/* Saved Applications Records Table matching image.png */}
        <RecordsTable
          records={records}
          onSelectRecordToEdit={handleSelectRecordToEdit}
          onSelectRecordToPrint={handleSelectRecordToPrint}
          onDownloadPdfRecord={handleDownloadPdfRecord}
          onDeleteRecord={handleDeleteRecord}
          onExportCSV={handleExportCSV}
          onNewRecord={handleNewRecord}
          onLoadSampleData={handleLoadSampleData}
        />
      </main>

      <SubAppFooter appNumber={1} appShortName="ফেরতযোগ্য অগ্রিম উত্তোলন" currentUser={currentUser} />

      {/* 4-Page Document Preview & PDF Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={previewData}
        autoDownload={autoDownloadPdf}
        downloadFileName={createPdfFileName('GPF_Refundable', previewData.applicantName || '')}
        onAutoDownloadComplete={() => {
          setAutoDownloadPdf(false);
          setIsPreviewOpen(false);
        }}
      />

      {/* HTML Editor Modal */}
      <HtmlEditorModal
        isOpen={isHtmlEditorOpen}
        onClose={() => setIsHtmlEditorOpen(false)}
        data={formData}
        onSaveHtml={() => {
          showToast('এইচটিএমএল সফলভাবে সেভ করা হয়েছে!', 'success');
        }}
      />

      {/* Desktop .exe Guide Modal */}
      <DesktopGuideModal
        isOpen={isDesktopGuideOpen}
        onClose={() => setIsDesktopGuideOpen(false)}
      />

      {/* Dedicated Print Container for Direct Browser Printing */}
      <div className="print-only hidden print:block bg-white text-black">
        <PrintTemplates data={previewData} pageFilter="all" />
      </div>
    </div>
  );
};

// MPA entry: `app1/main.tsx` imports this component as the page root.
export default GpfRefundableApp;
