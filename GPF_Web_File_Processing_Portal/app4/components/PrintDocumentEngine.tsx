import React from 'react';
import { GpfDeathClaim } from '../types/gpf';
import {
  toBengaliNumber,
  formatBangladeshiCurrency,
} from '../utils/bengaliWords';

interface PrintDocumentEngineProps {
  claim: GpfDeathClaim | null;
}

export const PrintDocumentEngine: React.FC<PrintDocumentEngineProps> = ({ claim }) => {
  if (!claim) return null;

  const formattedAmount = formatBangladeshiCurrency(claim.depositedAmount);
  const amountInWords = claim.depositedAmountInWords;

  const Value = ({ children }: { children: React.ReactNode }) => {
    return <span style={{ fontWeight: 400 }}>{children}</span>;
  };

  return (
    <div id="gpf-print-document" className="text-black font-['Hind_Siliguri',sans-serif]">
      <style>{`
        @media screen {
          #gpf-print-document {
            display: none !important;
            visibility: hidden !important;
          }
        }
        @media print {
          #gpf-print-document {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          #gpf-print-document * {
            font-weight: 400 !important;
          }
          header, main, footer, .print-hidden {
            display: none !important;
            visibility: hidden !important;
          }
          @page {
            size: A4 portrait;
            /* Top 30mm, Left 25mm, Right 25mm, Bottom decreased by 3/4 inch (11mm) */
            margin: 30mm 25mm 11mm 25mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-weight: 400 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-page {
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
            display: block;
            height: 250mm;
            max-height: 250mm;
            overflow: hidden;
            box-sizing: border-box;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            font-weight: 400 !important;
          }
          .print-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
            height: auto;
            max-height: none;
          }
          .app-left-aligned {
            text-align: left;
          }
          .app-body-justified {
            text-align: justify !important;
            text-justify: inter-word !important;
          }
          .code-box-group {
            display: flex;
            border: 1px solid #000000;
          }
          .code-box-group span {
            width: 22px;
            height: 22px;
            border-right: 1px solid #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 400 !important;
          }
          .code-box-group span:last-child {
            border-right: none;
          }
          .bordered-table {
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            width: 100% !important;
            table-layout: fixed;
          }
          .bordered-table th, .bordered-table td {
            border: 1px solid #000000 !important;
            padding: 6px 8px;
            font-weight: 400 !important;
            vertical-align: top;
          }
          .borderless-table {
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            width: 100% !important;
            table-layout: fixed;
          }
          .borderless-table th, .borderless-table td {
            border: none !important;
            padding: 6px 8px;
            font-weight: 400 !important;
          }
          /* Grid technique — explicit so borders/columns always print */
          .print-grid {
            display: grid !important;
            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
            width: 100% !important;
          }
          .print-grid > * {
            min-width: 0;
          }
          /* Table column widths for fixed layout */
          .col-w12 { width: 12mm !important; }
          .col-w20 { width: 20mm !important; }
          .col-w28 { width: 28mm !important; }
          .col-w44 { width: 44mm !important; }
          .col-w14 { width: 14mm !important; }
        }
      `}</style>

      {/* ================= PAGE 1 ================= */}
      <div className="print-page text-[15px] leading-[2.0] text-left app-left-aligned">
        <div className="mb-5 text-left">
          তারিখ: <Value>{claim.applicationDate}</Value>
        </div>

        {/* বরাবর অংশ (লাইন স্পেস কম) */}
        <div className="mb-5 text-left space-y-0.5 leading-[1.35]">
          <div>বরাবর</div>
          <div>উপজেলা হিসাবরক্ষণ কর্মকর্তা</div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>।
          </div>
        </div>

        <div className="mb-5 text-left">
          মাধ্যম: যথাযথ কর্তৃপক্ষ।
        </div>

        <div className="mb-5 text-left">
          বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদান প্রসঙ্গে।
        </div>

        <div className="mb-3 text-left">জনাব,</div>

        {/* আবেদন বডি - জাস্টিফাই */}
        <div className="mb-5 text-justify app-body-justified leading-relaxed">
          সবিনয় নিবেদন এই যে, <Value>{claim.schoolName}</Value>, <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value> এর <Value>{claim.deceasedDesignation}</Value> জনাব <Value>{claim.deceasedEmployeeName}</Value> আমার <Value>{claim.relationship}</Value> ছিলেন। তিনি বিগত <Value>{claim.deathDate}</Value> তারিখ মৃত্যুবরণ করেন। এমতাবস্থায় তাঁর সমগ্র চাকুরীকলে সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদানের জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
        </div>

        {/* আবেদন বডি - জাস্টিফাই */}
        <div className="mb-8 text-justify app-body-justified leading-relaxed">
          অতএব, মহোদয় নিকট সবিনয় নিবেদন এই যে, আমার <Value>{claim.relationship}</Value>র সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদানে আপনার সদয় মর্জি হয়।
        </div>

        {/* নিবেদন অংশ (লাইন স্পেস কম এবং আবেদনকারীর নামের উপর পর্যাপ্ত স্বাক্ষর স্পেস) */}
        <div className="pt-3 text-left leading-[1.35] space-y-0.5">
          <div>বিনীত</div>
          <div>নিবেদক</div>
          <div>আপনার বিশ্বস্ত</div>
          {/* আবেদনকারীর স্বাক্ষরের জন্য পর্যাপ্ত ফাঁকা জায়গা */}
          <div className="h-16 w-48"></div>
          <div>
            <Value>{claim.applicantName}</Value>
          </div>
          <div>
            (<Value>{claim.relationship}</Value> মৃত <Value>{claim.deceasedEmployeeName}</Value>
          </div>
          <div>
            <Value>{claim.deceasedDesignation}</Value>
          </div>
          <div>
            <Value>{claim.schoolName}</Value>
          </div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>)।
          </div>
        </div>
      </div>

      {/* ================= PAGE 2 ================= */}
      <div className="print-page text-[15px] leading-[2.0] text-left app-left-aligned">
        <div className="mb-5 text-left">
          তারিখ: <Value>{claim.applicationDate}</Value>
        </div>

        {/* বরাবর অংশ (লাইন স্পেস কম) */}
        <div className="mb-5 text-left space-y-0.5 leading-[1.35]">
          <div>বরাবর</div>
          <div>জেলা প্রাথমিক শিক্ষা অফিসার</div>
          <div>
            <Value>{claim.districtName}।</Value>
          </div>
        </div>

        <div className="mb-5 text-left">
          মাধ্যম: যথাযথ কর্তৃপক্ষ।
        </div>

        <div className="mb-5 text-left">
          বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলন প্রসঙ্গে।
        </div>

        <div className="mb-3 text-left">জনাব,</div>

        {/* আবেদন বডি - জাস্টিফাই */}
        <div className="mb-5 text-justify app-body-justified leading-relaxed">
          সবিনয় নিবেদন এই যে, <Value>{claim.schoolName}</Value>, <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value> এর <Value>{claim.deceasedDesignation}</Value> জনাব <Value>{claim.deceasedEmployeeName}</Value> আমার <Value>{claim.relationship}</Value> ছিলেন। তিনি বিগত <Value>{claim.deathDate}</Value> তারিখ মৃত্যুবরণ করেন। এমতাবস্থায় তাঁর সমগ্র চাকুরীকলে সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের অনুমতির জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
        </div>

        {/* আবেদন বডি - জাস্টিফাই */}
        <div className="mb-8 text-justify app-body-justified leading-relaxed">
          অতএব, মহোদয় নিকট সবিনয় নিবেদন এই যে, আমার সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের অনুমতি প্রদানে আপনার সদয় মর্জি হয়।
        </div>

        {/* নিবেদন অংশ (লাইন স্পেস কম এবং আবেদনকারীর নামের উপর পর্যাপ্ত স্বাক্ষর স্পেস) */}
        <div className="pt-3 text-left leading-[1.35] space-y-0.5">
          <div>বিনীত</div>
          <div>নিবেদক</div>
          <div>আপনার বিশ্বস্ত</div>
          {/* আবেদনকারীর স্বাক্ষরের জন্য পর্যাপ্ত ফাঁকা জায়গা */}
          <div className="h-16 w-48"></div>
          <div>
            <Value>{claim.applicantName}</Value>
          </div>
          <div>
            (<Value>{claim.relationship}</Value> মৃত <Value>{claim.deceasedEmployeeName}</Value>
          </div>
          <div>
            <Value>{claim.deceasedDesignation}</Value>
          </div>
          <div>
            <Value>{claim.schoolName}</Value>
          </div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>)।
          </div>
        </div>
      </div>

      {/* ================= PAGE 3: টি, আর ফরম নং ৩৭ (প্রথম ও দ্বিতীয় ছবির নিখুঁত ডিজাইন) ================= */}
      <div className="print-page text-[13px] leading-normal">
        {/* উপরের অংশ - প্রথম ছবির মত */}
        <div className="text-left text-xs mb-3 leading-tight">
          <div>টি, আর ফরম নং ৩৭</div>
          <div>[এস, আর ৩২৪ (১) দ্রষ্টব্য]</div>
        </div>

        <div className="text-center text-sm mb-4">
          কর্মচারীদের ভবিষ্যৎ তহবিল হইতে উত্তোলন/অগ্রিম গ্রহণের বিল
        </div>

        {/* শ্রেণী বিন্যাস কোড বক্স গ্রুপসমূহ */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div>ভবিষ্যৎ তহবিলের শ্রেণী বিন্যাস কোড</div>
          <div className="flex items-center gap-3">
            <div className="code-box-group">
              <span>৭</span>
            </div>
            <div className="code-box-group">
              <span>২</span><span>৪</span><span>৩</span><span>২</span>
            </div>
            <div className="code-box-group">
              <span>০</span><span>০</span><span>০</span><span>০</span>
            </div>
            <div className="code-box-group">
              <span>৯</span><span>১</span><span>০</span><span>১</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs mb-3">
          <div>টোকেন নং.................................... তারিখ....................................</div>
          <div>ভাউচার নং .................................... তারিখ ....................................</div>
        </div>

        {/* বিল টেবিল — grid technique (borders always print) */}
        <div className="border border-black my-2 text-xs font-normal" style={{ border: '1px solid #000000' }}>
          {/* header row */}
          <div className="print-grid grid grid-cols-12 font-normal border-b border-black text-center min-h-[46px]" style={{ borderBottom: '1px solid #000000' }}>
            <div className="col-span-1 border-r border-black font-normal flex items-center justify-center p-1">ক্রমিক নং</div>
            <div className="col-span-5 border-r border-black font-normal flex items-center justify-center p-1">চাঁদা প্রদানকারীর নাম, বেতন মঞ্জুরী পত্রের নং ও তারিখ।</div>
            <div className="col-span-3 border-r border-black font-normal flex items-center justify-center p-1">ভবিষ্য তহবিলের হিসাব নং</div>
            <div className="col-span-2 border-r border-black font-normal flex items-center justify-center p-1">অগ্রিম/উত্তোলন</div>
            <div className="col-span-1 font-normal flex items-center justify-center p-1">প্রাপ্তির রশিদ</div>
          </div>
          {/* body row */}
          <div className="print-grid grid grid-cols-12 min-h-[120px] text-xs font-normal items-stretch">
            {/* ক্রমিক নং */}
            <div className="col-span-1 border-r border-black p-2 text-center flex items-center justify-center font-normal">
              ০১
            </div>
            {/* চাঁদা প্রদানকারীর নাম ও বিবরণ */}
            <div className="col-span-5 border-r border-black p-2 text-left font-normal leading-relaxed flex flex-col justify-between">
              <div>
                <p className="font-semibold">{claim.applicantName || '..............................................'}</p>
                <p>{claim.deceasedDesignation || '..............................................'}</p>
                <p>{claim.schoolName || '..............................................'}</p>
                <p>
                  {claim.upazilaName || '....................'}, {claim.districtName || '....................'}। এর সাধারণ ভবিষ্য তহবিল-এ জমাকৃত টাকা অফেরতযোগ্য অগ্রিম উত্তোলন এর বিল।
                </p>
              </div>
              <div className="mt-3 flex justify-between text-[11px] items-center whitespace-nowrap">
                <span className="whitespace-nowrap">মঞ্জুরী নং-...............</span>
                <span className="whitespace-nowrap">তারিখ:................</span>
              </div>
            </div>
            {/* ভবিষ্যৎ তহবিলের হিসাব নং */}
            <div className="col-span-3 border-r border-black p-2 text-center flex items-center justify-center font-normal">
              <Value>{claim.gpfAccountNo}</Value>
            </div>
            {/* অগ্রিম/উত্তোলন */}
            <div className="col-span-2 border-r border-black p-2 text-center flex items-center justify-center font-normal">
              <Value>{formattedAmount}/-</Value>
            </div>
            {/* প্রাপ্তির রশীদ */}
            <div className="col-span-1 p-2 text-center flex items-center justify-center font-normal">
            </div>
          </div>
        </div>

        <div className="mb-3 text-xs">
          প্রয়োজনীয় প্রদেয় টাকা = <Value>{formattedAmount}/-</Value> (কথায়:{' '}
          <Value>{amountInWords}</Value>) টাকা বুঝিয়া পাইলাম।
        </div>

        <div className="mb-3 text-xs space-y-1.5 text-justify leading-relaxed">
          <div className="underline">প্রত্যায়নসমূহ</div>
          <p>
            ১। প্রত্যায়ন করা যাইতেছে যে এই বিলে গৃহীত টাকা প্রকৃত প্রাপকদের মধ্যে বিলি করা হইয়াছে এবং প্রত্যেক ২০০ টাকার উপর প্রদানের ক্ষেত্রে রেভিনিউ স্ট্যাম্প লাগাইয়া সেগুলি যথাযথভাবে বাতিলপূর্বক আমার অফিসে রক্ষিত প্রাপ্তি বহিতে প্রাপ্তির রশিদ গ্রহণ করা হইয়াছে।
          </p>
          <p>
            ২। আরও প্রত্যায়ন করা যাইতেছে যে চাঁদা প্রদানকারীর হিসাবে স্থিতি তাহার অগ্রিম/উত্তোলিত অর্থ অপেক্ষা বেশী। (প্রযোজ্য ক্ষেত্রে) বীমা পলিসি নং *......................... রাষ্ট্রপতির অনুকূলে ন্যস্ত করা হইয়াছে এবং হিসাব রক্ষণ অফিসে দাখিল করিয়াছে अथवा (গৃহীতব্য) পলিসি হিসাব রক্ষণ অফিসে প্রেরণ করা হইয়াছে ও উক্ত অফিস কর্তৃক পত্র নং ..................... মারফত গৃহীত হইয়াছে *যদি একের অধিক পলিসি থাকে তবে তাহার বিবরণ এখানে প্রদান করা যাইতে পারে।
          </p>
        </div>

        {/* নিচের অংশ - দ্বিতীয় ছবির মত */}
        <div className="flex justify-between text-xs mb-2 pt-1 leading-loose">
          <div>
            <div>স্থান....................................</div>
            <div>তারিখ ....................................</div>
            <div className="mt-3">সীল</div>
          </div>
          <div>
            <div>আয়ন কর্মকর্তার স্বাক্ষর ....................................</div>
            <div className="mt-1">নাম ....................................................................</div>
            <div className="mt-1">পদবী ....................................................................</div>
          </div>
        </div>

        <hr className="border-t border-black my-2.5" />

        <div className="text-center text-xs mb-1.5">হিসাব রক্ষণ অফিসে ব্যবহারের জন্য</div>

        <div className="text-xs mb-3">
          টাকা .................................... (কথায়) .................................................................... প্রদানের জন্য পাস করা হইল।
        </div>

        <div className="flex justify-between text-left text-xs leading-loose mb-3">
          <div>
            <div>অডিটর</div>
            <div className="mt-1">নাম ....................................</div>
            <div className="mt-1">তারিখ ....................................</div>
          </div>
          <div>
            <div>সুপার</div>
            <div className="mt-1">নাম ....................................</div>
            <div className="mt-1">তারিখ ....................................</div>
          </div>
          <div>
            <div>হিসাব রক্ষণ কর্মকর্তা</div>
            <div className="mt-1">নাম ....................................</div>
            <div className="mt-1">তারিখ ....................................</div>
          </div>
        </div>

        <div className="text-[11px] mt-1">
          বাঃসঃমুঃ-৯৭/৯৮-১৮০৫১ এফ(কম-১) ১০ লক্ষ কপি, (সি-৫৯) ১৯
        </div>
      </div>

      {/* ================= PAGE 4: বেঙ্গল অডিট ম্যানুয়েল ৬৬৩ (তৃতীয় ছবির মত নিখুঁত ও নিচের অংশদুটি জাস্টিফাইড) ================= */}
      <div className="print-page text-[16px] leading-[1.85]">
        <div className="text-center text-sm mb-6 leading-normal">
          <div>অডিট অফিসে প্রোভিডেন্ট ফান্ড চূড়ান্ত অর্থ প্রদানের কেস নিষ্পত্তিকরণের জন্য</div>
          <div className="underline">বেঙ্গল অডিট ম্যানুয়েলের অনুচ্ছেদ ৬৬৩ অনুযায়ী প্রয়োজনীয় বিবরণ।</div>
        </div>

        <div className="space-y-2 text-justify">
          <div>
            ১। চাঁদা দাতার নাম: জনাব <Value>{claim.deceasedEmployeeName}</Value>
          </div>

          <div>
            ২। অবসর গ্রহণ/পদত্যাগ/কর্মচ্যুতি/কর্মখারিজ/অবসর গ্রহণের পূর্বে প্রস্তুতিমূলক ছুটি/চাকুরি হইতে বিতাড়িত এর প্রকৃত তারিখ-<Value>{claim.deathDate}</Value>
            <div className="pl-4 text-[12px] space-y-0.5 mt-0.5">
              <div>(ক) কর্ম খারিজের ক্ষেত্রে উহার কারণ বলিতে হইবে।</div>
              <div>(খ) পদচ্যুতির ক্ষেত্রে কর্মচারী আপীল করিয়াছে কি বা করিতে ইচ্ছা করিয়াছে কি ?</div>
              <div>(গ) পদত্যাগের ক্ষেত্রে বলিতে হইবে যে তাহার পদত্যাগপত্র গ্রহণ করা হইয়াছে কি ?</div>
            </div>
          </div>

          <div>
            ৩। নির্ভুল জি. পি. ফান্ড হিসাব নং- সাধারণ ভবিষ্যৎ তহবিল হিসাব নং- <Value>{claim.gpfAccountNo}</Value>
          </div>

          <div>
            ৪। মঞ্জুরকারী কর্তৃপক্ষের নিকট হইতে একটি সনদপত্র এই মর্মে যে পূর্ববর্তী ১২ (কনটিনজেন্সি ঘটনার ১২) সময়ে তাহাকে জি. পি. ফান্ড হইতে কোন অগ্রিম দেওয়া হইয়াছে কিনা, যদি দেওয়া হইয়া থাকে তা হইলে অগ্রিমের পূর্ণ বিবরণ ...................................প্রযোজ্য নয়.....................................................
          </div>

          <div>
            ৫। জি. পি. ফান্ড হিসাব হইতে অর্থ প্রদানকৃত জীবন বীমা পলিসির বিবরণ ১২ মাস (বার মাস) সময়ে প্রিমিয়ামের জন্য উত্তোলনের বিবরণ ................................ প্রযোজ্য নয়.....................................................
          </div>

          <div>
            ৬। সর্ব শেষ ফান্ড হইতে কর্তনকৃত চাঁদার পরিমাণ টাকা ..........<Value>{toBengaliNumber(claim.lastDeductionAmount || '4900')}/-</Value>....................এবং ভাউচার নং- .....<Value>{claim.lastVoucherNo || '০৮'}</Value>...... টোকেন নং ....................... তাং .................... অগ্রীম উত্তোলন জনিত টাকা বেতন হইতে কর্তনকৃত ফেরত টাকা ।
          </div>

          <div>
            ৭। যে ট্রেজারীতে অর্থ প্রদান ইচ্ছা করা হয় তাহার নাম: <Value>{claim.treasuryOffice || `উপজেলা হিসাবরক্ষণ অফিস, ${claim.upazilaName}, ${claim.districtName}`}</Value>।
          </div>

          <div>
            ৮। এই মর্মে একটি সনদপত্র সরকারী কর্মচারী স্থানীয় যাহা বিভাগের প্রধান কর্তৃক প্রেরণ করিতে হইবে।
          </div>

          <div>
            ৯। ন্যাশনাল সিকিউরিটি ইন্টেলিজেন্স এর নিকট হইতে অস্থানীয় সরকারী সম্পর্কে একটি সনদপত্রের প্রয়োজন যে সেবা পেশায় থাকাকালীন অবস্থায় তাহার কার্যকলাপ কিরূপ ছিল এবং সে ভবিষ্যতে বাংলাদেশে থাকিতে ইচ্ছা করে কিনা অর্থ মন্ত্রণালয়ের স্মারক নং মে এফ/১৭ ২৩-১-৭৪ ....প্রযোজ্য নয় ।
          </div>

          <div>
            ১০। জি. পি. ফান্ডের টাকা দাবী করিয়া চাঁদা দাতা/মনোনীত ব্যক্তির নিকট হইতে প্রাপ্ত মূল দরখাস্তটি অফিস প্রধান কর্তৃক অগ্রবর্তী (ফরওয়ার্ড) করিতে হইবে ..ফরওয়ার্ড করা হইল।
          </div>

          <div>
            ১১। মনোনীত ব্যক্তি নাই এমন চাঁদা দাতার ক্ষেত্রে তাহার পরিবারের সদস্যদের বয়স এবং মৃত্যু কালে চাঁদা দাতার সংযোগের সম্পর্কের তালিকা মাইনর পুত্র ও বিবাহিত কন্যা ছাড়া প্রেরণ করিতে হইবে ...........................................
          </div>
        </div>

       {/* নিচের অংশদুটি আলাদাভাবে জাস্টিফাই ও উপরে পর্যাপ্ত ফাঁকা স্পেস */}
        <div className="flex justify-between items-start mt-20 pt-10 text-xs leading-relaxed gap-10">
          <div className="w-[48%] text-left">
            নন-গেজেটেড চাঁদা দাতার ক্ষেত্রে অফিস প্রধানের স্বাক্ষর অথবা গেজেটেড অফিসারের ক্ষেত্রে চাঁদা দাতা নিজের স্বাক্ষর
          </div>

          <div className="w-[48%] text-left">
            গেজেটেড চাঁদা দাতার ক্ষেত্রে একটি সনদপত্র উপরোক্ত ৩ ও ৭ অনুযায়ী যে কর্তৃপক্ষ চাঁদা দাতাকে অগ্রিম মঞ্জুরী করিতে যোগ্য তাহার দ্বারা প্রেরণ করিতে হইবে।
          </div>
        </div>
      </div>

      {/* ================= PAGE 5: সংযোজনী-৬ (টেবিলের দাগ হাইড, ৫ আঙ্গুলের উপর-নীচ স্পেস বৃদ্ধি, শেষের লাইন সেন্টার) ================= */}
      <div className="print-page text-[14px] leading-relaxed">
        <div className="text-right text-sm mb-2">সংযোজনী-৬</div>

        <div className="text-center text-base mb-5 underline">
          নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ
        </div>

        <div className="mb-5">
          <p className="text-justify mb-2.5">
            ১। নিম্নে সাধারণ ভবিষ্যৎ তহবিলে জমাকৃত সমুদয় অর্থ উত্তোলনের জন্য আবেদনকারী জনাব/বেগম <Value>{claim.applicantName}</Value> (<Value>{claim.relationship}</Value> মৃত <Value>{claim.deceasedEmployeeName}</Value>, <Value>{claim.deceasedDesignation}</Value>, <Value>{claim.schoolName}</Value>) {claim.upazilaName}, {claim.districtName} এর তিনটি নমুনা স্বাক্ষর সত্যায়িত করা হইল।
          </p>

          {/* টেবিলের দাগসমূহ হাইড (Border removed) */}
          <table className="w-full borderless-table text-xs text-left mb-4">
            <thead>
              <tr>
                <th className="w-24">ক্রমিক নং</th>
                <th className="w-64">পূর্ণ স্বাক্ষর</th>
                <th>সংক্ষিপ্ত স্বাক্ষর</th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-9"><td>(১)</td><td></td><td></td></tr>
              <tr className="h-9"><td>(২)</td><td></td><td></td></tr>
              <tr className="h-9"><td>(৩)</td><td></td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-5">
          <p className="text-justify mb-2.5">
            ২। নিম্নে সাধারণ ভবিষ্যৎ তহবিলে জমাকৃত সমুদয় অর্থ উত্তোলনের জন্য আবেদনকারী জনাব/বেগম <Value>{claim.applicantName}</Value> (<Value>{claim.relationship}</Value> মৃত <Value>{claim.deceasedEmployeeName}</Value>, <Value>{claim.deceasedDesignation}</Value>, <Value>{claim.schoolName}</Value>) {claim.upazilaName}, {claim.districtName} এর হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত করা হইল।
          </p>

          {/* টেবিলের দাগসমূহ হাইড ও ৫টি রো এর উপর-নীচ স্পেস বৃদ্ধি (h-14) */}
          <table className="w-full borderless-table text-xs text-left mb-4">
            <thead>
              <tr>
                <th className="w-24">ক্রমিক নং</th>
                <th className="w-64">আঙ্গুলের নাম</th>
                <th>ছাপ</th>
              </tr>
            </thead>
            <tbody>
              <tr className="h-14 align-middle"><td>(১)</td><td>বাম/ডান কনিষ্ঠ</td><td></td></tr>
              <tr className="h-14 align-middle"><td>(২)</td><td>বাম/ডান অনামিকা</td><td></td></tr>
              <tr className="h-14 align-middle"><td>(৩)</td><td>বাম/ডান মধ্যমা</td><td></td></tr>
              <tr className="h-14 align-middle"><td>(৪)</td><td>বাম/ডান তর্জনী</td><td></td></tr>
              <tr className="h-14 align-middle"><td>(৫)</td><td>বাম/ডান বৃদ্ধাঙ্গুলি</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6 text-xs">
          ৩। উপর্যুক্ত নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ আমার সম্মুখে প্রদান করা হইয়াছে।
        </div>

        {/* সব শেষের লাইন দুটি যেখানে আছে এখানেই রাইট এলাইন বাদ দিয়ে সেন্টার */}
        <div className="w-80 ml-auto text-center text-xs pt-4 leading-normal">
          <div>সত্যায়নকারী প্রথম শ্রেণির গেজেটেড কর্মকর্তার তারিখসহ স্বাক্ষর</div>
          <div>সীলমোহর (নামযুক্ত)</div>
        </div>
      </div>

      {/* ================= PAGE 6: ফরোয়ার্ডিং পত্র (ইউএও বরাবরে) ================= */}
      <div className="print-page text-[14px] leading-relaxed">
        <div className="text-center mb-5">
          <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
          <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>।
          </div>
        </div>

        <div className="flex justify-between items-center text-xs mb-4">
          <div>
            স্মারক নং- <Value>{claim.forwardingMemoNo || `উশিঅ/বিবা/সিল/${claim.year}/`}</Value>
          </div>
          <div>
            তারিখ: <Value>{claim.forwardingDate || claim.applicationDate}</Value>
          </div>
        </div>

        <div className="mb-3.5">
          বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের জন্য ক্ষমতাপত্র প্রদান প্রসঙ্গে।
        </div>

        <p className="text-justify mb-4 leading-loose indent-8">
          উপর্যুক্ত বিষয়ের আলোকে জানানো যাচ্ছে যে, নিম্নোক্ত শিক্ষক <Value>{claim.deathDate}</Value> তারিখ চাকুরীরত অবস্থায় মৃত্যুবরণ করেন। শিক্ষকের <Value>{claim.relationship}</Value> তাঁর সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র চেয়ে আবেদন করেছেন। এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য অনুরোধ করা হলো।
        </p>

        {/* ছক — grid technique (borders always print) */}
        <div className="border border-black text-xs font-normal mb-5" style={{ border: '1px solid #000000' }}>
          <div className="print-grid grid grid-cols-12 font-normal border-b border-black text-center min-h-[40px]" style={{ borderBottom: '1px solid #000000' }}>
            <div className="col-span-2 border-r border-black font-normal flex items-center justify-center p-1">ক্র:নং</div>
            <div className="col-span-6 border-r border-black font-normal flex items-center justify-center p-1">আবেদনকারীর বিবরণ</div>
            <div className="col-span-4 font-normal flex items-center justify-center p-1">চূড়ান্ত উত্তোলনের কারণ</div>
          </div>
          <div className="print-grid grid grid-cols-12 text-xs font-normal items-stretch">
            <div className="col-span-2 border-r border-black p-2 text-center flex items-center justify-center font-normal">০১</div>
            <div className="col-span-6 border-r border-black p-2 text-left leading-relaxed font-normal">
              জনাব <Value>{claim.applicantName}</Value>, (<Value>{claim.relationship}</Value> মৃত{' '}
              <Value>{claim.deceasedEmployeeName}</Value>, <Value>{claim.deceasedDesignation}</Value>,{' '}
              <Value>{claim.schoolName}</Value>) <Value>{claim.upazilaName}</Value>,{' '}
              <Value>{claim.districtName}</Value>।
            </div>
            <div className="col-span-4 p-2 text-center flex items-center justify-center font-normal">মৃত্যুজনিত কারণে</div>
          </div>
        </div>

        <div className="mb-6 text-xs space-y-1">
          <div className="underline mb-1">সংযুক্তি:</div>
          <div className="flex justify-between">
            <span>১। আবেদনপত্র-----------------------------------------------------</span>
            <Value>{claim.attachmentsCount}</Value>
          </div>
          <div className="flex justify-between">
            <span>২। অডিট বেঙ্গল ম্যানুয়াল ফরম (পূরণকৃত) ---------------------------</span>
            <Value>{claim.attachmentsCount}</Value>
          </div>
          <div className="flex justify-between">
            <span>৩। সাধারণ ভবিষ্যৎ তহবিল হিসাব বিবরণী এর অনলাইন কপি -----------</span>
            <Value>{claim.attachmentsCount}</Value>
          </div>
          <div className="flex justify-between">
            <span>৪। শিক্ষকের নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত--------</span>
            <Value>{claim.attachmentsCount}</Value>
          </div>
          <div className="flex justify-between">
            <span>৫। অবসর উত্তর ছুটি পিআরএল-এর অনুমতিপত্র ----------------------</span>
            <Value>{claim.attachmentsCount}</Value>
          </div>
        </div>

        {/* ডিডিও অংশ যেখানে আছে সেখানেই রাইট এলাইন বাদ দিয়ে সেন্টার ও ১ ইঞ্চির অধিক স্বাক্ষর স্পেস */}
        <div className="w-72 ml-auto text-center text-xs leading-normal mb-4">
          {/* ডিডিও স্বাক্ষরের জন্য এক ইঞ্চির উপরে (১.২৫ ইঞ্চি / ৩২ মিমি) পর্যাপ্ত ফাঁকা জায়গা */}
          <div className="h-28 w-full"></div>
          <div>
            (<Value>{claim.ddoName}</Value>)
          </div>
          <div>
            <Value>{claim.ddoDesignation}</Value>
          </div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>।
          </div>
        </div>

        {/* ডিডিও অংশ যে রো-তে শেষ হয়েছে তার পরবর্তী রোতে প্রাপক শব্দ বাদ দিয়ে প্রাপক অংশ */}
        <div className="text-left text-xs leading-snug">
          <div>উপজেলা হিসাব রক্ষণ কর্মকর্তা,</div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>।
          </div>
        </div>
      </div>

      {/* ================= PAGE 7: ফরোয়ার্ডিং পত্র (ডিপিইও বরাবরে) ================= */}
      <div className="print-page text-[14px] leading-relaxed">
        <div className="text-center mb-5">
          <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
          <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>।
          </div>
        </div>

        <div className="flex justify-between items-center text-xs mb-4">
          <div>
            স্মারক নং- <Value>{claim.forwardingMemoNo || `উশিঅ/বিবা/সিল/${claim.year}/`}</Value>
          </div>
          <div>
            তারিখ: <Value>{claim.forwardingDate || claim.applicationDate}</Value>
          </div>
        </div>

        <div className="mb-3.5">
          বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলন প্রসঙ্গে।
        </div>

        <p className="text-justify mb-4 leading-loose indent-8">
          উপর্যুক্ত বিষয়ের আলোকে জানানো যাচ্ছে যে, নিম্নোক্ত শিক্ষক <Value>{claim.deathDate}</Value> তারিখ চাকুরীরত অবস্থায় মৃত্যুবরণ করেন। শিক্ষকের <Value>{claim.relationship}</Value> তাঁর সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের জন্য অনুমতি চেয়ে আবেদন করেছেন। এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য অনুরোধ করা হলো।
        </p>

        {/* ছক — grid technique (borders always print) */}
        <div className="border border-black text-xs font-normal mb-5" style={{ border: '1px solid #000000' }}>
          <div className="print-grid grid grid-cols-12 font-normal border-b border-black text-center min-h-[40px]" style={{ borderBottom: '1px solid #000000' }}>
            <div className="col-span-2 border-r border-black font-normal flex items-center justify-center p-1">ক্র:নং</div>
            <div className="col-span-6 border-r border-black font-normal flex items-center justify-center p-1">আবেদনকারীর বিবরণ</div>
            <div className="col-span-4 font-normal flex items-center justify-center p-1">চূড়ান্ত উত্তোলনের কারণ</div>
          </div>
          <div className="print-grid grid grid-cols-12 text-xs font-normal items-stretch">
            <div className="col-span-2 border-r border-black p-2 text-center flex items-center justify-center font-normal">০১</div>
            <div className="col-span-6 border-r border-black p-2 text-left leading-relaxed font-normal">
              জনাব <Value>{claim.applicantName}</Value>, (<Value>{claim.relationship}</Value> মৃত{' '}
              <Value>{claim.deceasedEmployeeName}</Value>, <Value>{claim.deceasedDesignation}</Value>,{' '}
              <Value>{claim.schoolName}</Value>) <Value>{claim.upazilaName}</Value>,{' '}
              <Value>{claim.districtName}</Value>।
            </div>
            <div className="col-span-4 p-2 text-center flex items-center justify-center font-normal">মৃত্যুজনিত কারণে</div>
          </div>
        </div>

        <div className="mb-6 text-xs space-y-1">
          <div className="underline mb-1">সংযুক্তি:</div>
          <div className="flex justify-between">
            <span>১। আবেদনপত্র-----------------------------------------------------</span>
            <Value>{claim.attachmentsCount}</Value>
          </div>
          <div className="flex justify-between">
            <span>২। অডিট বেঙ্গল ম্যানুয়াল ফরম (পূরণকৃত) ---------------------------</span>
            <Value>{claim.attachmentsCount}</Value>
          </div>
          <div className="flex justify-between">
            <span>৩। স্থানীয় হিসাবরক্ষণ অফিস কর্তৃক প্রদত্ত ক্ষমতাপত্র --------------------</span>
            <Value>{claim.attachmentsCount}</Value>
          </div>
          <div className="flex justify-between">
            <span>৪। শিক্ষকের নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত--------</span>
            <Value>{claim.attachmentsCount}</Value>
          </div>
          <div className="flex justify-between">
            <span>৫। অবসর উত্তর ছুটি পিআরএল-এর অনুমতিপত্র ----------------------</span>
            <Value>{claim.attachmentsCount}</Value>
          </div>
        </div>

        {/* ডিডিও অংশ যেখানে আছে সেখানেই রাইট এলাইন বাদ দিয়ে সেন্টার ও ১ ইঞ্চির অধিক স্বাক্ষর স্পেস */}
        <div className="w-72 ml-auto text-center text-xs leading-normal mb-4">
          {/* ডিডিও স্বাক্ষরের জন্য এক ইঞ্চির উপরে (১.২৫ ইঞ্চি / ৩২ মিমি) পর্যাপ্ত ফাঁকা জায়গা */}
          <div className="h-28 w-full"></div>
          <div>
            (<Value>{claim.ddoName}</Value>)
          </div>
          <div>
            <Value>{claim.ddoDesignation}</Value>
          </div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>।
          </div>
        </div>

        {/* ডিডিও অংশ যে রো-তে শেষ হয়েছে তার পরবর্তী রোতে প্রাপক শব্দ বাদ দিয়ে প্রাপক অংশ */}
        <div className="text-left text-xs leading-snug">
          <div>জেলা প্রাথমিক শিক্ষা অফিসার,</div>
          <div>
            <Value>{claim.districtName}।</Value>
          </div>
        </div>
      </div>
    </div>
  );
};
