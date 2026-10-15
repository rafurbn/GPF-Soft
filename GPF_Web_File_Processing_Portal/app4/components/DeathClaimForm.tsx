import React, { useState, useEffect } from 'react';
import {
  GpfDeathClaim,
  LockSettings,
  DesignationType,
  RelationshipType,
  LockableField,
} from '../types/gpf';
import {
  toBengaliNumber,
  amountToBengaliWords,
  formatBangladeshiCurrency,
} from '../utils/bengaliWords';
import {
  Lock,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  FileCheck,
} from 'lucide-react';
import { LockToggleButton } from './LockToggleButton';

interface FormRowProps {
  /** Row number shown in the "ক্র: নং" column, e.g. '১' */
  index: string;
  label: React.ReactNode;
  hint?: string;
  hintClassName?: string;
  labelExtra?: React.ReactNode;
  children: React.ReactNode;
  lockCells: React.ReactNode;
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

interface DeathClaimFormProps {
  initialData?: GpfDeathClaim | null;
  lockSettings: LockSettings;
  onToggleLock: (field: LockableField) => void;
  onSaveClaim: (claimData: Omit<GpfDeathClaim, 'id' | 'serialNo' | 'createdAt' | 'updatedAt'>) => void;
  onReset: () => void;
  isEditing?: boolean;
}

export const DeathClaimForm: React.FC<DeathClaimFormProps> = ({
  initialData,
  lockSettings,
  onToggleLock,
  onSaveClaim,
  onReset,
  isEditing = false,
}) => {
  // Form fields
  // 1. সন: 2026, 2027, 2028
  const [year, setYear] = useState<string>(initialData?.year || '2026');
  // 2. আবেদনের তারিখ
  const [applicationDate, setApplicationDate] = useState<string>(initialData?.applicationDate || '16/03/2026');
  // 3. প্রাপক: একাধিক লাইনে লেখাযোগ্য ফিল্ড
  const [recipient, setRecipient] = useState<string>(
    initialData?.recipient || 'উপজেলা হিসাবরক্ষণ কর্মকর্তা\nবিয়ানীবাজার, সিলেট।'
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
  const [deathDate, setDeathDate] = useState<string>(initialData?.deathDate || '16/03/2026');
  // 8. আবেদনকারীর নাম
  const [applicantName, setApplicantName] = useState<string>(initialData?.applicantName || '');
  // 9. মৃত কর্মচারীর সাথে সম্পর্ক
  const [relationship, setRelationship] = useState<RelationshipType>(
    initialData?.relationship || 'স্ত্রী'
  );
  // 10. জিপিএফ হিসাব নং
  const [gpfAccountNo, setGpfAccountNo] = useState<string>(initialData?.gpfAccountNo || '১৩৬৮');
  // 11. জমাকৃত টাকার পরিমাণ
  const [depositedAmount, setDepositedAmount] = useState<string>(
    initialData?.depositedAmount ? String(initialData.depositedAmount) : '300000'
  );
  // 12. জমাকৃত টাকা (কথায়)
  const [depositedAmountInWords, setDepositedAmountInWords] = useState<string>(
    initialData?.depositedAmountInWords || 'তিন লক্ষ টাকা মাত্র'
  );
  // 13. আয়ন ব্যয়ন কর্মকর্তার নাম
  const [ddoName, setDdoName] = useState<string>(initialData?.ddoName || 'নৃপেন্দ্র নাথ সরকার');
  // 14. আয়ন ব্যয়ন কর্মকর্তার পদবী
  const [ddoDesignation, setDdoDesignation] = useState<string>(
    initialData?.ddoDesignation || 'উপজেলা প্রাথমিক শিক্ষা অফিসার (চ:দা:)'
  );
  // 15. উপজেলার নাম
  const [upazilaName, setUpazilaName] = useState<string>(initialData?.upazilaName || 'বিয়ানীবাজার');
  // 16. জেলার নাম
  const [districtName, setDistrictName] = useState<string>(initialData?.districtName || 'সিলেট');
  // 17. সংযুক্তি: শুধু 01(এক) খানা ও 02(দুই) খানা
  const [attachmentsCount, setAttachmentsCount] = useState<string>(
    initialData?.attachmentsCount || '02(দুই) খানা'
  );

  // Template variables
  const [sanctionMemoNo, setSanctionMemoNo] = useState<string>(initialData?.sanctionMemoNo || '৪৭০/১(০৪)');
  const [sanctionDate, setSanctionDate] = useState<string>(initialData?.sanctionDate || '24/09/2026');
  const [forwardingMemoNo, setForwardingMemoNo] = useState<string>(initialData?.forwardingMemoNo || 'উশিঅ/বিবা/সিল/2026/');
  const [forwardingDate, setForwardingDate] = useState<string>(initialData?.forwardingDate || '16/03/2026');
  const [lastDeductionAmount, setLastDeductionAmount] = useState<string>(
    initialData?.lastDeductionAmount ? String(initialData.lastDeductionAmount) : '4900'
  );
  const [lastVoucherNo, setLastVoucherNo] = useState<string>(initialData?.lastVoucherNo || '০৮');
  const [treasuryOffice, setTreasuryOffice] = useState<string>(
    initialData?.treasuryOffice || 'উপজেলা হিসাবরক্ষণ অফিস, বিয়ানীবাজার, সিলেট'
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize when initialData changes
  useEffect(() => {
    if (initialData) {
      setYear(initialData.year || '2026');
      setApplicationDate(initialData.applicationDate || '');
      setRecipient(initialData.recipient || '');
      setDeceasedEmployeeName(initialData.deceasedEmployeeName || '');
      setDeceasedDesignation(initialData.deceasedDesignation || 'প্রাক্তন সহকারী শিক্ষক');
      setSchoolName(initialData.schoolName || '');
      setDeathDate(initialData.deathDate || '');
      setApplicantName(initialData.applicantName || '');
      setRelationship(initialData.relationship || 'স্ত্রী');
      setGpfAccountNo(initialData.gpfAccountNo || '');
      setDepositedAmount(initialData.depositedAmount ? String(initialData.depositedAmount) : '');
      setDepositedAmountInWords(initialData.depositedAmountInWords || '');
      setDdoName(initialData.ddoName || '');
      setDdoDesignation(initialData.ddoDesignation || '');
      setUpazilaName(initialData.upazilaName || '');
      setDistrictName(initialData.districtName || '');
      setAttachmentsCount(initialData.attachmentsCount || '02(দুই) খানা');
      setSanctionMemoNo(initialData.sanctionMemoNo || '');
      setSanctionDate(initialData.sanctionDate || '');
      setForwardingMemoNo(initialData.forwardingMemoNo || '');
      setForwardingDate(initialData.forwardingDate || '');
      setLastDeductionAmount(initialData.lastDeductionAmount ? String(initialData.lastDeductionAmount) : '4900');
      setLastVoucherNo(initialData.lastVoucherNo || '০৮');
      setTreasuryOffice(initialData.treasuryOffice || '');
    }
  }, [initialData]);

  // Auto-generate words when deposited amount changes
  const handleAmountChange = (val: string) => {
    setDepositedAmount(val);
    if (!val || val.trim() === '') {
      setDepositedAmountInWords('');
      return;
    }
    const words = amountToBengaliWords(val);
    setDepositedAmountInWords(words);
  };

  const getFormDataObject = (): Omit<GpfDeathClaim, 'id' | 'serialNo' | 'createdAt' | 'updatedAt'> => {
    const depAmountNum = parseFloat(depositedAmount) || 0;
    const lastDedNum = parseFloat(lastDeductionAmount) || 0;

    return {
      year,
      applicationDate,
      recipient,
      deceasedEmployeeName,
      deceasedDesignation,
      schoolName,
      deathDate,
      applicantName,
      relationship,
      gpfAccountNo,
      depositedAmount: depAmountNum,
      depositedAmountInWords: depositedAmountInWords || amountToBengaliWords(depAmountNum),
      ddoName,
      ddoDesignation,
      upazilaName,
      districtName,
      attachmentsCount,
      sanctionMemoNo,
      sanctionDate,
      forwardingMemoNo,
      forwardingDate,
      lastDeductionAmount: lastDedNum,
      lastVoucherNo,
      treasuryOffice,
      status: initialData?.status || 'খসড়া',
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deceasedEmployeeName || !applicantName || !schoolName || !gpfAccountNo) {
      alert('অনুগ্রহ করে মৃত কর্মচারীর নাম, বিদ্যালয়, আবেদনকারী ও জিপিএফ হিসাব নম্বর পূরণ করুন।');
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
  const attachmentOptions = ['01(এক) খানা', '02(দুই) খানা'];

  // Year quick options
  const yearOptions = ['2026', '2027', '2028', '2029', '2030'];

  // Shared cell styling for the lock/unlock columns, matching app1/app2/app3.
  const cellClass = 'p-1.5 border border-slate-800 bg-[#0c1427] text-center';
  const emptyCellClass =
    'border border-slate-800 bg-[#0c1427]/60 w-24 text-center text-xs text-slate-600';

  // Renders the lock/unlock cells for a row.
  //  - combined: both buttons in one colSpan=2 cell (used by multi-line rows)
  //  - lockedAlways: a permanent "ফিক্সড" badge instead of buttons
  const renderLockControls = (
    field: LockableField,
    { combined = false, lockedAlways = false }: { combined?: boolean; lockedAlways?: boolean } = {},
  ) => {
    const isLocked = lockedAlways || !!lockSettings[field];

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
              onClick={() => onToggleLock(field)}
              title="তথ্য লক করে সংরক্ষণ করুন"
            />
            <LockToggleButton
              action="unlock"
              isLocked={isLocked}
              onClick={() => onToggleLock(field)}
              title="তথ্য পরিবর্তনের জন্য আনলক করুন"
            />
          </div>
        </td>
      );
    }

    return (
      <>
        <td className={`${cellClass} w-24`}>
          <LockToggleButton
            action="lock"
            isLocked={isLocked}
            onClick={() => onToggleLock(field)}
            title="তথ্য লক করে সংরক্ষণ করুন"
            fullWidth
          />
        </td>
        <td className={`${cellClass} w-24`}>
          <LockToggleButton
            action="unlock"
            isLocked={isLocked}
            onClick={() => onToggleLock(field)}
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

  // Locked-input styling, shared so locked fields look the same in every row.
  const fieldClass = (locked: boolean) =>
    `w-full max-w-sm rounded-lg px-3 py-1.5 border text-sm font-semibold focus:outline-hidden ${
      locked
        ? 'bg-amber-950/20 border-amber-500/50 text-amber-200 cursor-not-allowed'
        : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
    }`;

  return (
    <div className="bg-[#0e1628] border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden print:hidden">
      {/* Top Banner */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-[#131d33] to-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              জিপিএফ মৃত্যুদাবী নিষ্পত্তি-ইনপুট ড্যাশবোর্ড
              {isEditing && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  সম্পাদনা মোড
                </span>
              )}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Table Form */}
      <form onSubmit={handleSave}>
        <div className="overflow-x-auto p-2 sm:p-4 bg-[#080d1e]">
        <table className="w-full border-collapse text-sm border border-slate-800 rounded-xl overflow-hidden">
          <thead>
            <tr>
              <th
                colSpan={5}
                className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-emerald-300 py-3.5 px-4 text-center text-base sm:text-lg font-bold tracking-wide border-b border-emerald-500/30"
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
              <th className="bg-[#0f172a] text-slate-300 py-2.5 px-2 w-24 text-center font-bold text-xs sm:text-sm border-r border-slate-800">
                লক
              </th>
              <th className="bg-[#0f172a] text-slate-300 py-2.5 px-2 w-24 text-center font-bold text-xs sm:text-sm">
                আনলক
              </th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">
          {/* Row 1: সন */}
          <FormRow index="১" label="সন" hint="2026, 2027, 2028" lockCells={renderLockControls('year')}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                readOnly={lockSettings.year}
                placeholder="2026"
                className={fieldClass(lockSettings.year)}
              />
              {lockSettings.year && (
                <span className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2.5 py-0.5 rounded-lg font-medium whitespace-nowrap">
                  লক করা আছে
                </span>
              )}
            </div>
          </FormRow>

          {/* Row 2: আবেদনের তারিখ */}
          <FormRow index="২" label="আবেদনের তারিখ" hint="দাখিলের তারিখ (যেমন: 16/03/2026)" lockCells={renderEmptyLockCells()}>
            <input
              type="text"
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              placeholder="16/03/2026"
              className="w-full max-w-sm rounded-lg px-3 py-1.5 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-semibold"
            />
          </FormRow>

          {/* Row 3: প্রাপক (মাল্টি-লাইন) */}
          <FormRow
            index="৩"
            label="প্রাপক"
            hint="মাল্টি ডাটা এন্ট্রি / ড্রপডাউন সুবিধা"
            hintClassName="text-emerald-400 leading-tight"
            labelExtra={
              lockSettings.recipient ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-2 py-0.5 rounded mt-1.5 font-medium">
                  <Lock className="w-3 h-3" /> লকড (সুরক্ষিত)
                </span>
              ) : null
            }
            lockCells={renderLockControls('recipient', { combined: true })}
          >
            <textarea
              rows={2}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              readOnly={lockSettings.recipient}
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
              value={deathDate}
              onChange={(e) => setDeathDate(e.target.value)}
              placeholder="16/03/2026"
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
              value={gpfAccountNo}
              onChange={(e) => setGpfAccountNo(e.target.value)}
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
                  value={depositedAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="300000"
                  required
                  className="w-full rounded-lg px-3 py-1.5 pl-8 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-sm font-bold"
                />
                <span className="absolute left-2.5 top-1.5 text-xs font-semibold text-slate-400">৳</span>
              </div>
              {depositedAmount && (
                <div className="text-[11px] text-teal-400 flex items-center gap-1 font-semibold">
                  <span>৳ {formatBangladeshiCurrency(depositedAmount)} টাকা</span>
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
                onClick={() => setDepositedAmountInWords(amountToBengaliWords(depositedAmount))}
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
              readOnly={lockSettings.ddoName}
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
              readOnly={lockSettings.ddoDesignation}
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
              readOnly
              placeholder="বিয়ানীবাজার"
              className={fieldClass(true)}
            />
          </FormRow>

          {/* Row 16: জেলার নাম - স্থায়ীভাবে ফিক্সড */}
          <FormRow index="১৬" label={<>জেলার নাম <span className="text-rose-400">*</span></>} hint="কর্মক্ষেত্র জেলা" lockCells={renderLockControls('districtName', { lockedAlways: true })}>
            <input
              type="text"
              value={districtName}
              readOnly
              placeholder="সিলেট"
              className={fieldClass(true)}
            />
          </FormRow>

          {/* Row 17: সংযুক্তি (01(এক) খানা / 02(দুই) খানা) */}
          <FormRow index="১৭" label={<>সংযুক্তি <span className="text-rose-400">*</span></>} hint="01(এক) খানা / 02(দুই) খানা" hintClassName="text-teal-400/90" lockCells={renderLockControls('attachmentsCount')}>
            <div className="flex gap-2 items-center">
              {attachmentOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAttachmentsCount(opt)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-colors cursor-pointer ${
                    attachmentsCount === opt
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </FormRow>

          </tbody>
        </table>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-rose-400">*</span>
            <span>চিহ্নিত ফিল্ডসমূহ আবশ্যক। লকড ফিল্ডের তথ্য পরবর্তী ফর্মে অটো লোড থাকবে।</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-950/50 flex items-center gap-2 border border-emerald-500 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>তথ্য সফলভাবে সংরক্ষিত!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'আপডেট সম্পন্ন করুন' : 'তথ্য সেভ করুন'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
