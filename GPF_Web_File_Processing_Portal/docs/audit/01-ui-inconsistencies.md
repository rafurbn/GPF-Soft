# রিপোর্ট ১ — ইউআই অসামঞ্জস্য: যেসব জায়গায় পরিবর্তন আনয়ন প্রয়োজন

ভিত্তি: `main@e8b5ab0`, লাইভ সাইট `https://gpf-soft.vercel.app`।
প্রতিটি লাইন-নম্বর টুল আউটপুট দিয়ে হাতে যাচাই করা হয়েছে (অনুমান নয়)।
তীব্রতা: **[উ]** উচ্চ (সরাসরি ব্যবহারকারীর চোখে পড়ে / সরকারি নথিতে যায়), **[ম]** মধ্যম, **[নি]** নিম্ন।

---

## ১. সংখ্যা/ডিজিট এখনও ইংরেজি (মালিকের মূল অভিযোগ)

সম্পর্কিত হেল্পার যা **আগে থেকেই আছে** — সমস্যার মূল কারণ নতুন হেল্পার নয়, একই কাজের ৩টি বিকল্প লাইব্রেরি থাকায় অ্যাপগুলো যে যার মতো হেল্পার নিয়েছেছে:
`src/utils/numberToBanglaWords.ts` (`toBanglaDigits`, `formatBanglaCurrency`), `src/utils/bengaliConverter.ts` (`toBengaliDigits`, `formatBengaliDate`), `app4/utils/bengaliWords.ts` (`toBengaliNumber`, `formatBangladeshiCurrency`)।

### ১ ক. কেন্দ্রীয় ড্যাশবোর্ড ও সুপার এডমিন প্যানেল
| তীব্রতা | ফাইল:লাইন | যা দেখায় | কী করা দরকার |
|---|---|---|---|
| [উ] | `src/components/PortalDesktopSignInView.tsx:605` | `মোট শর্তাবলী: ১৪টি • প্রদর্শিত হচ্ছে: 14 টি` — এক লাইনেই ১৪ ও 14 | `toBanglaDigits(filteredBullets.length)` |
| [উ] | `src/components/SuperAdminOverview.tsx:36` | "নিবন্ধিত উপজেলা" সংখ্যা ইংরেজি | `toBanglaDigits(...)` |
| [উ] | `src/components/SuperAdminSuite.tsx:766` | `{stats.totalClaims} টি ফাইল` | `toBanglaDigits` |
| [উ] | `src/components/SuperAdminSuite.tsx:777` | `৳{stats.totalAmount.toLocaleString('en-US')}` | `formatBanglaCurrency` |
| [উ] | `src/components/SuperAdminSuite.tsx:788` | `{users.length} উপজেলা` | `toBanglaDigits` |
| [উ] | `src/components/SuperAdminSuite.tsx:799` | `{activeSessions.length} ডিভাইস` | `toBanglaDigits` |
| [উ] | `src/components/SuperAdminSuite.tsx:824,825,828` | প্রতি-অ্যাপ কার্ড: সংখ্যা, `৳…toLocaleString('en-US')`, গড় অর্থ | `toBanglaDigits` / `formatBanglaCurrency` |
| [উ] | `src/components/SuperAdminSuite.tsx:1160` | কেন্দ্রীয় ফাইল হাবের প্রতি সারির টাকা | `formatBanglaCurrency` |
| [উ] | `src/components/SuperAdminSuite.tsx:1838` | দাবির বিবরণ মডালের টাকা | `formatBanglaCurrency` |
| [ম] | `src/components/SuperAdminSuite.tsx:747` | ট্যাব ব্যাজ (উৎস `:719–723`) | `toBanglaDigits` |
| [ম] | `src/components/SuperAdminSuite.tsx:1847` | `applyDate` ইংরেজি তারিখ | `formatBengaliDate` |
| [উ] | `src/components/OfficialDashboard.tsx:208` | `{stat.value}` — মান `:163,167,173` থেকে `.length` | `toBanglaDigits` |
| [ম] | `src/components/BroadcastNoticeMarquee.tsx:101` | নোটিশ পেজ কাউন্টার `3/5` | `toBanglaDigits` |
| [নি] | `src/lib/centralAdminStore.ts:211` | অ্যাডমিন নোটিফিকেশনের টেক্সটে ইংরেজি অঙ্ক | `formatBanglaCurrency` |

