# রিপোর্ট ৩ — একীভরণ পরিকল্পনা (কী বদলাবেন, কোন ক্রমে, কীভাবে যাচাই)

লক্ষ্য: ৪টি সাব-অ্যাপ + রুট ড্যাশবোর্ড যেন **একই** হেডার/ফুটার/ব্যাক-বাটন/বাটন-টোন/ফন্ট/সংখ্যা-ফরম্যাট/লক-আচরণ/সেভ-অনুভব দেয় — নতুন ফিচার যোগ না করে, শুধু অসামঞ্জস্য দূর করে।
রিপোর্ট ১ এর [উ] আইটেমগুলো এই পরিকল্পনার ধাপ ১-৩-এ ঢাকা পড়ে।

---

## ১. লক্ষ্য আর্কিটেকচার (নতুন ফাইল ৬টি, সবগুলো `app-shared/`-এ)

```
app-shared/ui/
  SubAppChrome.tsx   // <SubAppHeader> + <SubAppFooter> + <BackButton>
  ActionButton.tsx   // প্রিন্ট/এডিট/ডিলিট/ডাউনলোড/সেভ — টোন-ভিত্তিক একমাত্র বাটন
  LockToggle.tsx     // বর্তমান LockToggleButton-এর শেয়ার্ড সংস্করণ (id prop সহ)
  Toast.tsx          // এক ধরনের টোস্ট (app3-এর alert() সরানোর জন্য)
  tokens.ts          // রঙ/রাউন্ড/আইকন/লেখার টোকেন (নিচে স্পেক)
src/lib/format.ts    // একমাত্র সংখ্যা-তারিখ ফরম্যাটার (রি-এক্সপোর্ট + তারিখ)
```

### টোকেন স্পেক (`tokens.ts`)
| টোকেন | মান | কারণ (অডিটের প্রমাণ) |
|---|---|---|
| `header.position` | `sticky top-0 z-50` | এখন `z-30`/`z-40`/`z-50`/fixed মিশ্র (`app3/components/DesktopHeader.tsx:20`, `app1/App.tsx:345`, `app4/components/Header.tsx:25-38`) |
| `header.titleTag` | `<h1>`, `text-base sm:text-lg md:text-xl font-bold` | app1/app2-তে `<h2>` `text-base sm:text-lg` |
| `header.meta` | দপ্তর + উপজেলা নাম + কোড + জেলা + সেভ-কাউন্ট | শুধু app4 দেখাত (`app4/components/Header.tsx:68-76`) |
| `back.label` | `ব্যাকপেইজ` / `ড্যাশবোর্ডে ফিরুন` (দুই লাইন) | app4-তে এক লাইন (`app4/components/Header.tsx:51`) |
| `back.tone` | emerald (app1-এর indigo বাদ) | `app1/App.tsx:351` |
| `radius` | `rounded-lg` (সব বাটন/সেল) | `rounded`/`rounded-md`/`rounded-xl` মিশ্র |
| `icon.size` | `w-4 h-4` | app1/2/3 `w-3.5`, app4 `w-4` |
| `action.print` | `Printer`, tone `amber` | রঙ amber→emerald→emerald→amber |
| `action.edit` | `Pencil`, tone `indigo` | এখন `Edit2`/`Edit`/`Edit3`/`Edit2` |
| `action.delete` | `Trash2`, tone `rose` | আইকন এক, কনফার্ম পদ্ধতি ৪ রকম |
| `action.download` | `Download`, tone `emerald` | একই |
| `action.new` | `Plus`, tone `amber`, লেখা `নতুন এন্ট্রি` (লেখায় `+` নয়) | `app4/components/ClaimsDataTable.tsx:291-292` দ্বৈত চিহ্ন |
| `save.label` | `ডাটা সংরক্ষণ করুন` / `তথ্য হালনাগাদ করুন` | সেইভ/সেভ/আপডেট ৪ রকম |
| `footer.slots` | ১) সিস্টেম+অ্যাপ নাম ২) দপ্তর+উপজেলা+জেলা+বিভাগ+ডিপিই ৩) `© ২০২৬ • রফিকুল ইসলাম` + ভার্সন ৪) যোগাযোগ | app4-তে ৩য়/৪র্থ স্লট নেই (`app4/App.tsx:367-368`) |
| `version` | একটি-ই উৎস (ধরা: `2.6.0`) | `v2.6 প্রো` / `v2.0 PROD` / `2.1.0-PROD` মিশ্র |

