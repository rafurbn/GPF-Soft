import React from 'react';
import { ArrowLeft, FileText, PlusCircle } from 'lucide-react';

interface HeaderProps {
  /** Returns to the root dashboard (real navigation, not just a scroll). */
  onBack: () => void;
  onNewEntry: () => void;
  claimCount: number;
  upazilaName?: string;
  districtName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onBack,
  onNewEntry,
  upazilaName,
  districtName,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0c1427]/90 backdrop-blur sticky top-0 z-40 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left: Navigation and App title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 hover:border-emerald-600 transition-colors whitespace-nowrap cursor-pointer"
              title="মূল ড্যাশবোর্ড বা ব্যাকপেইজে ফিরে যান"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ড্যাশবোর্ডে ফিরুন</span>
            </button>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    এ্যাপ 4
                  </span>
                  <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    জিপিএফ চূড়ান্ত উত্তোলন ফাইল প্রসেসিং (ডেথ ক্লেইম)
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400">
                  উপজেলা শিক্ষা অফিসারের কার্যালয়
                  {upazilaName ? `, ${upazilaName}` : ''}
                  {districtName ? `, ${districtName}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Right: New Entry Action */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onNewEntry}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-900/40 transition-colors border border-emerald-500"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>নতুন ক্লেইম ফর্ম</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

