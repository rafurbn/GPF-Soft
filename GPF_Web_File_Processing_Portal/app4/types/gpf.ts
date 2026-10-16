export type DesignationType =
  | 'প্রাক্তন সহকারী শিক্ষক'
  | 'প্রাক্তন প্রধান শিক্ষক(চ:দা:)'
  | 'প্রাক্তন প্রধান শিক্ষক';

export type RelationshipType = 'স্ত্রী' | 'স্বামী' | 'পুত্র' | 'কন্যা' | 'মাতা' | 'পিতা' | 'আইনগত উত্তরাধিকারী';

export type ClaimStatus = 'খসড়া' | 'যাচাইকৃত' | 'শিক্ষা অফিসে প্রক্রিয়াধীন' | 'অনুমোদিত' | 'সিএও অফিসে প্রেরিত';

export interface GpfDeathClaim {
  id: string;
  serialNo: number;
  // Row 1: সন (e.g. 2026, 2027, 2028)
  year: string;
  // Row 2: আবেদনের তারিখ (e.g. 16/03/2026)
  applicationDate: string;
  // Row 3: প্রাপক (একাধিক লাইনে লেখাযোগ্য ফিল্ড, লক/আনলক)
  recipient: string;
  // Row 4: মৃত কর্মচারীর নাম
  deceasedEmployeeName: string;
  // Row 5: মৃত কর্মচারীর পদবী (প্রাক্তন সহকারী শিক্ষক, প্রাক্তন প্রধান শিক্ষক(চ:দা:), প্রাক্তন প্রধান শিক্ষক)
  deceasedDesignation: DesignationType;
  // Row 6: মৃত কর্মচারীর বিদ্যালয়ের নাম
  schoolName: string;
  // Row 7: মৃত্যুর তারিখ
  deathDate: string;
  // Row 8: আবেদনকারীর নাম
  applicantName: string;
  // Row 9: মৃত কর্মচারীর সাথে সম্পর্ক
  relationship: RelationshipType;
  // Row 10: জিপিএফ হিসাব নং
  gpfAccountNo: string;
  // Row 11: জমাকৃত টাকার পরিমাণ (পূর্বে ছিল পূর্ববর্তী ৩০শে জুনে জমাকৃত টাকার পরিমাণ, এবং ১২ নং রো বাদ)
  depositedAmount: number;
  // Row 12: জমাকৃত টাকা (কথায়) - অটো জেনারেট হবে পয়সাসহ
  depositedAmountInWords: string;
  // Row 13: আয়ন ব্যয়ন কর্মকর্তার নাম
  ddoName: string;
  // Row 14: আয়ন ব্যয়ন কর্মকর্তার পদবী
  ddoDesignation: string;
  // Row 15: উপজেলার নাম
  upazilaName: string;
  // Row 16: জেলার নাম
  districtName: string;
  // Row 17: সংযুক্তি (শুধুমাত্র 01(এক) খানা ও 02(দুই) খানা)
  attachmentsCount: string;

  // Additional official template variables
  sanctionMemoNo?: string; // মঞ্জুরী নং (e.g. ৪৭০/১(০৪))
  sanctionDate?: string; // মঞ্জুরী তারিখ (e.g. ২৪/০৯/২০২৬)
  forwardingMemoNo?: string; // স্মারক নং (e.g. উশিঅ/বিবা/সিল/২০২৬/১১২)
  forwardingDate?: string; // স্মারক তারিখ
  lastDeductionAmount?: number; // সর্বশেষ কর্তনকৃত চাঁদা (e.g. ৪৯০০)
  lastVoucherNo?: string; // সর্বশেষ ভাউচার নং (e.g. ০৮)
  treasuryOffice?: string; // ট্রেজারী অফিসের নাম
  reason?: string; // কারণ (e.g. মৃত্যুজনিত কারণে)

  // System metadata
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LockSettings {
  year: boolean;
  recipient: boolean;
  ddoName: boolean;
  ddoDesignation: boolean;
  upazilaName: boolean;
  districtName: boolean;
  attachmentsCount: boolean;
}

export type LockableField = keyof LockSettings;

