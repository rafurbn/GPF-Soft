import React from 'react';
import { AlertTriangle, ShieldCheck, User, Info, Scale } from 'lucide-react';

export const PermanentDisclaimerSection: React.FC = () => {
  return (
    <div className="mb-6 bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 shadow-2xs text-amber-950">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <span>জরুরি আইনি ও দাপ্তরিক সতর্কবার্তা</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 bg-amber-200/70 text-amber-800 rounded-md">
                বাধ্যতামূলক
              </span>
            </h2>
            <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
              এই পোর্টালটি শুধুমাত্র উপজেলা প্রাথমিক শিক্ষা কার্যালয়ের অনুমোদিত শিক্ষক-কর্মকর্তাদের জিপিএফ ডাটা প্রসেসিং সহায়তায় প্রস্তুতকৃত। যেকোনো আর্থিক দাবির চূড়ান্ত অনুমোদন উপজেলা হিসাবরক্ষণ কার্যালয় (DAO) ও আইবাস++ (iBAS++) সার্ভারের বিধিমালা সাপেক্ষে প্রযোজ্য।
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs border-t md:border-t-0 md:border-l border-amber-200/80 pt-2 md:pt-0 md:pl-4">
          <div className="text-right">
            <div className="text-[11px] text-amber-800 font-semibold">সার্বক্ষণিক তদারকি ও এডমিন:</div>
            <div className="font-bold text-slate-900 text-xs">রফিকুল ইসলাম</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-900 text-xs">
            রি
          </div>
        </div>
      </div>
    </div>
  );
};