### লেবেল স্পেক (বাংলা বানান ঠিক করা)
`সংরক্ষণ` (সেইভ/সেভ নয়), `হালনাগাদ` (আপডেট), `মুছে ফেলুন` (ডিলিট), `প্রিন্ট`, `ডাউনলোড`, `লক করা আছে`, `আনলক`, `স্থায়ী` (ফিক্সড), `সাময়িক স্থগিত` (লকড)।

---

## ২. সংখ্যা/তারিখ: একক পথ (রিপোর্ট ১ §১-র সব [উ])
1. `src/lib/format.ts` তৈরি: `toBn`, `toEn`, `money` (লক্ষ/কোটি গ্রুপিংসহ), `date` (`dd/mm/yyyy` বাংলা), `dateTime`, `count` (`টি`/`সংখ্যক` সহ) — ভিত্তি হিসেবে `src/utils/numberToBanglaWords.ts` + `src/utils/bengaliConverter.ts`-এর তারিখ ফাংশন।
2. পুরোনো ৩ লাইব্রেরি রি-এক্সপোর্ট-থ্রু-deprecation নয়, সরাসরি প্রতিস্থাপন: `src/utils/bengaliConverter.ts`, `app4/utils/bengaliWords.ts`, ইনলাইন `toBn` (`app4/utils/printAndDownload.ts:10`) → সব `src/lib/format.ts` থেকে import।
3. ডেটা-সংরক্ষণে বাংলা অঙ্ক **নিষিদ্ধ**: `app3/App.tsx:281`-এর `apply_date: '২০২৬-০৯-২৩'` → `toEn(...)`; সেভ-এর আগে সব ISO ফিল্ডে `toEn` (ফর্ম ইনপুট বাংলা হলেও DB/Latin-এ যাবে)।
   **বাস্তবায়ন নোট (২০২৬-১০-১৯):** কোড পড়ে দেখা গেছে টেবিলের `record` কলামটি `jsonb` (`supabase/schema.sql:199`), তাই তারিখ কোনো SQL date cast হয় না; app1/app2/app3 সব জায়গাতেই রেকর্ডে বাংলা `dd/mm/yyyy` সংরক্ষিত হয় এবং প্রিন্ট পথ সেটিই নেয়। তাই এই ধাপে `toEn` না করে conventions বজায় রাখা হয়েছে: রেন্ডারের সব জায়গায় `date()` (ইংরেজি/ISO দিলেও বাংলা `dd/mm/yyyy` বানায়, বাংলা দিলে অপরিবর্তিত), আর `app3/App.tsx`-এর পুরোনো হার্ড-কোড `২০২৬-০৯-২৩` বদলে `getCurrentBengaliDate()` (আজকের তারিখ) বসানো হয়েছে।
