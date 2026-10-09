import React from 'react';
import {
  ArrowRight,
  BookmarkCheck,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  KeyRound,
  Lock,
  LogOut,
  Printer,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import type { UserSession, ActiveAppTab } from '../types';
import portalLogo from '../assets/images/logo RF.svg';

interface Dashboard14Props {
  currentUser: UserSession | null;
  isDemoSession?: boolean;
  onNavigateToApp: (tab: ActiveAppTab) => void;
  onOpenPasswordModal?: () => void;
  onLogout?: () => void;
}

// ---------------------------------------------------------------------------
// Post-login dashboard (page 2 layout).
//
// The sign-in page itself lives in `PortalDesktopSignInView.tsx` and is left
// untouched. After a successful sign-in this component renders:
//
//   Left column  : "এই পোর্টালে আপনাকে স্বাগতম" banner, the 3 GPF app launcher
//                  cards, then a row of empty placeholder boxes.
//   Right column : the active session card + password change / logout actions.
// ---------------------------------------------------------------------------
type LaunchTone = 'emerald' | 'amber' | 'sky';

interface LaunchItem {
  index: string;
  badge: string;
  tone: LaunchTone;
  title: string;
  desc: string;
  tab: ActiveAppTab;
}

const LAUNCH_ITEMS: LaunchItem[] = [
  {
    index: '১',
    badge: '১৩-৪৪ কিস্তি',
    tone: 'emerald',
    title: 'ফেরতযোগ্য অগ্রিম উত্তোলন',
    desc: 'কিস্তি হিসাব, অগ্রিম মঞ্জুরি ও আইবাস++ শিডিউল প্রস্তুত করুন।',
    tab: 'gpf_refundable',
  },
  {
    index: '২',
    badge: 'বয়স ৫২ / ২৫ বছর',
    tone: 'amber',
    title: 'অফেরতযোগ্য অগ্রিম উত্তোলন',
    desc: 'বয়স ৫২ বছর অথবা ২৫ বছর চাকরিকালীন স্থায়ী মঞ্জুরি ফাইল।',
    tab: 'gpf_non_refundable',
  },
  {
    index: '৩',
    badge: 'PRL ও নো-ডিমান্ড',
    tone: 'sky',
    title: 'চূড়ান্ত উত্তোলন ও নো-ডিমান্ড',
    desc: 'PRL চূড়ান্ত স্থিতি নিষ্পত্তি ও প্রত্যয়ন ফাইল প্রস্তুত করুন।',
    tab: 'gpf_final',
  },
];

const LAUNCH_TONES: Record<LaunchTone, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  sky: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
};

const LaunchCard: React.FC<{ item: LaunchItem; onClick: () => void }> = ({ item, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full text-left rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-600/60 hover:bg-slate-800/70 p-4 transition-all duration-200 cursor-pointer shadow-lg"
  >
    <div className="flex items-start gap-3.5">
      <div
        className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold text-lg font-mono shrink-0 transition ${LAUNCH_TONES[item.tone]}`}
      >
        {item.index}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h5 className="font-bold text-sm text-white group-hover:text-emerald-200 transition leading-snug">
            {item.title}
          </h5>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/70">
            {item.badge}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-normal">{item.desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
    </div>
  </button>
);

export const Dashboard14: React.FC<Dashboard14Props> = ({
  currentUser,
  isDemoSession = false,
  onNavigateToApp,
  onOpenPasswordModal,
  onLogout,
}) => {
  const upazilaName = currentUser?.upazila_name_bn || 'উপজেলা অফিস';
  const districtName = currentUser?.district_name_bn || '—';
  const upazilaCode = currentUser?.upazila_code || '—';
  const roleLabel = currentUser?.role === 'super_admin' ? 'প্রধান এডমিন' : 'মিনি ব্যবহারকারী';
  const sessionLabel = isDemoSession ? 'ডেমো (অফলাইন) সেশন' : 'সক্রিয় সাইন-ইন সেশন';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch animate-fadeIn">
      {/* ===================== LEFT COLUMN ===================== */}
      <div className="lg:col-span-8 space-y-4">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-800/50 p-4 sm:p-5 shadow-md">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 shrink-0">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                এই পোর্টালে আপনাকে স্বাগতম
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                {upazilaName} উপজেলা প্রাথমিক শিক্ষা অফিস • {districtName} জেলা
              </p>
            </div>
          </div>
        </div>

        {/* App launchpad */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>জিপিএফ ফাইল প্রসেসিং এ্যাপসমূহ</span>
            </h4>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
              ৩টি এ্যাপ প্রস্তুত
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {LAUNCH_ITEMS.map((item) => (
              <LaunchCard
                key={item.tab}
                item={item}
                onClick={() => onNavigateToApp(item.tab)}
              />
            ))}
          </div>
        </div>

        {/* Placeholder boxes (mirrors the empty boxes on the reference page) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((slot) => (
            <div
              key={slot}
              className="min-h-[112px] rounded-xl border border-dashed border-slate-800 bg-slate-950/50"
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Bottom helper note */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>সরকারি বিধিসম্মত হিসাবরক্ষণ ও সঠিক ডাটা এন্ট্রি পোর্টাল</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400/90 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            সর্বশেষ বিধিমালা অনুযায়ী হালনাগাদকৃত
          </span>
        </div>
      </div>

      {/* ===================== RIGHT COLUMN ===================== */}
      <div className="lg:col-span-4 space-y-4">
        {/* Active session card */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/40 via-slate-700 to-emerald-500/40" />

          <div className="flex items-center justify-between gap-3 mb-3.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>{sessionLabel}</span>
            </h4>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isDemoSession
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isDemoSession ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`}
              />
              {isDemoSession ? 'ডেমো' : 'অনলাইন'}
            </span>
          </div>

          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-500/30 shrink-0 bg-slate-900">
                <img src={portalLogo} alt="উপজেলা লোগো" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{upazilaName}</div>
                <div className="text-[11px] text-slate-400 truncate">
                  উপজেলা প্রাথমিক শিক্ষা অফিসারের কার্যালয়
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2">
                <div className="text-[10px] text-slate-500 font-semibold">উপজেলা কোড</div>
                <div className="text-sm font-bold font-mono text-emerald-400">{upazilaCode}</div>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2">
                <div className="text-[10px] text-slate-500 font-semibold">ব্যবহারকারী</div>
                <div className="text-sm font-bold text-emerald-400 truncate">{roleLabel}</div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                জেলা
              </span>
              <span className="text-xs font-bold text-slate-200">{districtName}</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToApp('gpf_refundable')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>সাইন-ইন করুন</span>
            </button>
          </div>
        </div>

        {/* Account actions */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 shadow-lg space-y-2.5">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>একাউন্ট ও নিরাপত্তা</span>
          </h4>

          <button
            type="button"
            onClick={() => onOpenPasswordModal?.()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold py-2.5 text-xs transition cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>পাসওয়ার্ড পরিবর্তন করুন</span>
          </button>

          <button
            type="button"
            onClick={() => onLogout?.()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold py-2.5 text-xs transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="no-print w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold py-2.5 text-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>প্রিন্ট / নোটিশ কপি</span>
          </button>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-start gap-1.5 leading-relaxed">
            <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
            <span>প্রতিটি ফাইল জেনারেট করার আগে সরকারি বিধিমালা অনুসারে যাচাই করে নিন।</span>
          </div>
        </div>
      </div>
    </div>
  );
};
