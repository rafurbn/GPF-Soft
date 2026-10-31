import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { LABELS, RADIUS } from './tokens';

export interface LockToggleProps {
  isLocked: boolean;
  /** One button flips the state, so apps pass a plain toggle, not two handlers. */
  onToggle: () => void;
  id?: string;
  fullWidth?: boolean;
}

/** The lock control: one button, two labels (`লক করা আছে` ↔ `আনলক`). */
export const LockToggle: React.FC<LockToggleProps> = ({ isLocked, onToggle, id, fullWidth = false }) => (
  <button
    type="button"
    id={id}
    onClick={onToggle}
    aria-pressed={isLocked}
    title={isLocked ? 'তথ্য পরিবর্তন করতে ক্লিক করে আনলক করুন' : 'তথ্য লক করে সংরক্ষণ করুন'}
    className={`inline-flex min-h-8 items-center justify-center gap-1.5 ${RADIUS} border px-2.5 py-1.5 text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap select-none active:translate-y-[1px] ${
      fullWidth ? 'w-full' : ''
    } ${
      isLocked
        ? 'border-emerald-600/70 bg-gradient-to-b from-emerald-900 to-emerald-950 text-emerald-200 shadow-[0_2px_0_0_#064e3b,0_3px_6px_rgba(0,0,0,0.3)] hover:from-emerald-800 hover:to-emerald-900 active:shadow-none'
        : 'border-slate-600/70 bg-gradient-to-b from-slate-750 to-slate-850 text-slate-300 shadow-[0_2px_0_0_#0f172a,0_3px_6px_rgba(0,0,0,0.3)] hover:from-slate-700 hover:to-slate-800 active:shadow-none'
    }`}
  >
    {isLocked ? <Lock className="h-3.5 w-3.5 shrink-0" /> : <Unlock className="h-3.5 w-3.5 shrink-0" />}
    <span>{isLocked ? LABELS.locked : LABELS.unlocked}</span>
  </button>
);

/** A field that is locked by the system (upazila/district from the session). */
export const FixedLockBadge: React.FC<{ title?: string }> = ({ title }) => (
  <span
    title={title || 'উপজেলা আইডি খোলার সময় নিশ্চিত করা নাম — পরিবর্তনযোগ্য নয়'}
    className={`inline-flex min-h-8 items-center justify-center gap-1.5 ${RADIUS} border border-emerald-800/60 bg-emerald-900/40 px-2.5 py-1.5 text-xs font-semibold text-emerald-200 whitespace-nowrap`}
  >
    <Lock className="h-3.5 w-3.5 shrink-0" />
    <span>{LABELS.fixed}</span>
  </span>
);
