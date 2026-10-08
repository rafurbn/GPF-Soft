import React from 'react';
import { 
  ArrowLeft,
  Award
} from 'lucide-react';

interface DesktopHeaderProps {
  onBack: () => void;
  onNewApplication?: () => void;
  onSave?: () => void;
  onOpenPrint?: () => void;
  onOpenHtmlEdit?: () => void;
  savedCount?: number;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  onBack,
}) => {
  return (
    <header className="bg-[#091122] text-white border-b border-[#1b2845] sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Branding & Big Visible Back Button */}
        <div className="flex items-center gap-3">
          {/* Big, Highly Visible Return Button */}
          <button
            type="button"
            onClick={onBack}
            className="group flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 hover:from-slate-800 hover:to-emerald-900 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-emerald-500/40 hover:scale-[1.02] active:scale-98 shrink-0"
            title="মূল ড্যাশবোর্ড বা ব্যাকপেইজে ফিরে যান"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-200">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] text-emerald-300 font-semibold leading-tight">
                ব্যাকপেইজ
              </span>
              <span className="block text-xs sm:text-[13px] font-bold text-white leading-tight">
                ড্যাশবোর্ডে ফিরুন
              </span>
            </div>
          </button>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 shrink-0">
            <Award className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                এ্যাপ ৩: জিপিএফ চূড়ান্ত উত্তোলন ফাইল প্রসেসিং
              </h1>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
