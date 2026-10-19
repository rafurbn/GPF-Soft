import React from 'react';
import { GpfDeathClaim } from '../types/gpf';
import {
  toBengaliNumber,
  formatBangladeshiCurrency,
} from '../utils/bengaliWords';

interface PrintDocumentEngineProps {
  claim: GpfDeathClaim | null;
}

// ইংরেজি সংখ্যা এবং তারিখকে বাংলায় রূপান্তরের ফাংশন
const toBn = (val: any): string => {
  if (val === undefined || val === null || val === '') return '';
  let str = String(val);

  // YYYY-MM-DD ফরম্যাট থাকলে DD/MM/YYYY করা
  str = str.replace(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/g, '$3/$2/$1');

  // ০-৯ সংখ্যা রূপান্তর
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
};

export const PrintDocumentEngine: React.FC<PrintDocumentEngineProps> = ({ claim }) => {
  if (!claim) return null;

  const formattedAmount = formatBangladeshiCurrency(claim.depositedAmount);
  const amountInWords = claim.depositedAmountInWords;

  const Value = ({ children }: { children: React.ReactNode }) => {
    if (typeof children === 'string' || typeof children === 'number') {
      return <span style={{ fontWeight: 400 }}>{toBn(children)}</span>;
    }
    return <span style={{ fontWeight: 400 }}>{children}</span>;
  };

  return (
    <div
      id="gpf-print-document"
      className="hidden print:block text-black"
      style={{ display: 'none' }}
    >
      <style>{`
        @media screen {
          #gpf-print-document {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            position: absolute !important;
            left: -9999px !important;
            top: -9999px !important;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm 20mm 15mm 20mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'SolaimanLipi', 'Nikosh', 'NikoshBAN', 'Kalpurush', 'Hind Siliguri', sans-serif !important;
            font-weight: 400 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #gpf-print-document {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'SolaimanLipi', 'Nikosh', 'NikoshBAN', 'Kalpurush', 'Hind Siliguri', sans-serif !important;
          }
          #gpf-print-document * {
            box-sizing: border-box !important;
            -moz-box-sizing: border-box !important;
            font-family: 'SolaimanLipi', 'Nikosh', 'NikoshBAN', 'Kalpurush', 'Hind Siliguri', sans-serif !important;
            font-weight: 400 !important;
          }
          header, main, footer, .print-hidden, nav {
            display: none !important;
            visibility: hidden !important;
          }

          /* ফায়ারফক্স ও ক্রোম সার্বজনীন ৭ পাতা ফরম্যাটিং */
          .print-page {
            display: block !important;
            box-sizing: border-box !important;
            width: 100% !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            font-weight: 400 !important;
          }
          .print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          .app-left-aligned {
            text-align: left;
          }
          .app-body-justified {
            text-align: justify !important;
            text-justify: inter-word !important;
          }

          /* কোড বক্স */
          .code-box-group {
            display: inline-flex;
            border: 1.5px solid #000000 !important;
            margin: 0 2px;
            vertical-align: middle;
          }
          .code-box-group span {
            width: 20px;
            height: 20px;
            border-right: 1.5px solid #000000 !important;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 11.5px;
            font-weight: 400 !important;
          }
          .code-box-group span:last-child {
            border-right: none !important;
          }

          /* ফায়ারফক্সে টেবিল বর্ডার অক্ষত রাখার ইউনিভার্সাল সিএসএস */
          .official-bordered-table {
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            width: 100% !important;
            table-layout: fixed !important;
            border: 1.5px solid #000000 !important;
            margin: 0 !important;
          }
          .official-bordered-table th, 
          .official-bordered-table td {
            border: 1.5px solid #000000 !important;
            background-color: transparent !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .borderless-table {
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            width: 100% !important;
            table-layout: fixed !important;
          }
          .borderless-table th, .borderless-table td {
            border: none !important;
            font-weight: 400 !important;
          }
        }
      `}</style>

      {/* ================= PAGE 1 ================= */}
      <div className="print-page text-[13px] leading-[1.5] text-left app-left-aligned">
        <div className="mb-2 text-left">
          তারিখ: <Value>{claim.applicationDate}</Value>
        </div>

        <div className="mb-2 text-left space-y-0.5 leading-[1.25]">
          <div>বরাবর</div>
          <div>উপজেলা হিসাবরক্ষণ কর্মকর্তা</div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>।
          </div>
        </div>

        <div className="mb-2 text-left">
          মাধ্যম: যথাযথ কর্তৃপক্ষ।
        </div>

        <div className="mb-2 text-left leading-[1.35]">
          বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদান প্রসঙ্গে।
        </div>

        <div className="mb-1 text-left">জনাব,</div>

        <div className="mb-2 text-justify app-body-justified leading-[1.45]">
          সবিনয় নিবেদন এই যে, <Value>{claim.schoolName}</Value>, <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value> এর <Value>{claim.deceasedDesignation}</Value> জনাব <Value>{claim.deceasedEmployeeName}</Value> আমার <Value>{claim.relationship}</Value> ছিলেন। তিনি বিগত <Value>{claim.deathDate}</Value> তারিখ মৃত্যুবরণ করেন। এমতাবস্থায় তাঁর সমগ্র চাকুরীকলে সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদানের জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
        </div>

        <div className="mb-3 text-justify app-body-justified leading-[1.45]">
          অতএব, মহোদয় নিকট সবিনয় নিবেদন এই যে, আমার <Value>{claim.relationship}</Value>র সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদানে আপনার সদয় মর্জি হয়।
        </div>

        <div className="pt-1 text-left leading-[1.25] space-y-0.5">
          <div>বিনীত</div>
          <div>নিবেদক</div>
          <div>আপনার বিশ্বস্ত</div>
          <div className="h-8 w-48"></div>
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
      <div className="print-page text-[13px] leading-[1.5] text-left app-left-aligned">
        <div className="mb-2 text-left">
          তারিখ: <Value>{claim.applicationDate}</Value>
        </div>

        <div className="mb-2 text-left space-y-0.5 leading-[1.25]">
          <div>বরাবর</div>
          <div>
            <Value>{claim.recipient}।</Value>
          </div>
          <div>
            <Value>{claim.districtName}।</Value>
          </div>
        </div>

        <div className="mb-2 text-left">
          মাধ্যম: যথাযথ কর্তৃপক্ষ।
        </div>

        <div className="mb-2 text-left leading-[1.35]">
          বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলন প্রসঙ্গে।
        </div>

        <div className="mb-1 text-left">জনাব,</div>

        <div className="mb-2 text-justify app-body-justified leading-[1.45]">
          সবিনয় নিবেদন এই যে, <Value>{claim.schoolName}</Value>, <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value> এর <Value>{claim.deceasedDesignation}</Value> জনাব <Value>{claim.deceasedEmployeeName}</Value> আমার <Value>{claim.relationship}</Value> ছিলেন। তিনি বিগত <Value>{claim.deathDate}</Value> তারিখ মৃত্যুবরণ করেন। এমতাবস্থায় তাঁর সমগ্র চাকুরীকলে সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের অনুমতির জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
        </div>

        <div className="mb-3 text-justify app-body-justified leading-[1.45]">
          অতএব, মহোদয় নিকট সবিনয় নিবেদন এই যে, আমার সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <Value>{claim.gpfAccountNo}</Value> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের অনুমতি প্রদানে আপনার সদয় মর্জি হয়।
        </div>

        <div className="pt-1 text-left leading-[1.25] space-y-0.5">
          <div>বিনীত</div>
          <div>নিবেদক</div>
          <div>আপনার বিশ্বস্ত</div>
          <div className="h-8 w-48"></div>
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

      {/* ================= PAGE 3: টি, আর ফরম নং ৩৭ ================= */}
      <div className="print-page text-[10.5px] leading-tight">
        <div className="text-left text-[10px] mb-1 leading-tight">
          <div>টি, আর ফরম নং ৩৭</div>
          <div>[এস, আর ৩২৪ (১) দ্রষ্টব্য]</div>
        </div>

        <div className="text-center text-xs font-semibold mb-1">
          কর্মচারীদের ভবিষ্যৎ তহবিল হইতে উত্তোলন/অগ্রিম গ্রহণের বিল
        </div>

        {/* শ্রেণী বিন্যাস কোড */}
        <div className="flex items-center justify-between text-[10px] mb-1">
          <div>ভবিষ্যৎ তহবিলের শ্রেণী বিন্যাস কোড</div>
          <div className="flex items-center gap-1">
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

        <div className="flex justify-between text-[10px] mb-1">
          <div>টোকেন নং.................................... তারিখ....................................</div>
          <div>ভাউচার নং .................................... তারিখ ....................................</div>
        </div>

        {/* বিল টেবিল (১ম টেবিল - যার প্রতিটি দাগ ফায়ারফক্সে অটুট থাকবে) */}
        <table className="official-bordered-table my-1 text-[10px]">
          <thead>
            <tr className="text-center">
              <th style={{ width: '10%', padding: '3px 2px', fontWeight: 600 }}>ক্রমিক নং</th>
              <th style={{ width: '44%', padding: '3px 4px', fontWeight: 600 }}>চাঁদা প্রদানকারীর নাম, বেতন মঞ্জুরী পত্রের নং ও তারিখ।</th>
              <th style={{ width: '22%', padding: '3px 2px', fontWeight: 600 }}>ভবিষ্য তহবিলের হিসাব নং</th>
              <th style={{ width: '14%', padding: '3px 2px', fontWeight: 600 }}>অগ্রিম/উত্তোলন</th>
              <th style={{ width: '10%', padding: '3px 2px', fontWeight: 600 }}>প্রাপ্তির রশিদ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle' }}>
                ০১
              </td>
              <td style={{ padding: '4px 5px', textAlign: 'left', verticalAlign: 'top', lineHeight: 1.3 }}>
                <p className="font-semibold">{claim.applicantName || '..............................................'}</p>
                <p>{claim.deceasedDesignation || '..............................................'}</p>
                <p>{claim.schoolName || '..............................................'}</p>
                <p>
                  {claim.upazilaName || '....................'}, {claim.districtName || '....................'}। এর সাধারণ ভবিষ্য তহবিল-এ জমাকৃত টাকা অফেরতযোগ্য অগ্রিম উত্তোলন এর বিল।
                </p>
                <div className="mt-1 flex justify-between text-[9.5px] items-center whitespace-nowrap">
                  <span className="whitespace-nowrap">মঞ্জুরী নং- {toBn(claim.forwardingMemoNo || claim.sanctionMemoNo || '...............')}</span>
                  <span className="whitespace-nowrap">তারিখ: {toBn(claim.forwardingDate || claim.sanctionDate || claim.applicationDate || '................')}</span>
                </div>
              </td>
              <td style={{ padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle' }}>
                <Value>{claim.gpfAccountNo}</Value>
              </td>
              <td style={{ padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle' }}>
                <Value>{formattedAmount}/-</Value>
              </td>
              <td style={{ padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle' }}>
                &nbsp;
              </td>
            </tr>
          </tbody>
        </table>

        <div className="my-1 text-[10px]">
          প্রয়োজনীয় প্রদেয় টাকা = <Value>{formattedAmount}/-</Value> (কথায়:{' '}
          <Value>{amountInWords}</Value>) টাকা বুঝিয়া পাইলাম।
        </div>

        <div className="mb-1 text-[9.5px] space-y-0.5 text-justify leading-tight">
          <div className="underline text-center font-medium">প্রত্যয়নসমূহ</div>
          <p>
            ১। প্রত্যায়ন করা যাইতেছে যে এই বিলে গৃহীত টাকা প্রকৃত প্রাপকদের মধ্যে বিলি করা হইয়াছে এবং প্রত্যেক ২০০ টাকার উপর প্রদানের ক্ষেত্রে রেভিনিউ স্ট্যাম্প লাগাইয়া সেগুলি যথাযথভাবে বাতিলপূর্বক আমার অফিসে রক্ষিত প্রাপ্তি বহিতে প্রাপ্তির রশিদ গ্রহণ করা হইয়াছে।
          </p>
          <p>
            ২। আরও প্রত্যায়ন করা যাইতেছে যে চাঁদা প্রদানকারীর হিসাবে স্থিতি তাহার অগ্রিম/উত্তোলিত অর্থ অপেক্ষা বেশী। (প্রযোজ্য ক্ষেত্রে) বীমা পলিসি নং *......................... রাষ্ট্রপতির অনুকূলে ন্যস্ত করা হইয়াছে এবং হিসাব রক্ষণ অফিসে দাখিল করিয়াছে অথবা (গৃহীতব্য) পলিসি হিসাব রক্ষণ অফিসে প্রেরণ করা হইয়াছে ও উক্ত অফিস কর্তৃক পত্র নং ..................... মারফত গৃহীত হইয়াছে।
          </p>
        </div>

        <div className="flex justify-between text-[10px] mb-1 pt-0.5 leading-tight">
          <div>
            <div>স্থান....................................</div>
            <div>তারিখ ....................................</div>
            <div className="mt-0.5">সীল</div>
          </div>
          <div>
            <div>আয়ন কর্মকর্তার স্বাক্ষর ....................................</div>
            <div className="mt-0.5">নাম ....................................................................</div>
            <div className="mt-0.5">পদবী ....................................................................</div>
          </div>
        </div>

        <hr className="border-t border-black my-0.5" />

        <div className="text-center text-[9.5px] mb-0.5">হিসাব রক্ষণ অফিসে ব্যবহারের জন্য</div>

        <div className="text-[10px] mb-0.5">
          টাকা .................................... (কথায়) .................................................................... প্রদানের জন্য পাস করা হইল।
        </div>

        <div className="flex justify-between text-left text-[10px] leading-tight mb-0.5">
          <div>
            <div>অডিটর</div>
            <div className="mt-0.5">নাম ....................................</div>
            <div className="mt-0.5">তারিখ ....................................</div>
          </div>
          <div>
            <div>সুপার</div>
            <div className="mt-0.5">নাম ....................................</div>
            <div className="mt-0.5">তারিখ ....................................</div>
          </div>
          <div>
            <div>হিসাব রক্ষণ কর্মকর্তা</div>
            <div className="mt-0.5">নাম ....................................</div>
            <div className="mt-0.5">তারিখ ....................................</div>
          </div>
        </div>

        <div className="text-[8.5px] mt-0.5">
          বাঃসঃমুঃ-৯৭/৯৮-১৮০৫১ এফ(কম-১) ১০ লক্ষ কপি, (সি-৫৯) ১৯
        </div>
      </div>

      {/* ================= PAGE 4: বেঙ্গল অডিট ম্যানুয়েল ৬৬৩ ================= */}
      <div className="print-page text-[11.5px] leading-[1.4]">
        <div className="text-center text-xs mb-1.5 leading-normal">
          <div>অডিট অফিসে প্রোভিডেন্ট ফান্ড চূড়ান্ত অর্থ প্রদানের কেস নিষ্পত্তিকরণের জন্য</div>
          <div className="underline font-semibold">বেঙ্গল অডিট ম্যানুয়েলের অনুচ্ছেদ ৬৬৩ অনুযায়ী প্রয়োজনীয় বিবরণ।</div>
        </div>

        <div className="space-y-0.5 text-justify text-[11px]">
          <div>
            ১। চাঁদা দাতার নাম: জনাব <Value>{claim.deceasedEmployeeName}</Value>
          </div>

          <div>
            ২। অবসর গ্রহণ/পদত্যাগ/কর্মচ্যুতি/কর্মখারিজ/অবসর গ্রহণের পূর্বে প্রস্তুতিমূলক ছুটি/চাকুরি হইতে বিতাড়িত এর প্রকৃত তারিখ- <Value>{claim.deathDate}</Value>
            <div className="pl-3 text-[10px] space-y-0.5 mt-0.5">
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
            ৬। সর্ব শেষ ফান্ড হইতে কর্তনকৃত চাঁদার পরিমাণ টাকা ..........<Value>{toBn(claim.lastDeductionAmount || '4900')}/-</Value>....................এবং ভাউচার নং- .....<Value>{toBn(claim.lastVoucherNo || '০৮')}</Value>...... টোকেন নং ....................... তাং .................... অগ্রীম উত্তোলন জনিত টাকা বেতন হইতে কর্তনকৃত ফেরত টাকা ।
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

        <div className="flex justify-between items-start mt-3 pt-1 text-[10px] leading-tight gap-4">
          <div className="w-[48%] text-left">
            নন-গেজেটেড চাঁদা দাতার ক্ষেত্রে অফিস প্রধানের স্বাক্ষর অথবা গেজেটেড অফিসারের ক্ষেত্রে চাঁদা দাতা নিজের স্বাক্ষর
          </div>

          <div className="w-[48%] text-left">
            গেজেটেড চাঁদা দাতার ক্ষেত্রে একটি সনদপত্র উপরোক্ত ৩ ও ৭ অনুযায়ী যে কর্তৃপক্ষ চাঁদা দাতাকে অগ্রিম মঞ্জুরী করিতে যোগ্য তাহার দ্বারা প্রেরণ করিতে হইবে।
          </div>
        </div>
      </div>

      {/* ================= PAGE 5: সংযোজনী-৬ ================= */}
      <div className="print-page text-[11.5px] leading-relaxed">
        <div className="text-right text-[10.5px] mb-1 font-semibold">সংযোজনী-৬</div>

        <div className="text-center text-xs mb-2 underline font-semibold">
          নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ
        </div>

        <div className="mb-2">
          <p className="text-justify mb-1 leading-normal">
            ১। নিম্নে সাধারণ ভবিষ্যৎ তহবিলে জমাকৃত সমুদয় অর্থ উত্তোলনের জন্য আবেদনকারী জনাব/বেগম <Value>{claim.applicantName}</Value> (<Value>{claim.relationship}</Value> মৃত <Value>{claim.deceasedEmployeeName}</Value>, <Value>{claim.deceasedDesignation}</Value>, <Value>{claim.schoolName}</Value>) {claim.upazilaName}, {claim.districtName} এর তিনটি নমুনা স্বাক্ষর সত্যায়িত করা হইল।
          </p>

          <table className="w-full borderless-table text-[10.5px] text-left mb-1">
            <thead>
              <tr>
                <th style={{ width: '18%', padding: '2px 4px', fontWeight: 400 }}>ক্রমিক নং</th>
                <th style={{ width: '48%', padding: '2px 4px', fontWeight: 400 }}>পূর্ণ স্বাক্ষর</th>
                <th style={{ width: '34%', padding: '2px 4px', fontWeight: 400 }}>সংক্ষিপ্ত স্বাক্ষর</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: '24px' }}><td style={{ padding: '2px 4px' }}>(১)</td><td></td><td></td></tr>
              <tr style={{ height: '24px' }}><td style={{ padding: '2px 4px' }}>(২)</td><td></td><td></td></tr>
              <tr style={{ height: '24px' }}><td style={{ padding: '2px 4px' }}>(৩)</td><td></td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-2">
          <p className="text-justify mb-1 leading-normal">
            ২। নিম্নে সাধারণ ভবিষ্যৎ তহবিলে জমাকৃত সমুদয় অর্থ উত্তোলনের জন্য আবেদনকারী জনাব/বেগম <Value>{claim.applicantName}</Value> (<Value>{claim.relationship}</Value> মৃত <Value>{claim.deceasedEmployeeName}</Value>, <Value>{claim.deceasedDesignation}</Value>, <Value>{claim.schoolName}</Value>) {claim.upazilaName}, {claim.districtName} এর হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত করা হইল।
          </p>

          <table className="w-full borderless-table text-[10.5px] text-left mb-1">
            <thead>
              <tr>
                <th style={{ width: '18%', padding: '2px 4px', fontWeight: 400 }}>ক্রমিক নং</th>
                <th style={{ width: '48%', padding: '2px 4px', fontWeight: 400 }}>আঙ্গুলের নাম</th>
                <th style={{ width: '34%', padding: '2px 4px', fontWeight: 400 }}>ছাপ</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: '28px', verticalAlign: 'middle' }}><td style={{ padding: '2px 4px' }}>(১)</td><td>বাম/ডান কনিষ্ঠ</td><td></td></tr>
              <tr style={{ height: '28px', verticalAlign: 'middle' }}><td style={{ padding: '2px 4px' }}>(২)</td><td>বাম/ডান অনামিকা</td><td></td></tr>
              <tr style={{ height: '28px', verticalAlign: 'middle' }}><td style={{ padding: '2px 4px' }}>(৩)</td><td>বাম/ডান মধ্যমা</td><td></td></tr>
              <tr style={{ height: '28px', verticalAlign: 'middle' }}><td style={{ padding: '2px 4px' }}>(৪)</td><td>বাম/ডান তর্জনী</td><td></td></tr>
              <tr style={{ height: '28px', verticalAlign: 'middle' }}><td style={{ padding: '2px 4px' }}>(৫)</td><td>বাম/ডান বৃদ্ধাঙ্গুলি</td><td></td></tr>
            </tbody>
          </table>
        </div>

        <div className="mb-1 text-[10.5px]">
          ৩। উপর্যুক্ত নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ আমার সম্মুখে প্রদান করা হইয়াছে।
        </div>

        <div className="w-80 ml-auto text-center text-[10.5px] pt-1 leading-tight">
          <div>সত্যায়নকারী প্রথম শ্রেণির গেজেটেড কর্মকর্তার তারিখসহ স্বাক্ষর</div>
          <div>সীলমোহর (নামযুক্ত)</div>
        </div>
      </div>

      {/* ================= PAGE 6: ফরোয়ার্ডিং পত্র (ইউএও বরাবরে) ================= */}
      <div className="print-page text-[11.5px] leading-relaxed">
        <div className="text-center mb-2">
          <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
          <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>।
          </div>
        </div>

        <div className="flex justify-between items-center text-[10.5px] mb-1.5">
          <div>
            স্মারক নং- <Value>{claim.forwardingMemoNo || `উশিঅ/বিবা/সিল/${claim.year}/`}</Value>
          </div>
          <div>
            তারিখ: <Value>{claim.forwardingDate || claim.applicationDate}</Value>
          </div>
        </div>

        <div className="mb-1.5 font-medium">
          বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের জন্য ক্ষমতাপত্র প্রদান প্রসঙ্গে।
        </div>

        <p className="text-justify mb-2 leading-relaxed indent-6">
          উপর্যুক্ত বিষয়ের আলোকে জানানো যাচ্ছে যে, নিম্নোক্ত শিক্ষক <Value>{claim.deathDate}</Value> তারিখ চাকুরীরত অবস্থায় মৃত্যুবরণ করেন। শিক্ষকের <Value>{claim.relationship}</Value> তাঁর সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র চেয়ে আবেদন করেছেন। এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য অনুরোধ করা হলো।
        </p>

        {/* ছক (২য় টেবিল - প্রতিটি সেল বর্ডারসহ) */}
        <table className="official-bordered-table text-[10.5px] mb-2">
          <thead>
            <tr className="text-center">
              <th style={{ width: '12%', padding: '3px 2px', fontWeight: 600 }}>ক্র:নং</th>
              <th style={{ width: '58%', padding: '3px 5px', fontWeight: 600 }}>আবেদনকারীর বিবরণ</th>
              <th style={{ width: '30%', padding: '3px 2px', fontWeight: 600 }}>চূড়ান্ত উত্তোলনের কারণ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle' }}>
                ০১
              </td>
              <td style={{ padding: '4px 5px', textAlign: 'left', verticalAlign: 'top', lineHeight: 1.35 }}>
                জনাব <Value>{claim.applicantName}</Value>, (<Value>{claim.relationship}</Value> মৃত{' '}
                <Value>{claim.deceasedEmployeeName}</Value>, <Value>{claim.deceasedDesignation}</Value>,{' '}
                <Value>{claim.schoolName}</Value>) <Value>{claim.upazilaName}</Value>,{' '}
                <Value>{claim.districtName}</Value>।
              </td>
              <td style={{ padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle' }}>
                মৃত্যুজনিত কারণে
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mb-2 text-[10px] space-y-0.5">
          <div className="underline mb-0.5">সংযুক্তি:</div>
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

        <div className="w-72 ml-auto text-center text-[10px] leading-tight mb-1">
          <div className="h-7 w-full"></div>
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

        <div className="text-left text-[10px] leading-tight">
          <div>উপজেলা হিসাব রক্ষণ কর্মকর্তা,</div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>।
          </div>
        </div>
      </div>

      {/* ================= PAGE 7: ফরোয়ার্ডিং পত্র (ডিপিইও বরাবরে) ================= */}
      <div className="print-page text-[11.5px] leading-relaxed">
        <div className="text-center mb-2">
          <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
          <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
          <div>
            <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>।
          </div>
        </div>

        <div className="flex justify-between items-center text-[10.5px] mb-1.5">
          <div>
            স্মারক নং- <Value>{claim.forwardingMemoNo || `উশিঅ/বিবা/সিল/${claim.year}/`}</Value>
          </div>
          <div>
            তারিখ: <Value>{claim.forwardingDate || claim.applicationDate}</Value>
          </div>
        </div>

        <div className="mb-1.5 font-medium">
          বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলন প্রসঙ্গে।
        </div>

        <p className="text-justify mb-2 leading-relaxed indent-6">
          উপর্যুক্ত বিষয়ের আলোকে জানানো যাচ্ছে যে, নিম্নোক্ত শিক্ষক <Value>{claim.deathDate}</Value> তারিখ চাকুরীরত অবস্থায় মৃত্যুবরণ করেন। শিক্ষকের <Value>{claim.relationship}</Value> তাঁর সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের জন্য অনুমতি চেয়ে আবেদন করেছেন। এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য অনুরোধ করা হলো।
        </p>

        {/* ছক (৩য় টেবিল - প্রতিটি সেলে চারপাশের বর্ডার নিশ্চিত করা হয়েছে) */}
        <table className="official-bordered-table text-[10.5px] mb-2">
          <thead>
            <tr className="text-center font-medium">
              <th style={{ width: '12%', padding: '3px 2px', fontWeight: 600 }}>ক্র/নং</th>
              <th style={{ width: '50%', padding: '3px 5px', fontWeight: 600 }}>আবেদনকারীর বিবরণ</th>
              <th style={{ width: '38%', padding: '3px 2px', fontWeight: 600 }}>চূড়ান্ত উত্তোলনের কারণ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle' }}>
                ০১
              </td>
              <td style={{ padding: '4px 5px', textAlign: 'left', verticalAlign: 'middle', lineHeight: 1.35 }}>
                <span className="font-semibold"><Value>{claim.applicantName}</Value></span>, <Value>{claim.relationship}</Value> মৃত <span className="font-semibold"><Value>{claim.deceasedEmployeeName}</Value></span>, <Value>{claim.deceasedDesignation}</Value>, <Value>{claim.schoolName}</Value>, <Value>{claim.upazilaName}</Value>, <Value>{claim.districtName}</Value>।
              </td>
              <td style={{ padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle' }}>
                <Value>{claim.reason || 'মৃত্যুজনিত কারণে'}</Value>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mb-2 text-[10px] space-y-0.5">
          <div className="underline mb-0.5">সংযুক্তি:</div>
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

        <div className="w-72 ml-auto text-center text-[10px] leading-tight mb-1">
          <div className="h-7 w-full"></div>
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

        <div className="text-left text-[10px] leading-tight">
          <div>জেলা প্রাথমিক শিক্ষা অফিসার,</div>
          <div>
            <Value>{claim.districtName}।</Value>
          </div>
        </div>
      </div>
    </div>
  );
};
