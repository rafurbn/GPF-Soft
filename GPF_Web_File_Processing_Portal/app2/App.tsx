import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { UserSession, GpfApplication, GpfNonRefundableFormData, NonRefundableLockableKey, NonRefundableLockedState, NonRefundableLockedValues } from '../src/types';
import { FormTable } from './components/FormTable';
import { RecordsList } from './components/RecordsList';
import { PreviewModal } from './components/PreviewModal';
import { DocumentTemplate } from './components/DocumentTemplate';
import { DesktopGuideModal } from './components/DesktopGuideModal';
import { getCurrentBengaliDate } from '../src/utils/dateUtils';
import { numberToBanglaWords, cleanNumberString } from '../src/utils/numberToBanglaWords';
import { createPdfFileName } from '../src/utils/pdfDownload';
import { loadUnlimitedRecords, saveUnlimitedRecords } from '../src/lib/unlimitedStore';

const STORAGE_KEY_RECORDS = 'gpf_nonrefundable_records_v2';
const STORAGE_KEY_LOCKED_STATE = 'gpf_nonrefundable_locked_state_v3';
const STORAGE_KEY_LOCKED_VALUES = 'gpf_nonrefundable_locked_values_v3';

const DEFAULT_LOCKED_STATE: NonRefundableLockedState = {
  year: true,
  receiver_info: false,
  ddo_name: false,
  ddo_designation: false,
  upazila_name: true,
  district_name: true,
};

const LOCKABLE_FIELD_LABELS: Record<NonRefundableLockableKey, string> = {
  year: 'সন',
  receiver_info: 'প্রাপক',
  ddo_name: 'আয়ন ব্যয়ন কর্মকর্তার নাম',
  ddo_designation: 'আয়ন ব্যয়ন কর্মকর্তার পদবী',
  upazila_name: 'উপজেলার নাম',
  district_name: 'জেলার নাম',
};

interface GpfNonRefundableAppProps {
  currentUser: UserSession;
  onBack: () => void;
  onSaveApplication: (app: GpfApplication) => void;
}