### ১ খ. সাব-অ্যাপ
| তীব্রতা | ফাইল:লাইন | যা দেখায় |
|---|---|---|
| [উ] | `app4/components/ClaimsDataTable.tsx:352` | `{claim.gpfAccountNo}` — জিপিএফ নম্বর ইংরেজি |
| [উ] | `app4/components/ClaimsDataTable.tsx:368,369` | আবেদনের তারিখ ও মৃত্যুর তারিখ ইংরেজি |
| [উ] | `app4/components/ClaimsDataTable.tsx:54`, `app4/App.tsx:307` | টোস্টে `${count}টি` ইংরেজি |
| [উ] | `app3/components/SavedRecordsTable.tsx:214` | `applicationDate` রূপ করা হয়নি, অথচ একই টেবিলের `:201,208` রূপ করা — এক টেবিলেই মিশ্র |
| [উ] | `app3/App.tsx:281` | **উল্টো দিকের ত্রুটি:** ISO ফিল্ডে `apply_date: '২০২৬-০৯-২৩'` — ডেটাবেজে বাংলা অঙ্ক জমা হওয়ার ঝুঁকি, `toEnglishDigits` দরকার |
| [নি] | `app1`, `app2` | দৃশ্যমান লিক নেই; শুধু টাকা লক্ষ/কোটি গ্রুপিং ছাড়া (`toBanglaDigits` ব্যবহৃত, `formatBanglaCurrency` নয়) |

**ইচ্ছাকৃত ইংরেজি, ঠিক রাখাই হবে**: ফাইলনাম ও আইডি — `SuperAdminSuite.tsx:385,563,574`, `app1/App.tsx:299`, `app2/App.tsx:450`, `app4/App.tsx:174,201,239`, লগইন আইডি `Bea002`।

### ১ গ. প্রিন্ট/PDF
- app4 পরিষ্কার: `app4/components/PrintDocumentEngine.tsx:31-36` প্রতিটি মান `toBn` দিয়ে র‍্যাপ করা — তবে `:451`-এ ডিফল্ট `'4900'` ও ভাউচার `'০৮'` হার্ড-কোড।
- app1/app2: বাংলা অঙ্ক কিন্তু গ্রুপিং নেই — `app1/components/PrintTemplates.tsx:28,33,34,36`, `app2/components/DocumentTemplate.tsx:14-16`, `app1/components/HtmlEditorModal.tsx:146,154,327,328,331`।
- app3 ঠিক আছে: `app3/components/OfficialPrintPreview.tsx:45-51` → `formatBanglaCurrency`।

---

