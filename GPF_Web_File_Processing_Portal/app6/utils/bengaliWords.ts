/**
 * Bengali numbers and words conversion utilities
 */

export const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const str = String(num);
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)]);
}

export function toEnglishNumber(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  let res = String(str);
  BENGALI_DIGITS.forEach((bDigit, idx) => {
    res = res.replaceAll(bDigit, String(idx));
  });
  return res;
}

export function parseBengaliInt(str: string | number | undefined | null): number | null {
  if (str === undefined || str === null) return null;
  const cleaned = toEnglishNumber(String(str)).replace(/[^0-9-]/g, '');
  if (!cleaned || cleaned === '-') return null;
  const parsed = parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

const ONES: Record<number, string> = {
  0: 'শূন্য',
  1: 'এক',
  2: 'দুই',
  3: 'তিন',
  4: 'চার',
  5: 'পাঁচ',
  6: 'ছয়',
  7: 'সাত',
  8: 'আট',
  9: 'নয়',
  10: 'দশ',
  11: 'এগারো',
  12: 'বারো',
  13: 'তেরো',
  14: 'চৌদ্দ',
  15: 'পনেরো',
  16: 'ষোলো',
  17: 'সতেরো',
  18: 'আঠারো',
  19: 'উনিশ',
  20: 'বিশ',
  21: 'একুশ',
  22: 'বাইশ',
  23: 'তেইশ',
  24: 'চব্বিশ',
  25: 'পঁচিশ',
  26: 'ছাব্বিশ',
  27: 'সাতাশ',
  28: 'আঠাশ',
  29: 'উনত্রিশ',
  30: 'ত্রিশ',
  31: 'একত্রিশ',
  32: 'বত্রিশ',
  33: 'তেত্রিশ',
  34: 'চৌত্রিশ',
  35: 'পঁয়ত্রিশ',
  36: 'ছত্রিশ',
  37: 'সাঁইত্রিশ',
  38: 'আটত্রিশ',
  39: 'উনচল্লিশ',
  40: 'চল্লিশ',
  41: 'একচল্লিশ',
  42: 'বিয়াল্লিশ',
  43: 'তেতাল্লিশ',
  44: 'চুয়াল্লিশ',
  45: 'পঁয়তাল্লিশ',
  46: 'ছেচল্লিশ',
  47: 'সাতচল্লিশ',
  48: 'আটচল্লিশ',
  49: 'উনপঞ্চাশ',
  50: 'পঞ্চাশ',
  51: 'একান্ন',
  52: 'বায়ান্ন',
  53: 'তিপ্পান্ন',
  54: 'চুয়ান্ন',
  55: 'পঞ্চান্ন',
  56: 'ছাপ্পান্ন',
  57: 'সাতান্ন',
  58: 'আটান্ন',
  59: 'উনষাট',
  60: 'ষাট',
  61: 'একষট্টি',
  62: 'বাষট্টি',
  63: 'তেষট্টি',
  64: 'চৌষট্টি',
  65: 'পঁয়ষট্টি',
  66: 'ছেষট্টি',
  67: 'সাতষট্টি',
  68: 'আটষট্টি',
  69: 'উনসত্তর',
  70: 'সত্তর',
  71: 'একাত্তর',
  72: 'বাহাত্তর',
  73: 'তিয়াত্তর',
  74: 'চৌহাত্তর',
  75: 'পঁচাত্তর',
  76: 'ছিয়াত্তর',
  77: 'সাতাত্তর',
  78: 'আটাত্তর',
  79: 'ঊনআশি',
  80: 'আশি',
  81: 'একাশি',
  82: 'বিরাশি',
  83: 'তিরাশি',
  84: 'চৌরাশি',
  85: 'পঁচাশি',
  86: 'ছিয়াশি',
  87: 'সাতাশি',
  88: 'অষ্টআশি',
  89: 'ঊননব্বই',
  90: 'নব্বই',
  91: 'একানব্বই',
  92: 'বিরানব্বই',
  93: 'তিরানব্বই',
  94: 'চুরানব্বই',
  95: 'পঁচানব্বই',
  96: 'ছিয়ানব্বই',
  97: 'সাতানব্বই',
  98: 'আটানব্বই',
  99: 'নিরানব্বই',
};

export function convertIntegerToBengaliWords(num: number): string {
  if (!Number.isFinite(num) || num < 0) return '';
  const rounded = Math.floor(num);
  if (rounded === 0) return ONES[0];
  if (rounded < 100) return ONES[rounded] || '';

  const crore = Math.floor(rounded / 10000000);
  let remainder = rounded % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundred = Math.floor(remainder / 100);
  remainder = remainder % 100;

  const parts: string[] = [];

  if (crore > 0) {
    parts.push(`${convertIntegerToBengaliWords(crore)} কোটি`);
  }
  if (lakh > 0) {
    parts.push(`${ONES[lakh] || convertIntegerToBengaliWords(lakh)} লক্ষ`);
  }
  if (thousand > 0) {
    parts.push(`${ONES[thousand] || convertIntegerToBengaliWords(thousand)} হাজার`);
  }
  if (hundred > 0) {
    parts.push(`${ONES[hundred]} শত`);
  }
  if (remainder > 0) {
    parts.push(ONES[remainder]);
  }

  return parts.join(' ').trim();
}

export function numberToBengaliWords(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '';
  const parsed = parseBengaliInt(value);
  if (parsed === null || parsed < 0) return '';
  return convertIntegerToBengaliWords(parsed);
}

export function amountToBengaliWords(amount: number | string): string {
  if (amount === undefined || amount === null || amount === '') return '';

  const cleaned = toEnglishNumber(String(amount)).replace(/[৳,/-\s]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed <= 0) return '';

  let integerPart = Math.floor(parsed);
  let decimalPart = Math.round((parsed - integerPart) * 100);

  if (decimalPart >= 100) {
    integerPart += 1;
    decimalPart = 0;
  }

  let words = '';
  if (integerPart > 0) {
    words += `${convertIntegerToBengaliWords(integerPart)} টাকা`;
  }

  if (decimalPart > 0) {
    const poishaWord = ONES[decimalPart] || convertIntegerToBengaliWords(decimalPart);
    words = words ? `${words} ${poishaWord} পয়সা` : `${poishaWord} পয়সা`;
  }

  return words ? `${words} মাত্র` : '';
}
