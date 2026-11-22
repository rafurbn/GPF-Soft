import React, { useState, useEffect } from 'react';
import {
  ExBangladeshLeaveApplication,
  LeaveApplicationStatus,
  LeaveLockSettings,
  LeaveLockableField,
} from '../types/leave';
import {
  numberToBengaliWords,
  parseBengaliInt,
  toBengaliNumber,
} from '../utils/bengaliWords';
import {
  calculateExactYmd,
  calculateLeaveDuration,
  calculatePlr1959HalfPayEarned,
  formatBengaliAge,
  getTodayDdMmYyyyBn,
  subtractYmd,
} from '../utils/dateUtils';
import {
  Calculator,
  Check,
  Lock,
  RotateCcw,
  Save,
  Unlock,
  AlertCircle,
} from 'lucide-react';

interface LeaveFormProps {
  initialData: Omit<
    ExBangladeshLeaveApplication,
    'id' | 'serialNo' | 'createdAt' | 'updatedAt'
  > & { id?: string };
  formVersion: number;
  lockSettings: LeaveLockSettings;
  onToggleLock: (field: LeaveLockableField) => void;
  onSaveApplication: (
    data: Omit<ExBangladeshLeaveApplication, 'id' | 'serialNo' | 'createdAt' | 'updatedAt'>
  ) => void;
  onReset: () => void;
  isEditing: boolean;
  fixedRegionFields?: {
    upazilaName?: boolean;
    districtName?: boolean;
    divisionName?: boolean;
  };
}

const inputCls =
  'w-full mt-1 px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700/90 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30';
const compactInputCls =
  'w-full px-2.5 py-2 text-xs bg-slate-900 border border-slate-700/90 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30';

