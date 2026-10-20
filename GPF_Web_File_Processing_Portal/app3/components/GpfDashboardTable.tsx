import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
} from 'lucide-react';
import { GpfFinalFormData, FinalLockableFieldKey, FinalFieldLocks } from '../../src/types';
import {
  toBengaliDigits,
  numberToBengaliWords,
  calculateBengaliAge,
  calculatePrlDate
} from '../../src/utils/bengaliConverter';
import { LockToggle, FixedLockBadge } from '../../app-shared/ui/LockToggle';
import { LOCKED_FIELD_TOAST, LABELS } from '../../app-shared/ui/tokens';
import { DashboardActionBar } from '../../app-shared/ui/DashboardActionBar';
import type { ToastKind } from '../../app-shared/ui/Toast';

interface GpfDashboardTableProps {
  formData: GpfFinalFormData;
  onChange: (field: keyof GpfFinalFormData, value: string) => void;
  locks: FinalFieldLocks;
  onToggleLock: (field: FinalLockableFieldKey, lockState: boolean) => void;
  onAutoGenerateWords: () => void;
  onOpenPrintPreview?: () => void;
  onNewApplication?: () => void;
  onSaveRecord?: () => void;
  onOpenHtmlEditor?: () => void;
  onShowToast?: (text: string, kind?: ToastKind) => void;
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
  onOpenHtmlEditor,
  onShowToast,
}) => {
  const [showDesignationPopup, setShowDesignationPopup] = useState(false);

  const handleLockedFieldNotice = (fieldName: string) => {
    onShowToast?.(LOCKED_FIELD_TOAST.replace('{label}', fieldName), 'warning');
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
      <div className="flex items-center justify-center">
        <LockToggle
          id={`lock-btn-${fieldKey}`}
          isLocked={isLocked}
          onToggle={() => onToggleLock(fieldKey, !isLocked)}
        />
      </div>
    );
  };

  const calculatedAge = formData.birthDate ? calculateBengaliAge(formData.birthDate) : '';

  return (
    <div className="w-full bg-[#0e1628] border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden mb-8">
      

      {/* Main Table 16 Rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#060b17] text-slate-400 border-b border-[#182642] text-xs font-semibold">
              <th className="py-2.5 px-3 w-12 text-center">ক্র:</th>
              <th className="py-2.5 px-4 w-72">ফিল্ডের নাম</th>
              <th className="py-2.5 px-4">এখানে তথ্য ইনপুট দিন</th>
              <th className="py-2.5 px-3 w-32 text-center">{LABELS.lockColumn}</th>
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
                <div className="relative w-full max-w-xl flex items-center">
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
                <div className="flex items-center gap-2 w-full max-w-xl">
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
              </td>
              <td className="py-3 px-4">
                <div className="w-full max-w-xl relative">
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
                  className="w-full max-w-xl px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
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
                <div className="flex items-center gap-2 w-full max-w-xl relative">
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
                  className="w-full max-w-xl px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
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
                <div className="w-full max-w-xl space-y-2">
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
                  className="w-full max-w-xl px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-medium"
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
                <div className="relative w-full max-w-xl flex items-center">
                  <input
                    type="text"
                    value={formData.totalDepositedAmount}
                    onChange={(e) => onChange('totalDepositedAmount', e.target.value)}
                    placeholder="১২০০০০০"
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
                <div className="relative w-full max-w-xl flex items-center">
                  <input
                    type="text"
                    value={formData.requestedAmountNumber}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="১৪৮০০০০"
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
                  className="w-full max-w-xl px-3 py-1.5 bg-[#10192e] border border-[#1f3052] rounded-lg text-[#10b981] placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs sm:text-sm font-semibold"
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
                <div className="relative w-full max-w-xl flex items-center">
                  <input
                    type="text"
                    value={formData.basicSalary}
                    onChange={(e) => onChange('basicSalary', e.target.value)}
                    placeholder="৩৪৫০০"
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
                <div className="relative w-full max-w-xl flex items-center">
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
                <div className="relative w-full max-w-xl flex items-center">
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
                </div>
              </td>
              <td className="py-3 px-3">{renderLockCell('ddoDesignation')}</td>
            </tr>

            {/* ১৫. উপজেলার নাম */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">১৫</td>
              <td className="py-3 px-4 font-semibold text-white">
                উপজেলার নাম
                <span className="block text-[11px] font-normal text-slate-400">({LABELS.fixed})</span>
              </td>
              <td className="py-3 px-4">
                <div className="relative w-full max-w-xl flex items-center">
                  <input
                    type="text"
                    value={formData.upazila}
                    readOnly
                    placeholder="বিয়ানীবাজার"
                    title={`(${LABELS.fixed})`}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      locks.upazila
                        ? 'bg-[#091120] border border-emerald-500/40 text-emerald-100 cursor-not-allowed select-none pr-20'
                        : 'bg-[#10192e] border border-[#1f3052] text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                </div>
              </td>
              <td className="py-3 px-3"><FixedLockBadge /></td>
            </tr>

            {/* ১৬. জেলার নাম */}
            <tr className="hover:bg-[#0f1a33] transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-400">১৬</td>
              <td className="py-3 px-4 font-semibold text-white">
                জেলার নাম
                <span className="block text-[11px] font-normal text-slate-400">({LABELS.fixed})</span>
              </td>
              <td className="py-3 px-4">
                <div className="relative w-full max-w-xl flex items-center">
                  <input
                    type="text"
                    value={formData.district}
                    readOnly
                    placeholder="সিলেট"
                    title={`(${LABELS.fixed})`}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      locks.district
                        ? 'bg-[#091120] border border-emerald-500/40 text-emerald-100 cursor-not-allowed select-none pr-20'
                        : 'bg-[#10192e] border border-[#1f3052] text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                </div>
              </td>
              <td className="py-3 px-3"><FixedLockBadge /></td>
            </tr>

          </tbody>
        </table>
      </div>

      <DashboardActionBar
        note="লক করা রো-এর ডাটা আনলক না করা পর্যন্ত অপরিবর্তিত ও সুরক্ষিত থাকবে।"
        onSave={onSaveRecord}
        onNew={onNewApplication}
        onPrint={onOpenPrintPreview}
        onHtmlEdit={onOpenHtmlEditor}
      />
    </div>
  );
};
