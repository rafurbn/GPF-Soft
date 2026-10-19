# রিপোর্ট ২ — অপ্রয়োজনীয়: বাদ দিলে ভালো হয় (প্রমাণসহ)

ভিত্তি: `main@e8b5ab0`। প্রতিটি আইটেমের জন্য প্রমাণ: পুরো রিপোতে ফাইলনাম/ইমপোর্ট-প্যাথ grep (হিট = ০ মানে কেউ ইমপোর্ট করে না) এবং md5sum।
**কোনো কিছুই এখনও মোছা হয়নি** — এটি শুধু তালিকা; §ই-এ যে কয়েকটি মোছার আগে আপনার একলাইনি নিশ্চিত করা দরকার, তা আলাদা করে চিহ্নিত।

---

## ক. সম্পূর্ণ ডেড ফাইল (কোথাও ইমপোর্ট হয় না) — মোট ১২১,০৫৯ বাইট
| ফাইল | বাইট | প্রমাণ | পরামর্শ |
|---|---|---|---|
| `src/components/Header.tsx` | ৮,৭৮৫ | সঠিক grep-এ একমাত্র হিট `app4/App.tsx:4` → সেটি `app4/components/Header.tsx`, এই ফাইল নয় | **মুছুন** |
| `src/utils/templateEngine.ts` | ২৬,৬২৪ | ইমপোর্টার ০ | **মুছুন** |
| `src/components/AllUpazilasModal.tsx` | ১৪,৬৮১ | ইমপোর্টার ০ | **মুছুন** (নোটিশ-বোর্ড জাতীয়, §ঘ দেখুন) |
| `src/components/GpfNoticeBoard14.tsx` | ২৪,০০৯ | ইমপোর্টার ০ | ⚠️ মুছার আগে নিশ্চিত হোন |
| `src/components/OfficialBulletNoticeBody.tsx` | ২০,৩৪৫ | ইমপোর্টার ০ | ⚠️ মুছার আগে নিশ্চিত হোন |
| `src/components/PermanentDisclaimerSection.tsx` | ২,৫৩০ | ইমপোর্টার ০ | ⚠️ মুছার আগে নিশ্চিত হোন |
| `src/data/mockData.ts` | ২২,৭৮২ | একমাত্র ইমপোর্টার `GpfNoticeBoard14.tsx:29` — সেটিও ডেড | **মুছুন** (নকল ডেটা; সরকারি UI-তে নকল নামের ঝুঁকি) |
| `app4/index.css` | ১,৩০৩ | `app4/main.tsx`-এ কোনো ইমপোর্ট নেই; গ্লোবাল CSS আসে `src/Main.tsx:4` + `app-shared/bootstrap.tsx:3` থেকে | **মুছুন** (ভেতরের `@media print` ও `.field-locked` কখনো চলেনি — প্রিন্ট আচরণ বদলাবে না) |

