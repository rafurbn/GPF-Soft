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
  Unlock,
  Save,
  RotateCcw,
  Sparkles,
  Check,
  FileCheck,
} from 'lucide-react';

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

  // Helper lock button
  const renderLockBtn = (field: LockableField) => {
    const isLocked = lockSettings[field];
    return (
      <button
        type="button"
        onClick={() => onToggleLock(field)}
        className={`px-2.5 py-1 text-xs rounded font-medium transition-all inline-flex items-center gap-1 shrink-0 ${
          isLocked
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:border-slate-600'
        }`}
        title={isLocked ? 'লক করা আছে (পরবর্তী এন্ট্রিতে মান সংরক্ষিত থাকবে)' : 'আনলক করা আছে'}
      >
        {isLocked ? (
          <>
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>লকড</span>
          </>
        ) : (
          <>
            <Unlock className="w-3 h-3" />
            <span>আনলক</span>
          </>
        )}
      </button>
    );
  };

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
              জিপিএফ চূড়ান্ত উত্তোলন - ডেথ ক্লেইম ইনপুট ড্যাশবোর্ড
              {isEditing && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  সম্পাদনা মোড
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              সকল তথ্য পূরণ করে সংরক্ষণ করুন।
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Form */}
      <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-900/80 rounded-lg text-xs font-semibold text-slate-300 border border-slate-800/80">
          <div className="col-span-1 text-center">ক্র.</div>
          <div className="col-span-4">ফিল্ডের নাম</div>
          <div className="col-span-5">এখানে তথ্য ইনপুট দিন</div>
          <div className="col-span-2 text-center">লক / আনলক</div>
        </div>

        {/* Rows Container */}
        <div className="divide-y divide-slate-800/60 bg-slate-950/40 rounded-xl border border-slate-800/80 overflow-hidden">
          {/* Row 1: সন (2026, 2027, 2028...) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ১
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ১</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">সন</label>
              <p className="text-[11px] text-slate-400">সন (2026, 2027, 2028)</p>
            </div>
            <div className="md:col-span-5 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {yearOptions.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                      year === y
                        ? 'bg-teal-600 text-white border-teal-500'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center">
              {renderLockBtn('year')}
            </div>
          </div>

          {/* Row 2: আবেদনের তারিখ */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ২
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ২</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                আবেদনের তারিখ <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">দাখিলের তারিখ (যেমন: 16/03/2026)</p>
            </div>
            <div className="md:col-span-5">
              <input
                type="text"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                placeholder="16/03/2026"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center text-xs text-slate-500">
              —
            </div>
          </div>

          {/* Row 3: প্রাপক (একাধিক লাইনে লেখাযোগ্য ফিল্ড, পপআপ নাই) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-start hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center pt-2">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ৩
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ৩</span>
            </div>
            <div className="md:col-span-4 pt-1">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                প্রাপক <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-teal-400/90 font-medium">
                একাধিক লাইনে লেখাযোগ্য ফিল্ড
              </p>
            </div>
            <div className="md:col-span-5">
              <textarea
                rows={3}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={`উপজেলা হিসাবরক্ষণ কর্মকর্তা\nবিয়ানীবাজার, সিলেট।`}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 resize-y"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center pt-2">
              {renderLockBtn('recipient')}
            </div>
          </div>

          {/* Row 4: মৃত কর্মচারীর নাম */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ৪
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ৪</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                মৃত কর্মচারীর নাম <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">মরহুম শিক্ষক বা কর্মচারীর পূর্ণ নাম</p>
            </div>
            <div className="md:col-span-5">
              <input
                type="text"
                value={deceasedEmployeeName}
                onChange={(e) => setDeceasedEmployeeName(e.target.value)}
                placeholder="মোঃ আন্দালিব"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center text-xs text-slate-500">
              —
            </div>
          </div>

          {/* Row 5: মৃত কর্মচারীর পদবী (প্রাক্তন সহকারী শিক্ষক, প্রাক্তন প্রধান শিক্ষক(চ:দা:) ও প্রাক্তন প্রধান শিক্ষক) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ৫
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ৫</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                মৃত কর্মচারীর পদবী <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-teal-400/90 font-medium">পদবী নির্বাচন করুন</p>
            </div>
            <div className="md:col-span-5">
              <div className="flex flex-wrap gap-2 items-center">
                {designationOptions.map((desig) => (
                  <button
                    key={desig}
                    type="button"
                    onClick={() => setDeceasedDesignation(desig)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                      deceasedDesignation === desig
                        ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {desig}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center text-xs text-slate-500">
              —
            </div>
          </div>

          {/* Row 6: মৃত কর্মচারীর বিদ্যালয়ের নাম */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ৬
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ৬</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                মৃত কর্মচারীর বিদ্যালয়ের নাম <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">কর্মস্থলের নাম (সরকারি প্রাথমিক বিদ্যালয়)</p>
            </div>
            <div className="md:col-span-5">
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="খাসা সরকারি প্রাথমিক বিদ্যালয়"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center text-xs text-slate-500">
              —
            </div>
          </div>

          {/* Row 7: মৃত্যুর তারিখ */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ৭
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ৭</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                মৃত্যুর তারিখ <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">মৃত্যুর সনদপত্র অনুযায়ী তারিখ</p>
            </div>
            <div className="md:col-span-5">
              <input
                type="text"
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
                placeholder="16/03/2026"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center text-xs text-slate-500">
              —
            </div>
          </div>

          {/* Row 8: আবেদনকারীর নাম */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ৮
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ৮</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                আবেদনকারীর নাম <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">মনোনীত ব্যক্তি / বৈধ ওয়ারিশের নাম</p>
            </div>
            <div className="md:col-span-5">
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="মোছাঃ মনজুদা বেগম"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center text-xs text-slate-500">
              —
            </div>
          </div>

          {/* Row 9: মৃত কর্মচারীর সাথে সম্পর্ক */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ৯
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ৯</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                মৃত কর্মচারীর সাথে সম্পর্ক <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-teal-400/90 font-medium">স্বামী/স্ত্রী</p>
            </div>
            <div className="md:col-span-5">
              <div className="flex flex-wrap gap-1.5 items-center">
                {relationshipOptions.map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setRelationship(rel)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
                      relationship === rel
                        ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center text-xs text-slate-500">
              —
            </div>
          </div>

          {/* Row 10: জিপিএফ হিসাব নং */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ১০
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ১০</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                জিপিএফ হিসাব নং <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">সাধারণ ভবিষ্যৎ তহবিল নম্বর</p>
            </div>
            <div className="md:col-span-5">
              <input
                type="text"
                value={gpfAccountNo}
                onChange={(e) => setGpfAccountNo(e.target.value)}
                placeholder="১৩৬৮"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center text-xs text-slate-500">
              —
            </div>
          </div>

          {/* Row 11: জমাকৃত টাকার পরিমাণ (পূর্ববর্তী ৩০শে জুন বাদ ও ১২ নং রো বাদ দিয়ে এটি মূল টাকার ফিল্ড) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ১১
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ১১</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                জমাকৃত টাকার পরিমাণ <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-teal-400 font-medium">মোট জমাকৃত/উত্তোলনযোগ্য অর্থ (অংকে)</p>
            </div>
            <div className="md:col-span-5 space-y-1">
              <div className="relative">
                <input
                  type="text"
                  value={depositedAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="300000"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 font-mono font-bold focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 pl-8"
                />
                <span className="absolute left-2.5 top-2 text-xs font-semibold text-slate-400">৳</span>
              </div>
              {depositedAmount && (
                <div className="text-[11px] text-teal-400 flex items-center gap-1 font-semibold">
                  <span>৳ {formatBangladeshiCurrency(depositedAmount)} টাকা</span>
                </div>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center text-xs text-slate-500">
              —
            </div>
          </div>

          {/* Row 12: জমাকৃত টাকা (কথায়) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center bg-teal-950/20 border-y border-teal-900/40">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-teal-800/80 text-teal-200 text-xs font-semibold flex items-center justify-center">
                ১২
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ১২</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-teal-200 flex items-center gap-1.5">
                <span>জমাকৃত টাকা (কথায়)</span>
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              </label>
              <p className="text-[11px] text-teal-400/90 font-medium">
                অটো জেনারেট হবে পয়সাসহ
              </p>
            </div>
            <div className="md:col-span-5">
              <input
                type="text"
                value={depositedAmountInWords}
                onChange={(e) => setDepositedAmountInWords(e.target.value)}
                placeholder="তিন লক্ষ টাকা মাত্র"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900/90 border border-teal-500/40 rounded-lg text-teal-200 font-medium focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center">
              <button
                type="button"
                onClick={() => setDepositedAmountInWords(amountToBengaliWords(depositedAmount))}
                className="px-2 py-1 text-[11px] rounded bg-teal-900/50 text-teal-300 border border-teal-700/50 hover:bg-teal-800/50 flex items-center gap-1"
                title="পুনরায় রূপান্তর করুন"
              >
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>রি-জেনারেট</span>
              </button>
            </div>
          </div>

          {/* Row 13: আয়ন ব্যয়ন কর্মকর্তার নাম */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ১৩
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ১৩</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                আয়ন ব্যয়ন কর্মকর্তার নাম <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">DDO এর পূর্ণ নাম</p>
            </div>
            <div className="md:col-span-5">
              <input
                type="text"
                value={ddoName}
                onChange={(e) => setDdoName(e.target.value)}
                placeholder="নৃপেন্দ্র নাথ সরকার"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center">
              {renderLockBtn('ddoName')}
            </div>
          </div>

          {/* Row 14: আয়ন ব্যয়ন কর্মকর্তার পদবী */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ১৪
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ১৪</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                আয়ন ব্যয়ন কর্মকর্তার পদবী <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">DDO পদবী</p>
            </div>
            <div className="md:col-span-5">
              <input
                type="text"
                value={ddoDesignation}
                onChange={(e) => setDdoDesignation(e.target.value)}
                placeholder="উপজেলা প্রাথমিক শিক্ষা অফিসার (চ:দা:)"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center">
              {renderLockBtn('ddoDesignation')}
            </div>
          </div>

          {/* Row 15: উপজেলার নাম */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ১৫
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ১৫</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                উপজেলার নাম <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">কর্মক্ষেত্র উপজেলা</p>
            </div>
            <div className="md:col-span-5">
              <input
                type="text"
                value={upazilaName}
                onChange={(e) => setUpazilaName(e.target.value)}
                placeholder="বিয়ানীবাজার"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center">
              {renderLockBtn('upazilaName')}
            </div>
          </div>

          {/* Row 16: জেলার নাম */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ১৬
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ১৬</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                জেলার নাম <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">কর্মক্ষেত্র জেলা</p>
            </div>
            <div className="md:col-span-5">
              <input
                type="text"
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                placeholder="সিলেট"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
              />
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center">
              {renderLockBtn('districtName')}
            </div>
          </div>

          {/* Row 17: সংযুক্তি (শুধুমাত্র 01(এক) খানা ও 02(দুই) খানা) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 p-3.5 items-center hover:bg-slate-900/40 transition-colors">
            <div className="md:col-span-1 flex items-center gap-2 md:justify-center">
              <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center">
                ১৭
              </span>
              <span className="md:hidden text-xs text-slate-400 font-medium">ফিল্ড ১৭</span>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs sm:text-sm font-semibold text-slate-200">
                সংযুক্তি <span className="text-rose-400">*</span>
              </label>
              <p className="text-[11px] text-teal-400/90 font-medium">
                01(এক) খানা / 02(দুই) খানা
              </p>
            </div>
            <div className="md:col-span-5">
              <div className="flex gap-2 items-center">
                {attachmentOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAttachmentsCount(opt)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                      attachmentsCount === opt
                        ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end md:justify-center">
              {renderLockBtn('attachmentsCount')}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-rose-400">*</span>
            <span>চিহ্নিত ফিল্ডসমূহ আবশ্যক। লকড ফিল্ডের তথ্য পরবর্তী ফর্মে অটো লোড থাকবে।</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-950/50 flex items-center gap-2 border border-emerald-500"
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
