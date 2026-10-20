/**
 * One place for the tones, radii, icon sizes and Bengali labels that the four
 * sub-apps used to each define for themselves. Anything visual that has to be
 * identical across apps belongs here, not inside an app.
 */

export const RADIUS = 'rounded-lg';
export const ICON_SIZE = 'w-4 h-4';
export const ICON_SIZE_SMALL = 'w-3.5 h-3.5';

/** Icon-only buttons inside a table row. */
export const ROW_BASE = `p-1.5 ${RADIUS} border transition-colors cursor-pointer shrink-0`;
/** Buttons with a text label in a card header or toolbar. */
export const BAR_BASE = `inline-flex items-center gap-1.5 px-3 py-1.5 ${RADIUS} text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap`;

export type ActionKind = 'print' | 'edit' | 'delete' | 'download' | 'new' | 'save' | 'neutral';

export const ROW_TONE: Record<ActionKind, string> = {
  print: 'bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border-amber-700/40',
  edit: 'bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 border-indigo-700/40',
  delete: 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border-rose-800/40',
  download: 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border-emerald-700/40',
  new: 'bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border-amber-700/40',
  save: 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border-emerald-700/40',
  neutral: 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700',
};

export const BAR_TONE: Record<ActionKind, string> = {
  print: 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-500',
  edit: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500',
  delete: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500',
  download: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500',
  new: 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-500',
  save: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500',
  neutral: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
};

/** Bengali wording — one spelling per concept, used by every app. */
export const LABELS = {
  print: 'প্রিন্ট',
  edit: 'সম্পাদনা',
  delete: 'মুছে ফেলুন',
  download: 'ডাউনলোড',
  new: 'নতুন এন্ট্রি',
  save: 'ডাটা সংরক্ষণ করুন',
  update: 'তথ্য হালনাগাদ করুন',
  exportCsv: 'এক্সেল (CSV)',
  excel: 'এক্সেল',
  confirmDelete: 'মুছুন',
  cancel: 'না',
  locked: 'লক করা আছে',
  unlocked: 'আনলক',
  todayDate: 'আজকের তারিখ',
  lockColumn: 'লক / আনলক',
  fixed: 'স্থায়ী',
  fixedFieldToast: 'উপজেলা ও জেলার নাম স্থায়ী — পরিবর্তন করা যাবে না।',
  preview: 'প্রিভিউ',
  htmlEdit: 'এইচটিএমএল সম্পাদনা',
  needIdentity: 'অনুগ্রহ করে আবেদনকারীর নাম অথবা জিপিএফ হিসাব নম্বর পূরণ করুন।',
};

/** The one save call-to-action used by every input dashboard. */
export const SAVE_CTA =
  'px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 shadow-lg shadow-emerald-950/50 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer hover:scale-102 active:scale-98';


/** Title shown when a locked field is clicked; `{label}` becomes the field name. */
export const LOCKED_FIELD_TOAST = '{label} ফিল্ডটি লক করা আছে। পরিবর্তন করতে প্রথমে আনলক করুন।';
