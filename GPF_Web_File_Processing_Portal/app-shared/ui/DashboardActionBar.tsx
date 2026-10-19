import React from 'react';
import { Save } from 'lucide-react';
import { ActionButton } from './ActionButton';
import { LABELS, SAVE_CTA } from './tokens';

export interface DashboardActionBarProps {
  /** The helper sentence on the left of the bar — each app keeps its own wording. */
  note?: React.ReactNode;
  onSave?: () => void;
  saveLabel?: string;
  onPrint?: () => void;
  onPreview?: () => void;
  onHtmlEdit?: () => void;
  onNew?: () => void;
  /** Anything app-specific (e.g. app4's reset / save-as-new). */
  extra?: React.ReactNode;
  /** A locked form cannot be saved. */
  saveDisabled?: boolean;
}

/**
 * The single action bar every input dashboard ends with, so প্রিন্ট, প্রিভিউ,
 * এইচটিএমএল সম্পাদনা, নতুন এন্ট্রি and সংরক্ষণ sit in the same order, with the
 * same tones and the same Bengali words, in all four apps.
 */
export const DashboardActionBar: React.FC<DashboardActionBarProps> = ({
  note,
  onSave,
  saveLabel = LABELS.save,
  onPrint,
  onPreview,
  onHtmlEdit,
  onNew,
  extra,
  saveDisabled = false,
}) => (
  <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
    {note && (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>{note}</span>
      </div>
    )}

    <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
      {extra}
      {onNew && <ActionButton kind="new" title={LABELS.new} onClick={onNew} id="btn-new-in-dashboard" />}
      {onPreview && <ActionButton kind="neutral" title={LABELS.preview} onClick={onPreview} id="btn-preview-draft" />}
      {onPrint && <ActionButton kind="print" title={LABELS.print} onClick={onPrint} id="btn-print-draft" />}
      {onHtmlEdit && <ActionButton kind="neutral" title={LABELS.htmlEdit} onClick={onHtmlEdit} id="btn-html-editor" />}
      {onSave && (
        <button
          type="button"
          id="btn-save-record"
          onClick={onSave}
          disabled={saveDisabled}
          title={saveLabel}
          className={`${SAVE_CTA} ${saveDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Save className="w-4 h-4" />
          <span>{saveLabel}</span>
        </button>
      )}
    </div>
  </div>
);
