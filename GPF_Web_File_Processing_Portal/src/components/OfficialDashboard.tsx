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
import { BookmarkCheck, Sparkles, ChevronRight, Clock, Plus, Activity, ShieldCheck, Lock } from 'lucide-react';
import { ActiveAppTab, UserSession } from '../types';
import { getAppMaintenanceStates, getRemoteMaintenanceState, hydrateMaintenanceStates } from '../lib/centralAdminStore';
import { toBn } from '../lib/format';
import { Toast, useToast } from '../../app-shared/ui/Toast';

// ৪টি সক্রিয় এ্যাপ + ১টি খালি স্লট (ভবিষ্যতে এখানে নতুন এ্যাপ যোগ করা হবে)।
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
  { 
    id: 'app4',
    no: '৪',
    isActive: true,
    title: 'জিপিএফ মৃত্যুদাবী নিষ্পত্তি',
    badge: 'চাকুরীরত অবস্থায় মৃত কর্মচারীর জন্য',
    desc: 'মৃত কর্মচারীর জিপিএফ চুড়ান্ত নিষ্পত্তি',
    tab: 'gpf_DeathClaim',
    accent: {
      badge: 'bg-blue-950/70 border-blue-700/60 text-blue-400 group-hover:border-blue-400',
      tag: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
      hoverBorder: 'hover:border-blue-600/70',
      hoverTitle: 'group-hover:text-blue-300',
      hoverIcon: 'group-hover:text-blue-400',
    },
  },
  // খালি স্লট — পরে এখানে নতুন এ্যাপ যোগ করা হবে।
  { id: 'app5', no: '৫', isActive: false },
];

interface OfficialDashboardProps {
  onNavigateToApp?: (tab: ActiveAppTab) => void;
  currentUser?: UserSession | null;
  users?: UserSession[];
}

