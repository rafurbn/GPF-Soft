export type LeavePurposeType =
  | 'তীর্থস্থান দর্শনের উদ্দেশ্যে'
  | 'চিকিৎসা গ্রহণের উদ্দেশ্যে'
  | 'পবিত্র ওমরাহ পালনের উদ্দেশ্যে'
  | 'দর্শনীয় স্থান ভ্রমণের উদ্দেশ্যে'
  | 'পারিবারিক কারণে';

export type LeaveApplicationStatus =
  | 'খসড়া'
  | 'যাচাইকৃত'
  | 'শিক্ষা অফিসে প্রক্রিয়াধীন'
  | 'অনুমোদিত'
  | 'প্রেরিত';

export interface ExBangladeshLeaveApplication {
  id: string;
  serialNo: number;
  // Personal Info
  applicantName: string;
  fatherName: string;
  designation: string;
  schoolName: string;
  upazilaName: string;
  districtName: string;
  divisionName: string;
  recipientDesignation: string;
  // Salary & Service
  basicSalary: string;
  salaryScale: string;
  joiningDate: string;
  birthDate: string;
  calculatedAge: string;
  // Leave Details
  applicationDate: string;
  destinationCountry: string;
  leavePurpose: string;
  leaveStartDate: string;
  leaveEndDate: string;
  leaveDays: string;
  leaveDaysWords: string;
  leaveAddress: string;
  expenseSource: string;
  familyAccompany: string;
  familyDetails: string;
  previousTravelDetails: string;
  leaveType: string;
  // School Statistics
  sanctionedPosts: string;
  workingTeachers: string;
  workingTeachersWords: string;
  maleStudents: string;
  femaleStudents: string;
  totalStudents: string;
  // Leave Account Form (Page 6)
  serviceStartDate: string;
  serviceCalculationDate: string;
  totalServiceYears: string;
  totalServiceMonths: string;
  totalServiceDays: string;
  earnedHalfPayYears: string;
  earnedHalfPayMonths: string;
  earnedHalfPayDays: string;
  leaveTakenYears: string;
  leaveTakenMonths: string;
  leaveTakenDays: string;
  balanceYears: string;
  balanceMonths: string;
  balanceDays: string;
  // DDO / Recommender
  ddoName: string;
  ddoDesignation: string;
  status: LeaveApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export type LeaveLockableField =
  | 'designation'
  | 'schoolName'
  | 'upazilaName'
  | 'districtName'
  | 'divisionName'
  | 'destinationCountry'
  | 'leavePurpose'
  | 'expenseSource'
  | 'sanctionedPosts'
  | 'workingTeachers'
  | 'ddoName'
  | 'ddoDesignation';

export type LeaveLockSettings = Record<LeaveLockableField, boolean>;
