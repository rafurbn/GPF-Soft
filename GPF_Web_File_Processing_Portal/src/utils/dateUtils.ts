import { toBanglaDigits } from './numberToBanglaWords';

/**
 * Calculates age based on Date of Birth and Application Date.
 * Returns detailed age info and whether the person is over 52 years old.
 */
export interface AgeCalculationResult {
  years: number;
  months: number;
  days: number;
  isOver52: boolean;
  text: string;
}

export const parseDateString = (dateStr: string): Date | null => {
  if (!dateStr || !dateStr.trim()) return null;
  // Convert any Bengali digits to English
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const normalized = dateStr.replace(/[০-৯]/g, (d) => String(bengaliDigits.indexOf(d)));

  // Try parsing DD/MM/YYYY or DD-MM-YYYY
  const parts = normalized.split(/[/.-]/);
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);

    // If year is 2 digits
    if (year < 100) {
      year += year > 40 ? 1900 : 2000;
    }

    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }

  // Fallback to standard Date parse
  const fallback = new Date(normalized);
  return isNaN(fallback.getTime()) ? null : fallback;
};

export const calculateAge = (
  dobStr?: string,
  applyDateStr?: string
): AgeCalculationResult => {
  if (!dobStr) {
    return { years: 0, months: 0, days: 0, isOver52: false, text: '' };
  }

  const dob = parseDateString(dobStr);
  const refDate = applyDateStr ? parseDateString(applyDateStr) || new Date() : new Date();

  if (!dob || isNaN(dob.getTime())) {
    return { years: 0, months: 0, days: 0, isOver52: false, text: '' };
  }

  let years = refDate.getFullYear() - dob.getFullYear();
  let months = refDate.getMonth() - dob.getMonth();
  let days = refDate.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    // Get days in previous month
    const prevMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const isOver52 = years >= 52;
  const yearsBn = toBanglaDigits(years);
  const monthsBn = toBanglaDigits(months);
  const daysBn = toBanglaDigits(days);

  const text = isOver52
    ? `বয়স: ${yearsBn} বছর ${monthsBn} মাস ${daysBn} দিন (৫২ বছরের ঊর্ধ্বে - অফেরতযোগ্য পাওয়ার যোগ্য)`
    : `বয়স: ${yearsBn} বছর ${monthsBn} মাস ${daysBn} দিন (৫২ বছর পূর্ণ হয়নি)`;

  return {
    years,
    months,
    days,
    isOver52,
    text,
  };
};

export const getCurrentBengaliDate = (): string => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return toBanglaDigits(`${day}/${month}/${year}`);
};
