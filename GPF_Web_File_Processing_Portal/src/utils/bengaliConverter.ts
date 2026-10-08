// Bengali Digits and Currency in Words Converter

export const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBengaliDigits = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return '';
  return String(num).replace(/[0-9]/g, (w) => banglaDigits[+w]);
};

export const toBanglaDigits = toBengaliDigits;
export const toBanglaNumber = toBengaliDigits;

export const toEnglishDigits = (num: string): string => {
  return String(num).replace(/[০-৯]/g, (d) => String(banglaDigits.indexOf(d)));
};

export const cleanNumberString = (val: number | string | undefined | null): number => {
  if (!val) return 0;
  const eng = toEnglishDigits(String(val)).replace(/[^0-9.]/g, '');
  return parseFloat(eng) || 0;
};

export const formatBanglaCurrency = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '';
  const clean = cleanNumberString(num);
  if (isNaN(clean)) return '';
  
  const parts = Math.round(clean).toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree + decimalPart;
  return toBengaliDigits(res);
};

const ones = [
  '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
  'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
  'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ', 'ত্রিশ',
  'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ',
  'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ',
  'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট',
  'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর', 'সত্তর',
  'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি', 'আশি',
  'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশী', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই', 'নব্বই',
  'একানব্বই', 'বানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
];

export const numberToBengaliWords = (num: number | string | undefined | null): string => {
  const n = cleanNumberString(num);
  if (!n || n === 0) return '';

  const convertTwoDigits = (val: number): string => {
    return ones[val] || '';
  };

  let numInt = Math.floor(n);
  let words = '';

  // কোটি (Crore)
  if (numInt >= 10000000) {
    const crore = Math.floor(numInt / 10000000);
    words += numberToBengaliWords(crore).replace(' টাকা মাত্র', '').replace(' মাত্র', '') + ' কোটি ';
    numInt %= 10000000;
  }

  // লক্ষ (Lakh)
  if (numInt >= 100000) {
    const lakh = Math.floor(numInt / 100000);
    words += convertTwoDigits(lakh) + ' লক্ষ ';
    numInt %= 100000;
  }

  // হাজার (Thousand)
  if (numInt >= 1000) {
    const thousand = Math.floor(numInt / 1000);
    words += convertTwoDigits(thousand) + ' হাজার ';
    numInt %= 1000;
  }

  // শত (Hundred)
  if (numInt >= 100) {
    const hundred = Math.floor(numInt / 100);
    words += convertTwoDigits(hundred) + ' শত ';
    numInt %= 100;
  }

  // অবশিষ্ট (Remaining)
  if (numInt > 0) {
    words += convertTwoDigits(numInt) + ' ';
  }

  return words.trim() + ' টাকা মাত্র';
};

export const formatBengaliDate = (dateStr: string, separator: string = '/'): string => {
  if (!dateStr) return '';
  const cleaned = toEnglishDigits(dateStr);
  const parts = cleaned.split(/[-/.]/);
  if (parts.length === 3) {
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];
    if (day.length === 4) {
      // YYYY-MM-DD format
      const temp = day;
      day = year;
      year = temp;
    }
    return `${toBengaliDigits(day)}${separator}${toBengaliDigits(month)}${separator}${toBengaliDigits(year)}`;
  }
  return toBengaliDigits(dateStr);
};

export const calculateBengaliAge = (birthDateStr: string): string => {
  if (!birthDateStr) return '';
  try {
    const cleaned = toEnglishDigits(birthDateStr).replace(/[^0-9/-]/g, '');
    const parts = cleaned.split(/[-/]/);
    if (parts.length !== 3) return '';
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10) - 1;
    let year = parseInt(parts[2], 10);
    if (day > 1000) {
      // YYYY-MM-DD
      const temp = day;
      day = year;
      year = temp;
    }
    const birthDate = new Date(year, month, day);
    const today = new Date();
    if (isNaN(birthDate.getTime())) return '';

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      days += 30;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years < 0) return '';
    return `${toBengaliDigits(years)} বছর ${toBengaliDigits(months)} মাস ${toBengaliDigits(days)} দিন`;
  } catch {
    return '';
  }
};

export const calculatePrlDate = (birthDateStr: string, separator: string = '/'): string => {
  if (!birthDateStr) return '';
  try {
    const cleaned = toEnglishDigits(birthDateStr).replace(/[^0-9/.\-]/g, '');
    const parts = cleaned.split(/[-/.]/);
    if (parts.length !== 3) return '';
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    if (day > 1000) {
      // YYYY-MM-DD
      const temp = day;
      day = year;
      year = temp;
    }
    if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
    if (year < 1900 || year > 2100) return '';

    const prlYear = year + 59;
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = month.toString().padStart(2, '0');

    return `${toBengaliDigits(dayStr)}${separator}${toBengaliDigits(monthStr)}${separator}${toBengaliDigits(prlYear)}`;
  } catch {
    return '';
  }
};
