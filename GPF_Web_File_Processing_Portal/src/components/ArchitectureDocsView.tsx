import React from 'react';
import { ShieldCheck, Database, Layers, CheckCircle2, FileCode, Server } from 'lucide-react';

export const ArchitectureDocsView: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          <span>উপজেলা প্রাথমিক শিক্ষা জিপিএফ সিস্টেম - আর্কিটেকচার নির্দেশিকা</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          সিস্টেম সিকিউরিটি, ডেটা আইসোলেশন ও জিপিএফ প্রসেসিং ফ্রেমওয়ার্ক স্পেসিফিকেশন
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>১. মাল্টি-টেন্যান্ট ডেটা সুরক্ষা (RLS)</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            প্রত্যেক উপজেলার ডাটা তাদের ৫ ডিজিটের নির্ধারিত কোড দ্বারা কঠোরভাবে ফিল্টার করা হয়। এক উপজেলার ব্যবহারকারী অন্য উপজেলার জিপিএফ ফাইল দেখতে বা পরিমার্জন করতে পারে না।
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Server className="w-4 h-4 text-indigo-600" />
            <span>২. আইবাস++ (iBAS++) প্রস্তুত কাঠামো</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            সরকারি আইবাস++ হিসাব ব্যবস্থার সাথে শতভাগ সংগতিপূর্ণ ফিল্ড ফরম্যাট (হিসাব নম্বর, এনআইডি, গ্রেড, স্কেল ও কিস্তি কর্তন শিডিউল)।
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-amber-600" />
            <span>৩. ১৪টি সতর্কতামূলক শর্তাবলী এনফোর্সমেন্ট</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            ফাইল সাবমিশন ও ছাড়পত্রের পূর্বে প্রতিটি শর্ত ব্যবহারকারীকে নোটিশ বোর্ডের মাধ্যমে প্রদর্শন এবং দায়বদ্ধতা নিশ্চিতকরণ মডিউল।
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>৪. ক্লাউড ও প্রিন্ট রেডি ডক্স</span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            প্রতিটি ফর্ম বাংলাদেশ ফরম নং-২৮৫৫ অনুযায়ী স্বয়ংক্রিয়ভাবে পরিপাটি এ৪ (A4) সাইজে প্রিন্ট বা পিডিএফ সংরক্ষণের জন্য প্রস্তুত।
          </p>
        </div>
      </div>
    </div>
  );
};
