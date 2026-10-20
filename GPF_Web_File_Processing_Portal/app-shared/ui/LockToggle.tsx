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
    className={`inline-flex min-h-8 items-center justify-center gap-1.5 ${RADIUS} border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
      fullWidth ? 'w-full' : ''
    } ${
      isLocked
        ? 'border-emerald-700/60 bg-emerald-900/50 text-emerald-200 hover:bg-emerald-800/60 hover:text-emerald-100'
        : 'border-slate-700/70 bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white'
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