export const GpfNonRefundableApp: React.FC<GpfNonRefundableAppProps> = ({
  currentUser,
  onBack,
  onSaveApplication,
}) => {
  const defaultInitialData: GpfNonRefundableFormData = {
    id: 'nonref-init-1',
    year: '২০২৬',
    apply_date: '২০/০৯/২০২৬',
    receiver_info: '',
    applicant_name: '',
    designation: 'সহকারী শিক্ষক',
    school_name: 'সরকারি প্রাথমিক বিদ্যালয়',
    date_of_birth: '02/01/1970',
    gpf_acc_no: '',
    gpf_total_balance: '800000',
    requested_amount: '500000',
    gpf_total_balance_words: 'পাঁচ লক্ষ টাকা মাত্র',
    basic_salary: '24220',
    ddo_name: '',
    ddo_designation: '',
    upazila_name: currentUser.upazila_name_bn || 'বিয়ানীবাজার',
    district_name: currentUser.district_name_bn || 'সিলেট',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // 1. Locked State & Values (from localStorage or defaults)
  const [lockedState, setLockedState] = useState<NonRefundableLockedState>(() => {
    let stored = DEFAULT_LOCKED_STATE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCKED_STATE);
      if (saved) stored = JSON.parse(saved);
    } catch {
      stored = DEFAULT_LOCKED_STATE;
    }
    // উপজেলা ও জেলার নাম উপজেলা আইডি খোলার সময়েই স্থায়ীভাবে ফিক্সড হয়ে যায়
    return { ...stored, upazila_name: true, district_name: true };
  });

  const [lockedValues, setLockedValues] = useState<NonRefundableLockedValues>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCKED_VALUES);
      return saved
        ? JSON.parse(saved)
        : {
            year: '২০২৬',
            receiver_info: '',
            ddo_name: '',
            ddo_designation: '',
            upazila_name: currentUser.upazila_name_bn || 'বিয়ানীবাজার',
            district_name: currentUser.district_name_bn || 'সিলেট',
          };
    } catch {
      return {};
    }
  });

  // 2. Saved Records
  const [records, setRecords] = useState<GpfNonRefundableFormData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return [defaultInitialData];
    } catch {
      return [defaultInitialData];
    }
  });

  // 3. Current Form Data - always initialized with locked values for locked fields
  const [formData, setFormData] = useState<GpfNonRefundableFormData>(() => {
    let initialYear = defaultInitialData.year;
    let initialReceiver = defaultInitialData.receiver_info;
    let initialDdoName = defaultInitialData.ddo_name;
    let initialDdoDesig = defaultInitialData.ddo_designation;
    let initialUpazila = defaultInitialData.upazila_name;
    let initialDistrict = defaultInitialData.district_name;

    try {
      const savedState = localStorage.getItem(STORAGE_KEY_LOCKED_STATE);
      const stateObj: NonRefundableLockedState = savedState ? JSON.parse(savedState) : DEFAULT_LOCKED_STATE;
      const savedVals = localStorage.getItem(STORAGE_KEY_LOCKED_VALUES);
      const valsObj: NonRefundableLockedValues = savedVals ? JSON.parse(savedVals) : {};

      if (stateObj.year && valsObj.year !== undefined) initialYear = valsObj.year;
      if (stateObj.receiver_info && valsObj.receiver_info !== undefined) initialReceiver = valsObj.receiver_info;
      if (stateObj.ddo_name && valsObj.ddo_name !== undefined) initialDdoName = valsObj.ddo_name;
      if (stateObj.ddo_designation && valsObj.ddo_designation !== undefined) initialDdoDesig = valsObj.ddo_designation;
      if (stateObj.upazila_name && valsObj.upazila_name !== undefined) initialUpazila = valsObj.upazila_name;
      if (stateObj.district_name && valsObj.district_name !== undefined) initialDistrict = valsObj.district_name;
    } catch (e) {
      console.error(e);
    }

    // রেজিস্ট্রেশনে নিশ্চিত করা উপজেলা ও জেলার নামই স্থায়ীভাবে ব্যবহৃত হয়
    initialUpazila = currentUser.upazila_name_bn || initialUpazila;
    initialDistrict = currentUser.district_name_bn || initialDistrict;

    return {
      ...defaultInitialData,
      year: initialYear,
      receiver_info: initialReceiver,
      ddo_name: initialDdoName,
      ddo_designation: initialDdoDesig,
      upazila_name: initialUpazila,
      district_name: initialDistrict,
      apply_date: getCurrentBengaliDate(),
      id: `gpf-nonref-${Date.now()}`,
    };
  });

  // 4. Modals & UI States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [autoDownloadPdf, setAutoDownloadPdf] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [printPageFilter, setPrintPageFilter] = useState<number | 'all'>('all');
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Sync lockedState to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOCKED_STATE, JSON.stringify(lockedState));
    } catch (e) {
      console.error(e);
    }
  }, [lockedState]);

  // Sync lockedValues to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOCKED_VALUES, JSON.stringify(lockedValues));
    } catch (e) {
      console.error(e);
    }
  }, [lockedValues]);

  // Hydrate from the unlimited (IndexedDB) store once the page mounts. The
  // synchronous localStorage read in state init gives instant first paint; this
  // then replaces it with the full, uncapped record set.
  useEffect(() => {
    let active = true;
    void loadUnlimitedRecords<GpfNonRefundableFormData>().then((stored) => {
      if (active && stored && stored.length > 0) setRecords(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  // Sync records to the unlimited (IndexedDB) store + localStorage mirror.
  useEffect(() => {
    void saveUnlimitedRecords(records, STORAGE_KEY_RECORDS).then((result) => {
      if (!result.ok) {
        showToast('সংরক্ষণ করা যায়নি — ব্রাউজার স্টোরেজ পূর্ণ। পুরনো আবেদন মুছে আবার চেষ্টা করুন।');
      }
    });
    // `showToast` is stable for the life of this component; records is the only
    // meaningful trigger here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Field change handler: strictly protects locked fields from being modified
  const handleFieldChange = (field: keyof GpfNonRefundableFormData, value: string) => {
    if (lockedState[field as NonRefundableLockableKey]) {
      showToast(`'${LOCKABLE_FIELD_LABELS[field as NonRefundableLockableKey] || field}' ফিল্ডটি লক করা রয়েছে। পরিবর্তন করতে প্রথমে আনলক করুন।`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle Lock: locks current value permanently into storage, or unlocks to allow modification
  const handleToggleLock = (field: NonRefundableLockableKey) => {
    if (field === 'upazila_name' || field === 'district_name') {
      showToast('উপজেলা ও জেলার নাম স্থায়ীভাবে ফিক্সড করা আছে।');
      return;
    }

    const willBeLocked = !lockedState[field];
    const fieldName = LOCKABLE_FIELD_LABELS[field] || field;

    setLockedState((prev) => {
      const next = { ...prev, [field]: willBeLocked };
      try {
        localStorage.setItem(STORAGE_KEY_LOCKED_STATE, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    if (willBeLocked) {
      // Freeze the current formData value as the locked value permanently
      const currentValue = formData[field] || '';
      setLockedValues((prev) => {
        const next = { ...prev, [field]: currentValue };
        try {
          localStorage.setItem(STORAGE_KEY_LOCKED_VALUES, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
      showToast(`'${fieldName}' স্থায়ীভাবে লক করা হয়েছে। আনলক না করা পর্যন্ত এটি আর কখনও পরিবর্তিত হবে না।`);
    } else {
      showToast(`'${fieldName}' আনলক করা হয়েছে। এখন তথ্য পরিবর্তন করতে পারবেন।`);
    }
  };

  // Reset / New Application - strictly keeps locked fields intact
  const handleReset = () => {
    setIsEditingExisting(false);
    setFormData({
      id: `gpf-nonref-${Date.now()}`,
      year: lockedState.year ? (lockedValues.year || formData.year) : '',
      apply_date: getCurrentBengaliDate(),
      receiver_info: lockedState.receiver_info ? (lockedValues.receiver_info || formData.receiver_info) : '',
      applicant_name: '',
      designation: 'সহকারী শিক্ষক',
      school_name: '',
      date_of_birth: '',
      gpf_acc_no: '',
      gpf_total_balance: '',
      requested_amount: '',
      gpf_total_balance_words: '',
      basic_salary: '',
      ddo_name: lockedState.ddo_name ? (lockedValues.ddo_name || formData.ddo_name) : '',
      ddo_designation: lockedState.ddo_designation ? (lockedValues.ddo_designation || formData.ddo_designation) : '',
      upazila_name: lockedState.upazila_name ? (lockedValues.upazila_name || formData.upazila_name) : currentUser.upazila_name_bn,
      district_name: lockedState.district_name ? (lockedValues.district_name || formData.district_name) : currentUser.district_name_bn,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    showToast('নতুন আবেদন ফরম প্রস্তুত হয়েছে। লক করা তথ্যাদি অক্ষুণ্ণ রয়েছে।');
  };

  // Save Record - ensures locked values are preserved
  const handleSaveRecord = () => {
    if (!formData.applicant_name && !formData.school_name) {
      showToast('দয়া করে অন্তত আবেদনকারীর নাম বা বিদ্যালয় ইনপুট দিন!');
      return;
    }

    let words = formData.gpf_total_balance_words;
    if (!words && formData.requested_amount) {
      words = numberToBanglaWords(formData.requested_amount);
    }

    const updatedData: GpfNonRefundableFormData = {
      ...formData,
      year: lockedState.year && lockedValues.year !== undefined ? lockedValues.year : formData.year,
      receiver_info: lockedState.receiver_info && lockedValues.receiver_info !== undefined ? lockedValues.receiver_info : formData.receiver_info,
      ddo_name: lockedState.ddo_name && lockedValues.ddo_name !== undefined ? lockedValues.ddo_name : formData.ddo_name,
      ddo_designation: lockedState.ddo_designation && lockedValues.ddo_designation !== undefined ? lockedValues.ddo_designation : formData.ddo_designation,
      upazila_name: lockedState.upazila_name && lockedValues.upazila_name !== undefined ? lockedValues.upazila_name : formData.upazila_name,
      district_name: lockedState.district_name && lockedValues.district_name !== undefined ? lockedValues.district_name : formData.district_name,
      gpf_total_balance_words: words,
      updatedAt: Date.now(),
    };

    setRecords((prev) => {
      const existsIndex = prev.findIndex((r) => r.id === updatedData.id);
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = updatedData;
        return next;
      }
      return [updatedData, ...prev];
    });

    setIsEditingExisting(true);
    showToast('আবেদনটি সফলভাবে সংরক্ষিত হয়েছে!');

    // Sync to parent portal application tracking
    const cleanAmount = cleanNumberString(updatedData.requested_amount);
    const parentApp: GpfApplication = {
      id: updatedData.id || `gpf-nonref-${Date.now()}`,
      tracking_no: `GPF-NON-${currentUser.upazila_code}-${Math.floor(100 + Math.random() * 900)}`,
      applicant_name: updatedData.applicant_name,
      designation: updatedData.designation,
      school_name: updatedData.school_name,
      gpf_acc_no: updatedData.gpf_acc_no,
      nid_no: 'N/A',
      amount: cleanAmount,
      status: 'অনুমোদিত',
      apply_date: updatedData.apply_date,
      upazila_code: currentUser.upazila_code,
      gpf_type: 'non_refundable',
      reason: '৫২ বছর বয়স পূর্ণ হওয়া জনিত অফেরতযোগ্য অগ্রিম'
    };
    onSaveApplication(parentApp);
  };

  // Edit existing record - strictly preserves locked fields
  const handleEditRecord = (rec: GpfNonRefundableFormData) => {
    const merged: GpfNonRefundableFormData = {
      ...rec,
      year: lockedState.year ? (lockedValues.year ?? rec.year) : rec.year,
      receiver_info: lockedState.receiver_info ? (lockedValues.receiver_info ?? rec.receiver_info) : rec.receiver_info,
      ddo_name: lockedState.ddo_name ? (lockedValues.ddo_name ?? rec.ddo_name) : rec.ddo_name,
      ddo_designation: lockedState.ddo_designation ? (lockedValues.ddo_designation ?? rec.ddo_designation) : rec.ddo_designation,
      upazila_name: lockedState.upazila_name ? (lockedValues.upazila_name ?? rec.upazila_name) : rec.upazila_name,
      district_name: lockedState.district_name ? (lockedValues.district_name ?? rec.district_name) : rec.district_name,
    };
    setFormData(merged);
    setIsEditingExisting(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`'${rec.applicant_name || 'নির্বাচিত'}' আবেদনটি এডিট মোডে লোড করা হয়েছে (লক করা তথ্য অপরিবর্তিত রাখা হয়েছে)।`);
  };

  // Delete record
  const handleDeleteRecord = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই আবেদনটি তালিকা থেকে মুছে ফেলতে চান?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast('আবেদনটি মুছে ফেলা হয়েছে।');
    }
  };

  // Print Handler
  const handlePrint = (pageFilter: number | 'all' = 'all') => {
    setPrintPageFilter(pageFilter);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDownloadPdfRecord = (record: GpfNonRefundableFormData) => {
    setFormData(record);
    setAutoDownloadPdf(true);
    setIsPreviewOpen(true);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (records.length === 0) {
      showToast('এক্সপোর্ট করার মতো কোনো তথ্য নেই!');
      return;
    }
    const headers = [
      'সন',
      'আবেদনের তারিখ',
      'আবেদনকারীর নাম',
      'পদবী',
      'বিদ্যালয়ের নাম',
      'জন্ম তারিখ',
      'জিপিএফ হিসাব নং',
      'পূর্ববর্তী জমাকৃত টাকা',
      'প্রার্থীত টাকা (অংকে)',
      'প্রার্থীত টাকা (কথায়)',
      'বর্তমান মূল বেতন',
      'আয়ন ব্যয়ন কর্মকর্তা',
      'ডিডিও পদবী',
      'উপজেলা',
      'জেলা',
    ];

    const rows = records.map((r) => [
      `"${r.year || ''}"`,
      `"${r.apply_date || ''}"`,
      `"${r.applicant_name || ''}"`,
      `"${r.designation || ''}"`,
      `"${r.school_name || ''}"`,
      `"${r.date_of_birth || ''}"`,
      `"${r.gpf_acc_no || ''}"`,
      `"${r.gpf_total_balance || ''}"`,
      `"${r.requested_amount || ''}"`,
      `"${r.gpf_total_balance_words || ''}"`,
      `"${r.basic_salary || ''}"`,
      `"${r.ddo_name || ''}"`,
      `"${r.ddo_designation || ''}"`,
      `"${r.upazila_name || ''}"`,
      `"${r.district_name || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `GPF_NonRefundable_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('এক্সেলে ব্যবহার উপযোগী CSV ফাইল ডাউনলোড হয়েছে!');
  };

  return (
    <div className="refundable-app space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce no-print">
          <Check className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Big Attractive Return Button */}
      <div className="sticky top-0 z-40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#091122] via-[#171827] to-[#091122] p-4 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-lg shadow-slate-950/30 backdrop-blur-md no-print">
        <div className="flex items-center gap-3.5">
          {/* Big, Highly Visible & Attractive Back Button */}
          <button
            type="button"
            onClick={onBack}
            className="group flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 hover:from-slate-800 hover:to-emerald-900 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-emerald-500/40 hover:scale-[1.02] active:scale-98 shrink-0"
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
                জিপিএফ অফেরতযোগ্য অগ্রিম উত্তোলন ফাইল প্রসেসিং
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* 16-Row Input Demand Form Table */}
      <FormTable
        formData={formData}
        onChange={handleFieldChange}
        lockedState={lockedState}
        onToggleLock={handleToggleLock}
        onSave={handleSaveRecord}
        onReset={handleReset}
        onPreview={() => setIsPreviewOpen(true)}
        onPrint={() => handlePrint('all')}
        isEditingExisting={isEditingExisting}
      />

      {/* Saved Records Section */}
      <RecordsList
        records={records}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
        onPrintRecord={(rec) => {
          // Print straight from the records list; the preview modal is never opened.
          setFormData(rec);
          requestAnimationFrame(() => {
            window.setTimeout(() => handlePrint('all'), 50);
          });
        }}
        onDownloadPdfRecord={handleDownloadPdfRecord}
        onNewRecord={handleReset}
        onExportCSV={handleExportCSV}
      />

      {/* Interactive 5-Page PDF Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={formData}
        onPrint={(pageFilter) => handlePrint(pageFilter)}
        autoDownload={autoDownloadPdf}
        downloadFileName={createPdfFileName('GPF_NonRefundable', formData.applicant_name || '')}
        onAutoDownloadComplete={() => {
          setAutoDownloadPdf(false);
          setIsPreviewOpen(false);
        }}
      />

      {/* Desktop .exe Packaging Guide Modal */}
      <DesktopGuideModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />

      {/* Hidden Print Container: Only activates during print / PDF generation.
          `print-only` is required because the @media print rule
          `.refundable-app > :not(.print-only) { display: none !important }`
          hides every other child, which is what produced a blank print page. */}
      <div className="print-only hidden print:block bg-white text-black">
        <DocumentTemplate data={formData} pageFilter={printPageFilter} />
      </div>
    </div>
  );
};

// MPA entry: `app2/main.tsx` imports this component as the page root.
export default GpfNonRefundableApp;