## ২. হেডার (চার অ্যাপে চার রকম)
| | এলিমেন্ট | অবস্থান | স্থান | ব্যাকগ্রাউন্ড | শিরোনাম ট্যাগ | আইকন | মেটা |
|---|---|---|---|---|---|---|---|
| app1 | `<div>` (হেডার নয়) | `app1/App.tsx:343,345` | `sticky top-0 z-40` | gradient `#091122→#0d1b2a`, `rounded-2xl` | `<h2>` `text-base sm:text-lg` | শুধু pulse dot | **কিছুই নেই** |
| app2 | `<div>` | `app2/App.tsx:467,469` | `sticky top-0 z-40` | একই, `via-[#171827]` | `<h2>` | নেই | **কিছুই নেই** |
| app3 | `<header>` | `app3/App.tsx:377` + `app3/components/DesktopHeader.tsx:20` | `sticky top-0 **z-30**` | **solid** `bg-[#091122]`, rounded নেই | `<h1>` + `md:text-xl` | `Award` | **কিছুই নেই** |
| app4 | `<header>` (`<main>`-এর বাইরে) | `app4/App.tsx:313-321`, `app4/components/Header.tsx:25-38` | **`fixed inset-x-0 top-0 z-50`**, স্ক্রলে সংকুচিত | `bg-[#0c1427]/80→/95`, `print:hidden` | `<h1>` `text-sm sm:text-base` | `FileText` | অ্যাপ-নম্বর ব্যাজ, সেভ-কাউন্ট, দপ্তর+উপজেলা+জেলা |
| root | `<header>` non-sticky | `src/components/PortalDesktopSignInView.tsx:428` | — | solid | `<h1>` **`font-serif`** | `<img>` লোগো | `v2.6 প্রো সংস্করণ`, স্ট্যাটাস ব্যাজ |

পরিবর্তন প্রয়োজন: `z-30`/`z-40`/`z-50` তিন মান, sticky vs fixed, `<h1>` vs `<h2>`, তিন রকম শিরোনাম সাইজ, শুধু app4-এর হেডারে উপজেলা/জেলা/সেভ-কাউন্ট দেখায় — বাকি তিনটিতে ব্যবহারকারী কোন উপজেলার ফাইল খুলেছেন তা হেডার থেকে বোঝা যায় না (সরকারি কাজের প্রেক্ষিতে এটি [উ])।

## ৩. ফুটার
app1/app2/app3 একই রকম (`app1/App.tsx:404-413`, `app2/App.tsx:534-543`, `app3/App.tsx:414-423`), কিন্তু:
- [ম] `app4/App.tsx:367` — দ্বিতীয় `<p>`-এ `text-[11px] text-slate-600` ক্লাস নেই → টেক্সট সাইজ ও রঙ আলাদা।
- [ম] শুধু app1/app2-তে `© ২০২৬ • …রফিকুল ইসলাম`; app3/app4-তে নেই।
- [নি] কোনো sub-app ফুটারে ভার্সন বা যোগাযোগ নেই; root-এ আছে WhatsApp/ফোন (`PortalDesktopSignInView.tsx:902-910`)।

## ৪. ব্যাকপেইজ বাটন
- app1/app2/app3: দুই লাইনের লেবেল `ব্যাকপেইজ` + `ড্যাশবোর্ডে ফিরুন`, `rounded-xl` (`app1/App.tsx:358-363`, `app2/App.tsx:482-487`, `app3/components/DesktopHeader.tsx:36-41`)।
- [ম] app4: লেবেল `ড্যাশবোর্ডে ফিরুন` এক লাইন, আকার `text-xs px-3 py-1.5 rounded-lg` (`app4/components/Header.tsx:47-51`)।
- [ম] app1-এর বাটন indigo, app2/app3/app4 emerald (`app1/App.tsx:351`)।
- root-এ আরও দুই রকম: `src/App.tsx:455-460` (সাদা বাটন), `src/components/SuperAdminSuite.tsx:705-711` (`←` **টেক্সট** হিসেবে, আইকন নয়)।
- হ্যান্ডলার সব অ্যাপে একই: `app-shared/bootstrap.tsx:101` → `window.location.assign('/')`,পেজ ছাড়ার আগে কোনো কনফার্মেশন নেই (সেভ না করা ফর্ম হারানোর ঝুঁকি) — [ম]।

