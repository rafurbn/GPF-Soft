import React from 'react';
import { GpfFormData } from '../../src/types';
import { PrintTemplates } from './PrintTemplates';
import {
  DocumentPreviewShell,
  useAutoDownloadPdf,
  type ShowToast,
} from '../../app-shared/ui/DocumentPreviewShell';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GpfFormData;
  autoDownload?: boolean;
  downloadFileName?: string;
  onAutoDownloadComplete?: () => void;
  onShowToast: ShowToast;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  autoDownload = false,
  downloadFileName = 'GPF_Refundable_Application.pdf',
  onAutoDownloadComplete,
  onShowToast,
}) => {
  useAutoDownloadPdf({
    isOpen,
    autoDownload,
    elementId: 'pdf-document',
    fileName: downloadFileName,
    onComplete: onAutoDownloadComplete,
    onShowToast,
  });

  // app1 prints in the page rather than through an iframe: the `print-only`
  // sibling container and the shared @media print rules do the work, so the
  // overlay must stay printable chrome-wise and only the chrome carries no-print.
  return (
    <DocumentPreviewShell
      isOpen={isOpen}
      onClose={onClose}
      title="প্রস্তুতকৃত জিপিএফ অগ্রিম উত্তোলন এর ফাইল ফরম্যাট প্রিভিউ"
      subtitle={<>আবেদনকারী:- {data.applicantName || '—'},  বিদ্যালয়:- {data.schoolName || '—'}</>}
      onPrint={() => window.setTimeout(() => window.print(), 150)}
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6"
      bodyClassName="flex-1 overflow-y-auto bg-[#070d19] p-4 sm:p-8 print:overflow-visible print:bg-white print:p-0"
    >
      <div id="pdf-document" className="mx-auto w-full">
        <PrintTemplates data={data} />
      </div>
    </DocumentPreviewShell>
  );
};
