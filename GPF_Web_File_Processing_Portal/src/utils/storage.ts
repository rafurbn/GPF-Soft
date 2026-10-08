import { GpfFormData, LockedFieldsConfig, ReceiverPreset } from '../types';

export const DEFAULT_INITIAL_FORM: GpfFormData = {
  year: '২০২৪-২০২৫',
  applyDate: '২২/০৯/২০২৪',
  receiverInfo: '',
  applicantName: '',
  designation: 'সহকারী শিক্ষক',
  schoolName: 'সরকারি প্রাথমিক বিদ্যালয়',
  gpfAccNo: '',
  gpfTotalBalance: '',
  requestedAmount: '',
  requestedAmountWords: 'এক লক্ষ পঞ্চাশ হাজার টাকা মাত্র',
  basicSalary: '',
  installmentNo: '১ম কিস্তি',
  hasPreviousLoan: 'না',
  isPreviousLoanRepaid: 'প্রযোজ্য নয়',
  lastInstallmentDate: 'প্রযোজ্য নয়',
  remainingInstallments: 'প্রযোজ্য নয়',
  ddoName: '',
  ddoDesignation: '',
  upazilaName: 'বিয়ানীবাজার',
  districtName: 'সিলেট',
  installmentCount: '২৪',
  installmentAmount: '৬,২৫০',
  purpose: 'গৃহমেরামত',
  memoNo: 'উশিঅ/বিবা/সা:ভ:তহ:/অগ্রিম/২০২৪/',
  hasInterest: 'হ্যাঁ',
  createdAt: new Date().toISOString(),
};

export const DEFAULT_LOCKED_CONFIG: LockedFieldsConfig = {
  year: true,
  receiverInfo: false,
  ddoName: false,
  ddoDesignation: false,
  upazilaName: true,
  districtName: true,
};

export const DEFAULT_RECEIVER_PRESETS: ReceiverPreset[] = [
  {
    id: '1',
    title: 'উপজেলা শিক্ষা অফিসার, বিয়ানীবাজার',
    content: 'উপজেলা শিক্ষা অফিসার\nবিয়ানীবাজার, সিলেট।',
  },
  {
    id: '2',
    title: 'জেলা প্রাথমিক শিক্ষা অফিসার, সিলেট',
    content: 'জেলা প্রাথমিক শিক্ষা অফিসার\nসিলেট।',
  },
  {
    id: '3',
    title: 'উপজেলা শিক্ষা অফিসার, সদর, সিলেট',
    content: 'উপজেলা শিক্ষা অফিসার\nসিলেট সদর, সিলেট।',
  },
];