## খ. বাইট-আইডেন্টিক্যাল / ড্রিফট করা ডুপ্লিকেট (মোছা নয়, **শেয়ার্ডে তোলা**)
md5sum যাচাই:
- `app1/components/DesktopGuideModal.tsx` ≡ `app2/components/DesktopGuideModal.tsx` — md5 `b46897b0…` উভয়ই, ৬,৪৪৪ B → একটি `app-shared/components/DesktopGuideModal.tsx`-এ নিন।
- `app1`/`app2`/`app3` `LockToggleButton.tsx` — তিনটের md5 `435e48c5…`, ১,২৫৯ B → শেয়ার্ড।
- `app4/components/LockToggleButton.tsx` — md5 `58ab83ea…`, ১,৪৬৯ B: শুধু ৬-লাইনের ডকুমেন্টেশন আর `id` prop বাদ (`app4/components/LockToggleButton.tsx:4-10,29-33`)। এটিকে শেয়ার্ড সংস্করণে মিলিয়ে ফেলুন।
- `app2/components/PreviewModal.tsx` (৭,৮৯৬ B) বনাম `app3/components/PreviewModal.tsx` (৭,৯৭১ B) — প্রথম পার্থক্য বাইট ১১৪-এ: ড্রিফট, আইডেন্টিক্যাল নয়। একই কম্পোনেন্টে মিলিয়ে নিন।
- রেকর্ড-টেবিল ত্রয়ী প্রায়-ডুপ্লিকೇট: `app1/components/RecordsTable.tsx`, `app2/components/RecordsList.tsx`, `app3/components/SavedRecordsTable.tsx` (+ `app4/components/ClaimsDataTable.tsx`)।
- ভেতরে ভেতরে ডুপ্লিকেট: `renderLockControls` ~২৩ লাইন app1+app4-এ হুবহু এক (`app1/components/InputFormTable.tsx:119-181` ≡ `app4/components/DeathClaimForm.tsx:326-385`); `app4/App.tsx:200-232` ≡ `:238-272` (`handleResetForm`/`nextFormValues`); সেভ-ভ্যালিডেশনের `alert()` টেক্সট `DeathClaimForm.tsx:285` ≡ `:888`।
- একই কাজের ৪টি বাংলা-সংখ্যা লাইব্রেরি: `src/utils/numberToBanglaWords.ts`, `src/utils/bengaliConverter.ts`, `app4/utils/bengaliWords.ts`, ইনলাইন `toBn` (`app4/utils/printAndDownload.ts:10`) → **একটি** `src/lib/format.ts`।
- দুটি সমান্তরাল PDF/প্রিন্ট পাথ: শেয়ার্ড `src/utils/pdfDownload.ts` (app1/2/৩) বনাম `app4/utils/printAndDownload.ts` (৪৭ KB)।

## গ. রিপো-ক্লাটার (git-ট্র্যাকড, ওয়ান-শট ডেভ টুল)
`git ls-files`-এ নিশ্চিত:
- ৯টি `qa-*.mjs`: `qa-app4-coldload.mjs`, `qa-app4-link.mjs`, `qa-diag.mjs`, `qa-login-identity.mjs`, `qa-login-probe.mjs`, `qa-otp-modal.mjs`, `qa-signin-v2.mjs`, `qa-signin.mjs`, `qa-subapps.mjs` — `package.json`-এর `"scripts"`-এ কোনোটিই নেই, অর্থাৎ বিল্ড/টেস্টের অংশ নয় → মুছে ফেলুন (বা চাইলে `scripts/qa/`-এ সরিয়ে `package.json`-এ যোগ করুন)।
- `fix2.ps1`, `fix3.ps1`, `fix4.ps1` — আগের একবার-ইউজ প্যাচ স্ক্রিপ্ট → মুছুন।
- `metadata.json` (৬৭৮ B) — Google AI Studio এক্সপোর্ট (Gemini উল্লেখ আছে), `vite.config.ts` ব্যবহার করে না → মুছুন।
- `dist/` ডিস্কে আছে কিন্তু **ট্র্যাকড নয়** (`git ls-files`-এ হিট নেই) → কিছু করার নেই; `.gitignore`-এ ঠিক আছে।
- `.env*` ট্র্যাকড নয় → ঠিক আছে।

