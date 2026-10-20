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
    className={`shrink-0 whitespace-nowrap ${RADIUS} inline-flex items-center gap-1 border border-slate-700/70 bg-slate-800/70 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-slate-700 hover:text-emerald-200 cursor-pointer`}
  >
    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
    <span>{LABELS.todayDate}</span>
  </button>
);
