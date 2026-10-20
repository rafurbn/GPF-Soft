import React, { useState, useEffect } from 'react';
import { money, toBn } from '../../src/lib/format';
import { numberToBengaliWords } from '../../src/utils/bengaliConverter';
import { normaliseBengaliDate, normaliseBengaliInput, parseBengaliNumber } from '../utils/bengaliInput';
import {
  GpfDeathClaim,
  LockSettings,
  DesignationType,
  RelationshipType,
  LockableField,
} from '../types/gpf';
import { Sparkles, PlusCircle } from 'lucide-react';
import { LockToggle, FixedLockBadge } from '../../app-shared/ui/LockToggle';
import { DashboardActionBar } from '../../app-shared/ui/DashboardActionBar';
import { TodayDateButton } from '../../app-shared/ui/TodayDateButton';
import type { ToastKind } from '../../app-shared/ui/Toast';
import { LABELS } from '../../app-shared/ui/tokens';
import { lockFieldProps, useLockedFieldNotice } from '../../app-shared/ui/lockedField';
import { getCurrentBengaliDate } from '../../src/utils/dateUtils';

interface FormRowProps {
  /** Row number shown in the "ক্র: নং" column, e.g. '১' */
  index: string;
  label: React.ReactNode;
  hint?: string;
  hintClassName?: string;
  children: React.ReactNode;
  lockCells: React.ReactNode;
  rowClassName?: string;
}

const FormRow: React.FC<FormRowProps> = ({
  index,
  label,
  hint,
  hintClassName = 'text-slate-400',
  children,
  lockCells,
  rowClassName = '',
}) => (
  <tr className={`border-b border-slate-800/80 hover:bg-slate-900/40 transition-colors ${rowClassName}`}>
    <td className="bg-[#0c1427] text-emerald-400 font-bold text-center py-2.5 px-2 border-r border-slate-800 w-12">
      {index}
    </td>
    <td className="bg-[#0f182c] text-slate-200 font-medium py-2.5 px-3 sm:px-4 border-r border-slate-800">
      {hint ? (
        <div>
          <span>{label}</span>
          <p className={`text-[11px] ${hintClassName} font-normal mt-0.5`}>({hint})</p>
        </div>
      ) : (
        label
      )}
    </td>
    <td className="bg-[#080d1e] p-2 sm:p-2.5 border-r border-slate-800">{children}</td>
    {lockCells}
  </tr>
);

interface DeathClaimFormProps {
  initialData?: GpfDeathClaim | null;
  lockSettings: LockSettings;
  onToggleLock: (field: LockableField) => void;
  onSaveClaim: (
    claimData: Omit<GpfDeathClaim, 'id' | 'serialNo' | 'createdAt' | 'updatedAt'>,
    forceNew?: boolean
  ) => void;
  onReset: () => void;
  onShowToast: (text: string, kind?: ToastKind) => void;
  isEditing?: boolean;
}

