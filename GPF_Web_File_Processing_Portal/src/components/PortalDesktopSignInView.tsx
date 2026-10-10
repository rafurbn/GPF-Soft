import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ArrowRight, 
  LogOut, 
  HelpCircle, 
  Phone, 
  Mail,
  FileSpreadsheet, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  ChevronRight, 
  Award, 
  Globe, 
  Layers, 
  SlidersHorizontal,
  BookmarkCheck,
  Eye,
  EyeOff,
  X,
  LayoutDashboard
} from 'lucide-react';
import { UserSession, ActiveAppTab } from '../types';
import portalLogo from '../assets/images/logo RF.svg';
import { isSupabaseConfigured } from '../lib/supabase';
import { ForgotPasswordOtpModal } from './ForgotPasswordOtpModal';
import { OfficialDashboard } from './OfficialDashboard';

interface PortalDesktopSignInViewProps {
  currentUser: UserSession | null;
  isLoggedIn: boolean;
  /** True when the visitor is signed in through the built-in offline demo directory. */
  isDemoSession?: boolean;
  onLogin: (loginId: string, password: string) => Promise<void>;
  onOpenRegistration: () => void;
  onLogout: () => void;
  onOpenPasswordModal: () => void;
  onNavigateToApp: (tab: ActiveAppTab) => void;
  /** Signed-in only: leaves the launcher and shows the 14-condition notice board again. */
  onOpenConditionNotice?: () => void;
  /** Accounts available to the signed-in session; used for the admin statistics. */
  visibleUsers?: UserSession[];
}