export const OfficialDashboard: React.FC<OfficialDashboardProps> = ({
  onNavigateToApp,
  currentUser,
  users = [],
}) => {
  const [maintenanceStates, setMaintenanceStates] = React.useState(getAppMaintenanceStates());

  const { toast, showToast } = useToast();

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const states = await hydrateMaintenanceStates();
        if (active) setMaintenanceStates(states);
      } catch {
        // App opening still performs a server-side availability check.
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const handleAppClick = async (appId: string, tab?: ActiveAppTab) => {
    // Check maintenance lock
    const localInfo = maintenanceStates.find((state) => state.appId === appId);
    let lockInfo = {
      isLocked: localInfo?.isLocked || false,
      reason: localInfo?.lockReason || '',
      appName: localInfo?.appName || '',
    };
    try {
      const remoteLock = await getRemoteMaintenanceState(appId);
      if (remoteLock) lockInfo = { ...lockInfo, isLocked: remoteLock.isLocked, reason: remoteLock.lockReason, appName: remoteLock.appName };
    } catch {
      showToast('কেন্দ্রীয় রক্ষণাবেক্ষণ অবস্থা যাচাই করা যায়নি। পরে আবার চেষ্টা করুন।', 'error');
      return;
    }
    if (lockInfo.isLocked) {
      showToast(`[${lockInfo.appName}] রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ রয়েছে।\nকারণ: ${lockInfo.reason}`, 'warning');
      return;
    }

    if (tab === 'gpf_DeathClaim') {
      window.location.href = '/app4/index.html';
      return;
    }
    if (tab && onNavigateToApp) onNavigateToApp(tab);
  };

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
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0b162c] to-[#070e1c] rounded-2xl border border-slate-700/60 p-5 sm:p-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.12)]">
      {/* ব্যানার: এই পোর্টালে আপনাকে স্বাগতম */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#092b2f]/90 via-[#0a232f]/80 to-[#0c182c]/90 border border-emerald-500/50 mb-6 shadow-[0_8px_20px_rgba(5,150,105,0.2),inset_0_1px_2px_rgba(255,255,255,0.15)] relative overflow-hidden group">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-emerald-500 to-teal-700 border border-emerald-300/40 flex items-center justify-center flex-shrink-0 text-white shadow-[0_4px_0_0_#064e3b,0_6px_12px_rgba(0,0,0,0.4)]">
            <BookmarkCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white drop-shadow-sm">
              এই পোর্টালে আপনাকে স্বাগতম
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              কর্মরত উপজেলা: <strong className="text-emerald-300 font-bold">{currentUser?.upazila_name_bn}</strong>, {currentUser?.district_name_bn}
            </p>
          </div>
        </div>

        {/* ব্যবহারকারী-সংক্রান্ত পরিসংখ্যান ও সুপার এডমিন কন্ট্রোল বাটন */}
        {isAdmin && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-4 sm:gap-6 px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-700/70 shadow-[0_3px_0_0_#020617,inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 border-r border-slate-800 pr-4">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>ইউজার পরিসংখ্যান</span>
              </div>
              {stats.map((stat) => (
                <div key={stat.id} className="flex items-center gap-2">
                  <span className={`w-1.5 h-6 rounded-full ${stat.dotClass}`} />
                  <div className="leading-tight">
                    <div className="text-xl font-black text-white font-mono">{toBn(stat.value)}</div>
                    <div className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigateToApp?.('super_admin_suite')}
              className="btn-3d btn-3d-indigo px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-200" />
              <span>Super Admin Suite</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
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
        <span className="text-[11px] font-semibold text-slate-400 font-mono">
          মোট ৫টি স্লট • ৪টি চালু
        </span>
      </div>

      {/* ২-কলামের গ্রিড (৪টি সচল বাটন + ১টি খালি স্লট) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {APPS.map((app) => {
          const lockedInfo = maintenanceStates.find((state) => state.appId === app.id) || {
            isLocked: false,
            lockReason: '',
            appName: '',
          };

          if (app.isActive && app.accent) {
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => handleAppClick(app.id, app.tab)}
                className={`group w-full text-left p-4.5 rounded-2xl transition-all duration-150 cursor-pointer flex items-center justify-between gap-3.5 select-none ${
                  lockedInfo.isLocked
                    ? 'border border-rose-800/80 bg-rose-950/20 shadow-[0_4px_0_0_#4c0519]'
                    : 'card-3d-interactive'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* ৩ডি নম্বর ব্যাজ */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0 border mt-0.5 shadow-[0_2px_0_0_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] ${app.accent.badge}`}>
                    {lockedInfo.isLocked ? <Lock className="w-4 h-4 text-rose-400" /> : app.no}
                  </div>

                  {/* এ্যাপের বিবরণ */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`font-bold text-sm sm:text-[15px] text-white ${app.accent.hoverTitle}`}>
                        {app.title}
                      </span>
                      {lockedInfo.isLocked ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          সাময়িক বন্ধ (রক্ষণাবেক্ষণ)
                        </span>
                      ) : (
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border shadow-xs ${app.accent.tag}`}>
                          {app.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 group-hover:text-slate-200 line-clamp-2 transition-colors">
                      {lockedInfo.isLocked ? lockedInfo.lockReason : app.desc}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-300 group-hover:border-emerald-500/60 group-hover:bg-emerald-950/60 shadow-[0_2px_0_0_#0f172a] transition-all flex-shrink-0">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          }

          // খালি স্লট — ভবিষ্যতের এ্যাপের জন্য সংরক্ষিত
          return (
            <div
              key={app.id}
              className="w-full min-h-[104px] rounded-2xl bg-[#09121f]/60 border border-dashed border-slate-700/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center gap-1.5 text-slate-500 select-none"
              title="ভবিষ্যতে এখানে নতুন এ্যাপ যোগ করা হবে"
            >
              <div className="w-8 h-8 rounded-xl border border-dashed border-slate-600 flex items-center justify-center text-slate-500">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-400">
                এ্যাপ স্লট {app.no} — খালি
              </span>
              <span className="text-[10px] font-mono tracking-wide text-slate-500 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                শীঘ্রই যোগ করা হবে
              </span>
            </div>
          );
        })}
      </div>
      <Toast toast={toast} />
    </div>
  );
}

export default OfficialDashboard;
