export type UserRole = 'upazila_user' | 'super_admin' | 'account_officer';

export interface UserSession {
  id: string;
  email: string;
  upazila_code: string;
  upazila_name_bn: string;
  district_name_bn: string;
  division_name_bn?: string;
  region_edit_until?: string | null;
  role: UserRole;
  is_first_login: boolean;
  phone: string;
  last_login: string;
}

export type ActiveAppTab = 
  | 'gpf_dashboard'
  | 'gpf_refundable'
  | 'gpf_non_refundable'
  | 'gpf_final'
  | 'admin_overview'
  | 'architecture_guide';

export type GpfType = 'refundable' | 'non_refundable' | 'final';

export interface GpfApplication {
  id: string;
  tracking_no: string;
  applicant_name: string;
  designation: string;
  school_name: string;
  gpf_acc_no: string;
  nid_no: string;
  amount: number;
  installment_count?: number;
  monthly_deduction?: number;
  status: 'খসড়া' | 'যাচাইকৃত' | 'অনুমোদিত' | 'বাতিল';
  apply_date: string;
  upazila_code: string;
  gpf_type: GpfType;
  reason: string;
}

export type GpfConditionCategory =
  | 'আইবাস++ ও হিসাব'
  | 'কর্তন ও মুনাফা'
  | 'অগ্রিম ও যোগ্যতা'
  | 'সনদ ও অডিট'
  | 'শাস্তি ও দায়বদ্ধতা';

export interface GpfCondition {
  id: number;
  number_bn: string;
  title: string;
  description: string;
  details: string;
  ruleRef: string;
  severity: 'critical' | 'warning' | 'info' | 'regulatory';
  category: GpfConditionCategory;
  iconType: 'shield' | 'calculator' | 'alert' | 'file-check' | 'user' | 'scale' | 'stamp' | 'key' | 'clock' | 'book' | 'check' | 'award' | 'banknote' | 'lock';
}

export type LockableFieldKey = 
  | 'year' 
  | 'receiverInfo' 
  | 'ddoName' 
  | 'ddoDesignation' 
  | 'upazilaName' 
  | 'districtName';

export interface LockedFieldsConfig {
  year: boolean;
  receiverInfo: boolean;
  ddoName: boolean;
  ddoDesignation: boolean;
  upazilaName: boolean;
  districtName: boolean;
}

export interface ReceiverPreset {
  id: string;
  title: string;
  content: string;
}

export interface GpfFormData {
  id?: string;
  year: string;
  applyDate: string;
  receiverInfo: string;
  applicantName: string;
  designation: string;
  schoolName: string;
  gpfAccNo: string;
  gpfTotalBalance: string;
  requestedAmount: string;
  requestedAmountWords: string;
  basicSalary: string;
  installmentNo: string;
  hasPreviousLoan: string;
  isPreviousLoanRepaid: string;
  lastInstallmentDate: string;
  remainingInstallments: string;
  ddoName: string;
  ddoDesignation: string;
  upazilaName: string;
  districtName: string;
  installmentCount?: string;
  installmentAmount?: string;
  purpose?: string;
  memoNo?: string;
  hasInterest?: string;
  createdAt?: string;
}

// Non-refundable GPF Form Types
export type NonRefundableLockableKey = 
  | 'year' 
  | 'receiver_info' 
  | 'ddo_name' 
  | 'ddo_designation' 
  | 'upazila_name' 
  | 'district_name';

export type NonRefundableLockedState = Record<NonRefundableLockableKey, boolean>;
export type NonRefundableLockedValues = Partial<Record<NonRefundableLockableKey, string>>;

export interface GpfNonRefundableFormData {
  id: string;
  year: string;
  apply_date: string;
  receiver_info: string;
  applicant_name: string;
  designation: string;
  school_name: string;
  date_of_birth: string;
  gpf_acc_no: string;
  gpf_total_balance: string;
  requested_amount: string;
  gpf_total_balance_words: string;
  basic_salary: string;
  ddo_name: string;
  ddo_designation: string;
  upazila_name: string;
  district_name: string;
  custom_memo_no?: string;
  createdAt?: number;
  updatedAt?: number;
}

// Final GPF Withdrawal Form Types (App 3)
export type FinalLockableFieldKey = 
  | 'yearSession' 
  | 'recipient' 
  | 'ddoName' 
  | 'ddoDesignation' 
  | 'upazila' 
  | 'district';

export type FinalFieldLocks = Record<FinalLockableFieldKey, boolean>;

export interface GpfFinalFormData {
  id?: string;
  yearSession: string;
  applicationDate: string;
  recipient: string;
  applicantName: string;
  designation: string;
  schoolName: string;
  birthDate: string;
  gpfAccountNo: string;
  totalDepositedAmount: string;
  requestedAmountNumber: string;
  requestedAmountWords: string;
  basicSalary: string;
  nidNumber?: string;
  ddoName: string;
  ddoDesignation: string;
  upazila: string;
  district: string;
  prlDate?: string;
}

export interface FinalSavedApplicationRecord extends GpfFinalFormData {
  id: string;
  savedAt: string;
}

export interface HtmlTemplate {
  id: string;
  name: string;
  pageNumber: number;
  htmlContent: string;
}