4. তারপরে রেন্ডার সাইট বদলানো (প্রায় ২৫টি): `SuperAdminSuite.tsx:747,766,777,788,799,824,825,828,1160,1838,1847`, `OfficialDashboard.tsx:208`, `SuperAdminOverview.tsx:36`, `PortalDesktopSignInView.tsx:605` (+`450`), `BroadcastNoticeMarquee.tsx:101`, `centralAdminStore.ts:211`, `app4/components/ClaimsDataTable.tsx:54,352,368,369`, `app4/App.tsx:307`, `app3/components/SavedRecordsTable.tsx:214`, app1/app2 প্রিন্ট টেমপ্লেটে `money`।
5. যা ইংরেজি রাখাই ঠিক: আইডি/ফাইলনাম/URL/ISO টাইমস্ট্যাম্প (`Bea002`, ব্যাকআপ ফাইলের নাম)। ফোন নম্বর (`01732-679551`) — আপনার সিদ্ধান্ত: বাংলা অঙ্কে চাইলে `toBn`, কপি-পেস্ট সুবিধার জন্য ইংরেজি রাখলে টোকেনে নথিভুক্ত করুন।

---

## ৩. ফন্ট: এক পথ
1. `app4/index.html:14`-এ রুটের ৫-ফ্যামিলি `<link>` কপি করুন (`index.html:14` থেকে) — এটি এক লাইনের কাজ, app4-এর প্রিন্ট/স্ক্রিন ফন্ট এখন এই কারণেই আলাদা।
2. চার অ্যাপের রুট থেকে হার্ড-কোড `font-['Hind_Siliguri',sans-serif]` সরিয়ে `font-sans`: `app1/App.tsx:318`, `app2/App.tsx:458`, `app3/App.tsx:361`, `app4/App.tsx:311`; কার্ড-লেভেল `app3/components/GpfDashboardTable.tsx:99`, `app3/components/SavedRecordsTable.tsx:99`।
3. রুট শিরোনামের `font-serif` (`PortalDesktopSignInView.tsx:443,475`) → `.font-bangla-serif`, যাতে `Noto Serif Bengali`/`Tiro Bangla` আসলেই লোড হয় (লাইভে মাপা computed value `ui-serif, Georgia…`)।
4. প্রিন্ট ফন্ট এক: app4-এর ইনলাইন `<style>` (`app4/components/PrintDocumentEngine.tsx:67,80,85`) বাদ দিয়ে `.font-bangla-serif`; `src/index.css`-এর `:82-85` ও `:225-298` দ্বৈত `@media print` মিলিয়ে একটি `@page` মার্জিন রাখুন; `app4/index.css` মুছুন (ইমপোর্টই হয় না)।
5. `index.html:2`-এর `lang="en"` → `lang="bn"`।

---

## ৪. লক/আনলক: এক আচরণ
| সিদ্ধান্ত | কেন / কী বদলাবে |
|---|---|
| এক কলামে এক বাটন (`লক করা আছে` ↔ `আনলক`), টোগল নয় দুই লেবেল | app1/app4-এর দুই-কলাম, app2/app3-এর এক-কলাম মিশ্রণ দূর |
| লক করা ফিল্ডে এক টোন (সবুজ) + `readOnly` + `select-none` + **ক্লিকে ব্যাখ্যা-টোস্ট** | app1-এর amber/emerald মিশ্র (`InputFormTable.tsx:259,327,739`) ও app4-এর `pointer-events-none` (`DeathClaimForm.tsx:396-416`) এক করা |
| স্থায়ী ফিল্ডে ক্লিক → টোস্ট (app3-এর নীরব `return` বাদ) | `app3/App.tsx:184` |
| ব্যানার লেখায় "লকড" বাটনের উল্লেখ → আসল লেবেল | `app3/components/GpfDashboardTable.tsx:49-54` |
| লক স্টেট সব অ্যাপে upazila-scoped (`src/lib/scopedStorage.ts`-এর `readScoped/writeScoped`) | `src/utils/storage.ts:102-107` (app1), `app3/App.tsx:22,137` অনস্কোপড — অন্য উপজেলার লক চুরি দূর |
| লক-অবস্থার এক আলাদা key নয়: অ্যাপ-স্তরের মেইনটেন্যান্স লকের নাম বদলান `পরিষেবা বন্ধ`/`রক্ষণাবেক্ষণ`, এবং টগলে কনফার্মেশন | `app-shared/bootstrap.tsx:69-96`, `SuperAdminSuite.tsx:535-554`-এ OTP/কনফার্ম নেই |

