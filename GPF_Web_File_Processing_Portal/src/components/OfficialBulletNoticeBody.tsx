import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  AlertCircle, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Building2,
  BookOpenCheck
} from 'lucide-react';
import { ActiveAppTab } from '../types';

interface OfficialBulletNoticeBodyProps {
  onNavigateToApp: (tab: ActiveAppTab) => void;
  upazilaName?: string;
  districtName?: string;
}

export const OFFICIAL_BULLET_POINTS = [
  {
    no: '১',
    title: 'ব্যক্তিগত উদ্যোগ:',
    text: 'এটি সম্পূর্ণ ব্যক্তিগত উদ্যোগে নির্মিত একটি সহায়ক টুল (Helper Tool), প্রাথমিক শিক্ষা অধিদপ্তর (DPE) বা অন্য কোনো সরকারি দপ্তরের অফিশিয়াল পোর্টাল নয়।',
    category: 'উদ্যোগ ও কাঠামো'
  },
  {
    no: '২',
    title: 'ঐচ্ছিক ব্যবহার:',
    text: 'সরকারি ফাইল প্রসেসিংয়ের কাজকে সহজ ও দ্রুত করার উদ্দেশ্যে এটি নির্মিত। এর ব্যবহারের সিদ্ধান্ত সম্পূর্ণ আপনার নিজস্ব এবং ঐচ্ছিক।',
    category: 'ব্যবহার নীতি'
  },
  {
    no: '৩',
    title: 'অভ্যন্তরীণ উপজেলা আইডি:',
    text: 'ওয়েবসাইটের ডেটাবেজ ব্যবস্থাপনা এবং ব্যবহারকারীদের সুবিধার্থে প্রতিটি উপজেলার জন্য একটি করে স্বতন্ত্র আইডি নম্বর (ID) তৈরি করা হয়েছে। এটি সম্পূর্ণ এই ওয়েবসাইটের অভ্যন্তরীণ কাজের জন্য নির্মিত এবং এর সাথে সরকার বা অধিদপ্তর অনুমোদিত কোনো অফিশিয়াল কোডের সম্পৃক্ততা নেই।',
    category: 'আইডি ও ডেটাবেজ'
  },
  {
    no: '৪',
    title: 'যাচাইকরণের দায়িত্ব:',
    text: 'এই সাইট থেকে জেনারেট হওয়া ফাইলসমূহ চূড়ান্তভাবে জমা দেওয়ার আগে সরকারি বিধিমালা এবং সংশ্লিষ্ট হিসাব রক্ষণ (CAO/UAO) অফিসের নিয়মের সাথে মিলিয়ে যাচাই করে নেওয়ার দায়িত্ব ব্যবহারকারীর।',
    category: 'দায়িত্ব ও অডিট'
  },
  {
    no: '৫',
    title: 'সংবেদনশীল তথ্যের সুরক্ষা:',
    text: 'ব্যবহারকারীদের সর্বোচ্চ নিরাপত্তা নিশ্চিত করতে এখানে এনআইডি (NID), পিডিএস (PDS) আইডি বা মোবাইল নম্বরের মতো কোনো সংবেদনশীল তথ্য ইনপুট দেওয়ার প্রয়োজন বা অপশন রাখা হয়নি।',
    category: 'তথ্য নিরাপত্তা'
  },
  {
    no: '৬',
    title: 'একাউন্ট নিরাপত্তা ও পাসওয়ার্ড:',
    text: 'সাইটে সাইন-ইন করার জন্য একটি সক্রিয় ব্যক্তিগত ই-মেইল ব্যবহার করতে হবে, যার মাধ্যমে আপনি পরবর্তীতে ভুলে যাওয়া পাসওয়ার্ড পুনরুদ্ধার (Reset) করতে পারবেন। আপনার পাসওয়ার্ডের গোপনীয়তা রক্ষার দায়িত্ব আপনার।',
    category: 'নিরাপত্তা ও একাউন্ট'
  },
  {
    no: '৭',
    title: 'ডাটা নিয়ন্ত্রণ ও ডিলিট অপশন:',
    text: 'এখানে প্রসেসকৃত ডাটা আপনার নিজস্ব প্রোফাইলে সংরক্ষিত থাকবে। ডাটা সুরক্ষার বিষয়ে আপনার কোনো সংশয় থাকলে ড্যাশবোর্ড থেকে যেকোনো সময় আপনার সংরক্ষিত ডাটা স্থায়ীভাবে মুছে (Delete) ফেলার পূর্ণ স্বাধীনতা রয়েছে।',
    category: 'ডাটা নিয়ন্ত্রণ'
  },
  {
    no: '৮',
    title: 'ম্যানুয়াল রেজিস্টার সংরক্ষণ:',
    text: 'এই প্ল্যাটফর্মটি কেবল ফাইল প্রস্তুতের কাজে সহায়তা করে। দাপ্তরিক স্বচ্ছতার জন্য এখানে প্রসেসকৃত ফাইলের বিবরণী আপনার অফিসের মূল সরকারি ভলিউম বা ফরওয়ার্ডিং রেজিস্টারে ম্যানুয়ালি লিপিবদ্ধ করে রাখার অনুরোধ করা হলো।',
    category: 'দাপ্তরিক রেজিস্টার'
  },
  {
    no: '৯',
    title: 'ডাটা ব্যাকআপ ও টেকনিক্যাল ত্রুটি:',
    text: 'কোনো অনাকাঙ্ক্ষিত সার্ভার ক্র্যাশ বা কারিগরি ত্রুটির কারণে ডাটা নষ্ট হলে এই প্ল্যাটফর্ম দায়ী থাকবে না। তাই প্রয়োজনীয় ফাইল প্রসেস হওয়ার সাথে সাথেই তা ডাউনলোড করে হার্ডকপি বা নিজস্ব ড্রাইভে সংরক্ষণ করুন।',
    category: 'ব্যাকআপ ও টেকনিক্যাল'
  },
  {
    no: '১০',
    title: 'পরিমার্জন ও পরিবর্তন:',
    text: 'সরকারি জিপিএফ বিধিমালার যেকোনো পরিবর্তনের সাথে সামঞ্জস্য রেখে এই ওয়েবসাইটের ফরম্যাট বা লজিক যেকোনো সময় পরিবর্তন, পরিমার্জন বা আপডেট করার ক্ষমতা নির্মাতা সংরক্ষণ করেন।',
    category: 'বিধিমালা আপডেট'
  },
  {
    no: '১১',
    title: 'আর্থিক লেনদেন ও ফ্রী সার্ভিস:',
    text: 'এই ওয়েবসাইটটি ব্যবহারের জন্য কোনো প্রকার আর্থিক লেনদেন বা ফি-র প্রয়োজন নেই। এটি সম্পূর্ণ বিনামূল্যে (Free of Cost) একটি সেবামূলক উদ্যোগ। এই সাইটের নাম ব্যবহার করে কেউ কোনো আর্থিক সুবিধা দাবি করলে তার জন্য নির্মাতা দায়ী থাকবেন না।',
    category: 'ফ্রি সার্ভিস'
  },
  {
    no: '১২',
    title: 'ভুল তথ্যের আইনি দায়মুক্তি:',
    text: 'ব্যবহারকারী কর্তৃক ইনপুটকৃত কোনো ভুল তথ্যের কারণে যদি কোনো ত্রুটিপূর্ণ ফাইল জেনারেট হয় বা সরকারি অডিট/হিসাব রক্ষণ অফিসে কোনো জটিলতা তৈরি হয়, তবে তার সম্পূর্ণ দায়ভার সংশ্লিষ্ট ব্যবহারকারীর। এর জন্য ওয়েবসাইটের আইনি বা আর্থিক কোনো দায় থাকবে না।',
    category: 'আইনি দায়মুক্তি'
  },
  {
    no: '১৩',
    title: 'সরাসরি সরকারি প্রতিনিধিত্বহীনতা:',
    text: 'এই প্ল্যাটফর্মটি কোনো সরকারি আইনি কাঠামো, অধিদপ্তর বা মন্ত্রণালয়ের প্রতিনিধিত্ব করে না। এটি কেবল একটি স্বয়ংক্রিয় \'ফাইল প্রসেসিং টুল\' (Automation Tool)। সরকারি চূড়ান্ত অনুমোদনের জন্য অফিশিয়াল নিয়ম ও চ্যানেল অনুসরণ করতে হবে।',
    category: 'প্রতিনিধিত্বহীনতা'
  },
  {
    no: '১৪',
    title: 'সেবা বন্ধ বা স্থগিতকরণ:',
    text: 'সার্ভার রক্ষণাবেক্ষণ, কারিগরি উন্নয়ন বা যেকোনো অনিবার্য কারণে এই ওয়েবসাইটের সেবা সাময়িক বা স্থায়ীভাবে বন্ধ করার পূর্ণ অধিকার নির্মাতা সংরক্ষণ করেন। এর ফলে উদ্ভূত কোনো কাজের ব্যাঘাত বা বিলম্বের জন্য নির্মাতাকে দায়ী করা যাবে না।',
    category: 'স্থগিতকরণ'
  }
];