export const SAMPLE_RECORDS: GpfFormData[] = [
  {
    id: 'rec-1',
    year: '২০২৪-২০২৫',
    applyDate: '২২/০৯/২০২৪',
    receiverInfo: 'উপজেলা শিক্ষা অফিসার\nবিয়ানীবাজার, সিলেট।',
    applicantName: 'মোছাঃ আফিয়া বেগম',
    designation: 'সহকারী শিক্ষক',
    schoolName: 'কুড়ার বাজার সরকারি প্রাথমিক বিদ্যালয়',
    gpfAccNo: '৭৮৪৫',
    gpfTotalBalance: '৫,৪০,০০০',
    requestedAmount: '১,৫০,০০০',
    requestedAmountWords: 'এক লক্ষ পঞ্চাশ হাজার টাকা মাত্র',
    basicSalary: '২৪,২২০',
    installmentNo: '১ম কিস্তি',
    hasPreviousLoan: 'না',
    isPreviousLoanRepaid: 'প্রযোজ্য নয়',
    lastInstallmentDate: 'প্রযোজ্য নয়',
    remainingInstallments: 'প্রযোজ্য নয়',
    ddoName: 'মোঃ মোয়াজ্জেম হোসেন',
    ddoDesignation: 'উপজেলা শিক্ষা অফিসার',
    upazilaName: 'বিয়ানীবাজার',
    districtName: 'সিলেট',
    installmentCount: '২৪',
    installmentAmount: '৬,২৫০',
    purpose: 'গৃহমেরামত',
    memoNo: 'উশিঅ/বিবা/সা:ভ:তহ:/অগ্রিম/২০২৪/১১০',
    hasInterest: 'হ্যাঁ',
    createdAt: '2024-09-22T10:00:00.000Z',
  },
  {
    id: 'rec-2',
    year: '২০২৪-২০২৫',
    applyDate: '১৮/০৯/২০২৪',
    receiverInfo: 'উপজেলা শিক্ষা অফিসার\nবিয়ানীবাজার, সিলেট।',
    applicantName: 'মোঃ আব্দুল মতিন',
    designation: 'প্রধান শিক্ষক',
    schoolName: '১০ নং বৈরাগীবাজার সরকারি প্রাথমিক বিদ্যালয়',
    gpfAccNo: '৪৫৮৯২',
    gpfTotalBalance: '৬,৮০,০০০',
    requestedAmount: '১,৮০,০০০',
    requestedAmountWords: 'এক লক্ষ আশি হাজার টাকা মাত্র',
    basicSalary: '৩২,৩০০',
    installmentNo: '২য় কিস্তি',
    hasPreviousLoan: 'হ্যাঁ',
    isPreviousLoanRepaid: 'হ্যাঁ',
    lastInstallmentDate: 'জুন ২০২৩',
    remainingInstallments: 'প্রযোজ্য নয়',
    ddoName: 'মোঃ মোয়াজ্জেম হোসেন',
    ddoDesignation: 'উপজেলা শিক্ষা অফিসার',
    upazilaName: 'বিয়ানীবাজার',
    districtName: 'সিলেট',
    installmentCount: '৩৬',
    installmentAmount: '৫,০০০',
    purpose: 'জরুরি চিকিৎসা ব্যয়',
    memoNo: 'উশিঅ/বিবা/সা:ভ:তহ:/অগ্রিম/২০২৪/১১৮',
    hasInterest: 'হ্যাঁ',
    createdAt: '2024-09-18T11:30:00.000Z',
  },
];

const STORAGE_KEYS = {
  RECORDS: 'gpf_advance_saved_records_v2',
  LOCKED_CONFIG: 'gpf_advance_locked_config_v3',
  LOCKED_VALUES: 'gpf_advance_locked_values_v3',
  RECEIVER_PRESETS: 'gpf_advance_receiver_presets_v2',
  CUSTOM_HTML: 'gpf_advance_custom_html_v2',
};

export const getSavedRecords = (): GpfFormData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse saved records', err);
  }
  return SAMPLE_RECORDS;
};

export const saveRecords = (records: GpfFormData[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records', err);
  }
};

export const getLockedConfig = (): LockedFieldsConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOCKED_CONFIG);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Failed to get locked config', err);
  }
  return DEFAULT_LOCKED_CONFIG;
};

export const saveLockedConfig = (config: LockedFieldsConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCKED_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save locked config', err);
  }
};

export const getLockedValues = (): Partial<GpfFormData> => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOCKED_VALUES);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Failed to get locked values', err);
  }
  return {
    year: DEFAULT_INITIAL_FORM.year,
    receiverInfo: DEFAULT_INITIAL_FORM.receiverInfo,
    ddoName: DEFAULT_INITIAL_FORM.ddoName,
    ddoDesignation: DEFAULT_INITIAL_FORM.ddoDesignation,
    upazilaName: DEFAULT_INITIAL_FORM.upazilaName,
    districtName: DEFAULT_INITIAL_FORM.districtName,
  };
};

export const saveLockedValues = (vals: Partial<GpfFormData>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCKED_VALUES, JSON.stringify(vals));
  } catch (err) {
    console.error('Failed to save locked values', err);
  }
};

export const getReceiverPresets = (): ReceiverPreset[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECEIVER_PRESETS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to get presets', err);
  }
  return DEFAULT_RECEIVER_PRESETS;
};

export const saveReceiverPresets = (presets: ReceiverPreset[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECEIVER_PRESETS, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save presets', err);
  }
};

export const getSavedCustomHtml = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_HTML) || '';
  } catch {
    return '';
  }
};

export const saveCustomHtml = (html: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_HTML, html);
  } catch (err) {
    console.error('Failed to save custom HTML', err);
  }
};

export const clearCustomHtml = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_HTML);
  } catch (err) {
    console.error('Failed to clear custom HTML', err);
  }
};