## ৫. সেভ ও অ্যাকশন: এক কন্ট্রাক্ট
1. **স্টোরেজ ত্রুটি আগে** (ফাংশনাল, রিপোর্ট ১ §৯.১): `src/lib/unlimitedStore.ts:21,147` — এক `records` স্টোর + `store.clear()` → app1 সেভ করলে app2/app3-এর তালিকা যেতে পারে। ঠিক: `STORE_NAME`-এ প্রতি-অ্যাপ key prefix (`${storeKey}::${id}`) এবং `clear()`-এর বদলে শুধু সেই প্রিফিক্সের রো মোছা (বা প্রতি অ্যাপে আলাদা objectStore, `DB_VERSION` বাড়াতে হবে)। app4-এর "আনলিমিটেড সেইভ ফাইল" ব্যাজ (`ClaimsDataTable.tsx:200`) মিথ্যা — স্টোর ব্যবহার না করলে ব্যাজ বাদ দিন।
2. `useAppSave()` হুক: একই ভ্যালিডেশন (নাম + GPF/তারিখ আবশ্যক), একই ডুপ-চেক (app4-এর নাম+GPF ম্যাচ ভিত্তি), লোকাল সিঙ্ক + `syncClaimToCentral` (`app-shared/centralClaimSync.ts:58-70`), ফলাফল এক `Toast`-এ (`alert()` বাদ: `app3/App.tsx:238,156`)।
3. `ActionButton` দিয়ে ৪ টেবিলের রো-বাটন প্রতিস্থাপন; ডিলিট কনফার্মেশন **একটি** প্যাটার্ন (ইনলাইন "মুছে ফেলবেন? হ্যাঁ/না" — app3-এর বর্তমান পদ্ধতি সেরা, বাকিদের `window.confirm` প্রতিস্থাপন)।
4. CSV/PDF: `src/lib/exportCsv.ts` (এক ইমপ্লিমেন্টেশন) + `src/lib/printDocument.ts`; app4-এর `utils/printAndDownload.ts` ধাপে ধাপে সেখানে মেলানো (প্রথমে ফন্ট ও সংখ্যা শেয়ার্ড, পরে পেজ-লেআউট)।
5. নকল ডেটা বাদ: `SAMPLE_RECORDS` (`src/utils/storage.ts:41`) ও app4 ফর্ম-ডিফল্ট (`DeathClaimForm.tsx:92-184`); "নমুনা তথ্য রিলোড" লিঙ্ক (`RecordsTable.tsx:134-142`) বাদ — কেন্দ্রীয় হাবে নকল ডেটা আগেই কেটেছি, একই নীতি।
6. app3 হেডারে কাজ না করা বাটন লাগান (`DesktopHeader.tsx:16-18` destructuring ঠিক করে `app3/App.tsx:379-383`-এর প্রপ চালু)।

---