export const BULLET_POINTS_14 = [
  {
    no: '১',
    title: 'ব্যক্তিগত উদ্যোগ:',
    text: 'এটি সম্পূর্ণ ব্যক্তিগত উদ্যোগে নির্মিত একটি সহায়ক টুল (Helper Tool), প্রাথমিক শিক্ষা অধিদপ্তর (DPE) বা অন্য কোনো সরকারি দপ্তরের অফিশিয়াল পোর্টাল নয়।',
    category: 'উদ্যোগ ও কাঠামো',
    colorTheme: 'emerald'
  },
  {
    no: '২',
    title: 'ঐচ্ছিক ব্যবহার:',
    text: 'সরকারি ফাইল প্রসেসিংয়ের কাজকে সহজ ও দ্রুত করার উদ্দেশ্যে এটি নির্মিত। এর ব্যবহারের সিদ্ধান্ত সম্পূর্ণ আপনার নিজস্ব এবং ঐচ্ছিক।',
    category: 'ব্যবহার নীতি',
    colorTheme: 'teal'
  },
  {
    no: '৩',
    title: 'অভ্যন্তরীণ উপজেলা আইডি:',
    text: 'ওয়েবসাইটের ডেটাবেজ ব্যবস্থাপনা এবং ব্যবহারকারীদের সুবিধার্থে প্রতিটি উপজেলার জন্য একটি করে স্বতন্ত্র আইডি নম্বর (ID) তৈরি করা হয়েছে। এটি সম্পূর্ণ এই ওয়েবসাইটের অভ্যন্তরীণ কাজের জন্য নির্মিত এবং এর সাথে সরকার বা অধিদপ্তর অনুমোদিত কোনো অফিশিয়াল কোডের সম্পৃক্ততা নেই।',
    category: 'আইডি ও ডেটাবেজ',
    colorTheme: 'blue'
  },
  {
    no: '৪',
    title: 'যাচাইকরণের দায়িত্ব:',
    text: 'এই সাইট থেকে জেনারেট হওয়া ফাইলসমূহ চূড়ান্তভাবে জমা দেওয়ার আগে সরকারি বিধিমালা এবং সংশ্লিষ্ট হিসাব রক্ষণ (CAO/UAO) অফিসের নিয়মের সাথে মিলিয়ে যাচাই করে নেওয়ার দায়িত্ব ব্যবহারকারীর।',
    category: 'যাচাই ও অডিট',
    colorTheme: 'indigo'
  },
  {
    no: '৫',
    title: 'সংবেদনশীল তথ্যের সুরক্ষা:',
    text: 'ব্যবহারকারীদের সর্বোচ্চ নিরাপত্তা নিশ্চিত করতে এখানে এনআইডি (NID), পিডিএস (PDS) আইডি বা মোবাইল নম্বরের মতো কোনো সংবেদনশীল তথ্য ইনপুট দেওয়ার প্রয়োজন বা অপশন রাখা হয়নি।',
    category: 'তথ্য নিরাপত্তা',
    colorTheme: 'violet'
  },
  {
    no: '৬',
    title: 'একাউন্ট নিরাপত্তা ও পাসওয়ার্ড:',
    text: 'সাইটে সাইন-ইন করার জন্য একটি সক্রিয় ব্যক্তিগত ই-মেইল ব্যবহার করতে হবে, যার মাধ্যমে আপনি পরবর্তীতে ভুলে যাওয়া পাসওয়ার্ড পুনরুদ্ধার (Reset) করতে পারবেন। আপনার পাসওয়ার্ডের গোপনীয়তা রক্ষার দায়িত্ব আপনার।',
    category: 'একাউন্ট সুরক্ষা',
    colorTheme: 'purple'
  },
  {
    no: '৭',
    title: 'ডাটা নিয়ন্ত্রণ ও ডিলিট অপশন:',
    text: 'এখানে প্রসেসকৃত ডাটা আপনার নিজস্ব প্রোফাইলে সংরক্ষিত থাকবে। ডাটা সুরক্ষার বিষয়ে আপনার কোনো সংশয় থাকলে ড্যাশবোর্ড থেকে যেকোনো সময় আপনার সংরক্ষিত ডাটা স্থায়ীভাবে মুছে (Delete) ফেলার পূর্ণ স্বাধীনতা রয়েছে।',
    category: 'ডাটা নিয়ন্ত্রণ',
    colorTheme: 'pink'
  },
  {
    no: '৮',
    title: 'ম্যানুয়াল রেজিস্টার সংরক্ষণ:',
    text: 'এই প্ল্যাটফর্মটি কেবল ফাইল প্রস্তুতের কাজে সহায়তা করে। দাপ্তরিক স্বচ্ছতার জন্য এখানে প্রসেসকৃত ফাইলের বিবরণী আপনার অফিসের মূল সরকারি ভলিউম বা ফরওয়ার্ডিং রেজিস্টারে ম্যানুয়ালি লিপিবদ্ধ করে রাখার অনুরোধ করা হলো।',
    category: 'দাপ্তরিক রেজিস্টার',
    colorTheme: 'amber'
  },
  {
    no: '৯',
    title: 'ডাটা ব্যাকআপ ও টেকনিক্যাল ত্রুটি:',
    text: 'কোনো অনাকাঙ্ক্ষিত সার্ভার ক্র্যাশ বা কারিগরি ত্রুটির কারণে ডাটা নষ্ট হলে এই প্ল্যাটফর্ম দায়ী থাকবে না। তাই প্রয়োজনীয় ফাইল প্রসেস হওয়ার সাথে সাথেই তা ডাউনলোড করে হার্ডকপি বা নিজস্ব ড্রাইভে সংরক্ষণ করুন।',
    category: 'ব্যাকআপ ও সিস্টেম',
    colorTheme: 'orange'
  },
  {
    no: '১০',
    title: 'পরিমার্জন ও পরিবর্তন:',
    text: 'সরকারি জিপিএফ বিধিমালার যেকোনো পরিবর্তনের সাথে সামঞ্জস্য রেখে এই ওয়েবসাইটের ফরম্যাট বা লজিক যেকোনো সময় পরিবর্তন, পরিমার্জন বা আপডেট করার ক্ষমতা নির্মাতা সংরক্ষণ করেন।',
    category: 'বিধিমালা আপডেট',
    colorTheme: 'cyan'
  },
  {
    no: '১১',
    title: 'আর্থিক লেনদেন ও ফ্রী সার্ভিস:',
    text: 'এই ওয়েবসাইটটি ব্যবহারের জন্য কোনো প্রকার আর্থিক লেনদেন বা ফি-র প্রয়োজন নেই। এটি সম্পূর্ণ বিনামূল্যে (Free of Cost) একটি সেবামূলক উদ্যোগ। এই সাইটের নাম ব্যবহার করে কেউ কোনো আর্থিক সুবিধা দাবি করলে তার জন্য নির্মাতা দায়ী থাকবেন না।',
    category: '১০০% ফ্রি সেবা',
    colorTheme: 'emerald'
  },
  {
    no: '১২',
    title: 'ভুল তথ্যের আইনি দায়মুক্তি:',
    text: 'ব্যবহারকারী কর্তৃক ইনপুটকৃত কোনো ভুল তথ্যের কারণে যদি কোনো ত্রুটিপূর্ণ ফাইল জেনারেট হয় বা সরকারি অডিট/হিসাব রক্ষণ অফিসে কোনো জটিলতা তৈরি হয়, তবে তার সম্পূর্ণ দায়ভার সংশ্লিষ্ট ব্যবহারকারীর। এর জন্য ওয়েবসাইটের আইনি বা আর্থিক কোনো দায় থাকবে না।',
    category: 'আইনি দায়মুক্তি',
    colorTheme: 'rose'
  },
  {
    no: '১৩',
    title: 'সরাসরি সরকারি প্রতিনিধিত্বহীনতা:',
    text: 'এই প্ল্যাটফর্মটি কোনো সরকারি আইনি কাঠামো, অধিদপ্তর বা মন্ত্রণালয়ের প্রতিনিধিত্ব করে না। এটি কেবল একটি স্বয়ংক্রিয় \'ফাইল প্রসেসিং টুল\' (Automation Tool)। সরকারি চূড়ান্ত অনুমোদনের জন্য অফিশিয়াল নিয়ম ও চ্যানেল অনুসরণ করতে হবে।',
    category: 'প্রতিনিধিত্বহীনতা',
    colorTheme: 'slate'
  },
  {
    no: '১৪',
    title: 'সেবা বন্ধ বা স্থগিতকরণ:',
    text: 'সার্ভার রক্ষণাবেক্ষণ, কারিগরি উন্নয়ন বা যেকোনো অনিবার্য কারণে এই ওয়েবসাইটের সেবা সাময়িক বা স্থায়ীভাবে বন্ধ করার পূর্ণ অধিকার নির্মাতা সংরক্ষণ করেন। এর ফলে উদ্ভূত কোনো কাজের ব্যাঘাত বা বিলম্বের জন্য নির্মাতাকে দায়ী করা যাবে না।',
    category: 'সার্ভিস নোটিশ',
    colorTheme: 'red'
  },
];