export const LeaveForm: React.FC<LeaveFormProps> = ({
  initialData,
  formVersion,
  lockSettings,
  onToggleLock,
  onSaveApplication,
  onReset,
  isEditing,
  fixedRegionFields,
}) => {
  const [applicantName, setApplicantName] = useState(initialData.applicantName);
  const [fatherName, setFatherName] = useState(initialData.fatherName);
  const [designation, setDesignation] = useState(initialData.designation);
  const [schoolName, setSchoolName] = useState(initialData.schoolName);
  const [upazilaName, setUpazilaName] = useState(initialData.upazilaName);
  const [districtName, setDistrictName] = useState(initialData.districtName);
  const [divisionName, setDivisionName] = useState(initialData.divisionName);
  const [recipientDesignation, setRecipientDesignation] = useState(initialData.recipientDesignation);

  const [basicSalary, setBasicSalary] = useState(initialData.basicSalary);
  const [salaryScale, setSalaryScale] = useState(initialData.salaryScale);
  const [joiningDate, setJoiningDate] = useState(initialData.joiningDate);
  const [birthDate, setBirthDate] = useState(initialData.birthDate);
  const [calculatedAge, setCalculatedAge] = useState(initialData.calculatedAge);

  const [applicationDate, setApplicationDate] = useState(initialData.applicationDate);
  const [destinationCountry, setDestinationCountry] = useState(initialData.destinationCountry);
  const [leavePurpose, setLeavePurpose] = useState(initialData.leavePurpose);
  const [leaveStartDate, setLeaveStartDate] = useState(initialData.leaveStartDate);
  const [leaveEndDate, setLeaveEndDate] = useState(initialData.leaveEndDate);
  const [leaveDays, setLeaveDays] = useState(initialData.leaveDays);
  const [leaveDaysWords, setLeaveDaysWords] = useState(initialData.leaveDaysWords);
  const [leaveAddress, setLeaveAddress] = useState(initialData.leaveAddress);
  const [expenseSource, setExpenseSource] = useState(initialData.expenseSource);
  const [familyAccompany, setFamilyAccompany] = useState(initialData.familyAccompany);
  const [familyDetails, setFamilyDetails] = useState(initialData.familyDetails);
  const [previousTravelDetails, setPreviousTravelDetails] = useState(
    initialData.previousTravelDetails
  );
  const [leaveType, setLeaveType] = useState(initialData.leaveType);

  const [sanctionedPosts, setSanctionedPosts] = useState(initialData.sanctionedPosts);
  const [workingTeachers, setWorkingTeachers] = useState(initialData.workingTeachers);
  const [workingTeachersWords, setWorkingTeachersWords] = useState(initialData.workingTeachersWords);
  const [maleStudents, setMaleStudents] = useState(initialData.maleStudents);
  const [femaleStudents, setFemaleStudents] = useState(initialData.femaleStudents);
  const [totalStudents, setTotalStudents] = useState(initialData.totalStudents);

  const [serviceStartDate, setServiceStartDate] = useState(initialData.serviceStartDate);
  const [serviceCalculationDate, setServiceCalculationDate] = useState(
    initialData.serviceCalculationDate
  );
  const [totalServiceYears, setTotalServiceYears] = useState(initialData.totalServiceYears);
  const [totalServiceMonths, setTotalServiceMonths] = useState(initialData.totalServiceMonths);
  const [totalServiceDays, setTotalServiceDays] = useState(initialData.totalServiceDays);
  const [earnedHalfPayYears, setEarnedHalfPayYears] = useState(initialData.earnedHalfPayYears);
  const [earnedHalfPayMonths, setEarnedHalfPayMonths] = useState(initialData.earnedHalfPayMonths);
  const [earnedHalfPayDays, setEarnedHalfPayDays] = useState(initialData.earnedHalfPayDays);
  const [leaveTakenYears, setLeaveTakenYears] = useState(initialData.leaveTakenYears || '০০');
  const [leaveTakenMonths, setLeaveTakenMonths] = useState(initialData.leaveTakenMonths || '০০');
  const [leaveTakenDays, setLeaveTakenDays] = useState(initialData.leaveTakenDays || '০০');
  const [balanceYears, setBalanceYears] = useState(initialData.balanceYears);
  const [balanceMonths, setBalanceMonths] = useState(initialData.balanceMonths);
  const [balanceDays, setBalanceDays] = useState(initialData.balanceDays);

  const [ddoName, setDdoName] = useState(initialData.ddoName);
  const [ddoDesignation, setDdoDesignation] = useState(initialData.ddoDesignation);
  const [status, setStatus] = useState<LeaveApplicationStatus>(initialData.status);

  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync only when initialData or formVersion explicitly changes (NOT when lockSettings toggles!)
  useEffect(() => {
    setApplicantName(initialData.applicantName);
    setFatherName(initialData.fatherName);
    setDesignation(initialData.designation);
    setSchoolName(initialData.schoolName);
    setUpazilaName(initialData.upazilaName);
    setDistrictName(initialData.districtName);
    setDivisionName(initialData.divisionName);
    setRecipientDesignation(initialData.recipientDesignation);

    const resolvedAppDate = initialData.applicationDate || getTodayDdMmYyyyBn();
    const resolvedCalcDate = initialData.serviceCalculationDate || resolvedAppDate;
    const resolvedStartDate = initialData.serviceStartDate || initialData.joiningDate;
    const resolvedTakenY = initialData.leaveTakenYears || '০০';
    const resolvedTakenM = initialData.leaveTakenMonths || '০০';
    const resolvedTakenD = initialData.leaveTakenDays || '০০';

    setBasicSalary(initialData.basicSalary);
    setSalaryScale(initialData.salaryScale);
    setJoiningDate(initialData.joiningDate);
    setBirthDate(initialData.birthDate);
    const autoAge =
      !initialData.calculatedAge && initialData.birthDate
        ? formatBengaliAge(initialData.birthDate, resolvedAppDate) || ''
        : initialData.calculatedAge;
    setCalculatedAge(autoAge);

    setApplicationDate(resolvedAppDate);
    setDestinationCountry(initialData.destinationCountry);
    setLeavePurpose(initialData.leavePurpose);
    setLeaveStartDate(initialData.leaveStartDate);
    setLeaveEndDate(initialData.leaveEndDate);
    setLeaveDays(initialData.leaveDays);
    setLeaveDaysWords(initialData.leaveDaysWords);
    setLeaveAddress(initialData.leaveAddress);
    setExpenseSource(initialData.expenseSource);
    setFamilyAccompany(initialData.familyAccompany);
    setFamilyDetails(initialData.familyDetails);
    setPreviousTravelDetails(initialData.previousTravelDetails);
    setLeaveType(initialData.leaveType);

    setSanctionedPosts(initialData.sanctionedPosts);
    setWorkingTeachers(initialData.workingTeachers);
    setWorkingTeachersWords(initialData.workingTeachersWords);
    setMaleStudents(initialData.maleStudents);
    setFemaleStudents(initialData.femaleStudents);
    setTotalStudents(initialData.totalStudents);

    setServiceStartDate(resolvedStartDate);
    setServiceCalculationDate(resolvedCalcDate);
    setLeaveTakenYears(resolvedTakenY);
    setLeaveTakenMonths(resolvedTakenM);
    setLeaveTakenDays(resolvedTakenD);

    const hasNoServiceCalcYet =
      (!initialData.totalServiceYears || initialData.totalServiceYears === '০০') &&
      (!initialData.totalServiceMonths || initialData.totalServiceMonths === '০০') &&
      (!initialData.totalServiceDays || initialData.totalServiceDays === '০০');

    const computedService =
      hasNoServiceCalcYet && resolvedStartDate && resolvedCalcDate
        ? calculateExactYmd(resolvedStartDate, resolvedCalcDate, true)
        : null;

    if (computedService) {
      const earned = calculatePlr1959HalfPayEarned(computedService);
      const bal = subtractYmd(earned, {
        years: resolvedTakenY,
        months: resolvedTakenM,
        days: resolvedTakenD,
      });
      setTotalServiceYears(computedService.years);
      setTotalServiceMonths(computedService.months);
      setTotalServiceDays(computedService.days);
      setEarnedHalfPayYears(earned.years);
      setEarnedHalfPayMonths(earned.months);
      setEarnedHalfPayDays(earned.days);
      setBalanceYears(bal.years);
      setBalanceMonths(bal.months);
      setBalanceDays(bal.days);
    } else {
      setTotalServiceYears(initialData.totalServiceYears);
      setTotalServiceMonths(initialData.totalServiceMonths);
      setTotalServiceDays(initialData.totalServiceDays);
      setEarnedHalfPayYears(initialData.earnedHalfPayYears);
      setEarnedHalfPayMonths(initialData.earnedHalfPayMonths);
      setEarnedHalfPayDays(initialData.earnedHalfPayDays);
      setBalanceYears(initialData.balanceYears);
      setBalanceMonths(initialData.balanceMonths);
      setBalanceDays(initialData.balanceDays);
    }

    setDdoName(initialData.ddoName);
    setDdoDesignation(initialData.ddoDesignation);
    setStatus(initialData.status);
    setFormError(null);
  }, [initialData, formVersion]);

  // Auto-calculate age when birthDate or applicationDate changes
  const handleBirthOrAppDateChange = (newBirth: string, newAppDate: string) => {
    const computedAge = formatBengaliAge(newBirth, newAppDate);
    if (computedAge) {
      setCalculatedAge(computedAge);
    }
  };

  // Auto-calculate leave days & words when start/end dates change
  const handleLeaveDateChange = (newStart: string, newEnd: string) => {
    const dur = calculateLeaveDuration(newStart, newEnd);
    if (dur) {
      setLeaveDays(dur.days);
      setLeaveDaysWords(dur.words);
    }
  };

  // Auto-calculate total students when male/female counts change
  const handleStudentsChange = (newMale: string, newFemale: string) => {
    const m = parseBengaliInt(newMale);
    const f = parseBengaliInt(newFemale);
    if (m !== null || f !== null) {
      const sum = Math.max(0, m ?? 0) + Math.max(0, f ?? 0);
      setTotalStudents(toBengaliNumber(sum));
    }
  };

  // Auto-calculate working teachers in words
  const handleWorkingTeachersChange = (val: string) => {
    setWorkingTeachers(val);
    const words = numberToBengaliWords(val);
    if (words) {
      setWorkingTeachersWords(words);
    }
  };

  // Sync balance whenever earned or taken changes
  const syncBalance = (
    eY: string,
    eM: string,
    eD: string,
    tY: string,
    tM: string,
    tD: string
  ) => {
    const bal = subtractYmd(
      { years: eY, months: eM, days: eD },
      { years: tY, months: tM, days: tD }
    );
    setBalanceYears(bal.years);
    setBalanceMonths(bal.months);
    setBalanceDays(bal.days);
  };

  // Live silent recalculation of service duration, PLR-1959 earned leave, and balance
  const tryRecalculateLeaveAccount = (
    startStr: string,
    endStr: string,
    tY = leaveTakenYears,
    tM = leaveTakenMonths,
    tD = leaveTakenDays
  ): boolean => {
    const service = calculateExactYmd(startStr, endStr, true);
    if (!service) return false;

    setTotalServiceYears(service.years);
    setTotalServiceMonths(service.months);
    setTotalServiceDays(service.days);

    const earned = calculatePlr1959HalfPayEarned(service);
    setEarnedHalfPayYears(earned.years);
    setEarnedHalfPayMonths(earned.months);
    setEarnedHalfPayDays(earned.days);

    const bal = subtractYmd(earned, { years: tY, months: tM, days: tD });
    setBalanceYears(bal.years);
    setBalanceMonths(bal.months);
    setBalanceDays(bal.days);
    return true;
  };

  // Recalculate earned & balance when totalService* fields are manually edited
  const syncFromServiceYmd = (
    sY: string,
    sM: string,
    sD: string,
    tY = leaveTakenYears,
    tM = leaveTakenMonths,
    tD = leaveTakenDays
  ) => {
    const earned = calculatePlr1959HalfPayEarned({ years: sY, months: sM, days: sD });
    setEarnedHalfPayYears(earned.years);
    setEarnedHalfPayMonths(earned.months);
    setEarnedHalfPayDays(earned.days);

    const bal = subtractYmd(earned, { years: tY, months: tM, days: tD });
    setBalanceYears(bal.years);
    setBalanceMonths(bal.months);
    setBalanceDays(bal.days);
  };

  // Explicit button handler for Leave Account calculation
  const handleAutoCalculateLeaveAccount = (
    startStr = serviceStartDate,
    endStr = serviceCalculationDate,
    tY = leaveTakenYears,
    tM = leaveTakenMonths,
    tD = leaveTakenDays
  ) => {
    if (!tryRecalculateLeaveAccount(startStr, endStr, tY, tM, tD)) {
      setFormError('সঠিক DD/MM/YYYY ফরম্যাটে চাকুরিকালের শুরু ও হিসাবের তারিখ লিখুন।');
      return;
    }
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !fatherName.trim() || !schoolName.trim()) {
      setFormError('অনুগ্রহ করে আবেদনকারীর নাম, পিতার নাম এবং বিদ্যালয়ের নাম পূরণ করুন।');
      return;
    }
    if (!destinationCountry.trim() || !leaveStartDate.trim() || !leaveEndDate.trim()) {
      setFormError('অনুগ্রহ করে গন্তব্য দেশ এবং ছুটির শুরু ও শেষ তারিখ পূরণ করুন।');
      return;
    }

    setFormError(null);
    onSaveApplication({
      applicantName: applicantName.trim(),
      fatherName: fatherName.trim(),
      designation,
      schoolName: schoolName.trim(),
      upazilaName: upazilaName.trim(),
      districtName: districtName.trim(),
      divisionName: divisionName.trim(),
      recipientDesignation: recipientDesignation.trim(),
      basicSalary: toBengaliNumber(basicSalary.trim()),
      salaryScale: toBengaliNumber(salaryScale.trim()),
      joiningDate: toBengaliNumber(joiningDate.trim()),
      birthDate: toBengaliNumber(birthDate.trim()),
      calculatedAge: toBengaliNumber(calculatedAge.trim()),
      applicationDate: toBengaliNumber(applicationDate.trim() || getTodayDdMmYyyyBn()),
      destinationCountry: destinationCountry.trim(),
      leavePurpose,
      leaveStartDate: toBengaliNumber(leaveStartDate.trim()),
      leaveEndDate: toBengaliNumber(leaveEndDate.trim()),
      leaveDays: toBengaliNumber(leaveDays.trim()),
      leaveDaysWords: leaveDaysWords.trim(),
      leaveAddress: leaveAddress.trim(),
      expenseSource: expenseSource.trim(),
      familyAccompany: familyAccompany.trim(),
      familyDetails: familyDetails.trim(),
      previousTravelDetails: previousTravelDetails.trim(),
      leaveType: leaveType.trim(),
      sanctionedPosts: toBengaliNumber(sanctionedPosts.trim()),
      workingTeachers: toBengaliNumber(workingTeachers.trim()),
      workingTeachersWords: workingTeachersWords.trim(),
      maleStudents: toBengaliNumber(maleStudents.trim()),
      femaleStudents: toBengaliNumber(femaleStudents.trim()),
      totalStudents: toBengaliNumber(totalStudents.trim()),
      serviceStartDate: toBengaliNumber(serviceStartDate.trim()),
      serviceCalculationDate: toBengaliNumber(
        serviceCalculationDate.trim() || applicationDate.trim() || getTodayDdMmYyyyBn()
      ),
      totalServiceYears: toBengaliNumber(totalServiceYears.trim()),
      totalServiceMonths: toBengaliNumber(totalServiceMonths.trim()),
      totalServiceDays: toBengaliNumber(totalServiceDays.trim()),
      earnedHalfPayYears: toBengaliNumber(earnedHalfPayYears.trim()),
      earnedHalfPayMonths: toBengaliNumber(earnedHalfPayMonths.trim()),
      earnedHalfPayDays: toBengaliNumber(earnedHalfPayDays.trim()),
      leaveTakenYears: toBengaliNumber(leaveTakenYears.trim() || '০০'),
      leaveTakenMonths: toBengaliNumber(leaveTakenMonths.trim() || '০০'),
      leaveTakenDays: toBengaliNumber(leaveTakenDays.trim() || '০০'),
      balanceYears: toBengaliNumber(balanceYears.trim()),
      balanceMonths: toBengaliNumber(balanceMonths.trim()),
      balanceDays: toBengaliNumber(balanceDays.trim()),
      ddoName: ddoName.trim(),
      ddoDesignation: ddoDesignation.trim(),
      status,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const renderLockBtn = (field: LeaveLockableField, label?: string) => {
    const isFixed = Boolean((fixedRegionFields as Record<string, boolean> | undefined)?.[field]);
    const isLocked = isFixed || lockSettings[field];
    return (
      <button
        type="button"
        onClick={() => onToggleLock(field)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          isLocked
            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
        }`}
        title={isFixed ? 'লগইনকৃত উপজেলা প্রোফাইল থেকে স্থায়ীভাবে নির্ধারিত' : isLocked ? 'লক করা আছে (নতুন ফর্মে এই মান থাকবে)' : 'আনলক করা (রিসেট হবে)'}
      >
        {isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
        <span>{label ? `${label} · ${isLocked ? 'লকড' : 'আনলক'}` : isLocked ? 'লকড' : 'আনলক'}</span>
      </button>
    );
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 sm:p-6 text-slate-100">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {isEditing
              ? 'বহি:বাংলাদেশ ছুটি আবেদন সম্পাদনা'
              : 'বহি:বাংলাদেশ ছুটি ও বিদেশ ভ্রমণ আবেদন ফর্ম'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            সরকারি প্রাথমিক বিদ্যালয়ের শিক্ষক ও কর্মচারীদের ৬ পৃষ্ঠার পূর্ণাঙ্গ ফাইল প্রসেসিং · উপজেলা শিক্ষা অফিস{upazilaName ? `, ${upazilaName}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="leave-status-select" className="text-xs text-slate-400 whitespace-nowrap">
            আবেদনের স্থিতি:
          </label>
          <select
            id="leave-status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as LeaveApplicationStatus)}
            className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="খসড়া">খসড়া</option>
            <option value="যাচাইকৃত">যাচাইকৃত</option>
            <option value="শিক্ষা অফিসে প্রক্রিয়াধীন">শিক্ষা অফিসে প্রক্রিয়াধীন</option>
            <option value="অনুমোদিত">অনুমোদিত</option>
            <option value="প্রেরিত">প্রেরিত</option>
          </select>
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          className="mb-5 px-4 py-3 rounded-lg bg-rose-950/60 border border-rose-700/60 text-rose-200 text-xs sm:text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-emerald-400">
            ১. আবেদনকারী, প্রাপক ও বিদ্যালয় পরিচিতি
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div>
              <label className="text-xs text-slate-300 font-medium">
                আবেদনকারীর নাম <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="যেমন: রূপালী রানী দাস"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">
                পিতার নাম <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="যেমন: সুদীপ্ত দাস"
                required
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">পদবী</label>
                {renderLockBtn('designation')}
              </div>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className={inputCls}
              >
                <option value="সহকারী শিক্ষক">সহকারী শিক্ষক</option>
                <option value="প্রধান শিক্ষক">প্রধান শিক্ষক</option>
                <option value="ভারপ্রাপ্ত প্রধান শিক্ষক">ভারপ্রাপ্ত প্রধান শিক্ষক</option>
                <option value="সহকারী প্রধান শিক্ষক">সহকারী প্রধান শিক্ষক</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">প্রাপক (বরাবর)</label>
              <input
                type="text"
                value={recipientDesignation}
                onChange={(e) => setRecipientDesignation(e.target.value)}
                placeholder="বিভাগীয় উপপরিচালক"
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">
                  বিদ্যালয়ের নাম <span className="text-rose-400">*</span>
                </label>
                {renderLockBtn('schoolName')}
              </div>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">উপজেলা</label>
                {renderLockBtn('upazilaName')}
              </div>
              <input
                type="text"
                value={upazilaName}
                readOnly={Boolean(fixedRegionFields?.upazilaName)}
                onChange={(e) => {
                  if (!fixedRegionFields?.upazilaName) setUpazilaName(e.target.value);
                }}
                className={`${inputCls} ${fixedRegionFields?.upazilaName ? 'opacity-80 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">জেলা</label>
                {renderLockBtn('districtName')}
              </div>
              <input
                type="text"
                value={districtName}
                readOnly={Boolean(fixedRegionFields?.districtName)}
                onChange={(e) => {
                  if (!fixedRegionFields?.districtName) setDistrictName(e.target.value);
                }}
                className={`${inputCls} ${fixedRegionFields?.districtName ? 'opacity-80 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">বিভাগ</label>
                {renderLockBtn('divisionName')}
              </div>
              <input
                type="text"
                value={divisionName}
                readOnly={Boolean(fixedRegionFields?.divisionName)}
                onChange={(e) => {
                  if (!fixedRegionFields?.divisionName) setDivisionName(e.target.value);
                }}
                className={`${inputCls} ${fixedRegionFields?.divisionName ? 'opacity-80 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 pt-5 border-t border-slate-800/80">
          <h2 className="text-sm font-semibold text-emerald-400">
            ২. বেতন, চাকুরি ও বয়স বিবরণ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            <div>
              <label className="text-xs text-slate-300 font-medium">মূল বেতন</label>
              <input
                type="text"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
                placeholder="১৪,৭৬০/-"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">বেতন স্কেল</label>
              <input
                type="text"
                value={salaryScale}
                onChange={(e) => setSalaryScale(e.target.value)}
                placeholder="১১০০০-২৬৫৯০"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">যোগদানের তারিখ</label>
              <input
                type="text"
                value={joiningDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setJoiningDate(v);
                  const syncedStart = !serviceStartDate || serviceStartDate === joiningDate ? v : serviceStartDate;
                  if (syncedStart !== serviceStartDate) {
                    setServiceStartDate(syncedStart);
                  }
                  const calcTarget = serviceCalculationDate || applicationDate || getTodayDdMmYyyyBn();
                  tryRecalculateLeaveAccount(syncedStart, calcTarget);
                }}
                placeholder="০৪/১০/২০১৮"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">জন্ম তারিখ</label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setBirthDate(v);
                  handleBirthOrAppDateChange(v, applicationDate);
                }}
                placeholder="০৭/০১/১৯৯১"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">বয়স (স্বয়ংক্রিয়/সম্পাদনাযোগ্য)</label>
              <input
                type="text"
                value={calculatedAge}
                onChange={(e) => setCalculatedAge(e.target.value)}
                placeholder="৩৫ বছর ১০ মাস ১৫ দিন"
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 pt-5 border-t border-slate-800/80">
          <h2 className="text-sm font-semibold text-emerald-400">
            ৩. প্রস্তাবিত ছুটি ও ভ্রমণ বিবরণ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div>
              <label className="text-xs text-slate-300 font-medium">আবেদনের তারিখ</label>
              <input
                type="text"
                value={applicationDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setApplicationDate(v);
                  handleBirthOrAppDateChange(birthDate, v);
                  const syncedEnd =
                    !serviceCalculationDate || serviceCalculationDate === applicationDate
                      ? v
                      : serviceCalculationDate;
                  if (syncedEnd !== serviceCalculationDate) {
                    setServiceCalculationDate(syncedEnd);
                  }
                  tryRecalculateLeaveAccount(serviceStartDate || joiningDate, syncedEnd);
                }}
                placeholder={getTodayDdMmYyyyBn()}
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">
                  গন্তব্য দেশ <span className="text-rose-400">*</span>
                </label>
                {renderLockBtn('destinationCountry')}
              </div>
              <input
                type="text"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                required
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">ভ্রমণের উদ্দেশ্য</label>
                {renderLockBtn('leavePurpose')}
              </div>
              <select
                value={leavePurpose}
                onChange={(e) => setLeavePurpose(e.target.value)}
                className={inputCls}
              >
                <option value="তীর্থস্থান দর্শনের উদ্দেশ্যে">তীর্থস্থান দর্শনের উদ্দেশ্যে</option>
                <option value="চিকিৎসা গ্রহণের উদ্দেশ্যে">চিকিৎসা গ্রহণের উদ্দেশ্যে</option>
                <option value="পবিত্র ওমরাহ পালনের উদ্দেশ্যে">পবিত্র ওমরাহ পালনের উদ্দেশ্যে</option>
                <option value="দর্শনীয় স্থান ভ্রমণের উদ্দেশ্যে">দর্শনীয় স্থান ভ্রমণের উদ্দেশ্যে</option>
                <option value="পারিবারিক কারণে">পারিবারিক কারণে</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">ভ্রমণকাল কী হিসেবে গণ্য হবে</label>
              <input
                type="text"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                placeholder="বহি:বাংলাদেশ ছুটি"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">
                ছুটি শুরুর তারিখ <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={leaveStartDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setLeaveStartDate(v);
                  handleLeaveDateChange(v, leaveEndDate);
                }}
                placeholder="১৭/০৮/২০২৬"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">
                ছুটি শেষের তারিখ <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={leaveEndDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setLeaveEndDate(v);
                  handleLeaveDateChange(leaveStartDate, v);
                }}
                placeholder="৩১/০৮/২০২৬"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">মোট দিন (সংখ্যা ও কথায়)</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="text"
                  value={leaveDays}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLeaveDays(v);
                    const words = numberToBengaliWords(v);
                    if (words) setLeaveDaysWords(words);
                  }}
                  placeholder="১৫"
                  className={compactInputCls}
                />
                <input
                  type="text"
                  value={leaveDaysWords}
                  onChange={(e) => setLeaveDaysWords(e.target.value)}
                  placeholder="পনেরো"
                  className={compactInputCls}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">ছুটিকালীন ঠিকানা</label>
              <input
                type="text"
                value={leaveAddress}
                onChange={(e) => setLeaveAddress(e.target.value)}
                placeholder="ছুটিকালীন অবস্থান/ঠিকানা"
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">ব্যয় নির্বাহের উৎস</label>
                {renderLockBtn('expenseSource')}
              </div>
              <input
                type="text"
                value={expenseSource}
                onChange={(e) => setExpenseSource(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">একা নাকি পরিবারের সাথে</label>
              <input
                type="text"
                value={familyAccompany}
                onChange={(e) => setFamilyAccompany(e.target.value)}
                placeholder="প্রযোজ্য নয়"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium">সঙ্গী সদস্যদের বিবরণ</label>
              <input
                type="text"
                value={familyDetails}
                onChange={(e) => setFamilyDetails(e.target.value)}
                placeholder="প্রযোজ্য নয়"
                className={inputCls}
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-xs text-slate-300 font-medium">
                ঐ দেশ শেষ কবে ভ্রমণ করেছেন ও স্থায়িত্ব
              </label>
              <input
                type="text"
                value={previousTravelDetails}
                onChange={(e) => setPreviousTravelDetails(e.target.value)}
                placeholder="প্রযোজ্য নয়"
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 pt-5 border-t border-slate-800/80">
          <h2 className="text-sm font-semibold text-emerald-400">
            ৪. বিদ্যালয়ের পরিসংখ্যান ও আয়ন ব্যয়ন কর্মকর্তা
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">মঞ্জুরীকৃত পদ</label>
                {renderLockBtn('sanctionedPosts')}
              </div>
              <input
                type="text"
                value={sanctionedPosts}
                onChange={(e) => setSanctionedPosts(e.target.value)}
                placeholder="০৬"
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">কর্মরত শিক্ষক (সংখ্যা ও কথায়)</label>
                {renderLockBtn('workingTeachers')}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="text"
                  value={workingTeachers}
                  onChange={(e) => handleWorkingTeachersChange(e.target.value)}
                  placeholder="০৬"
                  className={compactInputCls}
                />
                <input
                  type="text"
                  value={workingTeachersWords}
                  onChange={(e) => setWorkingTeachersWords(e.target.value)}
                  placeholder="ছয়"
                  className={compactInputCls}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-300 font-medium">ছাত্র, ছাত্রী ও মোট শিক্ষার্থী</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <input
                  type="text"
                  value={maleStudents}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMaleStudents(v);
                    handleStudentsChange(v, femaleStudents);
                  }}
                  placeholder="ছাত্র"
                  className={`${compactInputCls} text-center tabular-nums`}
                />
                <input
                  type="text"
                  value={femaleStudents}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFemaleStudents(v);
                    handleStudentsChange(maleStudents, v);
                  }}
                  placeholder="ছাত্রী"
                  className={`${compactInputCls} text-center tabular-nums`}
                />
                <input
                  type="text"
                  value={totalStudents}
                  onChange={(e) => setTotalStudents(e.target.value)}
                  placeholder="মোট"
                  className={`${compactInputCls} text-center text-emerald-300 font-semibold tabular-nums`}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">কর্মকর্তার নাম (DDO)</label>
                {renderLockBtn('ddoName')}
              </div>
              <input
                type="text"
                value={ddoName}
                onChange={(e) => setDdoName(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">কর্মকর্তার পদবী</label>
                {renderLockBtn('ddoDesignation')}
              </div>
              <input
                type="text"
                value={ddoDesignation}
                onChange={(e) => setDdoDesignation(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Section 5: Leave Account Form */}
        <section className="space-y-3 pt-5 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-emerald-400">
              ৫. ছুটির হিসাব বিবরণী (Leave Account Form - PLR 1959)
            </h2>
            <button
              type="button"
              onClick={() => handleAutoCalculateLeaveAccount()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>হিসাব স্বয়ংক্রিয় করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs text-slate-300 font-medium">চাকুরিকাল শুরু (হইতে)</label>
              <input
                type="text"
                value={serviceStartDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setServiceStartDate(v);
                  tryRecalculateLeaveAccount(v, serviceCalculationDate);
                }}
                placeholder="০৪/১০/২০১৮"
                className={inputCls}
              />
            </div>
            <div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-slate-300 font-medium">
                  হিসাবের তারিখ (পর্যন্ত)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const targetDate = applicationDate || getTodayDdMmYyyyBn();
                    setServiceCalculationDate(targetDate);
                    tryRecalculateLeaveAccount(serviceStartDate || joiningDate, targetDate);
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                >
                  আবেদনের তারিখ / আজকের তারিখ বসান
                </button>
              </div>
              <input
                type="text"
                value={serviceCalculationDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setServiceCalculationDate(v);
                  tryRecalculateLeaveAccount(serviceStartDate || joiningDate, v);
                }}
                placeholder={getTodayDdMmYyyyBn()}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
            <div>
              <label className="text-slate-300 font-medium">মোট চাকুরিকাল (বছর, মাস, দিন)</label>
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                <input
                  type="text"
                  value={totalServiceYears}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTotalServiceYears(v);
                    syncFromServiceYmd(v, totalServiceMonths, totalServiceDays);
                  }}
                  placeholder="বছর"
                  className={`${compactInputCls} text-center tabular-nums`}
                />
                <input
                  type="text"
                  value={totalServiceMonths}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTotalServiceMonths(v);
                    syncFromServiceYmd(totalServiceYears, v, totalServiceDays);
                  }}
                  placeholder="মাস"
                  className={`${compactInputCls} text-center tabular-nums`}
                />
                <input
                  type="text"
                  value={totalServiceDays}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTotalServiceDays(v);
                    syncFromServiceYmd(totalServiceYears, totalServiceMonths, v);
                  }}
                  placeholder="দিন"
                  className={`${compactInputCls} text-center tabular-nums`}
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium">অর্জিত অর্ধগড় ছুটি (বছর, মাস, দিন)</label>
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                <input
                  type="text"
                  value={earnedHalfPayYears}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEarnedHalfPayYears(v);
                    syncBalance(
                      v,
                      earnedHalfPayMonths,
                      earnedHalfPayDays,
                      leaveTakenYears,
                      leaveTakenMonths,
                      leaveTakenDays
                    );
                  }}
                  placeholder="বছর"
                  className={`${compactInputCls} text-center tabular-nums`}
                />
                <input
                  type="text"
                  value={earnedHalfPayMonths}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEarnedHalfPayMonths(v);
                    syncBalance(
                      earnedHalfPayYears,
                      v,
                      earnedHalfPayDays,
                      leaveTakenYears,
                      leaveTakenMonths,
                      leaveTakenDays
                    );
                  }}
                  placeholder="মাস"
                  className={`${compactInputCls} text-center tabular-nums`}
                />
                <input
                  type="text"
                  value={earnedHalfPayDays}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEarnedHalfPayDays(v);
                    syncBalance(
                      earnedHalfPayYears,
                      earnedHalfPayMonths,
                      v,
                      leaveTakenYears,
                      leaveTakenMonths,
                      leaveTakenDays
                    );
                  }}
                  placeholder="দিন"
                  className={`${compactInputCls} text-center tabular-nums`}
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium">পূর্বে গৃহীত ছুটি (বছর, মাস, দিন)</label>
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                <input
                  type="text"
                  value={leaveTakenYears}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLeaveTakenYears(v);
                    syncBalance(
                      earnedHalfPayYears,
                      earnedHalfPayMonths,
                      earnedHalfPayDays,
                      v,
                      leaveTakenMonths,
                      leaveTakenDays
                    );
                  }}
                  placeholder="০০"
                  className={`${compactInputCls} text-center tabular-nums`}
                />
                <input
                  type="text"
                  value={leaveTakenMonths}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLeaveTakenMonths(v);
                    syncBalance(
                      earnedHalfPayYears,
                      earnedHalfPayMonths,
                      earnedHalfPayDays,
                      leaveTakenYears,
                      v,
                      leaveTakenDays
                    );
                  }}
                  placeholder="০০"
                  className={`${compactInputCls} text-center tabular-nums`}
                />
                <input
                  type="text"
                  value={leaveTakenDays}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLeaveTakenDays(v);
                    syncBalance(
                      earnedHalfPayYears,
                      earnedHalfPayMonths,
                      earnedHalfPayDays,
                      leaveTakenYears,
                      leaveTakenMonths,
                      v
                    );
                  }}
                  placeholder="০০"
                  className={`${compactInputCls} text-center tabular-nums`}
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium">ছুটির ব্যালেন্স (বছর, মাস, দিন)</label>
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                <input
                  type="text"
                  value={balanceYears}
                  onChange={(e) => setBalanceYears(e.target.value)}
                  placeholder="বছর"
                  className={`${compactInputCls} text-center text-emerald-300 tabular-nums`}
                />
                <input
                  type="text"
                  value={balanceMonths}
                  onChange={(e) => setBalanceMonths(e.target.value)}
                  placeholder="মাস"
                  className={`${compactInputCls} text-center text-emerald-300 tabular-nums`}
                />
                <input
                  type="text"
                  value={balanceDays}
                  onChange={(e) => setBalanceDays(e.target.value)}
                  placeholder="দিন"
                  className={`${compactInputCls} text-center text-emerald-300 tabular-nums`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            লক করা ফিল্ডের মান পরবর্তী নতুন আবেদনে স্বয়ংক্রিয়ভাবে বজায় থাকবে।
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors inline-flex items-center gap-2 border border-emerald-500 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>সংরক্ষিত হয়েছে</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'আপডেট সম্পন্ন করুন' : 'ছুটি ফাইল সেভ করুন'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
