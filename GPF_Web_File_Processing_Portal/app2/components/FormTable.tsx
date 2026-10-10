import React, { useEffect, useState } from 'react';
import { Lock, Unlock, CheckCircle2, Save, Sparkles } from 'lucide-react';
import { GpfNonRefundableFormData, NonRefundableLockableKey, NonRefundableLockedState } from '../../src/types';
import { numberToBanglaWords, toBanglaNumber } from '../../src/utils/numberToBanglaWords';
import { calculateAge } from '../../src/utils/dateUtils';
import dashboardLogo from '../../src/assets/images/rafu.svg';
import { LockToggleButton } from '../components/LockToggleButton';

interface FormTableProps {
  formData: GpfNonRefundableFormData;
  onChange: (field: keyof GpfNonRefundableFormData, value: string) => void;
  lockedState: NonRefundableLockedState;
  onToggleLock: (field: NonRefundableLockableKey) => void;
  onSave: () => void;
  onReset: () => void;
  onPreview?: () => void;
  onPrint: () => void;
  isEditingExisting?: boolean;
}

const DESIGNATION_PRESETS = [
  'সহকারী শিক্ষক',
  'প্রধান শিক্ষক (চ:দা:)',
  'প্রধান শিক্ষক',
];

export const FormTable: React.FC<FormTableProps> = ({
  formData,
  onChange,
  lockedState,
  onToggleLock,
  onSave,
  onReset,
  onPreview,
  onPrint,
  isEditingExisting = false,
}) => {
  const [manualWordsEdit, setManualWordsEdit] = useState(false);
  const [showDesignationPresets, setShowDesignationPresets] = useState(false);

  // Auto-generate words when requested_amount changes
  useEffect(() => {
    if (!manualWordsEdit && formData.requested_amount) {
      const generatedWords = numberToBanglaWords(formData.requested_amount);
      if (generatedWords) {
        onChange('gpf_total_balance_words', generatedWords);
      }
    }
  }, [formData.requested_amount, manualWordsEdit]);

  const ageInfo = calculateAge(formData.date_of_birth, formData.apply_date);

  const renderLockBtn = (field: NonRefundableLockableKey) => {
    const isLocked = !!lockedState[field];
    return (
      <div className="flex items-center justify-center gap-1">
        {/* লক বাটন */}
        <LockToggleButton
          action="lock"
          id={`lock-btn-${field}`}
          isLocked={isLocked}
          onClick={() => onToggleLock(field)}
          title={isLocked ? 'ফিল্ডটি লক করা রয়েছে' : 'এই ফিল্ডের তথ্য স্থায়ীভাবে লক করুন'}
        />

        {/* আনলক বাটন */}
        <LockToggleButton
          action="unlock"
          id={`unlock-btn-${field}`}
          isLocked={isLocked}
          onClick={() => onToggleLock(field)}
          title={!isLocked ? 'ফিল্ডটি আনলক রয়েছে' : 'তথ্য পরিবর্তন করতে আনলক করুন'}
        />
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden" id="input-dashboard-section">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-4 border-b border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-emerald-400/50 shadow-md shadow-emerald-950/40 shrink-0">
                <img src={dashboardLogo} alt="" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                জিপিএফ অফেরতযোগ্য অগ্রিম উত্তোলন - ইনপুট ড্যাশবোর্ড
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-950/80 text-slate-300 text-xs uppercase tracking-wider border-b border-slate-800">
              <th className="py-3 px-4 w-14 text-center font-semibold">ক্র:</th>
              <th className="py-3 px-4 w-60 md:w-72 font-semibold">ফিল্ডের নাম</th>
              <th className="py-3 px-4 font-semibold">এখানে তথ্য ইনপুট দিন</th>
              <th className="py-3 px-4 w-28 md:w-36 text-center font-semibold">লক / আনলক</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {/* 1. সন (Year) */}
            <tr className={`hover:bg-slate-800/30 transition-colors ${lockedState.year ? 'bg-emerald-950/10' : ''}`}>
              <td className="py-3 px-4 text-center font-semibold text-slate-400">১</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                <span>সন</span>
                <span className="block text-[11px] text-slate-500">অর্থবছর বা আবেদনের বছর</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 max-w-xs">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      id="input-year"
                      value={formData.year}
                      readOnly={lockedState.year}
                      onChange={(e) => onChange('year', e.target.value)}
                      placeholder="২০২৬ বা 2026"
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        lockedState.year
                          ? 'bg-emerald-950/25 border border-emerald-500/50 text-emerald-200 cursor-not-allowed select-none'
                          : 'bg-slate-950 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500'
                      }`}
                    />
                    {formData.year && !lockedState.year && (
                      <span className="absolute right-3 top-2.5 text-xs text-emerald-400 font-mono">
                        {toBanglaNumber(formData.year)}
                      </span>
                    )}
                  </div>
                  {lockedState.year && (
                    <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2 py-1 rounded flex items-center gap-1 font-medium whitespace-nowrap">
                      <Lock className="w-3 h-3" /> লকড
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                {renderLockBtn('year')}
              </td>
            </tr>

            {/* 2. আবেদনের তারিখ */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 text-center font-semibold text-slate-400">২</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                <span>আবেদনের তারিখ</span>
                <span className="block text-[11px] text-slate-500">দিন/মাস/বছর</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    id="input-apply-date"
                    value={formData.apply_date}
                    onChange={(e) => onChange('apply_date', e.target.value)}
                    placeholder="যেমন: ২০/০৯/২০২৬ বা 20-09-2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-500 text-sm"
                  />
                  <button
                    type="button"
                    id="btn-set-today-date"
                    onClick={() => {
                      const d = new Date();
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const year = d.getFullYear();
                      onChange('apply_date', `${toBanglaNumber(day)}/${toBanglaNumber(month)}/${toBanglaNumber(year)}`);
                    }}
                    className="px-2.5 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg whitespace-nowrap border border-slate-700 cursor-pointer"
                  >
                    আজকের তারিখ
                  </button>
                </div>
              </td>
              <td className="py-3 px-4 text-center text-xs text-slate-600">—</td>
            </tr>

            {/* 3. প্রাপক (Receiver) - Multi data entry */}
            <tr className={`hover:bg-slate-800/30 transition-colors ${lockedState.receiver_info ? 'bg-emerald-950/10' : ''}`}>
              <td className="py-3 px-4 text-center font-semibold text-slate-400 align-top pt-4">৩</td>
              <td className="py-3 px-4 font-medium text-slate-200 align-top pt-4">
                <span>প্রাপক</span>
                <span className="block text-[11px] text-emerald-400 font-normal">
                  (মাল্টি ডাটা এন্ট্রি / ড্রপডাউন সুবিধা)
                </span>
                {lockedState.receiver_info && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2 py-0.5 rounded mt-1.5 font-medium">
                    <Lock className="w-3 h-3" /> লকড (সুরক্ষিত)
                  </span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="space-y-2">
                  <div className="relative">
                    <textarea
                      id="input-receiver-info"
                      rows={2}
                      value={formData.receiver_info}
                      readOnly={lockedState.receiver_info}
                      onChange={(e) => onChange('receiver_info', e.target.value)}
                      placeholder=""
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        lockedState.receiver_info
                          ? 'bg-emerald-950/25 border border-emerald-500/50 text-emerald-200 cursor-not-allowed select-none'
                          : 'bg-slate-950 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  {/* প্রাপক প্রিসেট বাছাই অপশন বাদ দেওয়া হয়েছে */}
                </div>
              </td>
              <td className="py-3 px-4 text-center align-top pt-4">
                {renderLockBtn('receiver_info')}
              </td>
            </tr>

            {/* 4. আবেদনকারীর নাম */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 text-center font-semibold text-slate-400">৪</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                আবেদনকারীর নাম
              </td>
              <td className="py-3 px-4">
                <input
                  type="text"
                  id="input-applicant-name"
                  value={formData.applicant_name}
                  onChange={(e) => onChange('applicant_name', e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-500 text-sm"
                />
              </td>
              <td className="py-3 px-4 text-center text-xs text-slate-600">—</td>
            </tr>

            {/* 5. পদবী */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 text-center font-semibold text-slate-400">৫</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                পদবী
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="input-designation"
                    value={formData.designation}
                    onChange={(e) => onChange('designation', e.target.value)}
                    placeholder="যেমন: সহকারী শিক্ষক / প্রধান শিক্ষক"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-500 text-sm"
                  />
                  <div className="relative">
                    <button
                      type="button"
                      id="btn-designation-dropdown"
                      onClick={() => setShowDesignationPresets(!showDesignationPresets)}
                      className="px-2.5 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 whitespace-nowrap cursor-pointer"
                    >
                      তালিকা
                    </button>
                    {showDesignationPresets && (
                      <div className="absolute right-0 z-20 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 text-xs">
                        {DESIGNATION_PRESETS.map((p, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              onChange('designation', p);
                              setShowDesignationPresets(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 cursor-pointer"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-center text-xs text-slate-600">—</td>
            </tr>

            {/* 6. বিদ্যালয়ের নাম */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 text-center font-semibold text-slate-400">৬</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                বিদ্যালয়ের নাম
              </td>
              <td className="py-3 px-4">
                <input
                  type="text"
                  id="input-school-name"
                  value={formData.school_name}
                  onChange={(e) => onChange('school_name', e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-500 text-sm"
                />
              </td>
              <td className="py-3 px-4 text-center text-xs text-slate-600">—</td>
            </tr>

            {/* 7. জন্ম তারিখ */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 text-center font-semibold text-slate-400">৭</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                <span>জন্ম তারিখ</span>
                <span className="block text-[11px] text-slate-500">বয়স স্বয়ংক্রিয়ভাবে গণনা হবে</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="relative max-w-xs w-full">
                    <input
                      type="text"
                      id="input-dob"
                      value={formData.date_of_birth}
                      onChange={(e) => onChange('date_of_birth', e.target.value)}
                      placeholder="যেমন: 02/01/1970 বা 02-01-1970"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-500 text-sm"
                    />
                  </div>

                  {formData.date_of_birth && ageInfo.years > 0 && (
                    <div className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                      ageInfo.isOver52
                        ? 'bg-emerald-950/60 border border-emerald-600/40 text-emerald-300'
                        : 'bg-rose-950/60 border border-rose-600/40 text-rose-300'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{ageInfo.text}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center text-xs text-slate-600">—</td>
            </tr>

            {/* 8. জিপিএফ হিসাব নং */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 text-center font-semibold text-slate-400">৮</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                জিপিএফ হিসাব নং
              </td>
              <td className="py-3 px-4">
                <input
                  type="text"
                  id="input-gpf-acc-no"
                  value={formData.gpf_acc_no}
                  onChange={(e) => onChange('gpf_acc_no', e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-500 text-sm font-mono"
                />
              </td>
              <td className="py-3 px-4 text-center text-xs text-slate-600">—</td>
            </tr>

            {/* 9. পূর্ববর্তী ৩০ শে জুনে জমাকৃত টাকার পরিমাণ */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 text-center font-semibold text-slate-400">৯</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                পূর্ববর্তী ৩০ শে জুনে জমাকৃত টাকার পরিমাণ
              </td>
              <td className="py-3 px-4">
                <div className="relative max-w-sm">
                  <input
                    type="text"
                    id="input-gpf-total-balance"
                    value={formData.gpf_total_balance}
                    onChange={(e) => onChange('gpf_total_balance', e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-500 text-sm font-mono"
                  />
                  {formData.gpf_total_balance && (
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                      {toBanglaNumber(formData.gpf_total_balance)} টাকা
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center text-xs text-slate-600">—</td>
            </tr>

            {/* 10. প্রার্থীত টাকা (অংকে) */}
            <tr className="hover:bg-slate-800/30 transition-colors bg-emerald-950/10">
              <td className="py-3 px-4 text-center font-semibold text-emerald-400">১০</td>
              <td className="py-3 px-4 font-semibold text-emerald-200">
                প্রার্থীত টাকা (অংকে)
              </td>
              <td className="py-3 px-4">
                <div className="relative max-w-sm">
                  <input
                    type="text"
                    id="input-requested-amount"
                    value={formData.requested_amount}
                    onChange={(e) => onChange('requested_amount', e.target.value)}
                    placeholder="যেমন: 500000"
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-700/60 rounded-lg text-emerald-300 focus:outline-hidden focus:border-emerald-400 text-base font-bold font-mono"
                  />
                  {formData.requested_amount && (
                    <span className="absolute right-3 top-2.5 text-xs text-emerald-400 font-mono">
                      {toBanglaNumber(formData.requested_amount)} টাকা
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center text-xs text-slate-600">—</td>
            </tr>

            {/* 11. প্রার্থীত টাকা (কথায়) */}
            <tr className="hover:bg-slate-800/30 transition-colors bg-emerald-950/20">
              <td className="py-3 px-4 text-center font-semibold text-emerald-400">১১</td>
              <td className="py-3 px-4 font-semibold text-emerald-200">
                <span>প্রার্থীত টাকা (কথায়)</span>
                <span className="block text-[11px] text-emerald-400 font-normal flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> অটো জেনারেট হবে
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="input-gpf-total-balance-words"
                    value={formData.gpf_total_balance_words}
                    onChange={(e) => {
                      setManualWordsEdit(true);
                      onChange('gpf_total_balance_words', e.target.value);
                    }}
                    placeholder="অটো জেনারেট হবে (যেমন: পাঁচ লক্ষ টাকা মাত্র)"
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-600/50 rounded-lg text-emerald-300 focus:outline-hidden focus:border-emerald-400 text-sm font-semibold"
                  />
                  {manualWordsEdit && (
                    <button
                      type="button"
                      id="btn-re-autogenerate-words"
                      onClick={() => {
                        setManualWordsEdit(false);
                        const w = numberToBanglaWords(formData.requested_amount);
                        onChange('gpf_total_balance_words', w);
                      }}
                      className="px-2 py-1.5 text-xs text-emerald-400 hover:text-emerald-200 bg-slate-800 rounded border border-slate-700 whitespace-nowrap cursor-pointer"
                      title="পুনরায় অটো জেনারেট করুন"
                    >
                      অটো
                    </button>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center text-xs text-slate-600">—</td>
            </tr>

            {/* 12. বর্তমান মূল বেতন */}
            <tr className="hover:bg-slate-800/30 transition-colors">
              <td className="py-3 px-4 text-center font-semibold text-slate-400">১২</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                বর্তমান মূল বেতন
              </td>
              <td className="py-3 px-4">
                <div className="relative max-w-sm">
                  <input
                    type="text"
                    id="input-basic-salary"
                    value={formData.basic_salary}
                    onChange={(e) => onChange('basic_salary', e.target.value)}
                    placeholder="যেমন: 24220"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-500 text-sm font-mono"
                  />
                  {formData.basic_salary && (
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                      {toBanglaNumber(formData.basic_salary)} টাকা
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center text-xs text-slate-600">—</td>
            </tr>

            {/* 13. আয়ন ব্যয়ন কর্মকর্তার নাম */}
            <tr className={`hover:bg-slate-800/30 transition-colors ${lockedState.ddo_name ? 'bg-emerald-950/10' : ''}`}>
              <td className="py-3 px-4 text-center font-semibold text-slate-400">১৩</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                <span>আয়ন ব্যয়ন কর্মকর্তার নাম</span>
                <span className="block text-[11px] text-slate-500">(ডিডিও নাম - লকযোগ্য)</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    id="input-ddo-name"
                    value={formData.ddo_name}
                    readOnly={lockedState.ddo_name}
                    onChange={(e) => onChange('ddo_name', e.target.value)}
                    placeholder=""
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      lockedState.ddo_name
                        ? 'bg-emerald-950/25 border border-emerald-500/50 text-emerald-200 cursor-not-allowed select-none'
                        : 'bg-slate-950 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                  {lockedState.ddo_name && (
                    <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2 py-1 rounded flex items-center gap-1 font-medium whitespace-nowrap">
                      <Lock className="w-3 h-3" /> লকড
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                {renderLockBtn('ddo_name')}
              </td>
            </tr>

            {/* 14. আয়ন ব্যয়ন কর্মকর্তার পদবী */}
            <tr className={`hover:bg-slate-800/30 transition-colors ${lockedState.ddo_designation ? 'bg-emerald-950/10' : ''}`}>
              <td className="py-3 px-4 text-center font-semibold text-slate-400">১৪</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                <span>আয়ন ব্যয়ন কর্মকর্তার পদবী</span>
                <span className="block text-[11px] text-slate-500">(লকযোগ্য)</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    id="input-ddo-designation"
                    value={formData.ddo_designation}
                    readOnly={lockedState.ddo_designation}
                    onChange={(e) => onChange('ddo_designation', e.target.value)}
                    placeholder=""
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      lockedState.ddo_designation
                        ? 'bg-emerald-950/25 border border-emerald-500/50 text-emerald-200 cursor-not-allowed select-none'
                        : 'bg-slate-950 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                  {lockedState.ddo_designation && (
                    <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2 py-1 rounded flex items-center gap-1 font-medium whitespace-nowrap">
                      <Lock className="w-3 h-3" /> লকড
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                {renderLockBtn('ddo_designation')}
              </td>
            </tr>

            {/* 15. উপজেলার নাম */}
            <tr className={`hover:bg-slate-800/30 transition-colors ${lockedState.upazila_name ? 'bg-emerald-950/10' : ''}`}>
              <td className="py-3 px-4 text-center font-semibold text-slate-400">১৫</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                <span>উপজেলার নাম</span>
                <span className="block text-[11px] text-slate-500">(স্থায়ীভাবে ফিক্সড)</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    id="input-upazila-name"
                    value={formData.upazila_name}
                    readOnly={lockedState.upazila_name}
                    onChange={(e) => onChange('upazila_name', e.target.value)}
                    placeholder="যেমন: বিয়ানীবাজার"
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      lockedState.upazila_name
                        ? 'bg-emerald-950/25 border border-emerald-500/50 text-emerald-200 cursor-not-allowed select-none'
                        : 'bg-slate-950 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                  {lockedState.upazila_name && (
                    <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2 py-1 rounded flex items-center gap-1 font-medium whitespace-nowrap">
                      <Lock className="w-3 h-3" /> লকড
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/50 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-300 whitespace-nowrap">
                  <Lock className="w-3.5 h-3.5" /> ফিক্সড
                </span>
              </td>
            </tr>

            {/* 16. জেলার নাম */}
            <tr className={`hover:bg-slate-800/30 transition-colors ${lockedState.district_name ? 'bg-emerald-950/10' : ''}`}>
              <td className="py-3 px-4 text-center font-semibold text-slate-400">১৬</td>
              <td className="py-3 px-4 font-medium text-slate-200">
                <span>জেলার নাম</span>
                <span className="block text-[11px] text-slate-500">(স্থায়ীভাবে ফিক্সড)</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    id="input-district-name"
                    value={formData.district_name}
                    readOnly={lockedState.district_name}
                    onChange={(e) => onChange('district_name', e.target.value)}
                    placeholder="যেমন: সিলেট"
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      lockedState.district_name
                        ? 'bg-emerald-950/25 border border-emerald-500/50 text-emerald-200 cursor-not-allowed select-none'
                        : 'bg-slate-950 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                  {lockedState.district_name && (
                    <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2 py-1 rounded flex items-center gap-1 font-medium whitespace-nowrap">
                      <Lock className="w-3 h-3" /> লকড
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/50 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-300 whitespace-nowrap">
                  <Lock className="w-3.5 h-3.5" /> ফিক্সড
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer action bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>লক করা ফিল্ডসমূহ পরবর্তী যেকোনো নতুন আবেদনের জন্য সংরক্ষিত থাকবে।</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-save-record"
            onClick={onSave}
            className="px-6 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-all shadow-md shadow-emerald-900/30 cursor-pointer hover:scale-102 active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>{isEditingExisting ? 'ডাটা আপডেট করুন' : 'ডাটা সেইভ করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
