/**
 * Bengali *input* helpers for the death-claim form.
 *
 * Digits, currency and words all come from src/lib/format and
 * src/utils/bengaliConverter - this file only keeps what is app4 specific:
 * normalising what the user types into the boxes.
 */
import { BN_DIGITS, toEn } from '../../src/lib/format';

/**
 * Converts every digit the user types into its Bengali counterpart while typing.
 *
 * This is what keeps dates, years, GPF account numbers and amounts in Bengali
 * digits in the *input boxes themselves* - not only in the generated print
 * document. It also:
 *   - normalises the common date separators so a Bengali keyboard (।/৳ keys)
 *     never produces a broken date, and
 *   - leaves non-digit characters (/, -, .) untouched so date masks keep working.
 */
export function normaliseBengaliInput(value: string): string {
  if (value === undefined || value === null) return '';
  return String(value)
    // Bengali danda / comma-as-separator typed on a Bengali keyboard.
    .replace(/।/g, '/')
    .replace(/[0-9]/g, (digit) => BN_DIGITS[parseInt(digit, 10)]);
}

/**
 * Normalises a *date-like* string to Bengali digits with '/' separators.
 * Accepts dd/mm/yyyy, yyyy-mm-dd and dd-mm-yyyy and always returns dd/mm/yyyy.
 * Used by the date inputs so the print output can never fall back to English.
 */
export function normaliseBengaliDate(value: string): string {
  if (!value) return '';
  const english = toEn(String(value))
    .replace(/[।]/g, '/')
    .replace(/[.]/g, '/')
    .replace(/-/g, '/')
    .replace(/\s+/g, '');

  const iso = english.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  const normalised = iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : english;
  return normaliseBengaliInput(normalised);
}

/**
 * Parses a numeric string that may be written in Bengali digits, with or
 * without commas, into a real number. Returns 0 for empty/invalid input.
 *
 * `parseFloat('৩০০০০০')` is NaN - that bug silently stored every claim amount
 * as 0, so all amount handling must go through this helper instead.
 */
export function parseBengaliNumber(value: number | string | undefined | null): number {
  if (value === undefined || value === null || value === '') return 0;
  const english = toEn(String(value)).replace(/[,\s৳]/g, '');
  const parsed = parseFloat(english);
  return Number.isFinite(parsed) ? parsed : 0;
}

