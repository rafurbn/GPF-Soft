import React from 'react';
import { 
  Building2, 
  KeyRound, 
  LogOut, 
  ShieldCheck, 
  FileText, 
  FileSpreadsheet, 
  AlertOctagon, 
  UserCheck, 
  Sparkles,
  BookOpenCheck,
  ChevronDown
} from 'lucide-react';
import { UserSession, ActiveAppTab } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface HeaderProps {
  currentUser: UserSession;
  activeTab: ActiveAppTab;
  onTabChange: (tab: ActiveAppTab) => void;
  onOpenPasswordModal: () => void;
  onLogout: () => void;
  onSwitchUser: (code: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onOpenPasswordModal,
  onLogout,
  onSwitchUser,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-30">
      {/* Top Banner Row */}
      <div className="bg-slate-900 text-slate-100 text-xs px-4 py-1.5 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার • প্রাথমিক শিক্ষা অধিদপ্তর</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">জেনারেল প্রভিডেন্ট ফান্ড (জিপিএফ) স্বয়ংক্রিয় প্রসেসিং হাব</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400">তত্ত্বাবধানে: <strong className="text-slate-200">রফিকুল ইসলাম</strong> (প্রধান এডমিন)</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">নিরাপদ iBAS++ ফ্রেন্ডলি</span>
          </div>
        </div>
      </div>

      {/* Main Header Area */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand and Upazila */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs font-bold text-lg">
              জি
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  উপজেলা প্রাথমিক শিক্ষা জিপিএফ পোর্টাল
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  কোড: {currentUser.upazila_code}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {currentUser.upazila_name_bn} প্রাথমিক শিক্ষা কার্যালয়, {currentUser.district_name_bn} জেলা
              </p>
            </div>
          </div>

          {/* User Profile & Demo Switcher */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Demo Switcher */}
            <div className="relative inline-flex items-center">
              <select
                value={currentUser.upazila_code}
                onChange={(e) => onSwitchUser(e.target.value)}
                aria-label="ইউজার ও উপজেলা পরিবর্তন"
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-1.5 pl-2.5 pr-7 rounded-lg text-xs font-medium hover:bg-slate-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {INITIAL_USERS.map((u) => (
                  <option key={u.id} value={u.upazila_code}>
                    {u.role === 'super_admin' ? `এডমিন: ${u.upazila_name_bn}` : `উপজেলা: ${u.upazila_name_bn} (${u.upazila_code})`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Password Reset Modal Button */}
            <button
              type="button"
              onClick={onOpenPasswordModal}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">পাসওয়ার্ড পরিবর্তন</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pt-3 border-t border-slate-100 mt-3 text-xs">
          <button
            type="button"
            onClick={() => onTabChange('gpf_dashboard')}
            className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'gpf_dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>সতর্কতামূলক শর্তাবলী (১৪টি)</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('gpf_refundable')}
            className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'gpf_refundable'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>১. ফেরতযোগ্য অগ্রিম</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('gpf_non_refundable')}
            className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'gpf_non_refundable'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>২. অফেরতযোগ্য অগ্রিম</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('gpf_final')}
            className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'gpf_final'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>৩. চূড়ান্ত উত্তোলন</span>
          </button>

          {currentUser.role === 'super_admin' && (
            <button
              type="button"
              onClick={() => onTabChange('admin_overview')}
              className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'admin_overview'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>এডমিন ওভারভিউ (রফিকুল ইসলাম)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onTabChange('architecture_guide')}
            className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ml-auto ${
              activeTab === 'architecture_guide'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>সিস্টেম নির্দেশিকা</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
