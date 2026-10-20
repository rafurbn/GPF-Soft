import React from 'react';
import { GpfNonRefundableFormData } from '../../src/types';
import { DocumentTemplate } from './DocumentTemplate';
import {
  DocumentPreviewShell,
  printElementViaIframe,
  useAutoDownloadPdf,
  type ShowToast,
} from '../../app-shared/ui/DocumentPreviewShell';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GpfNonRefundableFormData;
  autoDownload?: boolean;
  downloadFileName?: string;
  onAutoDownloadComplete?: () => void;
  onShowToast: ShowToast;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  autoDownload = false,
  downloadFileName = 'GPF_NonRefundable_Application.pdf',
  onAutoDownloadComplete,
  onShowToast,
}) => {
  useAutoDownloadPdf({
    isOpen,
    autoDownload,
    elementId: 'printable-document',
    fileName: downloadFileName,
    onComplete: onAutoDownloadComplete,
    onShowToast,
  });

  return (
    <DocumentPreviewShell
      isOpen={isOpen}
      onClose={onClose}
      title="প্রস্তুতকৃত জিপিএফ অগ্রিম উত্তোলনের ফাইল ফরম্যাট প্রিভিউ"
      subtitle={<>আবেদনকারী:- {data.applicant_name || 'N/A'}, বিদ্যালয়:- {data.school_name || 'N/A'}</>}
      onPrint={() => printElementViaIframe('printable-document', onShowToast)}
    >
      <div className="w-full flex flex-col items-center gap-8">
        <DocumentTemplate data={data} />
      </div>
    </DocumentPreviewShell>
  );
};