## ৬. ধাপে ধাপে বাস্তবায়ন (প্রতি ধাপ = আলাদা কমিট, যাচাইসহ)
| ধাপ | কাজ | রিস্ক | যাচাই |
|---|---|---|---|
| **০** | রিপোর্ট ২ §গ (ক্লাটার) + §ক-এর ৪টি নিশ্চিত-ডেড ফাইল মোছা | খুব কম | `npm run build`, `npm test` (২৫টি), ৫টি এন্ট্রি পেজ ব্রাউজারে খোলা |
| **১** | `src/lib/format.ts` + রিপোর্ট ১ §১-এর সব [উ] রেন্ডার সাইট + `app3/App.tsx:281`-এর ইনভার্ট কেস | কম (ভিউআলয়) | প্রতিটি পেজে স্ক্রিনশট তুলে Latin digit DOM স্ক্যান (লাইভ-পাসের স্ক্রিপ্ট reuse) |
| **২** | ফন্ট: app4 ফন্ট লিংক, ৬টি হার্ড-কোড ক্লাস বাদ, `lang`, print CSS মিলন | মধ্যম (প্রিন্ট লেআউট) | app1-4 একটি করে নমুদ আবেদন প্রিন্ট-প্রিভিউ PDF → ফন্ট/মার্জিন তুলনা |
| **৩** | Chrome একীভরণ: `SubAppChrome.tsx` (হেডার+ফুটার+ব্যাক), app1..app4 + root-এ প্রয়োগ | মধ্যম | ৪ পেজ স্ক্রিনশট পাশাপাশি; `z`/sticky থেকে কোনো এলিমেন্ট কাটছে না |
| **৪** | `ActionButton` + `LockToggle` + `Toast` + সেভ-কন্ট্রাক্ট | উচ্চতম (৪ অ্যাপের ফর্ম) | ধাপে ধাপে: আগে app1, তারপর app2→app3→app4; প্রতিটিতে সেভ/এডিট/ডিলিট/ডাউনলোড ম্যানুয়াল |
| **৫** | স্টোরেজ স্কোপিং + IndexedDB ক্রস-অ্যাপ ফিক্স | **উচ্চ** (ডেটা) | মাইগ্রেশন: পুরোনো রো → নতুন key prefix; লোকাল ব্যাকআপ (এনক্রিপ্টেড JSON) নিয়ে তারপর |
| **৬** | ডুপ্লিকেট শেয়ার্ডে তোলা (`DesktopGuideModal`, রেকর্ড টেবিল ত্রয়ী, প্রিন্ট পাথ) | উচ্চ | প্রতি প্রপ-মিগ্রেশনের পর `tsc --noEmit` |

**সময় (আনুমানিক):** ০: ১৫ মি | ১: ১–২ ঘ | ২: ১ ঘ | ৩: ১–২ ঘ | ৪: ৩–৫ ঘ | ৫: ২ ঘ | ৬: ৪–৬ ঘ।

## ৭. গ্রহণ-মানদণ্ড (এটি হলেই "সুন্দর দেখায়")
- ৪টি অ্যাপের হেডার/ফুটার/ব্যাক-বাটনের স্ক্রিনশট পাশাপাশি রাখলে আলাদা করা যায় না (শুধু অ্যাপ-নম্বর ও শিরোনাম আলাদা)।
- ৫টি এন্ট্রি পেজের **কোনোটিতেই** লেবেলের ভেতর Latin digit নেই (ফাইলনাম/আইডি ব্যতীত) — DOM স্ক্রিপ্টে হিট ০।
- একই উপজেলায় দুই ব্রাউজার প্রোফাইল খুলে app1-এ সেভ → app2/app3-এর তালিকা অক্ষুণ্ন; app2-র লক app1-এ প্রভাবফেল না।
- চারটি প্রিন্ট PDF-এ ফন্ট, মার্জিন, টাকা-গ্রুপিং ও তারিখ হুবহু এক রকম।
- সব জায়গায় ডিলিট কনফার্ম এক প্যাটার্ন, কোনো `alert()` নেই (`grep -n "alert(" app* src` → ০ হিট)।

## ৮. যা করা হবে না (স্কোপ-কন্ট্রোল)
- নতুন ফিচার/মডিউল যোগ নয়; DDO/UEO প্রিসেট পুনরুজ্জীবন নয় (আপনি বাদ দিয়েছেন)।
- লগইন/RBAC/RLS আচরণ বদল নয় — শুধু ভ্যানিশ অংশ।
- `src/index.css`-এর ইচ্ছাকৃত `.font-mono` রিম্যাপ (বাংলা অঙ্কের সাইজ ঠিক রাখতে) — রিপোর্ট ১ §৫ দ্রষ্টব্য; দরকার হলে `font-variant-numeric: tabular-nums` যোগ করা যায়।