export const PortalDesktopSignInView: React.FC<PortalDesktopSignInViewProps> = ({
  currentUser,
  isLoggedIn,
  isDemoSession = false,
  onLogin,
  onOpenRegistration,
  onLogout,
  onOpenPasswordModal,
  onNavigateToApp,
  onOpenConditionNotice,
  visibleUsers = [],
}) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotOtpModal, setShowForgotOtpModal] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Search and category state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const categories = [
    { id: 'all', label: 'সকল শর্ত (১৪)' },
    { id: 'উদ্যোগ ও ব্যবহার', label: 'উদ্যোগ ও নীতি' },
    { id: 'আইডি ও ডেটাবেজ', label: 'আইডি ও ডেটাবেজ' },
    { id: 'তথ্য নিরাপত্তা', label: 'নিরাপত্তা ও একাউন্ট' },
    { id: 'আইনি দায়মুক্তি', label: 'দায়মুক্তি ও অডিট' },
  ];

  const filteredBullets = BULLET_POINTS_14.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.no.includes(searchTerm) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'উদ্যোগ ও ব্যবহার' && (b.category.includes('উদ্যোগ') || b.category.includes('ব্যবহার') || b.category.includes('ফ্রি'))) ||
      (selectedCategory === 'আইডি ও ডেটাবেজ' && (b.category.includes('আইডি') || b.category.includes('রেজিস্টার') || b.category.includes('ব্যাকআপ'))) ||
      (selectedCategory === 'তথ্য নিরাপত্তা' && (b.category.includes('নিরাপত্তা') || b.category.includes('নিয়ন্ত্রণ') || b.category.includes('একাউন্ট'))) ||
      (selectedCategory === 'আইনি দায়মুক্তি' && (b.category.includes('যাচাই') || b.category.includes('দায়মুক্তি') || b.category.includes('প্রতিনিধিত্বহীনতা') || b.category.includes('সার্ভিস')));

    return matchesSearch && matchesCategory;
  });

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setErrorMsg('উপজেলা ID অথবা ইমেইল লিখুন।');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('অনুগ্রহ করে পাসওয়ার্ড লিখুন');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('১৪টি সতর্কতামূলক শর্তাবলীতে সম্মতি প্রদান আবশ্যক');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onLogin(loginId.trim(), password);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'সাইন ইন করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unified, professional badge styling by semantic category
  const getBadgeStyle = (category: string) => {
    if (category.includes('উদ্যোগ') || category.includes('ব্যবহার')) {
      return 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 shadow-2xs';
    }
    if (category.includes('আইডি') || category.includes('ডেটাবেজ')) {
      return 'bg-sky-950/70 text-sky-400 border border-sky-800/60 shadow-2xs';
    }
    if (category.includes('নিরাপত্তা') || category.includes('সুরক্ষা')) {
      return 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 shadow-2xs';
    }
    if (category.includes('অডিট') || category.includes('যাচাই') || category.includes('দায়মুক্তি')) {
      return 'bg-amber-950/70 text-amber-400 border border-amber-800/60 shadow-2xs';
    }
    return 'bg-slate-800 text-slate-300 border border-slate-700/80 shadow-2xs';
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col font-sans transition-all text-slate-100">
      {/*
        ========================================================================
        1. PRESTIGIOUS DYNAMIC TOP HEADER
        ========================================================================
      */}
      <header className="grid grid-cols-1 lg:grid-cols-12 border-b border-slate-800 bg-slate-950 text-white">
        {/* Left Branding */}
        <div className="lg:col-span-8 p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3.5 relative z-10">
            {/* Elegant Monogram / Crest Badge */}
            <div className="w-20 h-20 sm:w-[5.5rem] sm:h-[5.5rem] rounded-[24px] bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 p-0.5 shadow-lg shadow-emerald-950/60 shrink-0">
              <div className="w-full h-full rounded-[22px] overflow-hidden border border-emerald-500/30">
                <img src={portalLogo} alt="GPF পোর্টাল লোগো" className="w-full h-full object-cover" />
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-black tracking-tight text-white">
                GPF File Processing Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5 flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">উপজেলা প্রাথমিক শিক্ষা অফিসারের কার্যালয়</span>
              </p>
              <span className="mt-1 inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-2xs">
                v2.6 প্রো সংস্করণ
              </span>
            </div>
          </div>

          {/* Header Micro Badges */}
          <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2 text-xs relative z-10 no-print">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px]">ইউজার ফ্রেন্ডলি</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>২৪/৭ অনলাইন ক্লাউড সার্ভার</span>
            </div>
          </div>
        </div>

        {/* Right Header Column Title */}
        <div className="lg:col-span-4 p-4 sm:p-5 lg:p-6 bg-slate-950 flex items-center justify-between px-6 border-l border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className={`rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0 ${isLoggedIn ? 'w-8 h-8' : 'w-12 h-12'}`}>
              <Lock className={isLoggedIn ? 'w-4 h-4' : 'w-6 h-6'} />
            </div>
            <div>
              <h2 className={`font-bold leading-tight text-white font-serif ${isLoggedIn ? 'text-base sm:text-lg' : 'text-2xl sm:text-3xl'}`}>
                {isLoggedIn ? 'ব্যবহারকারী ড্যাশবোর্ড' : 'সাইন ইন উইন্ডো'}
              </h2>
              <p className={`text-slate-400 ${isLoggedIn ? 'text-[11px]' : 'text-sm sm:text-base'}`}>
                {isLoggedIn ? 'সক্রিয় একাউন্ট ও অ্যাপ হাব' : 'নিরাপদ অথেনটিকেশন গেটওয়ে'}
              </p>
            </div>
          </div>

          {isLoggedIn && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs uppercase tracking-wider">
              অনলাইন
            </span>
          )}
        </div>
      </header>

      {/*
        ========================================================================
        2. MAIN BODY
        - Logged in : full-width modern 14-condition analytics dashboard
        - Logged out: two-column desktop split (rules readout | sign-in form)
        ========================================================================
      */}
      <div
        className={`grid grid-cols-1 flex-1 items-stretch ${
          isLoggedIn ? '' : 'lg:grid-cols-12'
        }`}
      >
        {/*
          ----------------------------------------------------------------------
          LEFT COLUMN: 14 Bullet Lines with Clean, Modern Presentation
          (Visible only before sign-in. After login this whole column is removed
          so the launcher dashboard fills the window on its own.)
          ----------------------------------------------------------------------
        */}
        {!isLoggedIn && (
        <div className="lg:col-span-8 bg-slate-900/70 p-4 sm:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between">
          <div>
            {/* Top Interactive Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 text-white shadow-md border border-emerald-800/50 mb-5 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 shrink-0 mt-0.5">
                    <BookmarkCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                      ব্যবহার করার আগে অনুগ্রহ করে পড়ুন: সতর্কতামূলক শর্তাবলী ১৪টি
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 no-print">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer text-xs ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="শর্ত খুঁজুন..."
                  className="pl-8.5 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 shadow-2xs w-full sm:w-52"
                />
              </div>
            </div>

            {/* 14 Bullet Lines Container */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 sm:pr-2">
              {filteredBullets.map((item, idx) => (
                <div
                  key={item.no}
                  className="group relative p-3 sm:p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 shadow-xs transition-all duration-200 flex items-start gap-3"
                >
                  {/* Left Color Accent Bar on hover */}
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-transparent group-hover:bg-emerald-500 transition-colors"></div>

                  {/* Clean Semantic Badge */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${getBadgeStyle(item.category)} flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 font-mono transition-transform group-hover:scale-105`}
                  >
                    {item.no}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 text-xs sm:text-[13px] leading-relaxed text-slate-300 text-justify sm:text-left">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <strong className="font-bold text-white text-sm sm:text-[14px]">
                        {item.title}
                      </strong>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 group-hover:text-slate-300 transition-colors">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-slate-300 leading-normal">
                      {item.text}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="font-semibold text-slate-300">
              মোট শর্তাবলী: ১৪টি • প্রদর্শিত হচ্ছে: {filteredBullets.length} টি
            </span>
            <span className="text-emerald-400 font-medium">
              সর্বশেষ সরকারি প্রজ্ঞাপন ও বিধিমালা অনুযায়ী হালনাগাদকৃত
            </span>
          </div>
        </div>
        )}

        {/*
          ----------------------------------------------------------------------
          RIGHT COLUMN: Clean, Modern Sign-In & App Launcher Panel
          (Pre-login: a 4-column sidebar beside the conditions.
           Post-login: the same panel becomes the full-width dashboard.)
          ----------------------------------------------------------------------
        */}
        <div
          className={`bg-slate-950/70 p-5 sm:p-6 lg:p-7 flex flex-col relative overflow-hidden ${
            isLoggedIn ? 'w-full' : 'lg:col-span-4 justify-between'
          }`}
        >
          {/* Top Decorative Border Strip */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/40 via-slate-700 to-emerald-500/40"></div>

          <div className="flex-1">
            {/* Signed-in strip: who is using the portal + optional link back to the
                14-condition notice board (which is hidden from this page). */}
            {isLoggedIn && currentUser && (
              <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-white truncate">
                        {currentUser.upazila_name_bn} উপজেলা
                      </span>
                      {isDemoSession && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40">
                          ডেমো সেশন
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {currentUser.upazila_code} • {currentUser.district_name_bn}
                      {currentUser.email ? ` • ${currentUser.email}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onOpenConditionNotice && (
                    <button
                      type="button"
                      onClick={onOpenConditionNotice}
                      className="px-3 py-2 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                    >
                      ১৪টি শর্তাবলী দেখুন
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onOpenPasswordModal}
                    className="px-3 py-2 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    পাসওয়ার্ড পরিবর্তন
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-900/70 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট</span>
                  </button>
                </div>
              </div>
            )}

            {isLoggedIn && currentUser ? (
              <OfficialDashboard
                onNavigateToApp={onNavigateToApp}
                currentUser={currentUser}
                users={visibleUsers}
              />
            ) : (
              <div className="space-y-4">
                {/* Header Welcome Box */}
                <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md border border-slate-800 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold text-lg shrink-0">
                      <UserCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        স্বাগতম
                      </h3>
                      <p className="text-xs text-slate-400">
                        উপজেলা আইডি ও পাসওয়ার্ড দিয়ে সাইন-ইন করুন
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-medium flex items-center gap-2 animate-shake">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Success Toast */}
                  {toastNotification && (
                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{toastNotification}</span>
                    </div>
                  )}

                  {/* উপজেলা login ID (অথবা যাচাইকৃত ইমেইল) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      উপজেলা login ID অথবা ইমেইল
                    </label>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center absolute left-1.5 top-1/2 -translate-y-1/2">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="উপজেলা ID অথবা ইমেইল"
                        autoComplete="username"
                        required
                        className="w-full pl-11 pr-3 py-2.5 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-xl focus:outline-hidden focus:border-emerald-500 shadow-2xs font-bold text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  {/* গোপন পাসওয়ার্ড */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-300">
                        গোপন পাসওয়ার্ড
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-slate-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? 'লুকান' : 'পাসওয়ার্ড দেখুন'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center absolute left-1.5 top-1/2 -translate-y-1/2">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="পাসওয়ার্ড লিখুন"
                        autoComplete="current-password"
                        required
                        className={`w-full pl-11 pr-11 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl focus:outline-hidden focus:border-emerald-500 shadow-2xs font-bold transition-all text-white placeholder-slate-500 ${
                          showPassword
                            ? 'text-xs sm:text-sm font-mono tracking-normal'
                            : 'text-2xl sm:text-3xl'
                        }`}
                        style={{
                          letterSpacing: !showPassword && password ? '0.45em' : 'normal',
                          fontFamily: !showPassword ? 'caption, sans-serif' : 'monospace',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="w-8 h-8 flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                        title={showPassword ? 'লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* পাসওয়ার্ড ভুলে গিয়েছেন লিঙ্ক */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotOtpModal(true)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                      <span>পাসওয়ার্ড ভুলে গিয়েছেন? (ইমেইল ওটিপি)</span>
                    </button>
                  </div>

                  {/* শর্তাবলী চেকবক্স */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-2xs">
                    <label className="flex items-start gap-2.5 text-slate-300 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer shrink-0"
                      />
                      <span className="text-[11px] font-medium leading-relaxed text-slate-300">
                        আমি জিপিএফ ফাইল প্রসেসিং ও ব্যবহারের <strong className="text-white">১৪টি সতর্কতামূলক শর্তাবলী</strong> সজ্ঞানে পড়েছি এবং মেনে চলতে বাধ্য থাকব।
                      </span>
                    </label>
                  </div>

                  {/* সাইন ইন বাটন */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !isSupabaseConfigured}
                    className="w-full mt-2 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold shadow-lg shadow-emerald-950/50 transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-98"
                  >
                    <span>{isSubmitting ? 'যাচাই হচ্ছে...' : 'সাইন ইন করুন'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenRegistration}
                    className="group w-full rounded-xl border border-emerald-500/60 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-5 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-lg shadow-emerald-950/50 transition-all duration-200 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-400 hover:shadow-emerald-900/60 hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-5 w-5 text-amber-300 group-hover:animate-pulse" />
                    <span>প্রথমে উপজেলা আইডি তৈরি করুন</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Bottom strip (kept on the sign-in sidebar, hidden once the full-width
              dashboard is showing so nothing sits under it). */}
          {!isLoggedIn && (
          <div className="mt-5 pt-3.5 border-t border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>সরকারি বিধিসম্মত হিসাবরক্ষণ ও সঠিক ডাটা এন্ট্রি পোর্টাল</span>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* 
        ========================================================================
        3. FOOTER
        সার্বক্ষণিক তদারকি ও প্রধান এডমিন: রফিকুল ইসলাম • সর্বস্বত্ব সংরক্ষিত।
        WhatsApp+Mobile: ০১৭৩২-৬৭৯৫৫১
        ========================================================================
      */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-300 py-4 px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            সার্বক্ষণিক তদারকি ও প্রধান এডমিন: <strong className="text-white font-bold">রফিকুল ইসলাম</strong> • সর্বস্বত্ব সংরক্ষিত।
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/8801732679551"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition font-mono font-bold shadow-xs hover:scale-105"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp+Mobile: 01732-679551</span>
          </a>
        </div>
      </footer>

      {/* Forgot Password OTP Modal */}
      {showForgotOtpModal && (
        <ForgotPasswordOtpModal
          initialEmail=""
          onClose={() => setShowForgotOtpModal(false)}
          onSuccessReset={() => {
            setPassword('');
            setToastNotification('আপনার পাসওয়ার্ড সফলভাবে ওটিপি যাচাইয়ের মাধ্যমে পরিবর্তন করা হয়েছে!');
            setTimeout(() => setToastNotification(null), 4000);
          }}
        />
      )}
    </div>
  );
};
