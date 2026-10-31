/**
 * One place for the tones, radii, icon sizes and Bengali labels that the four
 * sub-apps used to each define for themselves. Anything visual that has to be
 * identical across apps belongs here, not inside an app.
 */

export const RADIUS = 'rounded-lg';
export const ICON_SIZE = 'w-4 h-4';
export const ICON_SIZE_SMALL = 'w-3.5 h-3.5';

/** Icon-only buttons inside a table row. */
export const ROW_BASE = `p-1.5 ${RADIUS} border transition-all duration-150 cursor-pointer shrink-0 select-none active:translate-y-[1px] hover:-translate-y-0.5`;
/** Buttons with a text label in a card header or toolbar. */
export const BAR_BASE = `btn-3d inline-flex items-center gap-1.5 px-3.5 py-1.5 ${RADIUS} text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap select-none`;

export type ActionKind = 'print' | 'edit' | 'delete' | 'download' | 'new' | 'save' | 'neutral';

export const ROW_TONE: Record<ActionKind, string> = {
  print: 'bg-gradient-to-b from-amber-900/60 to-amber-950/80 hover:from-amber-800/80 hover:to-amber-900 text-amber-300 border-amber-600/50 shadow-[0_2px_0_0_#78350f,0_3px_6px_rgba(0,0,0,0.3)] active:shadow-none',
  edit: 'bg-gradient-to-b from-indigo-900/60 to-indigo-950/80 hover:from-indigo-800/80 hover:to-indigo-900 text-indigo-300 border-indigo-600/50 shadow-[0_2px_0_0_#312e81,0_3px_6px_rgba(0,0,0,0.3)] active:shadow-none',
  delete: 'bg-gradient-to-b from-rose-900/60 to-rose-950/80 hover:from-rose-800/80 hover:to-rose-900 text-rose-300 border-rose-600/50 shadow-[0_2px_0_0_#881337,0_3px_6px_rgba(0,0,0,0.3)] active:shadow-none',
  download: 'bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 hover:from-emerald-800/80 hover:to-emerald-900 text-emerald-300 border-emerald-600/50 shadow-[0_2px_0_0_#064e3b,0_3px_6px_rgba(0,0,0,0.3)] active:shadow-none',
  new: 'bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 hover:from-emerald-800/80 hover:to-emerald-900 text-emerald-300 border-emerald-600/50 shadow-[0_2px_0_0_#064e3b,0_3px_6px_rgba(0,0,0,0.3)] active:shadow-none',
  save: 'bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 hover:from-emerald-800/80 hover:to-emerald-900 text-emerald-300 border-emerald-600/50 shadow-[0_2px_0_0_#064e3b,0_3px_6px_rgba(0,0,0,0.3)] active:shadow-none',
  neutral: 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-slate-200 border-slate-600/60 shadow-[0_2px_0_0_#0f172a,0_3px_6px_rgba(0,0,0,0.3)] active:shadow-none',
};

export const BAR_TONE: Record<ActionKind, string> = {
  print: 'btn-3d-amber',
  edit: 'btn-3d-indigo',
  delete: 'btn-3d-rose',
  download: 'btn-3d-emerald',
  new: 'btn-3d-emerald',
  save: 'btn-3d-emerald',
  neutral: 'btn-3d-slate',
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
  'btn-3d btn-3d-emerald px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 whitespace-nowrap cursor-pointer';


/** Title shown when a locked field is clicked; `{label}` becomes the field name. */
export const LOCKED_FIELD_TOAST = '{label} ফিল্ডটি লক করা আছে। পরিবর্তন করতে প্রথমে আনলক করুন।';
