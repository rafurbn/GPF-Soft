import React from 'react';
import { GpfFormData, LockedFieldsConfig, LockableFieldKey } from '../../src/types';
import { numberToBanglaWords, toBanglaDigits, cleanNumberString, formatBanglaCurrency } from '../../src/utils/numberToBanglaWords';
import { deriveFormData } from '../../src/utils/deriveFormData';
import {
  Lock,
  Unlock,
  Save,
  Sparkles,
  Calendar,
} from 'lucide-react';
import dashboardLogo from '../../src/assets/images/rafu.svg';
import { LockToggleButton } from './LockToggleButton';

interface InputFormTableProps {
  formData: GpfFormData;
  setFormData: React.Dispatch<React.SetStateAction<GpfFormData>>;
  lockedConfig: LockedFieldsConfig;
  toggleLock: (field: LockableFieldKey) => void;
  onSaveRecord: () => void;
  onResetUnlocked: () => void;
  onOpenPreview: () => void;
  onOpenHtmlEditor: () => void;
}

interface FormRowProps {
  /** Row number shown in the "ক্র: নং" column, e.g. '১' */
  index: string;
  /** Field label */
  label: React.ReactNode;
  /** Optional hint rendered under the label */
  hint?: string;
  /** Tailwind text color class for the hint */
  hintClassName?: string;
  /** Optional extra node rendered under the label (e.g. a "লকড" badge) */
  labelExtra?: React.ReactNode;
  /** The input/control markup for this row */
  children: React.ReactNode;
  /** Lock/unlock (or empty) cells */
  lockCells: React.ReactNode;
  /** Extra classes on the <tr> */
  rowClassName?: string;
}

const FormRow: React.FC<FormRowProps> = ({
  index,
  label,
  hint,
  hintClassName = 'text-slate-400',
  labelExtra,
  children,
  lockCells,
  rowClassName = '',
}) => (
  <tr className={`border-b border-slate-800/80 hover:bg-slate-900/40 transition-colors ${rowClassName}`}>
    <td className="bg-[#0c1427] text-emerald-400 font-bold text-center py-2.5 px-2 border-r border-slate-800 w-12">
      {index}
    </td>
    <td className="bg-[#0f182c] text-slate-200 font-medium py-2.5 px-3 sm:px-4 border-r border-slate-800">
      {hint || labelExtra ? (
        <div>
          <span>{label}</span>
          {hint && <p className={`text-[11px] ${hintClassName} font-normal mt-0.5`}>({hint})</p>}
          {labelExtra}
        </div>
      ) : (
        label
      )}
    </td>
    <td className="bg-[#080d1e] p-2 sm:p-2.5 border-r border-slate-800">{children}</td>
    {lockCells}
  </tr>
);

