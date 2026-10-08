// Bengali number conversions and currency in words

export const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBanglaDigits = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return '';
  return String(num).replace(/[0-9]/g, (w) => banglaDigits[+w]);
};

export const toBanglaNumber = toBanglaDigits;

export const toEnglishDigits = (num: string): string => {
  return num.replace(/[০-৯]/g, (d) => String(banglaDigits.indexOf(d)));
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
  // Format with commas in Indian / Bangladeshi system: 1,50,000
  const parts = clean.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree + decimalPart;
  return toBanglaDigits(res);
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

export const numberToBanglaWords = (num: number | string | undefined | null): string => {
  const n = cleanNumberString(num);
  if (!n || n === 0) return '';

  const convertTwoDigits = (val: number): string => {
    return ones[val] || '';
  };

  let crore = Math.floor(n / 10000000);
  let remainder = n % 10000000;

  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  let hundred = Math.floor(remainder / 100);
  let lastTwo = Math.floor(remainder % 100);

  let words = '';

  if (crore > 0) {
    words += (crore > 99 ? numberToBanglaWords(crore).replace(' টাকা মাত্র', '') : convertTwoDigits(crore)) + ' কোটি ';
  }
  if (lakh > 0) {
    words += convertTwoDigits(lakh) + ' লক্ষ ';
  }
  if (thousand > 0) {
    words += convertTwoDigits(thousand) + ' হাজার ';
  }
  if (hundred > 0) {
    words += convertTwoDigits(hundred) + ' শত ';
  }
  if (lastTwo > 0) {
    words += convertTwoDigits(lastTwo) + ' ';
  }

  words = words.trim();
  if (words) {
    return words + ' টাকা মাত্র';
  }
  return '';
};
