import { toBn } from './format';

/**
 * Single source for the portal's own identity strings — the version, the office
 * names and the support contact. The root dashboard and all four sub-apps read
 * these, so a label never has to be changed in more than one place.
 */
export const APP_VERSION = '2.6.0';

/** `সংস্করণ ২.৬.০` — Bengali digits, one label for header badges and footers. */
export const VERSION_LABEL = `সংস্করণ ${toBn(APP_VERSION)}`;

export const PORTAL_NAME = 'উপজেলা প্রাথমিক শিক্ষা জিপিএফ পোর্টাল';
export const OFFICE_NAME = 'উপজেলা শিক্ষা অফিসারের কার্যালয়';
export const DEPARTMENT_NAME = 'প্রাথমিক শিক্ষা অধিদপ্তর (ডিপিই)';
export const ADMIN_NAME = 'রফিকুল ইসলাম';

/** Stored in Latin digits so links stay dialable; rendered with `toBn`. */
export const SUPPORT_PHONE = '01732-679551';
export const SUPPORT_LINK = 'https://wa.me/8801732679551';
