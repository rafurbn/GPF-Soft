/*
 * Post-login launcher dashboard.
 *
 * Shown inside `PortalDesktopSignInView` after a successful sign-in. The three
 * GPF apps are MPA pages (app1/app2/app3), so the owning component performs the
 * navigation through `onNavigateToApp` instead of this component changing
 * `window.location` itself. Slots 4 and 5 are intentionally empty placeholders
 * for apps that will be added later.
 */
import React from 'react';
import { BookmarkCheck, Sparkles, ChevronRight, Clock, Plus, Activity } from 'lucide-react';
import { ActiveAppTab, UserSession } from '../types';

// ৩টি সক্রিয় এ্যাপ + ২টি খালি স্লট (ভবিষ্যতে এখানে নতুন এ্যাপ যোগ করা হবে)।
type LauncherApp = {
  id: string;
  no: string;
  isActive: boolean;
  title?: string;
  badge?: string;
  desc?: string;
  tab?: ActiveAppTab;
  accent?: {
    badge: string;
    tag: string;
    hoverBorder: string;
    hoverTitle: string;
    hoverIcon: string;
  };
};

const APPS: LauncherApp[] = [
  {
    id: 'app1',
    no: '১',
    isActive: true,
    title: 'ফেরতযোগ্য অগ্রিম উত্তোলন',
    badge: '১২-৪৮ কিস্তি',
    desc: 'স্বয়ংক্রিয় কিস্তি হিসাব, অগ্রিম মঞ্জুরি ও আইবাস++ শিডিউল ফরম',
    tab: 'gpf_refundable',
    accent: {
      badge: 'bg-emerald-950/70 border-emerald-700/60 text-emerald-400 group-hover:border-emerald-400',
      tag: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      hoverBorder: 'hover:border-emerald-600/70',
      hoverTitle: 'group-hover:text-emerald-300',
      hoverIcon: 'group-hover:text-emerald-400',
    },
  },
  {
    id: 'app2',
    no: '২',
    isActive: true,
    title: 'অফেরতযোগ্য অগ্রিম উত্তোলন',
    badge: 'বয়স ৫২ / ২৫ বছর',
    desc: 'বয়স ৫২ বছর বা ২৫ বছর চাকরিকালীন অফেরতযোগ্য স্থায়ী মঞ্জুরি',
    tab: 'gpf_non_refundable',
    accent: {
      badge: 'bg-amber-950/70 border-amber-700/60 text-amber-400 group-hover:border-amber-400',
      tag: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
      hoverBorder: 'hover:border-amber-600/70',
      hoverTitle: 'group-hover:text-amber-300',
      hoverIcon: 'group-hover:text-amber-400',
    },
  },
  {
    id: 'app3',
    no: '৩',
    isActive: true,
    title: 'চূড়ান্ত উত্তোলন ও নো-ডিমান্ড',
    badge: 'PRL ও দায়মুক্তি',
    desc: 'অবসরকালীন (PRL) চূড়ান্ত স্থিতি নিষ্পত্তি ও নো-ডিমান্ড প্রত্যয়ন',
    tab: 'gpf_final',
    accent: {
      badge: 'bg-rose-950/70 border-rose-700/60 text-rose-400 group-hover:border-rose-400',
      tag: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
      hoverBorder: 'hover:border-rose-600/70',
      hoverTitle: 'group-hover:text-rose-300',
      hoverIcon: 'group-hover:text-rose-400',
    },
  },
  // খালি স্লট — পরে এখানে নতুন এ্যাপ যোগ করা হবে।
  { id: 'app4', no: '৪', isActive: false },
  { id: 'app5', no: '৫', isActive: false },
];

interface OfficialDashboardProps {
  onNavigateToApp?: (tab: ActiveAppTab) => void;
  /** The signed-in account; the user statistics panel is shown to the admin only. */
  currentUser?: UserSession | null;
  /** Accounts included in the admin statistics (super admin accounts are excluded). */
  users?: UserSession[];
}

