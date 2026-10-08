import React from 'react';
import { UserSession, ActiveAppTab } from '../types';
import { KeyRound, LogOut, Lock, LogIn, Phone, ExternalLink } from 'lucide-react';
import adminPortrait from '../assets/images/admin_rafiqul_portrait_1790178930044.jpg';

interface OfficialDashboardProps {
  currentUser: UserSession | null;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenPasswordModal: () => void;
  onNavigateToApp: (tab: ActiveAppTab) => void;
}

export const OfficialDashboard: React.FC<OfficialDashboardProps> = ({
  currentUser,
  isLoggedIn,
  onOpenLogin,
  onLogout,
  onOpenPasswordModal,
  onNavigateToApp,
}) => {
  const disclaimerPoints = [
    {
      no: '১',
      title: 'ব্যক্তিগত উদ্যোগ:',
      text: 'এটি সম্পূর্ণ ব্যক্তিগত উদ্যোগে নির্মিত একটি সহায়ক টুল (Helper Tool), প্রাথমিক শিক্ষা অধিদপ্তর (DPE) বা অন্য কোনো সরকারি দপ্তরের অফিশিয়াল পোর্টাল নয়।',
    },
    {
      no: '২',
      title: 'ঐচ্ছিক ব্যবহার:',
      text: 'সরকারি ফাইল প্রসেসিংয়ের কাজকে সহজ ও দ্রুত করার উদ্দেশ্যে এটি নির্মিত। এর ব্যবহারের সিদ্ধান্ত সম্পূর্ণ আপনার নিজস্ব এবং ঐচ্ছিক।',
    },
    {
      no: '৩',
      title: 'অভ্যন্তরীণ উপজেলা আইডি:',
      text: 'ওয়েবসাইটের ডেটাবেজ ব্যবস্থাপনা এবং ব্যবহারকারীদের সুবিধার্থে প্রতিটি উপজেলার জন্য একটি করে স্বতন্ত্র আইডি নম্বর (ID) তৈরি করা হয়েছে। এটি সম্পূর্ণ এই ওয়েবসাইটের অভ্যন্তরীণ কাজের জন্য নির্মিত এবং এর সাথে সরকার বা অধিদপ্তর অনুমোদিত কোনো অফিশিয়াল কোডের সম্পৃক্ততা নেই।',
    },
    {
      no: '৪',
      title: 'যাচাইকরণের দায়িত্ব:',
      text: 'এই সাইট থেকে জেনারেট হওয়া ফাইলসমূহ চূড়ান্তভাবে জমা দেওয়ার আগে সরকারি বিধিমালা এবং সংশ্লিষ্ট হিসাব রক্ষণ (CAO/UAO) অফিসের নিয়মের সাথে মিলিয়ে যাচাই করে নেওয়ার দায়িত্ব ব্যবহারকারীর।',
    },
    {
      no: '৫',
      title: 'সংবেদনশীল তথ্যের সুরক্ষা:',
      text: 'ব্যবহারকারীদের সর্বোচ্চ নিরাপত্তা নিশ্চিত করতে এখানে এনআইডি (NID), পিডিএস (PDS) আইডি বা মোবাইল নম্বরের মতো কোনো সংবেদনশীল তথ্য ইনপুট দেওয়ার প্রয়োজন বা অপশন রাখা হয়নি।',
    },
    {
      no: '৬',
      title: 'একাউন্ট নিরাপত্তা ও পাসওয়ার্ড:',
      text: 'সাইটে সাইন-ইন করার জন্য একটি সক্রিয় ব্যক্তিগত ই-মেইল ব্যবহার করতে হবে, যার মাধ্যমে আপনি পরবর্তীতে ভুলে যাওয়া পাসওয়ার্ড পুনরুদ্ধার (Reset) করতে পারবেন। আপনার পাসওয়ার্ডের গোপনীয়তা রক্ষার দায়িত্ব আপনার।',
    },
    {
      no: '৭',
      title: 'ডাটা নিয়ন্ত্রণ ও ডিলিট অপশন:',
      text: 'এখানে প্রসেসকৃত ডাটা আপনার নিজস্ব প্রোফাইলে সংরক্ষিত থাকবে। ডাটা সুরক্ষার বিষয়ে আপনার কোনো সংশয় থাকলে ড্যাশবোর্ড থেকে যেকোনো সময় আপনার সংরক্ষিত ডাটা স্থায়ীভাবে মুছে (Delete) ফেলার পূর্ণ স্বাধীনতা রয়েছে।',
    },
    {
      no: '৮',
      title: 'ম্যানুয়াল রেজিস্টার সংরক্ষণ:',
      text: 'এই প্ল্যাটফর্মটি কেবল ফাইল প্রস্তুতের কাজে সহায়তা করে। দাপ্তরিক স্বচ্ছতার জন্য এখানে প্রসেসকৃত ফাইলের বিবরণী আপনার অফিসের মূল সরকারি ভলিউম বা ফরওয়ার্ডিং রেজিস্টারে ম্যানুয়ালি লিপিবদ্ধ করে রাখার অনুরোধ করা হলো।',
    },
    {
      no: '৯',
      title: 'ডাটা ব্যাকআপ ও টেকনিক্যাল ত্রুটি:',
      text: 'কোনো অনাকাঙ্ক্ষিত সার্ভার ক্র্যাশ বা কারিগরি ত্রুটির কারণে ডাটা নষ্ট হলে এই প্ল্যাটফর্ম দায়ী থাকবে না। তাই প্রয়োজনীয় ফাইল প্রসেস হওয়ার সাথে সাথেই তা ডাউনলোড করে হার্ডকপি বা নিজস্ব ড্রাইভে সংরক্ষণ করুন।',
    },
    {
      no: '১০',
      title: 'পরিমার্জন ও পরিবর্তন:',
      text: 'সরকারি জিপিএফ বিধিমালার যেকোনো পরিবর্তনের সাথে সামঞ্জস্য রেখে এই ওয়েবসাইটের ফরম্যাট বা লজিক যেকোনো সময় পরিবর্তন, পরিমার্জন বা আপডেট করার ক্ষমতা নির্মাতা সংরক্ষণ করেন।',
    },
    {
      no: '১১',
      title: 'আর্থিক লেনদেন ও ফ্রী সার্ভিস:',
      text: 'এই ওয়েবসাইটটি ব্যবহারের জন্য কোনো প্রকার আর্থিক লেনদেন বা ফি-র প্রয়োজন নেই। এটি সম্পূর্ণ বিনামূল্যে (Free of Cost) একটি সেবামূলক উদ্যোগ। এই সাইটের নাম ব্যবহার করে কেউ কোনো আর্থিক সুবিধা দাবি করলে তার জন্য নির্মাতা দায়ী থাকবেন না।',
    },
    {
      no: '১২',
      title: 'ভুল তথ্যের আইনি দায়মুক্তি:',
      text: 'ব্যবহারকারী কর্তৃক ইনপুটকৃত কোনো ভুল তথ্যের কারণে যদি কোনো ত্রুটিপূর্ণ ফাইল জেনারেট হয় বা সরকারি অডিট/হিসাব রক্ষণ অফিসে কোনো জটিলতা তৈরি হয়, তবে তার সম্পূর্ণ দায়ভার সংশ্লিষ্ট ব্যবহারকারীর। এর জন্য ওয়েবসাইটের আইনি বা আর্থিক কোনো দায় থাকবে না।',
    },
    {
      no: '১৩',
      title: 'সরাসরি সরকারি প্রতিনিধিত্বহীনতা:',
      text: 'এই প্ল্যাটফর্মটি কোনো সরকারি আইনি কাঠামো, অধিদপ্তর বা মন্ত্রণালয়ের প্রতিনিধিত্ব করে না। এটি কেবল একটি স্বয়ংক্রিয় \'ফাইল প্রসেসিং টুল\' (Automation Tool)। সরকারি চূড়ান্ত অনুমোদনের জন্য অফিশিয়াল নিয়ম ও চ্যানেল অনুসরণ করতে হবে।',
    },
    {
      no: '১৪',
      title: 'সেবা বন্ধ বা স্থগিতকরণ:',
      text: 'সার্ভার রক্ষণাবেক্ষণ, কারিগরি উন্নয়ন বা যেকোনো অনিবার্য কারণে এই ওয়েবসাইটের সেবা সাময়িক বা স্থায়ীভাবে বন্ধ করার পূর্ণ অধিকার নির্মাতা সংরক্ষণ করেন। এর ফলে উদ্ভূত কোনো কাজের ব্যাঘাত বা বিলম্বের জন্য নির্মাতাকে দায়ী করা যাবে না।',
    },
  ];

  return (
    <div className="w-full max-w-[1300px] mx-auto shadow-2xl border border-slate-400 overflow-hidden bg-white text-black font-sans select-text">
      {/* 1. TOP HEADER (Green background matching image) */}
      <header className="relative bg-[#00a651] text-black border-b-2 border-slate-900 flex items-stretch">
        {/* Left: Portrait photo of Rafiqul Islam */}
        <div className="shrink-0 w-28 sm:w-36 md:w-44 bg-slate-900 flex items-center justify-center border-r-2 border-slate-900 overflow-hidden">
          <img
            src={adminPortrait}
            alt="রফিকুল ইসলাম - প্রধান এডমিন"
            className="w-full h-full object-cover object-top filter contrast-105"
          />
        </div>

        {/* Center: Main Portal Titles */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-3 text-center sm:text-left">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-black tracking-tight drop-shadow-xs font-serif leading-tight">
            জিপিএফ ফাইল প্রসেসিং পোর্টাল
          </h1>
          <p className="text-base sm:text-xl md:text-2xl font-bold text-black mt-1 sm:mt-2">
            উপজেলা প্রাথমিক শিক্ষা অফিস, {currentUser ? `${currentUser.upazila_name_bn}, ${currentUser.district_name_bn}` : 'বিয়ানীবাজার, সিলেট'}।
          </p>
        </div>

        {/* Right: RF Logo Badge & Login/Logout Bar */}
        <div className="shrink-0 flex flex-col items-center justify-between p-2 sm:p-3 bg-[#008f45] border-l-2 border-slate-900">
          {/* RF Monogram Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0a3a1f] border-2 border-[#165b32] flex items-center justify-center shadow-md">
            <span className="text-red-600 font-black text-3xl sm:text-4xl tracking-tighter font-serif italic drop-shadow-sm select-none">
              RF
            </span>
          </div>

          {/* User Controls: Login, Logout, Password Change */}
          <div className="mt-2 flex flex-col gap-1 w-full text-center">
            {isLoggedIn ? (
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={onOpenPasswordModal}
                  title="পাসওয়ার্ড পরিবর্তন করুন"
                  className="bg-slate-900/90 hover:bg-black text-white px-2 py-1 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                >
                  <KeyRound className="w-3 h-3 text-amber-400" />
                  <span>পাসওয়ার্ড পরিবর্তন</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  title="লগআউট"
                  className="bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>লগআউট</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>লগইন করুন</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY (Purple Left Stripe + Cyan Content Area) */}
      <div className="flex min-h-[750px]">
        {/* Left Purple / Violet Vertical Stripe */}
        <div className="w-12 sm:w-24 md:w-32 bg-[#7b1fa2] shrink-0 border-r-2 border-slate-900 shadow-inner" />

        {/* Right Cyan / Sky-blue Main Container */}
        <main className="flex-1 bg-[#00b0f6] text-black p-4 sm:p-7 md:p-9">
          {/* Top 3 Application Buttons matching image */}
          <div className="flex flex-wrap items-center justify-around gap-3 pb-6 border-b-2 border-black/20">
            <button
              type="button"
              onClick={() => onNavigateToApp('gpf_refundable')}
              className="text-lg sm:text-2xl md:text-[26px] font-bold text-black hover:text-slate-900 hover:underline hover:scale-105 transition cursor-pointer px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/40 shadow-xs active:scale-95"
            >
              ১ | ফেরতযোগ্য অগ্রিম
            </button>

            <button
              type="button"
              onClick={() => onNavigateToApp('gpf_non_refundable')}
              className="text-lg sm:text-2xl md:text-[26px] font-bold text-black hover:text-slate-900 hover:underline hover:scale-105 transition cursor-pointer px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/40 shadow-xs active:scale-95"
            >
              ২ | অফেরতযোগ্য অগ্রিম
            </button>

            <button
              type="button"
              onClick={() => onNavigateToApp('gpf_final')}
              className="text-lg sm:text-2xl md:text-[26px] font-bold text-black hover:text-slate-900 hover:underline hover:scale-105 transition cursor-pointer px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/40 shadow-xs active:scale-95"
            >
              ৩ | চূড়ান্ত উত্তোলন
            </button>
          </div>

          {/* Guidelines Section Title */}
          <div className="mt-6 mb-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black font-serif">
              ব্যবহার করার আগে অনুগ্রহ করে পড়ুন:
            </h2>
          </div>

          {/* 14 Warning / Guidelines Conditions exactly matching image */}
          <div className="space-y-3.5 sm:space-y-4 text-xs sm:text-sm md:text-[15px] leading-relaxed text-black">
            {disclaimerPoints.map((item) => (
              <div key={item.no} className="flex items-start gap-2 sm:gap-3">
                <span className="font-bold text-black shrink-0 text-sm sm:text-base md:text-lg min-w-[20px] sm:min-w-[26px] text-right">
                  {item.no}
                </span>
                <div className="text-justify sm:text-left">
                  <strong className="font-bold text-black mr-1.5 text-black">
                    {item.title}
                  </strong>
                  <span>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* 3. FOOTER (Matching image: Dark Violet bar with Rafiqul Islam & WhatsApp number) */}
      <footer className="bg-[#6a1b9a] text-black font-bold py-3 px-4 sm:px-8 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm sm:text-base md:text-lg">
        <div className="text-center sm:text-left">
          সার্বক্ষণিক তদারকি ও প্রধান এডমিন: <span className="underline">রফিকুল ইসলাম</span> • সর্বস্বত্ব সংরক্ষিত।
        </div>
        <div className="text-center sm:text-right font-mono tracking-wide">
          WhatsApp+Mobile: 01732-679551
        </div>
      </footer>
    </div>
  );
};
