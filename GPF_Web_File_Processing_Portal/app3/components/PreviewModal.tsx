import React from 'react';
import { OfficialPrintPreview } from './OfficialPrintPreview';
import {
  DocumentPreviewShell,
  printElementViaIframe,
  useAutoDownloadPdf,
  type ShowToast,
} from '../../app-shared/ui/DocumentPreviewShell';

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
  onShowToast: ShowToast;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  autoDownload = false,
  downloadFileName = 'GPF_Final_Application.pdf',
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
      title="প্রস্তুতকৃত জিপিএফ-এ জমাকৃত সমূদয় টাকা চুড়ান্ত উত্তোলন ফাইল ফরম্যাট: প্রিন্ট প্রিভিউ"
      subtitle={<>আবেদনকারী:- {data.applicant_name || 'N/A'}, বিদ্যালয়:- {data.school_name || 'N/A'}</>}
      onPrint={() => printElementViaIframe('printable-document', onShowToast)}
    >
      <div className="w-full flex flex-col items-center gap-8">
        <OfficialPrintPreview {...data} embedded />
      </div>
    </DocumentPreviewShell>
  );
};
