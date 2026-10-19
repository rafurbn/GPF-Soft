import React from 'react';
import { ArrowLeft, Phone } from 'lucide-react';
import type { UserSession } from '../../src/types';
import { toBn } from '../../src/lib/format';
import dashboardLogo from '../../src/assets/images/rf-logo.svg';
import { ADMIN_NAME, DEPARTMENT_NAME, OFFICE_NAME, PORTAL_NAME, SUPPORT_LINK, SUPPORT_PHONE, VERSION_LABEL } from '../../src/lib/portalMeta';

const appBadgeText = (appNumber: number) => `এ্যাপ ${toBn(appNumber)}`;

/**
 * Region meta comes from the signed-in session, so no app has to thread five
 * strings through its own props just to render a header.
 */
const officeLine = (user?: UserSession, withDivision = false): string => {
  const upazila = user?.upazila_name_bn
    ? `${user.upazila_name_bn}${user.upazila_code ? ` (${user.upazila_code})` : ''}`
    : '';
  const parts = [upazila, user?.district_name_bn || '', withDivision ? user?.division_name_bn || '' : ''].filter(Boolean);
  return parts.length ? `${OFFICE_NAME}, ${parts.join(', ')}${withDivision ? ` · ${DEPARTMENT_NAME}` : ''}` : OFFICE_NAME;
};

export interface BackButtonProps {
  onBack: () => void;
}

/** The one "go back to the dashboard" button: emerald tone, two-line label. */
export const BackButton: React.FC<BackButtonProps> = ({ onBack }) => (
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
      <span className="block text-[10px] text-emerald-300 font-semibold leading-tight">ব্যাকপেইজ</span>
      <span className="block text-xs sm:text-[13px] font-bold text-white leading-tight">ড্যাশবোর্ডে ফিরুন</span>
    </div>
  </button>
);

export interface SubAppHeaderProps {
  appNumber: number;
  title: string;
  onBack: () => void;
  currentUser?: UserSession;
  savedCount?: number;
  /** Defaults to `টি সংরক্ষিত`; pass `টি ফাইল` etc. to match the app's wording. */
  savedCountUnit?: string;
  /** Right-hand slot, e.g. a "নতুন ক্লেইম ফর্ম" button. */
  actions?: React.ReactNode;
}

export const SubAppHeader: React.FC<SubAppHeaderProps> = ({
  appNumber,
  title,
  onBack,
  currentUser,
  savedCount,
  savedCountUnit = 'টি সংরক্ষিত',
  actions,
}) => (
  <header className="sticky top-0 z-50 border-b border-slate-800/90 bg-[#0c1427]/95 backdrop-blur-md print:hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-3">
          <BackButton onBack={onBack} />

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-400/50 shadow-md shadow-emerald-950/40 shrink-0">
              <img src={dashboardLogo} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {appBadgeText(appNumber)}
                </span>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight">{title}</h1>
                {savedCount !== undefined && (
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {toBn(savedCount)} {savedCountUnit}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">{officeLine(currentUser)}</p>
            </div>
          </div>
        </div>

        {actions && <div className="flex items-center gap-2 self-end sm:self-auto">{actions}</div>}
      </div>
    </div>
  </header>
);

export interface SubAppFooterProps {
  appNumber: number;
  /** Short name in brackets, e.g. `ফেরতযোগ্য অগ্রিম উত্তোলন`. */
  appShortName: string;
  currentUser?: UserSession;
}

export const SubAppFooter: React.FC<SubAppFooterProps> = ({ appNumber, appShortName, currentUser }) => (
  <footer className="border-t border-slate-800/80 bg-[#0a0f1d] py-5 text-center text-xs text-slate-500 print:hidden">
    <div className="max-w-7xl mx-auto px-4 space-y-1.5">
      <p className="font-medium text-slate-400">
        {PORTAL_NAME} • {appBadgeText(appNumber)} ({appShortName})
      </p>
      <p className="text-[11px] text-slate-500">{officeLine(currentUser, true)}</p>
      <p className="text-[11px] text-slate-600">
        সর্বস্বত্ব সংরক্ষিত © ২০২৬ • সার্বক্ষণিক তদারকি ও প্রধান এডমিন: {ADMIN_NAME} • {VERSION_LABEL}
      </p>
      <p className="text-[11px] text-slate-600">
        যোগাযোগ:{' '}
        <a
          href={SUPPORT_LINK}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>WhatsApp+Mobile: {toBn(SUPPORT_PHONE)}</span>
        </a>
      </p>
    </div>
  </footer>
);
