import dashboardLogo from '../../src/assets/images/rafu.svg';
import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Sparkles, 
  Save, 
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GpfFinalFormData, FinalLockableFieldKey, FinalFieldLocks } from '../../src/types';
import {
  toBengaliDigits,
  numberToBengaliWords,
  calculateBengaliAge,
  calculatePrlDate
} from '../../src/utils/bengaliConverter';
import { LockToggleButton } from '../components/LockToggleButton';

interface GpfDashboardTableProps {
  formData: GpfFinalFormData;
  onChange: (field: keyof GpfFinalFormData, value: string) => void;
  locks: FinalFieldLocks;
  onToggleLock: (field: FinalLockableFieldKey, lockState: boolean) => void;
  onAutoGenerateWords: () => void;
  onOpenPrintPreview?: () => void;
  onNewApplication?: () => void;
  onSaveRecord?: () => void;
}

const DESIGNATION_PRESETS = [
  'সহকারী শিক্ষক (অবসরপ্রাপ্ত)',
  'প্রধান শিক্ষক (চ:দা:) (অবসরপ্রাপ্ত)',
  'প্রধান শিক্ষক (অবসরপ্রাপ্ত)',
];


export const GpfDashboardTable: React.FC<GpfDashboardTableProps> = ({
  formData,
  onChange,
  locks,
  onToggleLock,
  onOpenPrintPreview,
  onNewApplication,
  onSaveRecord,
}) => {
  const [showDesignationPopup, setShowDesignationPopup] = useState(false);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const handleLockedFieldNotice = (fieldName: string) => {
    setLockedNotice(`🔒 "${fieldName}" ফিল্ডটি লক করা আছে। তথ্য পরিবর্তন করতে ডানপাশে "লকড" বাটনে ক্লিক করে আনলক করুন।`);
    setTimeout(() => setLockedNotice(null), 4000);
  };

  // Set today's date in Bengali DD/MM/YYYY format
  const handleSetToday = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateFormatted = `${toBengaliDigits(day)}/${toBengaliDigits(month)}/${toBengaliDigits(year)}`;
    onChange('applicationDate', dateFormatted);
  };

  // Auto convert amount to Bengali words
  const handleAmountChange = (val: string) => {
    onChange('requestedAmountNumber', val);
    const words = numberToBengaliWords(val);
    if (words) {
      onChange('requestedAmountWords', words);
    }
  };

  // Render lock control column button
  const renderLockCell = (fieldKey: FinalLockableFieldKey) => {
    const isLocked = locks[fieldKey];
    return (
      <div className="flex items-center justify-center gap-1">
        <LockToggleButton
          action="lock"
          isLocked={isLocked}
          onClick={() => onToggleLock(fieldKey, true)}
          title={isLocked ? 'ফিল্ডটি লক করা আছে' : 'ফিল্ডটি লক করুন'}
        />
        <LockToggleButton
          action="unlock"
          isLocked={isLocked}
          onClick={() => onToggleLock(fieldKey, false)}
          title={isLocked ? 'ফিল্ডটি আনলক করুন' : 'ফিল্ডটি আনলক আছে'}
        />
      </div>
    );
  };

  const calculatedAge = formData.birthDate ? calculateBengaliAge(formData.birthDate) : '';

  return (
    <div className="w-full bg-[#0b1328] rounded-xl border border-[#1a2845] shadow-2xl overflow-hidden font-['Hind_Siliguri',sans-serif]">
      
      {/* Top Header Card matching image.png */}
      <div className="bg-[#080f20] px-4 sm:px-6 py-3.5 border-b border-[#182642] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-emerald-400/50 shadow-md shadow-emerald-950/40 shrink-0">
              <img src={dashboardLogo} alt="" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              জিপিএফ চূড়ান্ত উত্তোলন-ইনপুট ড্যাশবোর্ড
            </h2>
          </div>
        </div>
      </div>

      {/* Locked Data Protection Notice Banner */}
      {lockedNotice && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/50 px-4 py-2 flex items-center justify-between text-emerald-200 text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>{lockedNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setLockedNotice(null)}
            className="text-emerald-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Table 16 Rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#060b17] text-slate-400 border-b border-[#182642] text-xs font-semibold">
              <th className="py-2.5 px-3 w-12 text-center">ক্র:</th>
              <th className="py-2.5 px-4 w-72">ফিল্ডের নাম</th>
              <th className="py-2.5 px-4">এখানে তথ্য ইনপুট দিন</th>
              <th className="py-2.5 px-3 w-32 text-center">লক / আনলক</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#15223b] bg-[#0b1328] text-slate-200">
            
            {/* ১. সন */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">১</td>
              <td className="py-3 px-4 font-semibold text-white">
                সন
                <span className="block text-[11px] font-normal text-slate-400"></span>
              </td>
              <td className="py-3 px-4">
                <div className="relative max-w-lg flex items-center">
                  <input
                    type="text"
                    value={formData.yearSession}
                    readOnly={locks.yearSession}
                    onClick={() => locks.yearSession && handleLockedFieldNotice('সন')}
                    onChange={(e) => !locks.yearSession && onChange('yearSession', e.target.value)}
                    placeholder="২০২৬"
                    title={locks.yearSession ? 'এই ফিল্ডটি লক করা আছে (ডানপাশে আনলক বাটনে ক্লিক করুন)' : undefined}
                    className={`w-full pl-3 pr-28 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      locks.yearSession
                        ? 'bg-[#091120] border border-emerald-500/40 text-emerald-100 cursor-not-allowed select-none'
                        : 'bg-[#10192e] border border-[#1f3052] text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                  <div className="absolute right-2 flex items-center gap-1.5 pointer-events-none">
                    {locks.yearSession && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/40 font-semibold">
                        <Lock className="w-2.5 h-2.5" /> রক্ষিত
                      </span>
                    )}
                    {formData.yearSession && (
                      <span className="px-2 py-0.5 text-xs rounded bg-[#09152b] text-emerald-400 border border-emerald-500/30 font-semibold">
                        {toBengaliDigits(formData.yearSession)}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 px-3">{renderLockCell('yearSession')}</td>
            </tr>

            {/* ২. আবেদনের তারিখ */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">২</td>
              <td className="py-3 px-4 font-semibold text-white">
                আবেদনের তারিখ
                <span className="block text-[11px] font-normal text-slate-400">দিন/মাস/বছর</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 max-w-lg">
                  <input
                    type="text"
                    value={formData.applicationDate}
                    onChange={(e) => onChange('applicationDate', e.target.value)}
                    placeholder="২১/০৯/২০২৬"
                    className="flex-1 px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleSetToday}
                    className="px-3 py-1.5 bg-[#121d36] hover:bg-[#1a2a4c] text-slate-300 hover:text-white border border-[#233559] rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>আজকের তারিখ</span>
                  </button>
                </div>
              </td>
              <td className="py-3 px-3 text-center text-slate-500 font-bold">—</td>
            </tr>

            {/* ৩. প্রাপক */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">৩</td>
              <td className="py-3 px-4 font-semibold text-white">
                প্রাপক
                <span className="block text-[11px] font-normal text-emerald-400">(মাল্টি ডাটা এন্ট্রি / ড্রপডাউন সুবিধা)</span>
                {locks.recipient && (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded border border-emerald-600/40 bg-emerald-950/80 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                    <Lock className="h-3 w-3" /> লকড (সুরক্ষিত)
                  </span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="max-w-lg relative">
                  <textarea
                    rows={2}
                    value={formData.recipient}
                    readOnly={locks.recipient}
                    onClick={() => locks.recipient && handleLockedFieldNotice('প্রাপক')}
                    onChange={(e) => !locks.recipient && onChange('recipient', e.target.value)}
                    placeholder=""
                    title={locks.recipient ? 'এই ফিল্ডটি লক করা আছে (ডানপাশে আনলক বাটনে ক্লিক করুন)' : undefined}
                    className={`w-full px-3 py-2 rounded-lg text-sm resize-none leading-relaxed transition-all ${
                      locks.recipient
                        ? 'bg-emerald-950/25 border border-emerald-500/50 text-emerald-200 cursor-not-allowed select-none'
                        : 'bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                </div>
              </td>
              <td className="py-3 px-3">{renderLockCell('recipient')}</td>
            </tr>

            {/* ৪. আবেদনকারীর নাম */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">৪</td>
              <td className="py-3 px-4 font-semibold text-white">
                আবেদনকারীর নাম
              </td>
              <td className="py-3 px-4">
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => onChange('applicantName', e.target.value)}
                  placeholder=""
                  className="w-full max-w-lg px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
                />
              </td>
              <td className="py-3 px-3 text-center text-slate-500 font-bold">—</td>
            </tr>

            {/* ৫. পদবী */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">৫</td>
              <td className="py-3 px-4 font-semibold text-white">
                পদবী
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 max-w-lg relative">
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => onChange('designation', e.target.value)}
                    placeholder="প্রধান শিক্ষক (অবসরপ্রাপ্ত)"
                    className="flex-1 px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDesignationPopup(!showDesignationPopup)}
                    className="px-3 py-1.5 bg-[#121d36] hover:bg-[#1a2a4c] text-slate-300 hover:text-white border border-[#233559] rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>তালিকা</span>
                  </button>

                  {/* Designation popup */}
                  {showDesignationPopup && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-[#0d172e] border border-[#233559] rounded-lg shadow-2xl p-1.5 z-20 space-y-1">
                      {DESIGNATION_PRESETS.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            onChange('designation', item);
                            setShowDesignationPopup(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-[#182645] hover:text-emerald-300 rounded cursor-pointer transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-3 text-center text-slate-500 font-bold">—</td>
            </tr>

            {/* ৬. বিদ্যালয়ের নাম */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">৬</td>
              <td className="py-3 px-4 font-semibold text-white">
                বিদ্যালয়ের নাম
              </td>
              <td className="py-3 px-4">
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => onChange('schoolName', e.target.value)}
                  placeholder=""
                  className="w-full max-w-lg px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
                />
              </td>
              <td className="py-3 px-3 text-center text-slate-500 font-bold">—</td>
            </tr>

            {/* ৭. জন্ম তারিখ */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">৭</td>
              <td className="py-3 px-4 font-semibold text-white">
                জন্ম তারিখ
                <span className="block text-[11px] font-normal text-slate-400">বয়স ও পিআরএল যোগ্যতা প্রদর্শিত</span>
              </td>
              <td className="py-3 px-4">
                <div className="max-w-lg space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="text"
                      value={formData.birthDate}
                      onChange={(e) => {
                        const newBirthDate = e.target.value;
                        onChange('birthDate', newBirthDate);
                        const autoPrl = calculatePrlDate(newBirthDate);
                        if (autoPrl) {
                          onChange('prlDate', autoPrl);
                        }
                      }}
                      placeholder="দিন/মাস/সাল (যেমন: ১৫/০৭/১৯৬৫)"
                      className="flex-1 px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
                    />
                    {calculatedAge && (
                      <span className="px-2.5 py-1 text-xs rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-semibold shrink-0">
                        বয়স: {calculatedAge}
                      </span>
                    )}
                  </div>

                  {/* PRL এ গমনের তারিখ */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-[#182642]/60">
                    <label className="text-xs font-semibold text-emerald-400 whitespace-nowrap flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      PRL এ গমনের তারিখ:
                    </label>
                    <input
                      type="text"
                      value={formData.prlDate || calculatePrlDate(formData.birthDate) || ''}
                      onChange={(e) => onChange('prlDate', e.target.value)}
                      placeholder="৫৯ বছর যোগ হয়ে অটো পূরণ হবে"
                      className="flex-1 px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
                    />
                  </div>
                </div>
              </td>
              <td className="py-3 px-3 text-center text-slate-500 font-bold">—</td>
            </tr>

            {/* ৮. জিপিএফ হিসাব নং */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">৮</td>
              <td className="py-3 px-4 font-semibold text-white">
                জিপিএফ হিসাব নং
              </td>
              <td className="py-3 px-4">
                <input
                  type="text"
                  value={formData.gpfAccountNo}
                  onChange={(e) => onChange('gpfAccountNo', e.target.value)}
                  placeholder=""
                  className="w-full max-w-lg px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
                />
              </td>
              <td className="py-3 px-3 text-center text-slate-500 font-bold">—</td>
            </tr>

            {/* ৯. পূর্ববর্তী ৩০ শে জুনে জমাকৃত টাকার পরিমাণ */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">৯</td>
              <td className="py-3 px-4 font-semibold text-white">
                পূর্ববর্তী ৩০ শে জুনে জমাকৃত টাকার পরিমাণ
              </td>
              <td className="py-3 px-4">
                <div className="relative max-w-lg flex items-center">
                  <input
                    type="text"
                    value={formData.totalDepositedAmount}
                    onChange={(e) => onChange('totalDepositedAmount', e.target.value)}
                    placeholder="1200000"
                    className="w-full pl-3 pr-28 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
                  />
                  {formData.totalDepositedAmount && (
                    <span className="absolute right-2 px-2 py-0.5 text-xs rounded bg-[#09152b] text-emerald-400 border border-emerald-500/30 font-semibold pointer-events-none">
                      {toBengaliDigits(formData.totalDepositedAmount)} টাকা
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-3 text-center text-slate-500 font-bold">—</td>
            </tr>

            {/* ১০. প্রার্থীত টাকা (অংকে) */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">১০</td>
              <td className="py-3 px-4 font-semibold text-white">
                প্রার্থীত টাকা / চূড়ান্ত স্থিতি (অংকে)
              </td>
              <td className="py-3 px-4">
                <div className="relative max-w-lg flex items-center">
                  <input
                    type="text"
                    value={formData.requestedAmountNumber}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="1480000"
                    className="w-full pl-3 pr-28 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
                  />
                  {formData.requestedAmountNumber && (
                    <span className="absolute right-2 px-2 py-0.5 text-xs rounded bg-[#09152b] text-emerald-400 border border-emerald-500/30 font-semibold pointer-events-none">
                      {toBengaliDigits(formData.requestedAmountNumber)} টাকা
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-3 text-center text-slate-500 font-bold">—</td>
            </tr>

            {/* ১১. প্রার্থীত টাকা (কথায়) */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">১১</td>
              <td className="py-3 px-4 font-semibold text-white">
                প্রার্থীত টাকা (কথায়)
                <span className="block text-[11px] font-normal text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  অটো জেনারেট হবে
                </span>
              </td>
              <td className="py-3 px-4">
                <input
                  type="text"
                  value={formData.requestedAmountWords}
                  onChange={(e) => onChange('requestedAmountWords', e.target.value)}
                  placeholder="চৌদ্দ লক্ষ আশি হাজার টাকা মাত্র"
                  className="w-full max-w-lg px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-[#10b981] placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-semibold"
                />
              </td>
              <td className="py-3 px-3 text-center text-slate-500 font-bold">—</td>
            </tr>

            {/* ১২. বর্তমান মূল বেতন */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">১২</td>
              <td className="py-3 px-4 font-semibold text-white">
                বর্তমান / সর্বশেষ মূল বেতন
              </td>
              <td className="py-3 px-4">
                <div className="relative max-w-lg flex items-center">
                  <input
                    type="text"
                    value={formData.basicSalary}
                    onChange={(e) => onChange('basicSalary', e.target.value)}
                    placeholder="34500"
                    className="w-full pl-3 pr-28 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
                  />
                  {formData.basicSalary && (
                    <span className="absolute right-2 px-2 py-0.5 text-xs rounded bg-[#09152b] text-emerald-400 border border-emerald-500/30 font-semibold pointer-events-none">
                      {toBengaliDigits(formData.basicSalary)} টাকা
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-3 text-center text-slate-500 font-bold">—</td>
            </tr>

            {/* ১৩. আয়ন ব্যয়ন কর্মকর্তার নাম */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">১৩</td>
              <td className="py-3 px-4 font-semibold text-white">
                আয়ন ব্যয়ন কর্মকর্তার নাম
                <span className="block text-[11px] font-normal text-slate-400">(ডিডিও নাম - সবসময়)</span>
              </td>
              <td className="py-3 px-4">
                <div className="relative max-w-lg flex items-center">
                  <input
                    type="text"
                    value={formData.ddoName}
                    readOnly={locks.ddoName}
                    onClick={() => locks.ddoName && handleLockedFieldNotice('ডিডিও নাম')}
                    onChange={(e) => !locks.ddoName && onChange('ddoName', e.target.value)}
                    placeholder=""
                    title={locks.ddoName ? 'এই ফিল্ডটি লক করা আছে (ডানপাশে আনলক বাটনে ক্লিক করুন)' : undefined}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      locks.ddoName
                        ? 'bg-[#091120] border border-emerald-500/40 text-emerald-100 cursor-not-allowed select-none pr-20'
                        : 'bg-[#10192e] border border-[#1f3052] text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                  {locks.ddoName && (
                    <span className="absolute right-2 flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/40 font-semibold pointer-events-none">
                      <Lock className="w-2.5 h-2.5" /> রক্ষিত
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-3">{renderLockCell('ddoName')}</td>
            </tr>

            {/* ১৪. আয়ন ব্যয়ন কর্মকর্তার পদবী */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">১৪</td>
              <td className="py-3 px-4 font-semibold text-white">
                আয়ন ব্যয়ন কর্মকর্তার পদবী
                <span className="block text-[11px] font-normal text-slate-400">(সবসময়)</span>
              </td>
              <td className="py-3 px-4">
                <div className="relative max-w-lg flex items-center">
                  <input
                    type="text"
                    value={formData.ddoDesignation}
                    readOnly={locks.ddoDesignation}
                    onClick={() => locks.ddoDesignation && handleLockedFieldNotice('ডিডিও পদবী')}
                    onChange={(e) => !locks.ddoDesignation && onChange('ddoDesignation', e.target.value)}
                    placeholder=""
                    title={locks.ddoDesignation ? 'এই ফিল্ডটি লক করা আছে (ডানপাশে আনলক বাটনে ক্লিক করুন)' : undefined}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      locks.ddoDesignation
                        ? 'bg-[#091120] border border-emerald-500/40 text-emerald-100 cursor-not-allowed select-none pr-20'
                        : 'bg-[#10192e] border border-[#1f3052] text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                  {locks.ddoDesignation && (
                    <span className="absolute right-2 flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/40 font-semibold pointer-events-none">
                      <Lock className="w-2.5 h-2.5" /> রক্ষিত
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-3">{renderLockCell('ddoDesignation')}</td>
            </tr>

            {/* ১৫. উপজেলার নাম */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">১৫</td>
              <td className="py-3 px-4 font-semibold text-white">
                উপজেলার নাম
                <span className="block text-[11px] font-normal text-slate-400">(স্থায়ীভাবে ফিক্সড)</span>
              </td>
              <td className="py-3 px-4">
                <div className="relative max-w-lg flex items-center">
                  <input
                    type="text"
                    value={formData.upazila}
                    readOnly
                    placeholder="বিয়ানীবাজার"
                    title="উপজেলা আইডি খোলার সময় নিশ্চিত করা নাম — স্থায়ীভাবে ফিক্সড"
                    className={`w-full px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      locks.upazila
                        ? 'bg-[#091120] border border-emerald-500/40 text-emerald-100 cursor-not-allowed select-none pr-20'
                        : 'bg-[#10192e] border border-[#1f3052] text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                  {locks.upazila && (
                    <span className="absolute right-2 flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/40 font-semibold pointer-events-none">
                      <Lock className="w-2.5 h-2.5" /> রক্ষিত
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-3"><span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-300 whitespace-nowrap">
                    <Lock className="w-3.5 h-3.5" /> ফিক্সড
                  </span></td>
            </tr>

            {/* ১৬. জেলার নাম */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">১৬</td>
              <td className="py-3 px-4 font-semibold text-white">
                জেলার নাম
                <span className="block text-[11px] font-normal text-slate-400">(স্থায়ীভাবে ফিক্সড)</span>
              </td>
              <td className="py-3 px-4">
                <div className="relative max-w-lg flex items-center">
                  <input
                    type="text"
                    value={formData.district}
                    readOnly
                    placeholder="সিলেট"
                    title="উপজেলা আইডি খোলার সময় নিশ্চিত করা নাম — স্থায়ীভাবে ফিক্সড"
                    className={`w-full px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      locks.district
                        ? 'bg-[#091120] border border-emerald-500/40 text-emerald-100 cursor-not-allowed select-none pr-20'
                        : 'bg-[#10192e] border border-[#1f3052] text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                  {locks.district && (
                    <span className="absolute right-2 flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/40 font-semibold pointer-events-none">
                      <Lock className="w-2.5 h-2.5" /> রক্ষিত
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-3"><span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-300 whitespace-nowrap">
                    <Lock className="w-3.5 h-3.5" /> ফিক্সড
                  </span></td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* Bottom Footer Action Bar matching image.png */}
      <div className="bg-[#080f20] px-4 sm:px-6 py-3.5 border-t border-[#182642] flex flex-wrap items-center justify-between gap-3">
        
        {/* Left helper note */}
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>লক করা রো-এর ডাটা যে পর্যন্ত পুনরায় আনলক না করা হবে, সে পর্যন্ত অপরিবর্তিত ও সুরক্ষিত থাকবে।</span>
        </div>

        {/* Right Action button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onSaveRecord && (
            <button
              type="button"
              onClick={onSaveRecord}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-950/50 hover:scale-[1.02] active:scale-98"
            >
              <Save className="w-4 h-4 text-white" />
              <span>ডাটা সেইভ করুন</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