## ৫. ফন্ট / টাইপোগ্রাফি
- [উ] `app4/index.html:14` শুধু **Hind Siliguri + JetBrains Mono** ডাউনলোড করে; বাকি চার এন্ট্রিতে ৫টি ফ্যামিলি (`index.html:14`, `app1/index.html:10`, `app2/index.html:10`, `app3/index.html:10`)। ফলে app4-এ `Noto Sans Bengali`, `Noto Serif Bengali`, `Tiro Bangla`, `Plus Jakarta Sans` লোড হয় না-ই — সেখানে `font-sans`/`font-bangla-serif` নীরবে ফallback নেয়।
- [উ] চার অ্যাপের রুটেই হার্ড-কোড `font-['Hind_Siliguri',sans-serif]` global স্ট্যাককে ওভাররাইড করে: `app1/App.tsx:318`, `app2/App.tsx:458`, `app3/App.tsx:361`, `app4/App.tsx:311` (আর `app3/components/GpfDashboardTable.tsx:99`, `app3/components/SavedRecordsTable.tsx:99`)। root ব্যবহার করে `font-sans` (`src/App.tsx:396`)।
- [ম] root-এর শিরোনাম `font-serif` (`PortalDesktopSignInView.tsx:443,475`) → লাইভে মাপা computed value `ui-serif, Georgia…`, অর্থাৎ ইংরেজি টাইটেল Georgia-তে রেন্ডার হয়; `src/index.css:44-49`-এর `.font-bangla-serif` ব্যবহার করা হয়নি।
- [ম] প্রিন্ট ফন্ট দুই ভাগ: app1/app2/app3 → `.font-bangla-serif` (`PrintTemplates.tsx:50`, `DocumentTemplate.tsx:35`, `OfficialPrintPreview.tsx:82`); app4 নিজের ইনলাইন `<style>`-এ `'SolaimanLipi','Nikosh','Kalpurush'` (`app4/components/PrintDocumentEngine.tsx:67,80,85`)।
- [উ] `src/index.css`-এ দুটি পরস্পরদ্বন্দ্বী `@media print`: `@page` margin `0` (`:82-85`) বনাম `25mm 20mm 15mm 20mm` (`:229`) — শেষটি জিতেছে, অর্থাৎ প্রথম ব্লকটি বিভ্রান্তিকর ডেড।
- [নি] root `<html lang="en">` (`index.html:2`), চার অ্যাপেই `lang="bn"`।
- দ্রষ্টব্য: `.font-mono`-কে বাংলা ফন্টে রিম্যাপ করা **ইচ্ছাকৃত ও নথিভুক্ত** (`src/index.css:32-41`) — সেটিকে ঠিক রাখুন, বোনাস হিসেবে টেবিলারে অ্যালাইনমেন্ট `tabular-nums` দিয়ে আলাদা করে ঠিক করা যাবে।

