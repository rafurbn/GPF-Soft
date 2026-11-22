import type { UserSession } from '../../src/types';
import { UPAZILA_DATABASE } from '../../src/data/upazilaData';
import { ExBangladeshLeaveApplication, LeaveLockSettings } from '../types/leave';
import { getTodayDdMmYyyyBn } from './dateUtils';

export const INITIAL_LEAVE_LOCKS: LeaveLockSettings = {
  designation: true,
  schoolName: false,
  upazilaName: true,
  districtName: true,
  divisionName: true,
  destinationCountry: true,
  leavePurpose: true,
  expenseSource: true,
  sanctionedPosts: false,
  workingTeachers: false,
  ddoName: true,
  ddoDesignation: true,
};

export function resolveUserRegion(currentUser?: Partial<UserSession> | null): {
  upazilaName: string;
  districtName: string;
  divisionName: string;
} {
  const upazilaName = (currentUser?.upazila_name_bn || '').trim();
  const districtName = (currentUser?.district_name_bn || '').trim();
  let divisionName = (currentUser?.division_name_bn || '').trim();

  if (!divisionName && (currentUser?.upazila_code || districtName || upazilaName)) {
    const matchByCode = currentUser?.upazila_code
      ? UPAZILA_DATABASE.find((u) => u.defaultId === currentUser.upazila_code)
      : undefined;
    const matchByDistrict =
      matchByCode ||
      UPAZILA_DATABASE.find(
        (u) =>
          (upazilaName && u.upazilaBn === upazilaName && (!districtName || u.districtBn === districtName)) ||
          (districtName && u.districtBn === districtName),
      );
    if (matchByDistrict?.divisionBn) {
      divisionName = matchByDistrict.divisionBn;
    }
  }

  return { upazilaName, districtName, divisionName };
}

export function getDefaultLeaveFormValues(
  currentUser?: Partial<UserSession> | null,
): Omit<ExBangladeshLeaveApplication, 'id' | 'serialNo' | 'createdAt' | 'updatedAt'> {
  const todayBn = getTodayDdMmYyyyBn();
  const region = resolveUserRegion(currentUser);

  return {
    applicantName: '',
    fatherName: '',
    designation: 'সহকারী শিক্ষক',
    schoolName: '',
    upazilaName: region.upazilaName,
    districtName: region.districtName,
    divisionName: region.divisionName,
    recipientDesignation: 'বিভাগীয় উপপরিচালক',
    basicSalary: '',
    salaryScale: '১১০০০-২৬৫৯০',
    joiningDate: '',
    birthDate: '',
    calculatedAge: '',
    applicationDate: todayBn,
    destinationCountry: 'ভারত',
    leavePurpose: 'তীর্থস্থান দর্শনের উদ্দেশ্যে',
    leaveStartDate: '',
    leaveEndDate: '',
    leaveDays: '',
    leaveDaysWords: '',
    leaveAddress: '',
    expenseSource: 'সঞ্চিত অর্থ হতে ব্যয় বহন করা হবে',
    familyAccompany: 'প্রযোজ্য নয়',
    familyDetails: 'প্রযোজ্য নয়',
    previousTravelDetails: 'প্রযোজ্য নয়',
    leaveType: 'বহি:বাংলাদেশ ছুটি',
    sanctionedPosts: '',
    workingTeachers: '',
    workingTeachersWords: '',
    maleStudents: '',
    femaleStudents: '',
    totalStudents: '',
    serviceStartDate: '',
    serviceCalculationDate: todayBn,
    totalServiceYears: '০০',
    totalServiceMonths: '০০',
    totalServiceDays: '০০',
    earnedHalfPayYears: '০০',
    earnedHalfPayMonths: '০০',
    earnedHalfPayDays: '০০',
    leaveTakenYears: '০০',
    leaveTakenMonths: '০০',
    leaveTakenDays: '০০',
    balanceYears: '০০',
    balanceMonths: '০০',
    balanceDays: '০০',
    ddoName: '',
    ddoDesignation: 'উপজেলা প্রাথমিক শিক্ষা অফিসার',
    status: 'খসড়া',
  };
}
