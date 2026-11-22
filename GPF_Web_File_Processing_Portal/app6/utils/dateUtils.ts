import { numberToBengaliWords, parseBengaliInt, toBengaliNumber, toEnglishNumber } from './bengaliWords';

export interface ParsedDate {
  day: number;
  month: number;
  year: number;
  dateObj: Date;
}

export interface YmdDuration {
  years: string;
  months: string;
  days: string;
}

export function getTodayDdMmYyyyBn(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  return toBengaliNumber(`${dd}/${mm}/${yyyy}`);
}

/**
 * Parses dates flexibly in DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, DD MM YYYY,
 * YYYY-MM-DD, or 8-digit DDMMYYYY (supporting both Bengali and English digits).
 */
export function parseDdMmYyyy(input: string | undefined | null): ParsedDate | null {
  if (!input) return null;
  const cleaned = toEnglishNumber(input)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  if (!cleaned) return null;

  let day: number;
  let month: number;
  let year: number;

  const dmyMatch = cleaned.match(/^(\d{1,2})[./\-\s]+(\d{1,2})[./\-\s]+(\d{4})$/);
  const ymdMatch = cleaned.match(/^(\d{4})[./\-](\d{1,2})[./\-](\d{1,2})$/);
  const compactMatch = cleaned.match(/^(\d{2})(\d{2})(\d{4})$/);

  if (dmyMatch) {
    day = parseInt(dmyMatch[1], 10);
    month = parseInt(dmyMatch[2], 10);
    year = parseInt(dmyMatch[3], 10);
  } else if (ymdMatch) {
    year = parseInt(ymdMatch[1], 10);
    month = parseInt(ymdMatch[2], 10);
    day = parseInt(ymdMatch[3], 10);
  } else if (compactMatch) {
    day = parseInt(compactMatch[1], 10);
    month = parseInt(compactMatch[2], 10);
    year = parseInt(compactMatch[3], 10);
  } else {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2200) {
    return null;
  }

  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return null;
  }

  return { day, month, year, dateObj };
}

export function extractBengaliYear(dateStr: string | undefined | null): string {
  const parsed = parseDdMmYyyy(dateStr);
  if (parsed) {
    return toBengaliNumber(parsed.year);
  }
  const eng = toEnglishNumber(dateStr || '');
  const yearMatch = eng.match(/(20\d{2}|19\d{2})/);
  if (yearMatch) {
    return toBengaliNumber(yearMatch[1]);
  }
  return toBengaliNumber(new Date().getFullYear());
}

function padTwoBengali(n: number): string {
  const safe = Math.max(0, Math.floor(n));
  return toBengaliNumber(String(safe).padStart(2, '0'));
}

/**
 * Calculates calendar difference (years, months, days) between two dates.
 */
export function calculateExactYmd(
  startStr: string,
  endStr: string,
  inclusive = false
): YmdDuration | null {
  const start = parseDdMmYyyy(startStr);
  const end = parseDdMmYyyy(endStr);
  if (!start || !end || end.dateObj < start.dateObj) return null;

  const endDate = new Date(end.dateObj.getTime());
  if (inclusive) {
    endDate.setDate(endDate.getDate() + 1);
  }

  let years = endDate.getFullYear() - start.year;
  let months = endDate.getMonth() - (start.month - 1);
  let days = endDate.getDate() - start.day;

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years: padTwoBengali(years),
    months: padTwoBengali(months),
    days: padTwoBengali(days),
  };
}

export function formatBengaliAge(birthDateStr: string, referenceDateStr?: string): string | null {
  const ref = referenceDateStr && parseDdMmYyyy(referenceDateStr)
    ? referenceDateStr
    : getTodayDdMmYyyyBn();
  const diff = calculateExactYmd(birthDateStr, ref, false);
  if (!diff) return null;
  return `${diff.years} বছর ${diff.months} মাস ${diff.days} দিন`;
}

/**
 * Calculates inclusive leave days between start and end date.
 */
export function calculateLeaveDuration(
  startStr: string,
  endStr: string
): { days: string; words: string } | null {
  const start = parseDdMmYyyy(startStr);
  const end = parseDdMmYyyy(endStr);
  if (!start || !end || end.dateObj < start.dateObj) return null;

  const utcStart = Date.UTC(start.year, start.month - 1, start.day);
  const utcEnd = Date.UTC(end.year, end.month - 1, end.day);
  const diffDays = Math.round((utcEnd - utcStart) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays <= 0) return null;

  return {
    days: toBengaliNumber(diffDays),
    words: numberToBengaliWords(diffDays),
  };
}

/**
 * Under PLR-1959, half-average-pay leave earned is 1/12th of total duty service.
 * Converts Y/M/D into total 30-day-month normalized days, divides by 12, then formats back to Y/M/D.
 */
export function calculatePlr1959HalfPayEarned(service: YmdDuration): YmdDuration {
  const y = parseBengaliInt(service.years) || 0;
  const m = parseBengaliInt(service.months) || 0;
  const d = parseBengaliInt(service.days) || 0;

  const totalNormalizedDays = y * 360 + m * 30 + d;
  const earnedDaysTotal = Math.floor(totalNormalizedDays / 12);

  const earnedYears = Math.floor(earnedDaysTotal / 360);
  const remAfterYears = earnedDaysTotal % 360;
  const earnedMonths = Math.floor(remAfterYears / 30);
  const earnedDays = remAfterYears % 30;

  return {
    years: padTwoBengali(earnedYears),
    months: padTwoBengali(earnedMonths),
    days: padTwoBengali(earnedDays),
  };
}

export function subtractYmd(earned: YmdDuration, taken: YmdDuration): YmdDuration {
  let y = (parseBengaliInt(earned.years) || 0) - (parseBengaliInt(taken.years) || 0);
  let m = (parseBengaliInt(earned.months) || 0) - (parseBengaliInt(taken.months) || 0);
  let d = (parseBengaliInt(earned.days) || 0) - (parseBengaliInt(taken.days) || 0);

  if (d < 0) {
    m -= 1;
    d += 30;
  }
  if (m < 0) {
    y -= 1;
    m += 12;
  }

  if (y < 0) {
    return { years: '০০', months: '০০', days: '০০' };
  }

  return {
    years: padTwoBengali(y),
    months: padTwoBengali(m),
    days: padTwoBengali(d),
  };
}