## ৬. লক / আনলক বাটন ও ফিল্ড
- বাটন কম্পোনেন্ট: app1/app2/app3 **বাইট-আইডেন্টিক্যাল** (১,২৫৯ B), app4 ড্রিফট (১,৪৬৯ B — `id` prop বাদ, `app4/components/LockToggleButton.tsx:4-10,29-33`)।
- [ম] কলাম গণনা আলাদা: app1/app4 দুই কলাম `লক` + `আনলক` (`app1/components/InputFormTable.tsx:234-239`, `app4/components/DeathClaimForm.tsx:365-382`); app2/app3 এক কলাম `লক / আনলক` (`app2/components/FormTable.tsx:113`, `app3/components/GpfDashboardTable.tsx:151`)।
- [উ] লক করা ইনপুটের রঙ এক নয়: app1 amber (`InputFormTable.tsx:259,681,702`) কিন্তু receiver/fix ফিল্ড emerald (`:327,739,755`); app2 emerald (`FormTable.tsx:136`); app3 **দুটি আলাদা ভ্যারিয়েন্ট এক ফাইলে** (`GpfDashboardTable.tsx:175,524` বনাম `:249`); app4 amber, recipient emerald (`DeathClaimForm.tsx:399,542`)।
- [উ] লকের আচরণ আলাদা: app1 শুধু `readOnly` (কোনো ফидব্যাক নেই); app2 টোস্টে ফিল্ডের নাম বলে (`app2/App.tsx:224`); app3 ইনলাইন ব্যানার (`GpfDashboardTable.tsx:49-54,127-141`) যার টেক্সটে **"লকড" নামে বাটনের কথা বলা হয় যা আসলে নেই** (আসল লেবেল `আনলক`); app4 `pointer-events-none` + `disabled` + `tabIndex:-1` (`DeathClaimForm.tsx:396-416`) — একমাত্র অ্যাপ যে কার্যত ক্লিক ব্লক করে।
- [উ] ফিক্সড ফিল্ডে ক্লিক করলে app1/app2/app4 টোস্ট দেয় (`app1/App.tsx:110`, `app2/App.tsx:237`, `app4/App.tsx:96`), **app3 নীরবে `return` করে** (`app3/App.tsx:184`) → ব্যবহারকারী মনে করে বাটন নষ্ট।
- [ম] ব্যাজের বাংলা এক নয়: `লক করা আছে` (`app1:265`, `app4:500`) / `লকড` (`app2:148`) / `লকড (সুরক্ষিত)` (`app1:311`, `app2:204`, `app3:233`, `app4:528`) / `ফিক্সড` (`app1:129`, `app4:336`)।
- [উ] state সংরক্ষণের স্কোপিং আলাদা: app2/app4 upazila-scoped (`readScoped/writeScoped`, `app2/App.tsx:24-25`, `app4/App.tsx:15`); app1 অনস্কোপড (`src/utils/storage.ts:102-107`), app3 সরাসরি raw `localStorage`-এ লেখে কোনো লাইব্রেরি ছাড়াই (`app3/App.tsx:22,137`) → **এক উপজেলার লক অন্য উপজেলার ফাইলে চলে যায়**।
- `.field-locked` CSS (`app4/index.css:25`) কোনো জায়গায় ব্যবহৃত হয়নি, আর সেই ফাইলটাই ইমপোর্ট হয় না।
- [ম] তৃতীয়, সম্পূর্ণ আলাদা "লক": পুরো অ্যাপের মেইনটেন্যান্স লক (`app-shared/bootstrap.tsx:69-96`) টগল হয় `src/components/SuperAdminSuite.tsx:535-554` থেকে — কোনো কনফার্মেশন/OTP নেই।

## ৭. ডাটা সেইভ অংশ
| | বাটনের লেখা | কোথায় লেখে | ভ্যালিডেশন | ফیدব্যাক |
|---|---|---|---|---|
| app1 | `ডাটা সেইভ করুন` (`InputFormTable.tsx:779-787`) | `saveUnlimitedRecords(..., 'gpf_advance_saved_records_v2')` (`app1/App.tsx:73`) | শুধু নাম (`:161`) | টাইপ-করা টোস্ট (`:321-340`) |
| app2 | `ডাটা সেইভ করুন` / `ডাটা আপডেট করুন` (`FormTable.tsx:645-653`) | effect-এ লেখে (`app2/App.tsx:204`) | নাম **অথবা** স্কুল (`:293`) | এক ধরনের টোস্ট (`:214`) |
| app3 | `ডাটা সেইভ করুন` (`GpfDashboardTable.tsx:652-660`) | raw localStorage + `saveUnlimitedRecords` (`app3/App.tsx:154`) | নাম **অথবা** GPF (`:237`) | **`alert()`** (`:238,156`) + টোস্ট |
| app4 | `তথ্য সেভ করুন` / `আপডেট সম্পন্ন করুন` (`DeathClaimForm.tsx:903-918`) | `writeScoped` localStorage-এই, IndexedDB নয় (`app4/App.tsx:86-92`) | ৪টি আবশ্যক ফিল্ড (`:284`) | নিচে-ডানে টোস্ট + বাটনের লেখা বদলায় |
- [উ] বানান ভাঙন: **সেইভ** (app1/2/3) বনাম **সেভ** (app4); app3 একমাত্র অ্যাপ যে ব্রাউজারের `alert()` ব্যবহার করে — পোর্টালের বাকি সব জায়গায় টোস্ট, তাই এটি অসামঞ্জস্য ও অবিশ্বাস-দায়ক।
- [উ] চার অ্যাপেই ভ্যালিডেশন-নিয়ম আলাদা, অথচ একই ধরনের আবেদনপত্র।
- [ম] সেভ সেন্ট্রাল ডিবিতে সিঙ্ক হয় (`app-shared/centralClaimSync.ts:58-70`) কিন্তু ব্যর্থতার বার্তা app1/app2/app4 টোস্টে, app3 আলাদা অবস্থানে অ্যাম্বার ব্যানারে (`app3/App.tsx:369-373`)।
- [উ] রুট ড্যাশবোর্ডের "সেভ" প্রপ `onSaveApplication` **নো-ওপ** (`app-shared/bootstrap.tsx:108-111`) — প্রতিটি অ্যাপ যে `parentApp` অবজেক্ট তৈরি করে (`app1/App.tsx:191-207`, `app2/App.tsx:330-344`, `app3/App.tsx:271-285`) তা খারিজ হয়ে যায়।