export const DeathClaimForm: React.FC<DeathClaimFormProps> = ({
  initialData,
  lockSettings,
  onToggleLock,
  onSaveClaim,
  onReset,
  onShowToast,
  isEditing = false,
}) => {
    // 1. সন: 2026, 2027, 2028
  const [year, setYear] = useState<string>(toBn(initialData?.year || '২০২৬'));
  
  // 2. আবেদনের তারিখ
  const [applicationDate, setApplicationDate] = useState<string>(
    initialData?.applicationDate ? normaliseBengaliDate(initialData.applicationDate) : getCurrentBengaliDate()
  );
  
  // 3. প্রাপক: একাধিক লাইনে লেখাযোগ্য ফিল্ড
  const [recipient, setRecipient] = useState<string>(
    initialData?.recipient || ''
  );
  
  // 4. মৃত কর্মচারীর নাম
  const [deceasedEmployeeName, setDeceasedEmployeeName] = useState<string>(
    initialData?.deceasedEmployeeName || ''
  );
  
  // 5. মৃত কর্মচারীর পদবী: প্রাক্তন সহকারী শিক্ষক, প্রাক্তন প্রধান শিক্ষক(চ:দা:) ও প্রাক্তন প্রধান শিক্ষক
  const [deceasedDesignation, setDeceasedDesignation] = useState<DesignationType>(
    initialData?.deceasedDesignation || 'প্রাক্তন সহকারী শিক্ষক'
  );

  // 6. মৃত কর্মচারীর বিদ্যালয়ের নাম
  const [schoolName, setSchoolName] = useState<string>(initialData?.schoolName || '');

  // 7. মৃত্যুর তারিখ
  const [deathDate, setDeathDate] = useState<string>(
    initialData?.deathDate ? normaliseBengaliDate(initialData.deathDate) : ''
  );

  // 8. আবেদনকারীর নাম
  const [applicantName, setApplicantName] = useState<string>(initialData?.applicantName || '');

  // 9. মৃত কর্মচারীর সাথে সম্পর্ক
  const [relationship, setRelationship] = useState<RelationshipType>(
    initialData?.relationship || 'স্ত্রী'
  );

  // 10. জিপিএফ হিসাব নং
  const [gpfAccountNo, setGpfAccountNo] = useState<string>(
    initialData?.gpfAccountNo ? toBn(initialData.gpfAccountNo) : ''
  );

  // 11. জমাকৃত টাকার পরিমাণ
  const [depositedAmount, setDepositedAmount] = useState<string>(
    initialData?.depositedAmount ? toBn(String(initialData.depositedAmount)) : ''
  );

  // 12. জমাকৃত টাকা (কথায়)
  const [depositedAmountInWords, setDepositedAmountInWords] = useState<string>(
    initialData?.depositedAmountInWords || ''
  );

  // 13. আয়ন ব্যয়ন কর্মকর্তার নাম
  const [ddoName, setDdoName] = useState<string>(initialData?.ddoName || '');

  // 14. আয়ন ব্যয়ন কর্মকর্তার পদবী
  const [ddoDesignation, setDdoDesignation] = useState<string>(
    initialData?.ddoDesignation || ''
  );

  // 15. উপজেলার নাম
  const [upazilaName, setUpazilaName] = useState<string>(initialData?.upazilaName || '');

  // 16. জেলার নাম
  const [districtName, setDistrictName] = useState<string>(initialData?.districtName || '');

  // 17. সংযুক্তি: শুধুমাত্র ০১(এক) খানা ও ০২(দুই) খানা
  const [attachmentsCount, setAttachmentsCount] = useState<string>(
    initialData?.attachmentsCount ? toBn(initialData.attachmentsCount) : '০২(দুই) খানা'
  );

  // Template variables
  const [sanctionMemoNo, setSanctionMemoNo] = useState<string>(
    initialData?.sanctionMemoNo ? toBn(initialData.sanctionMemoNo) : ''
  );
  const [sanctionDate, setSanctionDate] = useState<string>(
    initialData?.sanctionDate ? normaliseBengaliDate(initialData.sanctionDate) : ''
  );
  const [forwardingMemoNo, setForwardingMemoNo] = useState<string>(
    initialData?.forwardingMemoNo ? toBn(initialData.forwardingMemoNo) : ''
  );
  const [forwardingDate, setForwardingDate] = useState<string>(
    initialData?.forwardingDate ? normaliseBengaliDate(initialData.forwardingDate) : ''
  );
  const [lastDeductionAmount, setLastDeductionAmount] = useState<string>(
    initialData?.lastDeductionAmount ? toBn(String(initialData.lastDeductionAmount)) : ''
  );
  const [lastVoucherNo, setLastVoucherNo] = useState<string>(
    initialData?.lastVoucherNo ? toBn(initialData.lastVoucherNo) : ''
  );
  const [treasuryOffice, setTreasuryOffice] = useState<string>(
    initialData?.treasuryOffice || ''
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize when initialData changes.
  useEffect(() => {
    if (initialData) {
      setYear(toBn(initialData.year || '২০২৬'));
      setApplicationDate(normaliseBengaliDate(initialData.applicationDate || getCurrentBengaliDate()));
      setRecipient(initialData.recipient || '');
      setDeceasedEmployeeName(initialData.deceasedEmployeeName || '');
      setDeceasedDesignation(initialData.deceasedDesignation || 'প্রাক্তন সহকারী শিক্ষক');
      setSchoolName(initialData.schoolName || '');
      setDeathDate(normaliseBengaliDate(initialData.deathDate || ''));
      setApplicantName(initialData.applicantName || '');
      setRelationship(initialData.relationship || 'স্ত্রী');
      setGpfAccountNo(toBn(initialData.gpfAccountNo || ''));
      // A saved claim with no amount reads as blank, not as ০.
      setDepositedAmount(initialData.depositedAmount ? toBn(String(initialData.depositedAmount)) : '');
      setDepositedAmountInWords(
        initialData.depositedAmountInWords ||
          (initialData.depositedAmount ? numberToBengaliWords(initialData.depositedAmount) : '')
      );
      setDdoName(initialData.ddoName || '');
      setDdoDesignation(initialData.ddoDesignation || '');
      setUpazilaName(initialData.upazilaName || '');
      setDistrictName(initialData.districtName || '');
      setAttachmentsCount(
        initialData.attachmentsCount ? toBn(initialData.attachmentsCount) : '০২(দুই) খানা'
      );
      setSanctionMemoNo(initialData.sanctionMemoNo ? toBn(initialData.sanctionMemoNo) : '');
      setSanctionDate(initialData.sanctionDate ? normaliseBengaliDate(initialData.sanctionDate) : '');
      setForwardingMemoNo(initialData.forwardingMemoNo ? toBn(initialData.forwardingMemoNo) : '');
      setForwardingDate(initialData.forwardingDate ? normaliseBengaliDate(initialData.forwardingDate) : '');
      setLastDeductionAmount(initialData.lastDeductionAmount ? toBn(String(initialData.lastDeductionAmount)) : '');
      setLastVoucherNo(initialData.lastVoucherNo ? toBn(initialData.lastVoucherNo) : '');
      setTreasuryOffice(initialData.treasuryOffice || '');
    }
  }, [initialData]);

  // Auto-generate words when deposited amount changes.
  const handleAmountChange = (val: string) => {
    const bengaliValue = normaliseBengaliInput(val.replace(/[^0-9০-৯./,]/g, ''));
    setDepositedAmount(bengaliValue);
    if (!bengaliValue || bengaliValue.trim() === '') {
      setDepositedAmountInWords('');
      return;
    }
    const words = numberToBengaliWords(bengaliValue);
    setDepositedAmountInWords(words);
  };

  // Same normalisation for the last-deduction amount (Bengali digits).
  const handleLastDeductionChange = (val: string) => {
    setLastDeductionAmount(normaliseBengaliInput(val.replace(/[^0-9০-৯.,]/g, '')));
  };

  const getFormDataObject = (): Omit<GpfDeathClaim, 'id' | 'serialNo' | 'createdAt' | 'updatedAt'> => {
    const depAmountNum = parseBengaliNumber(depositedAmount);
    const lastDedNum = parseBengaliNumber(lastDeductionAmount);

    return {
      year: toBn(year) || '২০২৬',
      applicationDate: normaliseBengaliDate(applicationDate),
      recipient,
      deceasedEmployeeName: deceasedEmployeeName.trim(),
      deceasedDesignation,
      schoolName: schoolName.trim(),
      deathDate: normaliseBengaliDate(deathDate),
      applicantName: applicantName.trim(),
      relationship,
      gpfAccountNo: toBn(gpfAccountNo),
      depositedAmount: depAmountNum,
      depositedAmountInWords: depositedAmountInWords || numberToBengaliWords(depAmountNum),
      ddoName,
      ddoDesignation,
      upazilaName,
      districtName,
      attachmentsCount: toBn(attachmentsCount) === '০১(এক) খানা' ? '০১(এক) খানা' : '০২(দুই) খানা',
      sanctionMemoNo: sanctionMemoNo ? toBn(sanctionMemoNo) : '',
      sanctionDate: sanctionDate ? normaliseBengaliDate(sanctionDate) : '',
      forwardingMemoNo: forwardingMemoNo ? toBn(forwardingMemoNo) : '',
      forwardingDate: forwardingDate ? normaliseBengaliDate(forwardingDate) : '',
      lastDeductionAmount: lastDedNum,
      lastVoucherNo: lastVoucherNo ? toBn(lastVoucherNo) : '',
      treasuryOffice,
      status: initialData?.status || 'খসড়া',
    };
  };

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!deceasedEmployeeName || !applicantName || !schoolName || !gpfAccountNo) {
      onShowToast('অনুগ্রহ করে মৃত কর্মচারীর নাম, বিদ্যালয়, আবেদনকারী ও জিপিএফ হিসাব নম্বর পূরণ করুন।', 'error');
      return;
    }

    onSaveClaim(getFormDataObject());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Designation options
  const designationOptions: DesignationType[] = [
    'প্রাক্তন সহকারী শিক্ষক',
    'প্রাক্তন প্রধান শিক্ষক(চ:দা:)',
    'প্রাক্তন প্রধান শিক্ষক',
  ];

  // Relationship options
  const relationshipOptions: RelationshipType[] = [
    'স্ত্রী',
    'স্বামী',
    'পুত্র',
    'কন্যা',
    'মাতা',
    'পিতা',
    'আইনগত উত্তরাধিকারী',
  ];

  // Attachment options: strictly 01(এক) খানা and 02(দুই) খানা
  const attachmentOptions = ['০১(এক) খানা', '০২(দুই) খানা'];

  // Year quick options
  const yearOptions = ['2026', '2027', '2028', '2029', '2030'];

  // Shared cell styling for the lock/unlock columns, matching app1/app2/app3.
  const cellClass = 'p-1.5 border border-slate-800 bg-[#0c1427] text-center';
  const emptyCellClass =
    'border border-slate-800 bg-[#0c1427]/60 w-24 text-center text-xs text-slate-600';

  // One lock cell per row: a single toggle, or the fixed badge for the field names
  // that come from the upazila session. The header keeps colSpan=2, so the table
  // is exactly as wide as it was with the old two-button pair.
  const renderLockControls = (
    field: LockableField,
    { lockedAlways = false }: { lockedAlways?: boolean } = {},
  ) => (
    <td colSpan={2} className={cellClass}>
      {lockedAlways ? (
        <FixedLockBadge />
      ) : (
        <LockToggle
          id={`lock-btn-${field}`}
          isLocked={!!lockSettings[field]}
          onToggle={() => onToggleLock(field)}
          fullWidth
        />
      )}
    </td>
  );

  // Empty lock cell for a row that cannot be locked
  const renderEmptyLockCells = () => <td colSpan={2} className={emptyCellClass}>—</td>;

  // Locked-input styling: completely disables cursor, caret and selection
  const fieldClass = (locked: boolean) =>
    `w-full max-w-sm rounded-lg px-3 py-1.5 border text-sm font-semibold focus:outline-hidden transition-colors ${
      locked
        ? 'bg-emerald-950/25 border-emerald-500/50 text-emerald-200 cursor-not-allowed select-none'
        : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
    }`;

  const noticeLocked = useLockedFieldNotice(onShowToast);

  return (
    <div className="bg-[#0e1628] border border-slate-800/90 rounded-2xl shadow-2xl print:hidden">
      {/* Entry-mode strip — the page title and logo live in SubAppHeader only */}
      <div className="px-5 py-3 border-b border-emerald-900/50 flex items-center gap-2">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {isEditing ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold animate-pulse">
                  সম্পাদনা মোড
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  নতুন এন্ট্রি মোড
                </span>
              )}
        </h2>
      </div>

      {/* Main Table Form */}
      <form onSubmit={handleSave}>
        <div className="p-2 sm:p-4 bg-[#080d1e]">
        <table className="w-full border-collapse text-sm border border-slate-800 rounded-xl">
          <thead className="shadow-md">
            <tr>
              <th
                colSpan={5}
                className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-emerald-300 py-3 px-4 text-center text-sm sm:text-base font-bold tracking-wide border-b border-emerald-500/30"
              >
                জিপিএফ মৃত্যুদাবী নিষ্পত্তি-ইনপুট ড্যাশবোর্ড
              </th>
            </tr>
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
              <th colSpan={2} className="bg-[#0f172a] text-slate-300 py-2.5 px-2 w-48 text-center font-bold text-xs sm:text-sm">
                {LABELS.lockColumn}
              </th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">
          {/* Row 1: সন */}
          <FormRow index="১" label="সন" hint="২০২৬, ২০২৭, ২০২৮" lockCells={renderLockControls('year')}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(normaliseBengaliInput(e.target.value.replace(/[^0-9০-৯]/g, '')))}
                {...lockFieldProps(lockSettings.year, 'সন', noticeLocked)}
                placeholder="২০২৬"
                className={fieldClass(lockSettings.year)}
              />            </div>
          </FormRow>

          {/* Row 2: আবেদনের তারিখ */}
          <FormRow index="২" label="আবেদনের তারিখ" hint="দাখিলের তারিখ (যেমন: ১৬/০৩/২০২৬)" lockCells={renderEmptyLockCells()}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={applicationDate}
                onChange={(e) => setApplicationDate(normaliseBengaliInput(e.target.value))}
                onBlur={(e) => setApplicationDate(normaliseBengaliDate(e.target.value))}
                placeholder="১৬/০৩/২০২৬"
                className="w-full max-w-sm rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
              />
              <TodayDateButton onPick={(v) => setApplicationDate(v)} />
            </div>
          </FormRow>

          {/* Row 3: প্রাপক (মাল্টি-লাইন) */}
          <FormRow
            index="৩"
            label="প্রাপক"
            hint="মাল্টি ডাটা এন্ট্রি / ড্রপডাউন সুবিধা"
            hintClassName="text-emerald-400 leading-tight"
            lockCells={renderLockControls('recipient')}
          >
            <textarea
              rows={2}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              {...lockFieldProps(lockSettings.recipient, 'প্রাপক', noticeLocked)}
              placeholder={`উপজেলা হিসাবরক্ষণ কর্মকর্তা\n${upazilaName}, ${districtName}।`}
              className={`w-full rounded-lg px-3 py-2 text-sm ${
                lockSettings.recipient
                  ? 'bg-emerald-950/25 border border-emerald-500/50 text-emerald-200 cursor-not-allowed select-none'
                  : 'bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500'
              }`}
            />
          </FormRow>

          {/* Row 4: মৃত কর্মচারীর নাম */}
          <FormRow index="৪" label={<>মৃত কর্মচারীর নাম <span className="text-rose-400">*</span></>} hint="মরহুম শিক্ষক বা কর্মচারীর পূর্ণ নাম" lockCells={renderEmptyLockCells()}>
            <input
              type="text"
              value={deceasedEmployeeName}
              onChange={(e) => setDeceasedEmployeeName(e.target.value)}
              placeholder="মোঃ আন্দালিব"
              required
              className="w-full max-w-sm rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
            />
          </FormRow>

          {/* Row 5: মৃত কর্মচারীর পদবী */}
          <FormRow index="৫" label={<>মৃত কর্মচারীর পদবী <span className="text-rose-400">*</span></>} hint="পদবী নির্বাচন করুন" hintClassName="text-teal-400/90" lockCells={renderEmptyLockCells()}>
            <div className="flex flex-wrap gap-2 items-center">
              {designationOptions.map((desig) => (
                <button
                  key={desig}
                  type="button"
                  onClick={() => setDeceasedDesignation(desig)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-colors cursor-pointer ${
                    deceasedDesignation === desig
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {desig}
                </button>
              ))}
            </div>
          </FormRow>

          {/* Row 6: মৃত কর্মচারীর বিদ্যালয়ের নাম */}
          <FormRow index="৬" label={<>মৃত কর্মচারীর বিদ্যালয়ের নাম <span className="text-rose-400">*</span></>} hint="কর্মস্থলের নাম (সরকারি প্রাথমিক বিদ্যালয়)" lockCells={renderEmptyLockCells()}>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="খাসা সরকারি প্রাথমিক বিদ্যালয়"
              required
              className="w-full max-w-sm rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
            />
          </FormRow>

          {/* Row 7: মৃত্যুর তারিখ */}
          <FormRow index="৭" label={<>মৃত্যুর তারিখ <span className="text-rose-400">*</span></>} hint="মৃত্যুর সনদপত্র অনুযায়ী তারিখ" lockCells={renderEmptyLockCells()}>
            <input
              type="text"
              inputMode="numeric"
              value={deathDate}
              onChange={(e) => setDeathDate(normaliseBengaliInput(e.target.value))}
              onBlur={(e) => setDeathDate(normaliseBengaliDate(e.target.value))}
              placeholder="১৬/০৩/২০২৬"
              required
              className="w-full max-w-sm rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
            />
          </FormRow>

          {/* Row 8: আবেদনকারীর নাম */}
          <FormRow index="৮" label={<>আবেদনকারীর নাম <span className="text-rose-400">*</span></>} hint="মনোনীত ব্যক্তি / বৈধ ওয়ারিশের নাম" lockCells={renderEmptyLockCells()}>
            <input
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="মোছাঃ মনজুদা বেগম"
              required
              className="w-full max-w-sm rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
            />
          </FormRow>

          {/* Row 9: মৃত কর্মচারীর সাথে সম্পর্ক */}
          <FormRow index="৯" label={<>মৃত কর্মচারীর সাথে সম্পর্ক <span className="text-rose-400">*</span></>} hint="স্বামী/স্ত্রী" hintClassName="text-teal-400/90" lockCells={renderEmptyLockCells()}>
            <div className="flex flex-wrap gap-1.5 items-center">
              {relationshipOptions.map((rel) => (
                <button
                  key={rel}
                  type="button"
                  onClick={() => setRelationship(rel)}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold border transition-colors cursor-pointer ${
                    relationship === rel
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </FormRow>

          {/* Row 10: জিপিএফ হিসাব নং */}
          <FormRow index="১০" label={<>জিপিএফ হিসাব নং <span className="text-rose-400">*</span></>} hint="সাধারণ ভবিষ্যৎ তহবিল নম্বর" lockCells={renderEmptyLockCells()}>
            <input
              type="text"
              inputMode="numeric"
              value={gpfAccountNo}
              onChange={(e) => setGpfAccountNo(normaliseBengaliInput(e.target.value.replace(/[^0-9০-৯]/g, '')))}
              placeholder="১৩৬৮"
              required
              className="w-full max-w-sm rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
            />
          </FormRow>

          {/* Row 11: জমাকৃত টাকার পরিমাণ (পূর্ববর্তী ৩০শে জুন বাদ ও ১২ নং রো বাদ দিয়ে এটি মূল টাকার ফিল্ড) */}
          <FormRow index="১১" label={<>জমাকৃত টাকার পরিমাণ <span className="text-rose-400">*</span></>} hint="মোট জমাকৃত/উত্তোলনযোগ্য অর্থ (অংকে)" hintClassName="text-teal-400" lockCells={renderEmptyLockCells()}>
            <div className="space-y-1">
              <div className="relative max-w-sm">
                <input
                  type="text"
                  inputMode="numeric"
                  value={depositedAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="৩০০০০০"
                  required
                  className="w-full rounded-lg px-3 py-1.5 pl-8 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-bold"
                />
                <span className="absolute left-2.5 top-1.5 text-xs font-semibold text-slate-400">৳</span>
              </div>
              {depositedAmount && (
                <div className="text-[11px] text-teal-400 flex items-center gap-1 font-semibold">
                  <span>৳ {money(depositedAmount)} টাকা</span>
                </div>
              )}
            </div>
          </FormRow>

          {/* Row 12: জমাকৃত টাকা (কথায়) - অটো জেনারেট */}
          <FormRow
            index="১২"
            label={<span className="flex items-center gap-1.5">জমাকৃত টাকা (কথায়) <Sparkles className="w-3.5 h-3.5 text-emerald-400" /></span>}
            hint="অটো জেনারেট হবে পয়সাসহ"
            hintClassName="text-emerald-400/90"
            lockCells={renderEmptyLockCells()}
            rowClassName="bg-emerald-950/20"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={depositedAmountInWords}
                onChange={(e) => setDepositedAmountInWords(e.target.value)}
                placeholder="তিন লক্ষ টাকা মাত্র"
                className="w-full max-w-sm rounded-lg px-3 py-1.5 border border-emerald-500/40 bg-slate-950 text-emerald-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 text-sm font-semibold"
              />
              <button
                type="button"
                onClick={() => setDepositedAmountInWords(numberToBengaliWords(depositedAmount))}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-800/50 flex items-center gap-1 whitespace-nowrap cursor-pointer"
                title="পুনরায় রূপান্তর করুন"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>রি-জেনারেট</span>
              </button>
            </div>
          </FormRow>

          {/* Row 13: আয়ন ব্যয়ন কর্মকর্তার নাম */}
          <FormRow index="১৩" label={<>আয়ন ব্যয়ন কর্মকর্তার নাম <span className="text-rose-400">*</span></>} hint="DDO এর পূর্ণ নাম" lockCells={renderLockControls('ddoName')}>
            <input
              type="text"
              value={ddoName}
              onChange={(e) => setDdoName(e.target.value)}
              {...lockFieldProps(lockSettings.ddoName, 'আয়ন ব্যয়ন কর্মকর্তার নাম', noticeLocked)}
              placeholder="নৃপেন্দ্র নাথ সরকার"
              required
              className={fieldClass(lockSettings.ddoName)}
            />
          </FormRow>

          {/* Row 14: আয়ন ব্যয়ন কর্মকর্তার পদবী */}
          <FormRow index="১৪" label={<>আয়ন ব্যয়ন কর্মকর্তার পদবী <span className="text-rose-400">*</span></>} hint="DDO পদবী" lockCells={renderLockControls('ddoDesignation')}>
            <input
              type="text"
              value={ddoDesignation}
              onChange={(e) => setDdoDesignation(e.target.value)}
              {...lockFieldProps(lockSettings.ddoDesignation, 'আয়ন ব্যয়ন কর্মকর্তার পদবী', noticeLocked)}
              placeholder="উপজেলা প্রাথমিক শিক্ষা অফিসার (চ:দা:)"
              required
              className={fieldClass(lockSettings.ddoDesignation)}
            />
          </FormRow>

          {/* Row 15: উপজেলার নাম - স্থায়ীভাবে ফিক্সড */}
          <FormRow index="১৫" label={<>উপজেলার নাম <span className="text-rose-400">*</span></>} hint="কর্মক্ষেত্র উপজেলা" lockCells={renderLockControls('upazilaName', { lockedAlways: true })}>
            <input
              type="text"
              value={upazilaName}
              {...lockFieldProps(true, 'উপজেলার নাম', noticeLocked)}
              placeholder="বিয়ানীবাজার"
              className={fieldClass(true)}
            />
          </FormRow>

          {/* Row 16: জেলার নাম - স্থায়ীভাবে ফিক্সড */}
          <FormRow index="১৬" label={<>জেলার নাম <span className="text-rose-400">*</span></>} hint="কর্মক্ষেত্র জেলা" lockCells={renderLockControls('districtName', { lockedAlways: true })}>
            <input
              type="text"
              value={districtName}
              {...lockFieldProps(true, 'জেলার নাম', noticeLocked)}
              placeholder="সিলেট"
              className={fieldClass(true)}
            />
          </FormRow>

          {/* Row 17: সংযুক্তি (01(এক) খানা / 02(দুই) খানা) */}
          <FormRow index="১৭" label={<>সংযুক্তি <span className="text-rose-400">*</span></>} hint="০১(এক) খানা / ০২(দুই) খানা" hintClassName="text-teal-400/90" lockCells={renderLockControls('attachmentsCount')}>
            <div className="flex gap-2 items-center">
              {attachmentOptions.map((opt) => {
                // The state holds the value exactly as chosen, but an imported
                // record may store the English-digit form ('02(দুই) খানা').
                // Compare on a normalised (Bengali-digit) copy so the selected
                // option is always highlighted.
                const isSelected = toBn(attachmentsCount) === toBn(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAttachmentsCount(opt)}
                    aria-pressed={isSelected}
                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </FormRow>

          {/* ---- Official template variables (used across the 7 print pages) ---- */}
          <tr>
            <td colSpan={5} className="bg-[#0b1324] border-y border-slate-800 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-teal-400">
              অতিরিক্ত অফিশিয়াল তথ্য (প্রিন্ট ফাইলের জন্য)
            </td>
          </tr>

          <FormRow index="১৮" label="মঞ্জুরী নং ও তারিখ" hint="যেমন: ৪৭০/১(০৪) ও ২৪/০৯/২০২৬" lockCells={renderEmptyLockCells()}>
            <div className="flex flex-wrap items-center gap-2 max-w-lg">
              <input
                type="text"
                value={sanctionMemoNo}
                onChange={(e) => setSanctionMemoNo(normaliseBengaliInput(e.target.value))}
                placeholder="৪৭০/১(০৪)"
                className="w-40 rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
              />
              <input
                type="text"
                inputMode="numeric"
                value={sanctionDate}
                onChange={(e) => setSanctionDate(normaliseBengaliInput(e.target.value))}
                onBlur={(e) => setSanctionDate(normaliseBengaliDate(e.target.value))}
                placeholder="২৪/০৯/২০২৬"
                className="w-40 rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
              />
            </div>
          </FormRow>

          <FormRow index="১৯" label="স্মারক নং ও তারিখ" hint="ফরোয়ার্ডিং পত্রের স্মারক" lockCells={renderEmptyLockCells()}>
            <div className="flex flex-wrap items-center gap-2 max-w-lg">
              <input
                type="text"
                value={forwardingMemoNo}
                onChange={(e) => setForwardingMemoNo(normaliseBengaliInput(e.target.value))}
                placeholder="উশিঅ/বিবা/সিল/২০২৬/"
                className="w-56 rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
              />
              <input
                type="text"
                inputMode="numeric"
                value={forwardingDate}
                onChange={(e) => setForwardingDate(normaliseBengaliInput(e.target.value))}
                onBlur={(e) => setForwardingDate(normaliseBengaliDate(e.target.value))}
                placeholder="১৬/০৩/২০২৬"
                className="w-40 rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
              />
            </div>
          </FormRow>

          <FormRow index="২০" label="সর্বশেষ কর্তনকৃত চাঁদা ও ভাউচার নং" hint="শেষ ফান্ড কর্তন তথ্য" lockCells={renderEmptyLockCells()}>
            <div className="flex flex-wrap items-center gap-2 max-w-lg">
              <div className="relative w-40">
                <input
                  type="text"
                  inputMode="numeric"
                  value={lastDeductionAmount}
                  onChange={(e) => handleLastDeductionChange(e.target.value)}
                  placeholder="৪৯০০"
                  className="w-full rounded-lg px-3 py-1.5 pl-8 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
                />
                <span className="absolute left-2.5 top-1.5 text-xs font-semibold text-slate-400">৳</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={lastVoucherNo}
                onChange={(e) => setLastVoucherNo(normaliseBengaliInput(e.target.value.replace(/[^0-9০-৯]/g, '')))}
                placeholder="০৮"
                className="w-28 rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
              />
            </div>
          </FormRow>

          <FormRow index="২১" label="ট্রেজারী অফিসের নাম" hint="হিসাবরক্ষণ কার্যালয়" lockCells={renderEmptyLockCells()}>
            <input
              type="text"
              value={treasuryOffice}
              onChange={(e) => setTreasuryOffice(e.target.value)}
              placeholder="উপজেলা হিসাবরক্ষণ অফিস, বিয়ানীবাজার, সিলেট"
              className="w-full max-w-md rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
            />
          </FormRow>

          </tbody>
        </table>
        </div>

        {/* Action bar — the same one app1/app2/app3 use */}
        <DashboardActionBar
          note={
            <>
              <span className="text-rose-400">*</span>
              <span>চিহ্নিত ফিল্ডসমূহ আবশ্যক। {LABELS.locked} ফিল্ডের তথ্য পরবর্তী ফর্মে অটো লোড থাকবে।</span>
            </>
          }
          onNew={onReset}
          onSave={handleSave}
          saveLabel={saveSuccess ? 'তথ্য সফলভাবে সংরক্ষিত!' : isEditing ? LABELS.update : LABELS.save}
          extra={
            isEditing ? (
              <button
                type="button"
                onClick={() => {
                  if (!deceasedEmployeeName || !applicantName || !schoolName || !gpfAccountNo) {
                    onShowToast('অনুগ্রহ করে মৃত কর্মচারীর নাম, বিদ্যালয়, আবেদনকারী ও জিপিএফ হিসাব নম্বর পূরণ করুন।', 'error');
                    return;
                  }
                  onSaveClaim(getFormDataObject(), true);
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-emerald-200 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/70 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                title="বিদ্যমান ফাইল অপরিবর্তিত রেখে এটি নতুন ক্লেইম হিসেব সংরক্ষণ করুন"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>নতুন হিসেব সংরক্ষণ</span>
              </button>
            ) : null
          }
        />
      </form>
    </div>
  );
};
