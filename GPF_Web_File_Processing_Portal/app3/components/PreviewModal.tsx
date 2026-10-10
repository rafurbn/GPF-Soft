import React, { useEffect, useRef } from 'react';
import { 
  Printer, 
  X, 
  Eye
} from 'lucide-react';
// আপনার ফাইল স্ট্রাকচার অনুযায়ী OfficialPrintPreview কম্পোনেন্টটি ইমপোর্ট করে নিন
import { OfficialPrintPreview } from './OfficialPrintPreview';
import { downloadElementAsPdf } from '../../src/utils/pdfDownload';

type PreviewData = React.ComponentProps<typeof OfficialPrintPreview> & {
  applicant_name?: string;
  school_name?: string;
};

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PreviewData;
  autoDownload?: boolean;
  downloadFileName?: string;
  onAutoDownloadComplete?: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  autoDownload = false,
  downloadFileName = 'GPF_Final_Application.pdf',
  onAutoDownloadComplete,
}) => {
  const autoDownloadStarted = useRef(false);

  useEffect(() => {
    if (!isOpen || !autoDownload) {
      autoDownloadStarted.current = false;
      return;
    }
    if (autoDownloadStarted.current) return;

    autoDownloadStarted.current = true;
    window.setTimeout(() => {
      void downloadElementAsPdf('printable-document', downloadFileName)
        .catch(() => window.alert('PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।'))
        .finally(() => onAutoDownloadComplete?.());
    }, 250);
  }, [autoDownload, downloadFileName, isOpen, onAutoDownloadComplete]);

  if (!isOpen) return null;

  const handleIframePrint = () => {
    const printElement = document.getElementById('printable-document');
    if (!printElement) {
      alert('প্রিন্ট করার উপাদান পাওয়া যায়নি!');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      // মূল পেজের সব স্টাইল ও Tailwind CSS ইমপোর্ট
      const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((style) => style.outerHTML)
        .join('');

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>GPF Document Print</title>
            ${headStyles}
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&display=swap');
              
              @page {
                size: A4 portrait;
                margin: 0;
              }

              * { 
                box-sizing: border-box; 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              html, body { 
                margin: 0; 
                padding: 0; 
                background: #ffffff !important; 
                color: #000000 !important;
                font-family: 'Noto Serif Bengali', serif;
              }

              .a4-page { 
                width: 210mm !important;
                min-height: 297mm !important;
                margin: 0 auto !important; 
                padding: 16mm 15mm !important;
                page-break-after: always !important; 
                page-break-inside: avoid !important;
                background: #ffffff !important;
                box-sizing: border-box !important;
              }

              .a4-page:last-child {
                page-break-after: auto !important;
              }
            </style>
          </head>
          <body>
            ${printElement.innerHTML}
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 no-print">
      {/* Modal Container */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Topbar / Header */}
        <div className="bg-[#0b1329] px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                প্রস্তুতকৃত জিপিএফ-এ জমাকৃত সমূদয় টাকা চুড়ান্ত উত্তোলন ফাইল ফরম্যাট: প্রিন্ট প্রিভিউ
              </h3>
              <p className="text-xs text-slate-400">
                আবেদনকারী:- {data.applicant_name || 'N/A'}, বিদ্যালয়:- {data.school_name || 'N/A'}
              </p>
            </div>
          </div>

          {/* Top Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleIframePrint}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-[#059669] hover:bg-[#047857] text-white flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >    
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content Area (Middle Body) */}
        <div className="flex-1 overflow-y-auto bg-[#070d19] p-4 sm:p-8 flex justify-center items-start">
          <div className="w-full flex flex-col items-center gap-8">
            
            {/* এখানে OfficialPrintPreview কল করা হলো যা সম্পূর্ণ ৫টি পাতা রেন্ডার করবে */}
            <OfficialPrintPreview {...data} embedded />

          </div>
        </div>

        {/* Modal Bottom Status Bar / Footer */}
        <div className="bg-[#0b1329] px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p>প্রিন্ট ডায়ালগে "Save as PDF" নির্বাচন করে সরাসরি পিডিএফ ফাইল হিসেবে সংরক্ষণ করতে পারেন।</p>
          </div>
          <button
            type="button"
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