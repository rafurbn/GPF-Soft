import {
  banglaDigits,
  toBengaliDigits,
  toEnglishDigits,
  formatBanglaCurrency,
} from '../utils/bengaliConverter';

/**
 * The single place that decides how a number or a date is *displayed*.
 * Anything that ends up on screen or in a print document goes through these
 * helpers, so the four apps and the admin panel cannot drift apart again.
 * Stored data (ISO dates, ids, JSON) must use `toEn` instead.
 */

export const BN_DIGITS = banglaDigits;

/** Latin digits -> Bengali digits, leaving every other character untouched. */
export const toBn = (value: number | string | null | undefined): string =>
  value === null || value === undefined ? '' : toBengaliDigits(String(value));

/** Bengali digits -> Latin digits. Use before saving or sending anything. */
export const toEn = (value: number | string | null | undefined): string =>
  value === null || value === undefined ? '' : toEnglishDigits(String(value));

/** Bengali digits with lakh/crore grouping and two decimals: ৩,০০,০০০.০০ */
export const money = (value: number | string | null | undefined): string => {
  const num = parseFloat(toEn(String(value ?? '')).replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(num)) return toBn('0.00');
  const [int, dec] = num.toFixed(2).split('.');
  let grouped = int;
  if (grouped.length > 3) {
    const lastThree = grouped.slice(-3);
    const rest = grouped.slice(0, -3);
    grouped = `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${lastThree}`;
  }
  return `${toBn(grouped)}.${toBn(dec)}`;
};

/** Rounded, no decimals — for KPI cards and totals. Empty input gives ''. */
export const moneyCompact = (value: number | string | null | undefined): string =>
  formatBanglaCurrency(value === null || value === undefined ? '' : String(value));

/** dd/mm/yyyy in Bengali digits; ISO yyyy-mm-dd is flipped to dd/mm/yyyy. */
export const date = (value: string | null | undefined, separator = '/'): string => {
  if (!value) return '';
  const cleaned = toEn(String(value)).replace(/।/g, '/').replace(/[.]/g, '/').replace(/-/g, '/');
  const iso = cleaned.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  const normalised = iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : cleaned;
  return toBn(normalised.trim()).replace(/\//g, separator);
};

/** Bengali date + time, 24h: ২৩/০৯/২০২৬ • ১৪:৩৫ */
export const dateTime = (value: string | number | Date | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)} • ${toBn(
    `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  )}`;
};

/** A count with its Bengali unit: ৫ টি ফাইল */
export const count = (value: number | string | null | undefined, unit = 'টি'): string =>
  `${toBn(value)} ${unit}`;