## ৮. প্রিন্ট / এডিট / ডিলিট / ডাউনলোড বাটন
- [উ] একই কাজ, আলাদা আইকন: Edit = `Edit2` (app1) → `Edit` (app2) → `Edit3` (app3) → `Edit2` (app4) (`app1/components/RecordsTable.tsx:211`, `app2/components/RecordsList.tsx:152`, `app3/components/SavedRecordsTable.tsx:231`, `app4/components/ClaimsDataTable.tsx:396`)।
- [ম] রঙের অরাজকতা: Print = amber→emerald→emerald→amber; Edit = indigo→emerald→emerald→blue।
- [উ] ডিলিট কনফার্মেশন চার রকম: `window.confirm` app1 (`App.tsx:275`) ও app2 (`App.tsx:383`) ও app4 (`ClaimsDataTable.tsx:407`), app3 ইনলাইন ছোট মিনি-মোডাল `মুছুন/না` (`SavedRecordsTable.tsx:241-260`)।
- [ম] আকার ভিন্ন: `rounded` / `rounded-md` / `rounded-lg`; আইকন `w-3.5` (app1/2/3) বনাম `w-4` (app4); সার্চ বক্স `w-44` (app3) বনাম `w-64` (বাকিগুলো)।
- [ম] `নতুন এন্ট্রি` বাটন: app1 amber, app2/app3 ইন্ডিগো (`app3/components/SavedRecordsTable.tsx:137-145`-এ হেক্স `#4f46e5`), app4-তে আইকনে `+` আর লেখায় "+ নতুন এন্ট্রি" — **দ্বৈত চিহ্ন** (`ClaimsDataTable.tsx:291-292`)।
- [ম] CSV এক্সপোর্ট তিন অ্যাপে তিনটি আলাদা হাতে-গড়া ইমপ্লিমেন্টেশন (`RecordsTable.tsx:49-72` — লেবেল "এক্সেল", `SavedRecordsTable.tsx:47-96`, app2-তে `App.tsx`-এ ন্যস্ত); ফিল্টার শুধু app4-এ (`ClaimsDataTable.tsx:261-284`); JSON ব্যাকআপ/ইমপোর্ট শুধু app4-এ (`:219-236`) ও app1-এ `.html` (`HtmlEditorModal.tsx:509`)।
- [উ] ডাউনলোড পাথ: app1/app2/app3 শেয়ার্ড `src/utils/pdfDownload.ts` (html2pdf) ব্যবহার করে, app4 সম্পূর্ণ বিকল্প ৪৭ KB জেনারেটর `app4/utils/printAndDownload.ts` — আউটপুট ফরম্যাট/ফন্ট/সময় আলাদা হওয়ার মূল কারণ।