## ঘ. অ্যাপের ভেতরের ডেড ওয়্যারিং (কোড লাইনভিত্তিক)
| আইটেম | প্রমাণ | করণীয় |
|---|---|---|
| `app3/components/DesktopHeader.tsx:9-14` — `onNewApplication/onSave/onOpenPrint/onOpenHtmlEdit/savedCount` প্রপ ডিক্লেয়ার + `app3/App.tsx:379-383`-এ পাস, কিন্তু কম্পোনেন্ট শুধু `onBack` নেয় (`:16-18`) | grep + রিড | **বাটনগুলো লাগান** (ব্যবহারকারী প্রিন্ট বাটন খুঁজছেন), না হলে প্রপ মুছুন |
| `app-shared/bootstrap.tsx:108-111` — `onSaveApplication` নো-ওপ; প্রতিটি অ্যাপের `parentApp` অবজেক্ট (`app1/App.tsx:191-207`, `app2/App.tsx:330-344`, `app3/App.tsx:271-285`) খারিজ | রিড | ইমপ্লিমেন্ট বা প্রপ-থ্রেডিং বাদ দিন |
| `app-shared/centralClaimSync.ts:82-91` — `checkAppMaintenanceStatus`, `getUpazilaAnnouncements` ইমপোর্টার ০; `:80-81`-এ `isAppLocked`-এর রিটার্ন টাইপ নিজ ডকের বিপরীত | grep | মুছুন / ডক ঠিক করুন |
| `app4/index.css:25` `.field-locked` | কোনো JSX-এ ব্যবহার নেই | ফাইলসহ মুছুন |
| `src/index.css:82-85` `@page { margin: 0 }` | `src/index.css:229`-এ `@page { margin: 25mm 20mm 15mm 20mm }` পরে এসে জিতেছে | ডুপ্লিকেট `@media print` ব্লক (`:225-298` বা `:82-85`) মিলিয়ে একটি রাখুন |
| `src/utils/storage.ts:41` `SAMPLE_RECORDS` | `app1/App.tsx:7,312-313` লোড + persist করে | **বাদ দিন** (নকল ডেটা); "নমুনা তথ্য রিলোড" লিঙ্ক `app1/components/RecordsTable.tsx:134-142`-সহ |
| `app4/components/DeathClaimForm.tsx:92-184` হার্ড-কোড ডিফল্ট (বিয়ানীবাজার/সিলেট/"নৃপেন্দ্র নাথ সরকার"/৩০০০০০) | রিড | খালি বা উপজেলা-সেশন থেকে পূরণ করা ডিফল্ট |

## ঙ. যা **মোছা যাবে না** (ভুলভাবে "অপ্রয়োজনীয়" মনে হতে পারে)
- `scripts/setup-supabase.mjs` — `package.json`-এ `"supabase:setup"` স্ক্রিপ্ট এটিই চালায়।
- `app4/utils/initialData.ts` — `app4/App.tsx:3` ইমপোর্ট করে।
- `src/lib/*` — সবগুলো কোথা না কোথাও ইমপোর্টেড (`unlimitedStore`, `scopedStorage`, `secureBackup`, `centralAdminStore`, `adminSecurity`, `authProfile`, `upazilaSession`, `supabase`)।
- সব `*.test.ts` — `vitest run` চালায় (২৫টি টেস্ট পাস)।
- `app-shared/*` — চার অ্যাপের বুটস্ট্র্যাপ ও কেন্দ্রীয় সিঙ্ক এখানে।
- **DDO/UEO প্রিসেট** বিষয়ক কিছু — আপনি আগেই বাদ দিয়েছিলেন; সেটি ফের আনার প্রস্তাব নয়।

## চ. মুছার ক্রম (নিরাপদ → ঝুঁকিপূর্ণ)
1. রিপো-ক্লাটার (§গ) — শূন্য রিস্ক, কোনো ইমপোর্ট নেই।
2. §ক-এর `Header.tsx`, `templateEngine.ts`, `mockData.ts`, `app4/index.css` — ইমপোর্টার ০, বিল্ডে প্রভাব পড়বে না (`npm run build` + `npm test` দিয়ে যাচাই)।
3. §ঘ-এর ডেড ওয়্যারিং — ছোট, লোকাল পরিবর্তন।
4. নোটিশ-বোর্ড জাতীয় ৩টি ফাইল (`GpfNoticeBoard14`, `OfficialBulletNoticeBody`, `PermanentDisclaimerSection`, মোট ~৪৭ KB) — **আপনার হ্যাঁ-না চাই**: এগুলো ভবিষ্যতে নোটিশ বোর্ডের কাজে লাগাতে চেয়েছিলেন কিনা।
5. ডুপ্লিকেট কম্পোনেন্ট শেয়ার্ডে তোলা (§খ) — মুছে ফেলা নয়, রিফ্যাক্টরিং; রিপোর্ট ৩-এ ধাপে ধাপে আছে।
