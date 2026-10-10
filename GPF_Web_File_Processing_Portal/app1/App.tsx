import React, { useState, useEffect } from 'react';
import { ArrowLeft, Code2, CheckCircle2, AlertCircle, Info, Sparkles, FileText, Layers } from 'lucide-react';
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

// localStorage key that app1 mirrors its records into (see src/utils/storage.ts).
const RECORDS_STORAGE_KEY = 'gpf_advance_saved_records_v2';

interface GpfRefundableAppProps {
  currentUser: UserSession;
  onBack: () => void;
  onSaveApplication: (app: GpfApplication) => void;
}

export const GpfRefundableApp: React.FC<GpfRefundableAppProps> = ({
  currentUser,
  onBack,
  onSaveApplication,
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
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

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
      showToast('উপজেলা ও জেলার নাম স্থায়ীভাবে ফিক্সড করা আছে।', 'info');
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
    onSaveApplication(parentApp);
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
    if (confirm('আপনি কি এই আবেদনটি মুছে ফেলতে চান?')) {
      const updated = records.filter((r) => r.id !== id);
      setRecords(updated);
      persistRecords(updated);
      showToast('আবেদনটি তালিকা থেকে মুছে ফেলা হয়েছে', 'info');
    }
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
    <div className="refundable-app space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border text-sm font-semibold transition-all">
          {toastMessage.type === 'success' && (
            <div className="flex items-center space-x-2 text-emerald-300 bg-slate-950/95 border-emerald-500/50 p-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{toastMessage.text}</span>
            </div>
          )}
          {toastMessage.type === 'error' && (
            <div className="flex items-center space-x-2 text-rose-300 bg-slate-950/95 border-rose-500/50 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>{toastMessage.text}</span>
            </div>
          )}
          {toastMessage.type === 'info' && (
            <div className="flex items-center space-x-2 text-sky-300 bg-slate-950/95 border-sky-500/50 p-2 rounded-lg">
              <Info className="w-5 h-5 text-sky-400" />
              <span>{toastMessage.text}</span>
            </div>
          )}
        </div>
      )}

      {/* Top Bar with Big Attractive Return Button */}
      <div className="sticky top-0 z-40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#091122] via-[#0d1b2a] to-[#091122] p-4 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-lg shadow-slate-950/30 backdrop-blur-md no-print">
        <div className="flex items-center gap-3.5">
          {/* Big, Highly Visible & Attractive Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="group flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-900 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-indigo-500/40 hover:scale-[1.02] active:scale-98 shrink-0"
            title="মূল ড্যাশবোর্ড বা ব্যাকপেইজে ফিরে যান"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-200">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] text-emerald-300 font-semibold leading-tight">
                ব্যাকপেইজ
              </span>
              <span className="block text-xs sm:text-[13px] font-bold text-white leading-tight">
                ড্যাশবোর্ডে ফিরুন
              </span>
            </div>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                জিপিএফ ফেরতযোগ্য অগ্রিম উত্তোলন ফাইল প্রসেসিং
              </h2>
            </div>
          </div>
        </div>
      </div>

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