export const OfficialDashboard: React.FC<OfficialDashboardProps> = ({
  onNavigateToApp,
  currentUser,
  users = [],
}) => {
  const handleAppClick = (tab?: ActiveAppTab) => {
    if (tab && onNavigateToApp) onNavigateToApp(tab);
  };

  // ব্যবহারকারী-সংক্রান্ত পরিসংখ্যান শুধু এডমিন দেখে; সাধারণ উপজেলা ইউজার
  // এই প্যানেলটি একেবারেই দেখে না।
  const isAdmin = currentUser?.role === 'super_admin';
  const upazilaAccounts = users.filter((user) => user.role !== 'super_admin');
  const stats = [
    { id: 'accounts', label: 'নিবন্ধিত উপজেলা', value: upazilaAccounts.length, dotClass: 'bg-emerald-400' },
    {
      id: 'reset',
      label: 'পাসওয়ার্ড রিসেট বাকি',
      value: upazilaAccounts.filter((user) => user.is_first_login).length,
      dotClass: 'bg-amber-400',
    },
    {
      id: 'active',
      label: 'সক্রিয় একাউন্ট',
      value: upazilaAccounts.filter((user) => !user.is_first_login).length,
      dotClass: 'bg-sky-400',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a121e]/90 rounded-2xl border border-slate-800/80 p-5 sm:p-6 shadow-xl">
      {/* ব্যানার: এই পোর্টালে আপনাকে স্বাগতম */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#091e23]/80 via-[#0a1b24]/60 to-[#091522]/80 border border-emerald-600/40 mb-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0a1e22] border border-emerald-500/70 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-wide text-white">
            এই পোর্টালে আপনাকে স্বাগতম
          </h2>
        </div>

        {/* ব্যবহারকারী-সংক্রান্ত পরিসংখ্যান — শুধুমাত্র এডমিনের জন্য */}
        {isAdmin && (
          <div className="flex items-center gap-4 sm:gap-6 px-4 py-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 border-r border-slate-800 pr-4">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>ব্যবহারকারী পরিসংখ্যান</span>
            </div>
            {stats.map((stat) => (
              <div key={stat.id} className="flex items-center gap-2">
                <span className={`w-1.5 h-6 rounded-full ${stat.dotClass}`} />
                <div className="leading-tight">
                  <div className="text-xl font-black text-white font-mono">{stat.value}</div>
                  <div className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* টাইটেল */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm sm:text-base font-bold text-slate-100">
            জিপিএফ ফাইল প্রসেসিং এ্যাপসমূহ:
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 font-mono">
          মোট ৫টি স্লট • ৩টি চালু
        </span>
      </div>

      {/* ২-কলামের গ্রিড (৩টি সচল বাটন + ২টি খালি স্লট) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {APPS.map((app) => {
          if (app.isActive && app.accent) {
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => handleAppClick(app.tab)}
                className={`group w-full text-left p-4 rounded-2xl bg-[#0d1829]/90 hover:bg-[#112036] border border-slate-800/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg flex items-center justify-between gap-3 active:scale-[0.99] ${app.accent.hoverBorder}`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* নম্বর ব্যাজ */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 border mt-0.5 ${app.accent.badge}`}>
                    {app.no}
                  </div>

                  {/* এ্যাপের বিবরণ */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`font-bold text-sm sm:text-[15px] text-white ${app.accent.hoverTitle}`}>
                        {app.title}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${app.accent.tag}`}>
                        {app.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2">
                      {app.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight className={`w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-all flex-shrink-0 ${app.accent.hoverIcon}`} />
              </button>
            );
          }

          // খালি স্লট — ভবিষ্যতের এ্যাপের জন্য সংরক্ষিত
          return (
            <div
              key={app.id}
              className="w-full min-h-[104px] rounded-2xl bg-[#09121f]/60 border border-dashed border-slate-800/80 flex flex-col items-center justify-center gap-1.5 text-slate-600 select-none"
              title="ভবিষ্যতে এখানে নতুন এ্যাপ যোগ করা হবে"
            >
              <div className="w-8 h-8 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-600">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                এ্যাপ স্লট {app.no} — খালি
              </span>
              <span className="text-[10px] font-mono tracking-wide text-slate-600 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                শীঘ্রই যোগ করা হবে
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OfficialDashboard;
