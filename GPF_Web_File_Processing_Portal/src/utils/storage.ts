import { GpfFormData, LockedFieldsConfig } from '../types';
import { readUpazilaContext } from '../lib/upazilaSession';
import { readScoped, scopedKey, writeScoped } from '../lib/scopedStorage';
import { getCurrentBengaliDate } from './dateUtils';

/**
 * app1 keeps its drafts, lock states and saved files in `localStorage`. Those
 * keys used to be plain strings shared by the whole origin, so two upazilas
 * signing in on the same computer read and overwrote each other's files. Every
 * helper below now goes through `readScoped`/`writeScoped`, which namespaces by
 * the active upazila and adopts the pre-namespacing value once.
 */

/** The upazila whose session is currently active in this browser. */
const currentScope = (): string | undefined | null => readUpazilaContext()?.upazila_code;

export const DEFAULT_INITIAL_FORM: GpfFormData = {
  year: '২০২৪-২০২৫',
  applyDate: getCurrentBengaliDate(),
  receiverInfo: '',
  applicantName: '',
  designation: 'সহকারী শিক্ষক',
  schoolName: 'সরকারি প্রাথমিক বিদ্যালয়',
  gpfAccNo: '',
  gpfTotalBalance: '',
  requestedAmount: '',
  requestedAmountWords: '',
  basicSalary: '',
  installmentNo: '১ম কিস্তি',
  hasPreviousLoan: 'না',
  isPreviousLoanRepaid: 'প্রযোজ্য নয়',
  lastInstallmentDate: 'প্রযোজ্য নয়',
  remainingInstallments: 'প্রযোজ্য নয়',
  ddoName: '',
  ddoDesignation: '',
  // Both come from the signed-in upazila's own session, never a preset name.
  upazilaName: '',
  districtName: '',
  installmentCount: '',
  installmentAmount: '',
  purpose: 'গৃহমেরামত',
  memoNo: '',
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

const STORAGE_KEYS = {
  RECORDS: 'gpf_advance_saved_records_v2',
  LOCKED_CONFIG: 'gpf_advance_locked_config_v3',
  LOCKED_VALUES: 'gpf_advance_locked_values_v3',
  CUSTOM_HTML: 'gpf_advance_custom_html_v2',
};

/**
 * The saved files for this upazila. Empty means empty: the app never seeds the
 * list with sample applications, because a government dashboard must not show
 * names that no one filed.
 */
export const getSavedRecords = (): GpfFormData[] => {
  try {
    const data = readScoped(currentScope(), STORAGE_KEYS.RECORDS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse saved records', err);
  }
  return [];
};

export const saveRecords = (records: GpfFormData[]): void => {
  writeScoped(currentScope(), STORAGE_KEYS.RECORDS, JSON.stringify(records));
};

export const getLockedConfig = (): LockedFieldsConfig => {
  try {
    const data = readScoped(currentScope(), STORAGE_KEYS.LOCKED_CONFIG);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Failed to get locked config', err);
  }
  return DEFAULT_LOCKED_CONFIG;
};

export const saveLockedConfig = (config: LockedFieldsConfig): void => {
  writeScoped(currentScope(), STORAGE_KEYS.LOCKED_CONFIG, JSON.stringify(config));
};

export const getLockedValues = (): Partial<GpfFormData> => {
  try {
    const data = readScoped(currentScope(), STORAGE_KEYS.LOCKED_VALUES);
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
  writeScoped(currentScope(), STORAGE_KEYS.LOCKED_VALUES, JSON.stringify(vals));
};

export const getSavedCustomHtml = (): string => readScoped(currentScope(), STORAGE_KEYS.CUSTOM_HTML) || '';

export const saveCustomHtml = (html: string): void => {
  writeScoped(currentScope(), STORAGE_KEYS.CUSTOM_HTML, html);
};

export const clearCustomHtml = (): void => {
  try {
    window.localStorage.removeItem(scopedKey(currentScope(), STORAGE_KEYS.CUSTOM_HTML));
  } catch (err) {
    console.error('Failed to clear custom HTML', err);
  }
};
