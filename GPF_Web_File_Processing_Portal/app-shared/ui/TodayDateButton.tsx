import React from 'react';
import { Calendar } from 'lucide-react';
import { getCurrentBengaliDate } from '../../src/utils/dateUtils';
import { LABELS, RADIUS } from './tokens';

export interface TodayDateButtonProps {
  /** Receives today as `দিন/মাস/বছর` in Bengali digits. */
  onPick: (dateBn: string) => void;
}

/** The `আজকের তারিখ` control that sits beside each app's application-date input. */
export const TodayDateButton: React.FC<TodayDateButtonProps> = ({ onPick }) => (
  <button
    type="button"
    onClick={() => onPick(getCurrentBengaliDate())}
    className={`shrink-0 whitespace-nowrap ${RADIUS} inline-flex items-center gap-1.5 border border-emerald-600/50 bg-gradient-to-b from-emerald-950/70 to-slate-900 px-3 py-1.5 text-xs font-bold text-emerald-300 shadow-[0_2px_0_0_#064e3b,0_3px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_3px_0_0_#064e3b,0_4px_8px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all duration-150 cursor-pointer select-none`}
  >
    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
    <span>{LABELS.todayDate}</span>
  </button>
);