export const InputFormTable: React.FC<InputFormTableProps> = ({
  formData,
  setFormData,
  lockedConfig,
  toggleLock,
  onSaveRecord,
  onResetUnlocked,
  onOpenPreview,
  onOpenHtmlEditor,
}) => {
  // Field change handler
  const handleChange = (field: keyof GpfFormData, value: string) => {
    // Widened view of the lock config so any form field can be looked up safely
    // without an unsafe cast; non-lockable fields simply have no entry.
    const lockMap: Partial<Record<keyof GpfFormData, boolean>> = lockedConfig;

    // If the field is locked, do not allow changes unless unlocked
    if (lockMap[field]) {
      return;
    }
    setFormData((prev) => deriveFormData(prev, field, value));
  };

  // Formats a currency field as Bangla digits with separators on blur
  const handleCurrencyBlur = (
    field: 'requestedAmount' | 'gpfTotalBalance' | 'basicSalary'
  ) => {
    const current = formData[field];
    if (current) {
      const formatted = formatBanglaCurrency(current);
      if (formatted && formatted !== '০') {
        handleChange(field, formatted);
      }
    }
  };

  // Shared cell styling for the lock/unlock columns
  const cellClass = 'p-1.5 border border-slate-800 bg-[#0c1427] text-center';
  const emptyCellClass =
    'border border-slate-800 bg-[#0c1427]/60 w-24 text-center text-xs text-slate-600';

  // Renders the lock/unlock cells for a row.
  // - combined: renders both buttons inside one colSpan=2 cell
  // - lockedAlways: renders the "fixed" badge instead of buttons (permanently locked fields)
  const renderLockControls = (
    field: LockableFieldKey,
    { combined = false, lockedAlways = false }: { combined?: boolean; lockedAlways?: boolean } = {}
  ) => {
    const isLocked = lockedAlways || !!lockedConfig[field];

    if (lockedAlways) {
      return (
        <td colSpan={2} className={cellClass}>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-800/60 bg-emerald-900/40 px-3 py-1.5 text-xs font-semibold text-emerald-200 whitespace-nowrap">
            <Lock className="h-3.5 w-3.5" /> ফিক্সড
          </span>
        </td>
      );
    }

    if (combined) {
      return (
        <td colSpan={2} className={cellClass}>
          <div className="flex items-center justify-center gap-1">
            <LockToggleButton
              action="lock"
              isLocked={isLocked}
              onClick={() => toggleLock(field)}
              title="তথ্য লক করে সংরক্ষণ করুন"
            />
            <LockToggleButton
              action="unlock"
              isLocked={isLocked}
              onClick={() => toggleLock(field)}
              title="তথ্য পরিবর্তনের জন্য আনলক করুন"
            />
          </div>
        </td>
      );
    }

    return (
      <>
        {/* Lock Cell */}
        <td className={`${cellClass} w-24`}>
          <LockToggleButton
            action="lock"
            isLocked={isLocked}
            onClick={() => toggleLock(field)}
            title="তথ্য লক করে সংরক্ষণ করুন"
            fullWidth
          />
        </td>

        {/* Unlock Cell */}
        <td className={`${cellClass} w-24`}>
          <LockToggleButton
            action="unlock"
            isLocked={isLocked}
            onClick={() => toggleLock(field)}
            title="তথ্য পরিবর্তনের জন্য আনলক করুন"
            fullWidth
          />
        </td>
      </>
    );
  };

  // Empty Lock/Unlock cells for non-lockable rows
  const renderEmptyLockCells = () => (
    <>
      <td className={emptyCellClass}>—</td>
      <td className={emptyCellClass}>—</td>
    </>
  );

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden mb-8">
      {/* Top Action & Navigation Bar */}
      <div className="bg-slate-850 px-4 sm:px-6 py-3.5 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-emerald-400/50 shadow-md shadow-emerald-950/40 shrink-0">
            <img src={dashboardLogo} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              জিপিএফ ফেরতযোগ্য অগ্রিম উত্তোলন-ইনপুট ড্যাশবোর্ড
            </h2>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto p-2 sm:p-4 bg-[#080d1e]">
        <table className="w-full border-collapse text-sm border border-slate-800 rounded-xl overflow-hidden">
          {/* Main Title Row */}
          <thead>
            <tr>
              <th
                colSpan={5}
                className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-emerald-300 py-3.5 px-4 text-center text-base sm:text-lg font-bold tracking-wide border-b border-emerald-500/30"
              >
                জিপিএফ ফেরতযোগ্য অগ্রিম উত্তোলন-ইনপুট ড্যাশবোর্ড
              </th>
            </tr>
            {/* Header Columns */}
            <tr className="border-b border-slate-800 bg-[#0f172a]">
              <th className="bg-[#0f172a] text-slate-300 py-2.5 px-3 w-14 text-center font-bold text-xs sm:text-sm border-r border-slate-800">
                ক্র: নং
              </th>
              <th className="bg-[#0f172a] text-slate-300 py-2.5 px-4 w-72 sm:w-88 text-left font-bold text-xs sm:text-sm border-r border-slate-800">
                ফিল্ডের নাম
              </th>
              <th className="bg-[#0f172a] text-slate-300 py-2.5 px-4 text-left font-bold text-xs sm:text-sm border-r border-slate-800">
                এখানে তথ্য ইনপুট দিন
              </th>
              <th className="bg-[#0f172a] text-slate-300 py-2.5 px-2 w-24 text-center font-bold text-xs sm:text-sm border-r border-slate-800">
                লক
              </th>
              <th className="bg-[#0f172a] text-slate-300 py-2.5 px-2 w-24 text-center font-bold text-xs sm:text-sm">
                আনলক
              </th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">

            {/* ১। সন */}
            <FormRow
              index="১"
              label="সন"
              lockCells={renderLockControls('year')}
            >
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    readOnly={lockedConfig.year}
                    placeholder="2026"
                    className={`w-full max-w-sm rounded-lg px-3 py-1.5 border text-sm font-semibold focus:outline-hidden ${
                      lockedConfig.year
                        ? 'bg-amber-950/20 border-amber-500/50 text-amber-200 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                    }`}
                  />
                  {lockedConfig.year && (
                    <span className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2.5 py-0.5 rounded-lg font-medium whitespace-nowrap">
                      লক করা আছে
                    </span>
                  )}
                </div>
            </FormRow>

            {/* ২। আবেদনের তারিখ */}
            <FormRow
              index="২"
              label="আবেদনের তারিখ"
              lockCells={renderEmptyLockCells()}
            >
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.applyDate}
                    onChange={(e) => handleChange('applyDate', e.target.value)}
                    placeholder="যেমন: ২২/০৯/২০২৪"
                    className="w-full max-w-sm rounded-lg px-3 py-1.5 text-white bg-slate-950 border border-slate-700 focus:border-emerald-500 text-sm font-semibold focus:outline-hidden placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const d = String(today.getDate()).padStart(2, '0');
                      const m = String(today.getMonth() + 1).padStart(2, '0');
                      const y = today.getFullYear();
                      handleChange('applyDate', toBanglaDigits(`${d}/${m}/${y}`));
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center space-x-1"
                  >
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    <span>আজকের তারিখ</span>
                  </button>
                </div>
            </FormRow>

            {/* ৩। প্রাপক (মাল্টি ডাটা এন্ট্রির সুযোগ থাকবে) */}
            <FormRow
              index="৩"
              label="প্রাপক"
              hint="মাল্টি ডাটা এন্ট্রি / ড্রপডাউন সুবিধা"
              hintClassName="text-emerald-400 leading-tight"
              labelExtra={
                lockedConfig.receiverInfo ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2 py-0.5 rounded mt-1.5 font-medium">
                    <Lock className="w-3 h-3" /> লকড (সুরক্ষিত)
                  </span>
                ) : null
              }
              lockCells={renderLockControls('receiverInfo', { combined: true })}
            >
                <div className="space-y-2">
                  <textarea
                    id="input-receiver-info"
                    rows={2}
                    value={formData.receiverInfo}
                    onChange={(e) => handleChange('receiverInfo', e.target.value)}
                    readOnly={lockedConfig.receiverInfo}
                    placeholder=""
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      lockedConfig.receiverInfo
                        ? 'bg-emerald-950/25 border border-emerald-500/50 text-emerald-200 cursor-not-allowed select-none'
                        : 'bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500'
                    }`}
                  />
                  {lockedConfig.receiverInfo && (
                    <p className="text-[11px] text-emerald-400/80 italic">
                      তথ্য পরিবর্তন করতে ডানের 'আনলক' বাটনে ক্লিক করুন।
                    </p>
                  )}
                </div>
            </FormRow>

            {/* ৪। আবেদনকারীর নাম */}
            <FormRow
              index="৪"
              label="আবেদনকারীর নাম"
              lockCells={renderEmptyLockCells()}
            >
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => handleChange('applicantName', e.target.value)}
                  placeholder=""
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
                />
            </FormRow>

            {/* ৫। পদবী */}
            <FormRow
              index="৫"
              label="পদবী"
              lockCells={renderEmptyLockCells()}
            >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => handleChange('designation', e.target.value)}
                    placeholder="যেমন: সহকারী শিক্ষক / প্রধান শিক্ষক"
                    className="flex-1 min-w-[200px] bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
                  />
                  <div className="flex gap-1.5">
                    {['সহকারী শিক্ষক', 'প্রধান শিক্ষক'].map((desig) => (
                      <button
                        key={desig}
                        type="button"
                        onClick={() => handleChange('designation', desig)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                          formData.designation === desig
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-850 hover:bg-slate-750 text-slate-300 border-slate-700'
                        }`}
                      >
                        {desig}
                      </button>
                    ))}
                  </div>
                </div>
            </FormRow>

            {/* ৬। বিদ্যালয়ের নাম */}
            <FormRow
              index="৬"
              label="বিদ্যালয়ের নাম"
              lockCells={renderEmptyLockCells()}
            >
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => handleChange('schoolName', e.target.value)}
                    placeholder="যেমন: কুড়ার বাজার সরকারি প্রাথমিক বিদ্যালয়"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
                  />
            </FormRow>

            {/* ৭। জিপিএফ হিসাব নং */}
            <FormRow
              index="৭"
              label="জিপিএফ হিসাব নং"
              lockCells={renderEmptyLockCells()}
            >
                <input
                  type="text"
                  value={formData.gpfAccNo}
                  onChange={(e) => handleChange('gpfAccNo', toBanglaDigits(e.target.value))}
                  placeholder=""
                  className="w-full max-w-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
                />
            </FormRow>

            {/* ৮। পূর্ববর্তী ৩০ শে জুনে জমাকৃত টাকার পরিমাণ */}
            <FormRow
              index="৮"
              label="পূর্ববর্তী ৩০ শে জুনে জমাকৃত টাকার পরিমাণ"
              lockCells={renderEmptyLockCells()}
            >
                <div className="relative max-w-sm">
                  <input
                    type="text"
                    value={formData.gpfTotalBalance}
                    onChange={(e) => handleChange('gpfTotalBalance', e.target.value)}
                    onBlur={() => handleCurrencyBlur('gpfTotalBalance')}
                    placeholder=""
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs font-semibold text-slate-500">টাকা</span>
                </div>
            </FormRow>

            {/* ৯। প্রার্থীত টাকা (অংকে) */}
            <FormRow
              index="৯"
              label={
                <span className="flex items-center space-x-1">
                  <span>প্রার্থীত টাকা (অংকে)</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                </span>
              }
              lockCells={renderEmptyLockCells()}
              rowClassName="bg-emerald-50/20"
            >
                <div className="relative max-w-sm">
                  <input
                    type="text"
                    value={formData.requestedAmount}
                    onChange={(e) => handleChange('requestedAmount', e.target.value)}
                    onBlur={() => handleCurrencyBlur('requestedAmount')}
                    placeholder=""
                    className="w-full bg-slate-950 border-2 border-emerald-500/80 rounded-lg px-3 py-1.5 text-emerald-400 font-bold focus:outline-hidden text-sm placeholder-slate-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-emerald-700">টাকা</span>
                </div>
            </FormRow>

            {/* ১০। প্রার্থীত টাকা (কথায়) */}
            <FormRow
              index="১০"
              label="প্রার্থীত টাকা (কথায়)"
              lockCells={renderEmptyLockCells()}
            >
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.requestedAmountWords}
                    onChange={(e) => handleChange('requestedAmountWords', e.target.value)}
                    placeholder="যেমন: এক লক্ষ পঞ্চাশ হাজার টাকা মাত্র"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const words = numberToBanglaWords(formData.requestedAmount);
                      if (words) handleChange('requestedAmountWords', words);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-400 border border-emerald-300 rounded text-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    পুনরায় তৈরি
                  </button>
                </div>
            </FormRow>

            {/* ১১। বর্তমান মূল বেতন */}
            <FormRow
                index="১১"
                label="বর্তমান মূল বেতন"
                lockCells={renderEmptyLockCells()}
            >
                  <div className="relative max-w-sm">
                    <input
                      type="text"
                      value={formData.basicSalary}
                      onChange={(e) => handleChange('basicSalary', e.target.value)}
                      onBlur={() => handleCurrencyBlur('basicSalary')}
                      placeholder="যেমন: ২৪,২২০"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-bold"
                    />
                    <span className="absolute right-3 top-2 text-xs font-semibold text-slate-500">টাকা</span>
                  </div>
            </FormRow>

            {/* ১২। অগ্রিমটি কততম */}
            <FormRow
                index="১২"
                label="অগ্রিমটি কততম"
                hint="১ম কিস্তি/২য় কিস্তি/৩য় কিস্তি"
                lockCells={renderEmptyLockCells()}
            >
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={formData.installmentNo}
                      onChange={(e) => handleChange('installmentNo', e.target.value)}
                      placeholder="যেমন: ১ম কিস্তি"
                      className="w-40 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
                    />
                    <div className="flex gap-1.5">
                      {['১ম কিস্তি', '২য় কিস্তি', '৩য় কিস্তি'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleChange('installmentNo', opt)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                            formData.installmentNo === opt
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-850 hover:bg-slate-750 text-slate-300 border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
            </FormRow>

            {/* ১৩। পূর্বে কি কোন অগ্রিম লওয়া হইয়াছিল? */}
            <FormRow
              index="১৩"
              label="পূর্বে কি কোন অগ্রিম লওয়া হইয়াছিল?"
              hint="হ্যাঁ/না/প্রযোজ্য নয়"
              lockCells={renderEmptyLockCells()}
            >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={formData.hasPreviousLoan}
                    onChange={(e) => handleChange('hasPreviousLoan', e.target.value)}
                    placeholder="যেমন: না / হ্যাঁ / প্রযোজ্য নয়"
                    className="w-36 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
                  />
                  <div className="flex gap-1.5">
                    {['না', 'হ্যাঁ', 'প্রযোজ্য নয়'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('hasPreviousLoan', opt)}
                        className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                          formData.hasPreviousLoan === opt
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-850 hover:bg-slate-750 text-slate-300 border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
            </FormRow>

            {/* ১৪। যদি হইয়া থাকে, সব টাকা পরিশোধ করা হইয়াছে কি? */}
            <FormRow
              index="১৪"
              label="যদি হইয়া থাকে, সব টাকা পরিশোধ করা হইয়াছে কি?"
              hint="হ্যাঁ/না/প্রযোজ্য নয়"
              lockCells={renderEmptyLockCells()}
            >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={formData.isPreviousLoanRepaid}
                    onChange={(e) => handleChange('isPreviousLoanRepaid', e.target.value)}
                    placeholder="যেমন: প্রযোজ্য নয় / হ্যাঁ / না"
                    className="w-36 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
                  />
                  <div className="flex gap-1.5">
                    {['প্রযোজ্য নয়', 'হ্যাঁ', 'না'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('isPreviousLoanRepaid', opt)}
                        className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                          formData.isPreviousLoanRepaid === opt
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-850 hover:bg-slate-750 text-slate-300 border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
            </FormRow>

            {/* ১৫। যদি হইয়া থাকে শেষ কিস্তি কোন সময়ে দেওয়া হইয়াছিল? */}
            <FormRow
              index="১৫"
              label="যদি হইয়া থাকে শেষ কিস্তি কোন সময়ে দেওয়া হইয়াছিল?"
              hint="প্রযোজ্য নয়/মাস ও সন এন্ট্রির অপশন"
              lockCells={renderEmptyLockCells()}
            >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={formData.lastInstallmentDate}
                    onChange={(e) => handleChange('lastInstallmentDate', e.target.value)}
                    placeholder="যেমন: প্রযোজ্য নয় অথবা জুন ২০২৪"
                    className="flex-1 max-w-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('lastInstallmentDate', 'প্রযোজ্য নয়')}
                    className={`px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                      formData.lastInstallmentDate === 'প্রযোজ্য নয়'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-850 hover:bg-slate-750 text-slate-300 border-slate-700'
                    }`}
                  >
                    প্রযোজ্য নয়
                  </button>
                </div>
            </FormRow>

            {/* ১৬। পূর্বের অগ্রিম পরিশোধ না হইয়া থাকিলে কত কিস্তি প্রদেয় আছে? */}
            <FormRow
              index="১৬"
              label="পূর্বের অগ্রিম পরিশোধ না হইয়া থাকিলে কত কিস্তি প্রদেয় আছে?"
              hint="প্রযোজ্য নয়/রাইটিং অপশন"
              lockCells={renderEmptyLockCells()}
            >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={formData.remainingInstallments}
                    onChange={(e) => handleChange('remainingInstallments', e.target.value)}
                    placeholder="যেমন: প্রযোজ্য নয় অথবা ১২ কিস্তি"
                    className="flex-1 max-w-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('remainingInstallments', 'প্রযোজ্য নয়')}
                    className={`px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                      formData.remainingInstallments === 'প্রযোজ্য নয়'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-850 hover:bg-slate-750 text-slate-300 border-slate-700'
                    }`}
                  >
                    প্রযোজ্য নয়
                  </button>
                </div>
            </FormRow>

            {/* ১৭। আয়ন ব্যয়ন কর্মকর্তার নাম */}
            <FormRow
              index="১৭"
              label="আয়ন ব্যয়ন কর্মকর্তার নাম"
              lockCells={renderLockControls('ddoName')}
            >
                  <input
                    type="text"
                    value={formData.ddoName}
                    onChange={(e) => handleChange('ddoName', e.target.value)}
                    readOnly={lockedConfig.ddoName}
                    placeholder=""
                    className={`w-full max-w-sm rounded-lg px-3 py-1.5 border text-sm font-semibold focus:outline-hidden ${
                      lockedConfig.ddoName
                        ? 'bg-amber-950/20 border-amber-500/50 text-amber-200 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                    }`}
                  />
            </FormRow>

            {/* ১৮। আয়ন ব্যয়ন কর্মকর্তার পদবী */}
            <FormRow
              index="১৮"
              label="আয়ন ব্যয়ন কর্মকর্তার পদবী"
              lockCells={renderLockControls('ddoDesignation')}
            >
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={formData.ddoDesignation}
                      onChange={(e) => handleChange('ddoDesignation', e.target.value)}
                      readOnly={lockedConfig.ddoDesignation}
                      placeholder=""
                      className={`flex-1 min-w-[200px] rounded-lg px-3 py-1.5 border text-sm font-semibold focus:outline-hidden ${
                        lockedConfig.ddoDesignation
                          ? 'bg-amber-950/20 border-amber-500/50 text-amber-200 cursor-not-allowed'
                          : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                      }`}
                    />
                    {!lockedConfig.ddoDesignation && (
                      <div className="flex gap-1.5">
                        {['উপজেলা প্রাথমিক শিক্ষা অফিসার', 'জেলা প্রাথমিক শিক্ষা অফিসার'].map((des) => (
                          <button
                            key={des}
                            type="button"
                            onClick={() => handleChange('ddoDesignation', des)}
                            className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                                formData.ddoDesignation === des
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-slate-850 hover:bg-slate-750 text-slate-300 border-slate-700'
                            }`}
                          >
                            {des}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
            </FormRow>

            {/* ১৯। উপজেলার নাম */}
            <FormRow
              index="১৯"
              label="উপজেলার নাম"
              hint="উপজেলা আইডি খোলার সময় নিশ্চিত করা নাম স্থায়ীভাবে ফিক্সড"
              lockCells={renderLockControls('upazilaName', { lockedAlways: true })}
            >
                  <input
                    type="text"
                    value={formData.upazilaName}
                    readOnly
                    placeholder="যেমন: বিয়ানীবাজার"
                    className="w-full max-w-sm rounded-lg px-3 py-1.5 border text-sm font-semibold focus:outline-hidden bg-emerald-950/20 border-emerald-700/50 text-emerald-200 placeholder-slate-500 cursor-not-allowed select-none"
                  />
            </FormRow>

            {/* ২০। জেলার নাম */}
            <FormRow
              index="২০"
              label="জেলার নাম"
              hint="উপজেলা আইডি খোলার সময় নিশ্চিত করা নাম স্থায়ীভাবে ফিক্সড"
              lockCells={renderLockControls('districtName', { lockedAlways: true })}
            >
                  <input
                    type="text"
                    value={formData.districtName}
                    readOnly
                    placeholder="যেমন: সিলেট"
                    className="w-full max-w-sm rounded-lg px-3 py-1.5 border text-sm font-semibold focus:outline-hidden bg-emerald-950/20 border-emerald-700/50 text-emerald-200 placeholder-slate-500 cursor-not-allowed select-none"
                  />
            </FormRow>

          </tbody>
        </table>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="bg-[#0b1329] border-t border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Save className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">আবেদন ডাটা সংরক্ষণ</span>
            <p className="text-xs text-slate-400">
              ২০টি রো-তে তথ্য ইনপুট সম্পন্ন হলে ডাটা সেইভ করুন
            </p>
          </div>
        </div>

        {/* Action Button: Only Save Data button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveRecord}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer hover:scale-102 active:scale-98"
            title="রেকর্ড সংরক্ষণ করুন"
          >
            <Save className="w-4 h-4" />
            <span>ডাটা সেইভ করুন</span>
          </button>
        </div>
      </div>

    </div>
  );
};
