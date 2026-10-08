import React, { useEffect, useRef, useState } from 'react';
import { GpfFormData } from '../../src/types';
import { PrintTemplates } from './PrintTemplates';
import { X, Printer, Layers, Eye, CheckCircle2 } from 'lucide-react';
import { downloadElementAsPdf } from '../../src/utils/pdfDownload';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GpfFormData;
  autoDownload?: boolean;
  downloadFileName?: string;
  onAutoDownloadComplete?: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  autoDownload = false,
  downloadFileName = 'GPF_Refundable_Application.pdf',
  onAutoDownloadComplete,
}) => {
  const [activeTab, setActiveTab] = useState<number | 'all'>('all');
  const autoDownloadStarted = useRef(false);

  useEffect(() => {
    if (!isOpen || !autoDownload) {
      autoDownloadStarted.current = false;
      return;
    }
    if (autoDownloadStarted.current) return;

    autoDownloadStarted.current = true;
    window.setTimeout(() => {
      void downloadElementAsPdf('pdf-document', downloadFileName)
        .catch(() => window.alert('PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।'))
        .finally(() => onAutoDownloadComplete?.());
    }, 250);
  }, [autoDownload, downloadFileName, isOpen, onAutoDownloadComplete]);

  if (!isOpen) return null;

  const handlePrint = (tab: number | 'all') => {
    setActiveTab(tab);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // The modal chrome is hidden individually with `no-print`; the wrapper itself
  // must NOT carry `no-print`, or the @media print rule would hide the whole
  // document along with the chrome.
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Bar (hidden on print) */}
        <div className="px-6 py-4 bg-[#0b1329] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                প্রস্তুতকৃত জিপিএফ অগ্রিম উত্তোলন এর ফাইল ফরম্যাট প্রিভিউ
              </h2>
              <p className="text-xs text-slate-400">
                আবেদনকারী:- {data.applicantName || 'মোছাঃ আফিয়া বেগম'},  বিদ্যালয়:- {data.schoolName || 'কুড়ার বাজার সপ্রাবি'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePrint(activeTab)}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-[#059669] hover:bg-[#047857] text-white flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              title="ব্রাউজার প্রিন্ট অথবা PDF আকারে সংরক্ষণ করুন"
            >
              <Printer className="w-4 h-4" />
              <span>
                {activeTab === 'all' ? 'প্রিন্ট / PDF' : `পাতা ${activeTab} প্রিন্ট / PDF`}
              </span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector (hidden on print) */}

        {/* Document Content Viewport — kept visible during print, reset to plain white */}
        <div className="flex-1 overflow-y-auto bg-[#070d19] p-4 sm:p-8 print:overflow-visible print:bg-white print:p-0">
          <div id="pdf-document" className="mx-auto w-full">
            <PrintTemplates data={data} pageFilter={activeTab} />
          </div>
        </div>

        {/* Modal Bottom Helper Bar */}
        <div className="px-6 py-3 bg-[#0b1329] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 no-print">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>প্রিন্ট ডায়ালগে "Save as PDF" নির্বাচন করে সরাসরি পিডিএফ ফাইল হিসেবে সংরক্ষণ করতে পারেন।</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 font-medium rounded-md border border-slate-700 transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