export const OfficialBulletNoticeBody: React.FC<OfficialBulletNoticeBodyProps> = ({
  onNavigateToApp,
  upazilaName = 'বিয়ানীবাজার',
  districtName = 'সিলেট'
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPoints = OFFICIAL_BULLET_POINTS.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.no.includes(searchTerm)
  );

  const handleCopySingle = (index: number, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const handleCopyAll = () => {
    const fullText = OFFICIAL_BULLET_POINTS.map(p => `${p.no}। ${p.title} ${p.text}`).join('\n\n');
    navigator.clipboard?.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 3 Action App Buttons at the Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <button
          type="button"
          onClick={() => onNavigateToApp('gpf_refundable')}
          className="bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 p-4 rounded-xl shadow-xs transition group text-left cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition">
              ১
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">
                ফেরতযোগ্য অগ্রিম উত্তোলন
              </h3>
              <p className="text-xs text-slate-500">
                ১২-৪৮ কিস্তি ও আইবাস++ শিডিউল
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateToApp('gpf_non_refundable')}
          className="bg-white hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 p-4 rounded-xl shadow-xs transition group text-left cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition">
              ২
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-800">
                অফেরতযোগ্য অগ্রিম উত্তোলন
              </h3>
              <p className="text-xs text-slate-500">
                বয়স ৫২ বছর / ২৫ বছর চাকরি শর্ত
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateToApp('gpf_final')}
          className="bg-white hover:bg-rose-50/70 border border-slate-200 hover:border-rose-300 p-4 rounded-xl shadow-xs transition group text-left cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition">
              ৩
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-800">
                চূড়ান্ত উত্তোলন ও নো-ডিমান্ড
              </h3>
              <p className="text-xs text-slate-500">
                অবসরকালীন (PRL) চূড়ান্ত নিষ্পত্তি
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-700 group-hover:translate-x-1 transition shrink-0" />
        </button>
      </div>

      {/* Main Bullet Lines Box matching the user guidelines */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Banner Title Row */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white/20 text-white">
                <BookOpenCheck className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                ব্যবহার করার আগে অনুগ্রহ করে পড়ুন:
              </h2>
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              উপজেলা প্রাথমিক শিক্ষা কার্যালয়, {upazilaName}, {districtName} • জিপিএফ ফাইল প্রসেসিংয়ের ১৪টি সতর্কতামূলক বুলেট শর্তাবলী
            </p>
          </div>

          <div className="flex items-center gap-2 no-print shrink-0">
            <button
              type="button"
              onClick={handleCopyAll}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'সব কপি হয়েছে' : 'সবগুলো কপি'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / নোটিশ</span>
            </button>
          </div>
        </div>

        {/* Search Filter Bar (no-print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 no-print">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="শর্ত খুঁজুন (যেমন: উদ্যোগ, পাসওয়ার্ড, এনআইডি, আইনি...)"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            মোট শর্ত: {filteredPoints.length} টি
          </div>
        </div>

        {/* 14 Bullet Lines in Body */}
        <div className="p-5 sm:p-7 space-y-4 text-slate-800">
          {filteredPoints.map((item, idx) => (
            <div 
              key={item.no}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-50/50 transition border border-transparent hover:border-emerald-100"
            >
              {/* Bullet Number */}
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                {item.no}
              </div>

              {/* Bullet Content */}
              <div className="flex-1 text-xs sm:text-sm leading-relaxed text-justify sm:text-left">
                <span className="font-bold text-slate-900 mr-1.5 text-sm sm:text-base">
                  {item.title}
                </span>
                <span className="text-slate-700">
                  {item.text}
                </span>
              </div>

              {/* Quick Copy single line */}
              <button
                type="button"
                onClick={() => handleCopySingle(idx, `${item.no}। ${item.title} ${item.text}`)}
                title="এই শর্তটি কপি করুন"
                className="opacity-0 group-hover:opacity-100 transition p-1.5 text-slate-400 hover:text-emerald-700 rounded-md hover:bg-white shrink-0 no-print cursor-pointer"
              >
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
