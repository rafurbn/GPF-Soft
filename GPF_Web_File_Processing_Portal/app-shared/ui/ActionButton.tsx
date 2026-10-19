import React, { useState } from 'react';
import { Download, FileSpreadsheet, Pencil, Plus, Printer, Save, Trash2 } from 'lucide-react';
import type { ActionKind } from './tokens';
import { BAR_BASE, BAR_TONE, ICON_SIZE, LABELS, ROW_BASE, ROW_TONE } from './tokens';

const ICONS: Record<ActionKind, React.ComponentType<{ className?: string }>> = {
  print: Printer,
  edit: Pencil,
  delete: Trash2,
  download: Download,
  new: Plus,
  save: Save,
  neutral: FileSpreadsheet,
};

interface BaseProps {
  kind: ActionKind;
  onClick: () => void;
  /** Tooltip; the screen-reader text when there is no visible label. */
  title: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export interface ActionButtonProps extends BaseProps {
  /** Omit for the icon-only row buttons; pass it to get a labelled bar button. */
  label?: string;
}

/** The only action button the apps use: tone and icon come from `kind`. */
export const ActionButton: React.FC<ActionButtonProps> = ({ kind, onClick, title, id, disabled, className, label }) => {
  const Icon = ICONS[kind];
  const row = !label;
  return (
    <button
      type="button"
      id={id}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={row ? title : undefined}
      className={`${row ? ROW_BASE : BAR_BASE} ${row ? ROW_TONE[kind] : BAR_TONE[kind]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className || ''}`}
    >
      <Icon className={ICON_SIZE} />
      {label && <span>{label}</span>}
    </button>
  );
};

export interface RowDeleteButtonProps {
  onConfirm: () => void;
  title?: string;
  id?: string;
}

/**
 * Delete with an inline মুছুন/না pair instead of `window.confirm`, so all four
 * apps ask for confirmation the same way (app3's pattern, adopted everywhere).
 */
export const RowDeleteButton: React.FC<RowDeleteButtonProps> = ({ onConfirm, title = LABELS.delete, id }) => {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return <ActionButton id={id} kind="delete" title={title} onClick={() => setConfirming(true)} />;
  }

  return (
    <span className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          onConfirm();
        }}
        className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
      >
        {LABELS.confirmDelete}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] cursor-pointer"
      >
        {LABELS.cancel}
      </button>
    </span>
  );
};
