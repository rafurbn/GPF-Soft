import React, { useEffect, useRef } from 'react';
import { Eye, Printer, X } from 'lucide-react';
import { downloadElementAsPdf } from '../../src/utils/pdfDownload';
import type { ToastKind } from './Toast';

export type ShowToast = (text: string, kind?: ToastKind) => void;

export const PDF_DOWNLOAD_FAILED_TOAST = 'PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।';
export const PRINT_TARGET_MISSING_TOAST = 'প্রিন্ট করার উপাদান পাওয়া যায়নি!';
export const PRINT_FOOTER_HINT =
  'প্রিন্ট ডায়ালগে "Save as PDF" নির্বাচন করে সরাসরি পিডিএফ ফাইল হিসেবে সংরক্ষণ করতে পারেন।';

/**
 * Prints one document node by cloning it into a throwaway iframe that carries
 * the page's own stylesheets. The dashboard behind the modal therefore never
 * leaks onto the paper, and the A4 metrics match the in-page print rules.
 */
export const printElementViaIframe = (elementId: string, onShowToast: ShowToast): void => {
  const printElement = document.getElementById(elementId);
  if (!printElement) {
    onShowToast(PRINT_TARGET_MISSING_TOAST, 'error');
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
  if (!doc) return;

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

  window.setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 500);
};

/** Fires exactly one PDF download per auto-download request while the modal is open. */
export const useAutoDownloadPdf = (options: {
  isOpen: boolean;
  autoDownload: boolean;
  elementId: string;
  fileName: string;
  onComplete?: () => void;
  onShowToast: ShowToast;
}) => {
  const { isOpen, autoDownload, elementId, fileName, onComplete, onShowToast } = options;
  const autoDownloadStarted = useRef(false);

  useEffect(() => {
    if (!isOpen || !autoDownload) {
      autoDownloadStarted.current = false;
      return;
    }
    if (autoDownloadStarted.current) return;

    autoDownloadStarted.current = true;
    window.setTimeout(() => {
      void downloadElementAsPdf(elementId, fileName)
        .catch(() => onShowToast(PDF_DOWNLOAD_FAILED_TOAST, 'error'))
        .finally(() => onComplete?.());
    }, 250);
  }, [autoDownload, elementId, fileName, isOpen, onComplete, onShowToast]);
};

interface DocumentPreviewShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** The applicant/school line under the title; each app composes its own. */
  subtitle: React.ReactNode;
  onPrint: () => void;
  children: React.ReactNode;
  /** app2/app3 hide the whole overlay when the browser prints in-page; app1 must not. */
  overlayClassName?: string;
  bodyClassName?: string;
}

const DEFAULT_OVERLAY =
  'fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 no-print';
const DEFAULT_BODY = 'flex-1 overflow-y-auto bg-[#070d19] p-4 sm:p-8 flex justify-center items-start';

/** The one preview-modal chrome shared by app1, app2 and app3. */
export const DocumentPreviewShell: React.FC<DocumentPreviewShellProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  onPrint,
  children,
  overlayClassName = DEFAULT_OVERLAY,
  bodyClassName = DEFAULT_BODY,
}) => {
  if (!isOpen) return null;

  return (
    <div className={overlayClassName}>
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="bg-[#0b1329] px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">{title}</h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPrint}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-[#059669] hover:bg-[#047857] text-white flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              title="ব্রাউজার প্রিন্ট অথবা PDF আকারে সংরক্ষণ করুন"
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

        <div className={bodyClassName}>{children}</div>

        <div className="bg-[#0b1329] px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p>{PRINT_FOOTER_HINT}</p>
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