## ৯. প্রিন্ট/ডিসপ্লে নয় — অডিটে ধরা পড়া কার্যকরী ত্রুটি
1. **[উ] অ্যাপ-মধ্যে ডেটা মুছে যাওয়া:** `loadUnlimitedRecords()`/`saveUnlimitedRecords()` একই IndexedDB অবজেক্টস্টোর `records`-এ সব রেকর্ড রাখে এবং প্রতিবার `store.clear()` করে (`src/lib/unlimitedStore.ts:21,147`); লোকালস্টোরেজ কী পারামিটারটি কেবল মিররে লেখে (`:120-127`)। অর্থাৎ app1-এ সেভ করলে app2/app3-এর সেভ-তালিকা ওঠে যেতে পারে। app4-তে একই "আনলিমিটেড সেইভ ফাইল" ব্যাজ দেখায় (`ClaimsDataTable.tsx:200`) কিন্তু সে সেই স্টোর ব্যবহারই করে না।
2. **[উ] নমুনা/নকল ডেটা UI-তে:** `SAMPLE_RECORDS` (`src/utils/storage.ts:41`) app1-এ লোড ও **persist** হয় (`app1/App.tsx:7,312-313`); app4-এর ডিফল্ট ফর্মে বিয়ানীবাজার/সিলেট/"নৃপেন্দ্র নাথ সরকার"/৩০০০০০ হার্ড-কোড (`app4/components/DeathClaimForm.tsx:92-184`)। সরকারি প্যানেলে নকল নাম থাকবে না — এটি আগে কেটেছি কেন্দ্রীয় হাব থেকে; একই নীতি এখানে প্রযোজ্য।
3. **[উ] স্কোপিং ভাঙন:** app1/app3-এর লক/রেকর্ড key upazila-scoped নয় (উপরে §৬) → অন্য উপজেলার ফাইলে লক চলে যায়।
4. **[ম] app3-এর হেডারে কাজ না করা ওয়্যারিং:** `DesktopHeader`-এ `onNewApplication/onSave/onOpenPrint/onOpenHtmlEdit/savedCount` প্রপ দেওয়া হয় (`app3/App.tsx:379-383`) কিন্তু কম্পোনেন্ট শুধু `onBack` ডিস্ট্রাকচার করে (`app3/components/DesktopHeader.tsx:16-18`) → app3-এর হেডারে প্রিন্ট/নতুন এন্ট্রি বাটন চুপচাপ নেই।
5. **[নি] ভার্সন মিশ্রণ:** root ব্যাজ `v2.6 প্রো সংস্করণ` (`PortalDesktopSignInView.tsx:450`) বনাম প্যানেল `v2.0 PROD` (`SuperAdminSuite.tsx:679`) এবং ব্যাকআপ পেলোড `'2.1.0-PROD'` (`src/lib/centralAdminStore.ts`) — তিন জায়গায় তিন সংস্করণ।

## যা লাইভে যাচাই করা যায়নি
চারটি সাব-অ্যাপই সেশন-গেটেড; লগইন না করলে `/app1/…/app4/` নীরবে `/`-এ রিডাইরেক্ট করে (কনসোল এরর নেই, অ্যাসেট ২০০/৩০৪)। তাই সেগুলোর ড্যাশবোর্ড সংখ্যা/ফন্ট লাইভে দেখা যায়নি — ওই বিভাগগুলো কোড-প্রমাণভিত্তিক। স্ক্রিনশট: `C:\Users\pc\AppData\Local\Temp\gpf-audit\01-root.png` … `05-app4-redirected.png` (ব্রাউজার ভিউপোর্ট ৯৮৮px, ট্রু ১৪৪০px ডেস্কটপ পাওয়া যায়নি)।

সম্পূর্ণ রিপোর্ট ২ (বাদ দেওয়ার তালিকা) ও রিপোর্ট ৩ (একীভরণ পরিকল্পনা) একই ফোল্ডারে।
