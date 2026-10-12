import { GpfDeathClaim } from '../types/gpf';
import {
  toBengaliNumber,
  formatBangladeshiCurrency,
} from './bengaliWords';

/**
 * Generates the complete, standalone HTML document for the official death claim pages.
 * Fully customized according to user specifications:
 * - Application bodies (Page 1 & 2) fully justified (text-align: justify)
 * - Ample signature space (>1.25 in) above applicant name in application letters
 * - Page 4 (Bengal Audit Manual): Extra vertical space above footer blocks and both blocks cleanly justified
 * - Pages 6 & 7 (Forwarding letters): DDO signature space exceeds 1 inch (margin-top: 115px) above DDO name
 * - DDO block centered in place on the right side
 * - Recipient on following row on left side without the word "প্রাপক"
 * - Bottom margin reduced by 3/4 inch (11mm)
 * - Zero bold weights (font-weight: 400 throughout)
 */
export function generateOfficial7PagesHtml(claim: GpfDeathClaim): string {
  const formattedAmount = formatBangladeshiCurrency(claim.depositedAmount);
  const amountInWords = claim.depositedAmountInWords;

  return `<!doctype html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>জিপিএফ চূড়ান্ত উত্তোলন (ডেথ ক্লেইম) - ${claim.deceasedEmployeeName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      /* Top 30mm, Left 25mm, Right 25mm, Bottom decreased by 3/4 inch (11mm) */
      margin: 30mm 25mm 11mm 25mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-weight: 400 !important;
    }
    body {
      font-family: 'Hind Siliguri', 'SolaimanLipi', 'Kalpurush', sans-serif;
      font-weight: 400 !important;
      color: #000000;
      background: #ffffff;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      page-break-after: always;
      break-after: page;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 0;
      margin: 0;
      background: #ffffff;
      font-weight: 400 !important;
    }
    .page:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }
    .text-left {
      text-align: left !important;
    }
    .text-center {
      text-align: center !important;
    }
    .text-right {
      text-align: right !important;
    }
    .text-justify {
      text-align: justify !important;
      text-justify: inter-word !important;
    }
    .val {
      font-weight: 400 !important;
      color: #000000;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    th, td {
      padding: 6px 8px;
      font-weight: 400 !important;
    }
    .bordered-table th, .bordered-table td {
      border: 1px solid #000000;
    }
    .borderless-table th, .borderless-table td {
      border: none !important;
    }
    .seal-box {
      border: 1px dashed #444444;
      width: 85px;
      height: 55px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #333333;
      margin-top: 10px;
    }
    /* TR Form 37 Code Boxes */
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
    @media screen {
      body {
        background: #f1f5f9;
        padding: 20px;
      }
      .page {
        max-width: 800px;
        margin: 0 auto 30px auto;
        background: #ffffff;
        padding: 45px 40px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        border-radius: 4px;
        min-height: auto;
      }
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: আবেদনপত্র (উপজেলা হিসাবরক্ষণ কর্মকর্তা বরাবরে) ================= -->
  <div class="page text-left" style="font-size: 15px; line-height: 2.1;">
    <div style="margin-bottom: 20px;">তারিখ: <span class="val">${claim.applicationDate}</span></div>

    <!-- বরাবর অংশ (লাইন স্পেস কম) -->
    <div style="margin-bottom: 20px; line-height: 1.35;">
      <div>বরাবর</div>
      <div>উপজেলা হিসাবরক্ষণ কর্মকর্তা</div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>

    <div style="margin-bottom: 20px;">মাধ্যম: যথাযথ কর্তৃপক্ষ।</div>

    <div style="margin-bottom: 20px;">
      বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${claim.gpfAccountNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদান প্রসঙ্গে।
    </div>

    <div style="margin-bottom: 14px;">জনাব,</div>

    <!-- বডি জাস্টিফাইড -->
    <div class="text-justify" style="margin-bottom: 22px;">
      সবিনয় নিবেদন এই যে, <span class="val">${claim.schoolName}</span>, <span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span> এর <span class="val">${claim.deceasedDesignation}</span> জনাব <span class="val">${claim.deceasedEmployeeName}</span> আমার <span class="val">${claim.relationship}</span> ছিলেন। তিনি বিগত <span class="val">${claim.deathDate}</span> তারিখ মৃত্যুবরণ করেন। এমতাবস্থায় তাঁর সমগ্র চাকুরীকলে সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${claim.gpfAccountNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদানের জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
    </div>

    <!-- বডি জাস্টিফাইড -->
    <div class="text-justify" style="margin-bottom: 35px;">
      অতএব, মহোদয় নিকট সবিনয় নিবেদন এই যে, আমার <span class="val">${claim.relationship}</span>র সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${claim.gpfAccountNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদানে আপনার সদয় মর্জি হয়।
    </div>

    <!-- নিবেদন অংশ: আবেদনকারীর নামের উপর স্বাক্ষরের জন্য পর্যাপ্ত ফাঁকা জায়গা (65px) -->
    <div style="margin-top: 15px; line-height: 1.35;">
      <div>বিনীত</div>
      <div>নিবেদক</div>
      <div>আপনার বিশ্বস্ত</div>
      <!-- স্বাক্ষরের জন্য পর্যাপ্ত ফাঁকা জায়গা -->
      <div style="margin-top: 65px;"><span class="val">${claim.applicantName}</span></div>
      <div>(<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span></div>
      <div><span class="val">${claim.deceasedDesignation}</span></div>
      <div><span class="val">${claim.schoolName}</span></div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>)।</div>
    </div>
  </div>

  <!-- ================= PAGE 2: আবেদনপত্র (জেলা প্রাথমিক শিক্ষা অফিসার বরাবরে) ================= -->
  <div class="page text-left" style="font-size: 15px; line-height: 2.1;">
    <div style="margin-bottom: 20px;">তারিখ: <span class="val">${claim.applicationDate}</span></div>

    <!-- বরাবর অংশ (লাইন স্পেস কম) -->
    <div style="margin-bottom: 20px; line-height: 1.35;">
      <div>বরাবর</div>
      <div>জেলা প্রাথমিক শিক্ষা অফিসার</div>
      <div><span class="val">${claim.districtName}</span>।</div>
    </div>

    <div style="margin-bottom: 20px;">মাধ্যম: যথাযথ কর্তৃপক্ষ।</div>

    <div style="margin-bottom: 20px;">
      বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${claim.gpfAccountNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলন প্রসঙ্গে।
    </div>

    <div style="margin-bottom: 14px;">জনাব,</div>

    <!-- বডি জাস্টিফাইড -->
    <div class="text-justify" style="margin-bottom: 22px;">
      সবিনয় নিবেদন এই যে, <span class="val">${claim.schoolName}</span>, <span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span> এর <span class="val">${claim.deceasedDesignation}</span> জনাব <span class="val">${claim.deceasedEmployeeName}</span> আমার <span class="val">${claim.relationship}</span> ছিলেন। তিনি বিগত <span class="val">${claim.deathDate}</span> তারিখ মৃত্যুবরণ করেন। এমতাবস্থায় তাঁর সমগ্র চাকুরীকলে সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${claim.gpfAccountNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের অনুমতির জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
    </div>

    <!-- বডি জাস্টিফাইড -->
    <div class="text-justify" style="margin-bottom: 35px;">
      অতএব, মহোদয় নিকট সবিনয় নিবেদন এই যে, আমার সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${claim.gpfAccountNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের অনুমতি প্রদানে আপনার সদয় মর্জি হয়।
    </div>

    <!-- নিবেদন অংশ: আবেদনকারীর নামের উপর স্বাক্ষরের জন্য পর্যাপ্ত ফাঁকা জায়গা (65px) -->
    <div style="margin-top: 15px; line-height: 1.35;">
      <div>বিনীত</div>
      <div>নিবেদক</div>
      <div>আপনার বিশ্বস্ত</div>
      <!-- স্বাক্ষরের জন্য পর্যাপ্ত ফাঁকা জায়গা -->
      <div style="margin-top: 65px;"><span class="val">${claim.applicantName}</span></div>
      <div>(<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span></div>
      <div><span class="val">${claim.deceasedDesignation}</span></div>
      <div><span class="val">${claim.schoolName}</span></div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>)।</div>
    </div>
  </div>

  <!-- ================= PAGE 3: টি, আর ফরম নং ৩৭ ================= -->
  <div class="page" style="font-size: 13px; line-height: 1.5;">
    <div style="text-align: left; font-size: 12px; margin-bottom: 14px; line-height: 1.4;">
      <div>টি, আর ফরম নং ৩৭</div>
      <div>[এস, আর ৩২৪ (১) দ্রষ্টব্য]</div>
    </div>

    <div style="text-align: center; font-size: 15px; margin-bottom: 18px;">
      কর্মচারীদের ভবিষ্যৎ তহবিল হইতে উত্তোলন/অগ্রিম গ্রহণের বিল
    </div>

    <!-- শ্রেণী বিন্যাস কোড বক্স গ্রুপসমূহ -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; font-size: 12.5px;">
      <div>ভবিষ্যৎ তহবিলের শ্রেণী বিন্যাস কোড</div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <div class="code-box-group">
          <span>৭</span>
        </div>
        <div class="code-box-group">
          <span>২</span><span>৪</span><span>৩</span><span>২</span>
        </div>
        <div class="code-box-group">
          <span>০</span><span>০</span><span>০</span><span>০</span>
        </div>
        <div class="code-box-group">
          <span>৯</span><span>১</span><span>০</span><span>১</span>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 12px;">
      <div>টোকেন নং.................................... তারিখ....................................</div>
      <div>ভাউচার নং .................................... তারিখ ....................................</div>
    </div>

    <table class="bordered-table">
      <thead>
        <tr style="text-align: center;">
          <th style="width: 45px;">ক্রমি<br>ক নং</th>
          <th>চাঁদা প্রদানকারীর নাম, বেতন মঞ্জুরী পত্রের নং ও তারিখ।</th>
          <th style="width: 115px;">ভবিষ্যৎ তহবিলের হিসাব নং</th>
          <th style="width: 110px;">অগ্রিম/উত্তোলন</th>
          <th style="width: 75px;">প্রাপ্তির রশীদ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; vertical-align: top;">১</td>
          <td style="text-align: justify; vertical-align: top; line-height: 1.6;">
            জনাব <span class="val">${claim.applicantName}</span> (<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span>, <span class="val">${claim.deceasedDesignation}</span>, <span class="val">${claim.schoolName}</span>) ${claim.upazilaName}, ${claim.districtName} এর সাধারণ ভবিষ্যৎ তহবিল-এ জমাকৃত টাকা অফেরতযোগ্য অগ্রিম উত্তোলন এর বিল।
            <div style="margin-top: 6px;">
              মঞ্জুরী নং- <span class="val">${claim.sanctionMemoNo || '৪৭০/১(০৪)'}</span> তারিখ: <span class="val">${claim.sanctionDate || '24/09/2026'}</span>
            </div>
          </td>
          <td style="text-align: center; vertical-align: top;"><span class="val">${claim.gpfAccountNo}</span></td>
          <td style="text-align: center; vertical-align: top;"><span class="val">${formattedAmount}/-</span></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-bottom: 14px;">
      প্রয়োজনীয় প্রদেয় টাকা = <span class="val">${formattedAmount}/-</span> (কথায়: <span class="val">${amountInWords}</span>) টাকা বুঝিয়া পাইলাম।
    </div>

    <div style="font-size: 12px; line-height: 1.6; text-align: justify; margin-bottom: 16px;">
      <div style="text-decoration: underline; margin-bottom: 4px;">প্রত্যায়নসমূহ</div>
      <p style="margin-bottom: 6px;">
        ১। প্রত্যায়ন করা যাইতেছে যে এই বিলে গৃহীত টাকা প্রকৃত প্রাপকদের মধ্যে বিলি করা হইয়াছে এবং প্রত্যেক ২০০ টাকার উপর প্রদানের ক্ষেত্রে রেভিনিউ স্ট্যাম্প লাগাইয়া সেগুলি যথাযথভাবে বাতিলপূর্বক আমার অফিসে রক্ষিত প্রাপ্তি বহিতে প্রাপ্তির রশিদ গ্রহণ করা হইয়াছে।
      </p>
      <p>
        ২। আরও প্রত্যায়ন করা যাইতেছে যে চাঁদা প্রদানকারীর হিসাবে স্থিতি তাহার অগ্রিম/উত্তোলিত অর্থ অপেক্ষা বেশী। (প্রযোজ্য ক্ষেত্রে) বীমা পলিসি নং *......................... রাষ্ট্রপতির অনুকূলে ন্যস্ত করা হইয়াছে এবং হিসাব রক্ষণ অফিসে দাখিল করিয়াছে अथवा (গৃহীতব্য) পলিসি হিসাব রক্ষণ অফিসে প্রেরণ করা হইয়াছে ও উক্ত অফিস কর্তৃক পত্র নং ..................... মারফত গৃহীত হইয়াছে *যদি একের অধিক পলিসি থাকে তবে তাহার বিবরণ এখানে প্রদান করা যাইতে পারে।
      </p>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
      <div style="line-height: 1.8;">
        <div>স্থান....................................</div>
        <div>তারিখ ....................................</div>
        <div style="margin-top: 14px;">সীল</div>
      </div>
      <div style="line-height: 1.8;">
        <div>আয়ন কর্মকর্তার স্বাক্ষর ....................................</div>
        <div style="margin-top: 6px;">নাম ....................................................................</div>
        <div style="margin-top: 6px;">পদবী ....................................................................</div>
      </div>
    </div>

    <hr style="border: 0; border-top: 1px solid #000000; margin: 12px 0;">

    <div style="text-align: center; font-size: 13px; margin-bottom: 8px;">হিসাব রক্ষণ অফিসে ব্যবহারের জন্য</div>

    <div style="font-size: 12px; margin-bottom: 14px;">
      টাকা .................................... (কথায়) .................................................................... প্রদানের জন্য পাস করা হইল।
    </div>

    <div style="display: flex; justify-content: space-between; text-align: left; font-size: 12px; line-height: 1.8; margin-bottom: 12px;">
      <div>
        <div>অডিটর</div>
        <div style="margin-top: 6px;">নাম ....................................</div>
        <div style="margin-top: 6px;">তারিখ ....................................</div>
      </div>
      <div>
        <div>সুপার</div>
        <div style="margin-top: 6px;">নাম ....................................</div>
        <div style="margin-top: 6px;">তারিখ ....................................</div>
      </div>
      <div>
        <div>হিসাব রক্ষণ কর্মকর্তা</div>
        <div style="margin-top: 6px;">নাম ....................................</div>
        <div style="margin-top: 6px;">তারিখ ....................................</div>
      </div>
    </div>

    <div style="font-size: 11px; margin-top: 4px;">
      বাঃসঃমুঃ-৯৭/৯৮-১৮০৫১ এফ(কম-১) ১০ লক্ষ কপি, (সি-৫৯) ১৯
    </div>
  </div>

  <!-- ================= PAGE 4: বেঙ্গল অডিট ম্যানুয়েল ৬৬৩ (উপরের স্পেস বৃদ্ধি ও নিচের অংশ দুটি জাস্টিফাইড) ================= -->
  <div class="page" style="font-size: 13.5px; line-height: 1.85;">
    <div style="text-align: center; font-size: 14px; margin-bottom: 18px; line-height: 1.5;">
      <div>অডিট অফিসে প্রোভিডেন্ট ফান্ড চূড়ান্ত অর্থ প্রদানের কেস নিষ্পত্তিকরণের জন্য</div>
      <div style="text-decoration: underline;">বেঙ্গল অডিট ম্যানুয়েলের অনুচ্ছেদ ৬৬৩ অনুযায়ী প্রয়োজনীয় বিবরণ।</div>
    </div>

    <div style="text-align: justify;">
      <div style="margin-bottom: 8px;">১। চাঁদা দাতার নাম: জনাব <span class="val">${claim.deceasedEmployeeName}</span></div>

      <div style="margin-bottom: 8px;">
        ২। অবসর গ্রহণ/পদত্যাগ/কর্মচ্যুতি/কর্মখারিজ/অবসর গ্রহণের পূর্বে প্রস্তুতিমূলক ছুটি/চাকুরি হইতে বিতাড়িত এর প্রকৃত তারিখ-<span class="val">${claim.deathDate}</span>
        <div style="padding-left: 18px; font-size: 12px; line-height: 1.5; margin-top: 3px;">
          <div>(ক) কর্ম খারিজের ক্ষেত্রে উহার কারণ বলিতে হইবে।</div>
          <div>(খ) পদচ্যুতির ক্ষেত্রে কর্মচারী আপীল করিয়াছে কি বা করিতে ইচ্ছা করিয়াছে কি ?</div>
          <div>(গ) পদত্যাগের ক্ষেত্রে বলিতে হইবে যে তাহার পদত্যাগপত্র গ্রহণ করা হইয়াছে কি ?</div>
        </div>
      </div>

      <div style="margin-bottom: 8px;">৩। নির্ভুল জি. পি. ফান্ড হিসাব নং- সাধারণ ভবিষ্যৎ তহবিল হিসাব নং- <span class="val">${claim.gpfAccountNo}</span></div>

      <div style="margin-bottom: 8px;">৪। মঞ্জুরকারী কর্তৃপক্ষের নিকট হইতে একটি সনদপত্র এই মর্মে যে পূর্ববর্তী ১২ (কনটিনজেন্সি ঘটনার ১২) সময়ে তাহাকে জি. পি. ফান্ড হইতে কোন অগ্রিম দেওয়া হইয়াছে কিনা, যদি দেওয়া হইয়া থাকে তা হইলে অগ্রিমের পূর্ণ বিবরণ ...................................প্রযোজ্য নয়.....................................................</div>

      <div style="margin-bottom: 8px;">৫। জি. পি. ফান্ড হিসাব হইতে অর্থ প্রদানকৃত জীবন বীমা পলিসির বিবরণ ১২ মাস (বার মাস) সময়ে প্রিমিয়ামের জন্য উত্তোলনের বিবরণ ................................ প্রযোজ্য নয়.....................................................</div>

      <div style="margin-bottom: 8px;">৬। সর্ব শেষ ফান্ড হইতে কর্তনকৃত চাঁদার পরিমাণ টাকা ..........<span class="val">${toBengaliNumber(claim.lastDeductionAmount || '4900')}/-</span>....................এবং ভাউচার নং- .....<span class="val">${claim.lastVoucherNo || '০৮'}</span>...... টোকেন নং ....................... তাং .................... অগ্রীম উত্তোলন জনিত টাকা বেতন হইতে কর্তনকৃত ফেরত টাকা ।</div>

      <div style="margin-bottom: 8px;">৭। যে ট্রেজারীতে অর্থ প্রদান ইচ্ছা করা হয় তাহার নাম: <span class="val">${claim.treasuryOffice || `উপজেলা হিসাবরক্ষণ অফিস, ${claim.upazilaName}, ${claim.districtName}`}</span>।</div>

      <div style="margin-bottom: 8px;">৮। এই মর্মে একটি সনদপত্র সরকারী কর্মচারী স্থানীয় যাহা বিভাগের প্রধান কর্তৃক প্রেরণ করিতে হইবে।</div>

      <div style="margin-bottom: 8px;">৯। ন্যাশনাল সিকিউরিটি ইন্টেলিজেন্স এর নিকট হইতে অস্থানীয় সরকারী সম্পর্কে একটি সনদপত্রের প্রয়োজন যে সেবা পেশায় থাকাকালীন অবস্থায় তাহার কার্যকলাপ কিরূপ ছিল এবং সে ভবিষ্যতে বাংলাদেশে থাকিতে ইচ্ছা করে কিনা অর্থ মন্ত্রণালয়ের স্মারক নং মে এফ/১৭ ২৩-১-৭৪ ....প্রযোজ্য নয় ।</div>

      <div style="margin-bottom: 8px;">১০। জি. পি. ফান্ডের টাকা দাবী করিয়া চাঁদা দাতা/মনোনীত ব্যক্তির নিকট হইতে প্রাপ্ত মূল দরখাস্তটি অফিস প্রধান কর্তৃক অগ্রবর্তী (ফরওয়ার্ড) করিতে হইবে ..ফরওয়ার্ড করা হইল।</div>

      <div style="margin-bottom: 8px;">১১। মনোনীত ব্যক্তি নাই এমন চাঁদা দাতার ক্ষেত্রে তাহার পরিবারের সদস্যদের বয়স এবং মৃত্যু কালে চাঁদা দাতার সংযোগের সম্পর্কের তালিকা মাইনর পুত্র ও বিবাহিত কন্যা ছাড়া প্রেরণ করিতে হইবে ...........................................</div>
    </div>

    <!-- এটির উপরে আরও একটু ফাঁকা স্পেইস (margin-top: 60px) এবং লেখা দুটি আলাদাভাবে জাস্টিফাই -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 60px; font-size: 12px; line-height: 1.6;">
      <div style="width: 44%; text-align: justify; text-justify: inter-word;">
        নন-গেজেটেড চাঁদা দাতার ক্ষেত্রে অফিস প্রধানের স্বাক্ষর<br>
        অথবা গেজেটেড অফিসারের ক্ষেত্রে চাঁদা দাতা নিজের স্বাক্ষর
      </div>
      <div style="width: 48%; text-align: justify; text-justify: inter-word;">
        গেজেটেড চাঁদা দাতার ক্ষেত্রে একটি সনদপত্র<br>
        উপরোক্ত ৩ ও ৭ অনুযায়ী যে কর্তৃপক্ষ চাঁদা দাতাকে<br>
        অগ্রিম মঞ্জুরী করিতে যোগ্য তাহার দ্বারা প্রেরণ করিতে হইবে।
      </div>
    </div>
  </div>

  <!-- ================= PAGE 5: সংযোজনী-৬ ================= -->
  <div class="page" style="font-size: 14px; line-height: 1.7;">
    <div style="text-align: right; font-size: 14px; margin-bottom: 10px;">সংযোজনী-৬</div>

    <div style="text-align: center; font-size: 16px; margin-bottom: 22px; text-decoration: underline;">
      নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ
    </div>

    <div style="margin-bottom: 24px;">
      <p style="text-align: justify; margin-bottom: 12px;">
        ১। নিম্নে সাধারণ ভবিষ্যৎ তহবিলে জমাকৃত সমুদয় অর্থ উত্তোলনের জন্য আবেদনকারী জনাব/বেগম <span class="val">${claim.applicantName}</span> (<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span>, <span class="val">${claim.deceasedDesignation}</span>, <span class="val">${claim.schoolName}</span>) ${claim.upazilaName}, ${claim.districtName} এর তিনটি নমুনা স্বাক্ষর সত্যায়িত করা হইল।
      </p>

      <table class="borderless-table" style="font-size: 13px;">
        <thead>
          <tr style="text-align: left;">
            <th style="width: 90px;">ক্রমিক নং</th>
            <th style="width: 250px;">পূর্ণ স্বাক্ষর</th>
            <th>সংক্ষিপ্ত স্বাক্ষর</th>
          </tr>
        </thead>
        <tbody>
          <tr style="height: 38px;"><td>(১)</td><td></td><td></td></tr>
          <tr style="height: 38px;"><td>(২)</td><td></td><td></td></tr>
          <tr style="height: 38px;"><td>(৩)</td><td></td><td></td></tr>
        </tbody>
      </table>
    </div>

    <div style="margin-bottom: 24px;">
      <p style="text-align: justify; margin-bottom: 12px;">
        ২। নিম্নে সাধারণ ভবিষ্যৎ তহবিলে জমাকৃত সমুদয় অর্থ উত্তোলনের জন্য আবেদনকারী জনাব/বেগম <span class="val">${claim.applicantName}</span> (<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span>, <span class="val">${claim.deceasedDesignation}</span>, <span class="val">${claim.schoolName}</span>) ${claim.upazilaName}, ${claim.districtName} এর হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত করা হইল।
      </p>

      <table class="borderless-table" style="font-size: 13px;">
        <thead>
          <tr style="text-align: left;">
            <th style="width: 90px;">ক্রমিক নং</th>
            <th style="width: 250px;">আঙ্গুলের নাম</th>
            <th>ছাপ</th>
          </tr>
        </thead>
        <tbody>
          <tr style="height: 52px; vertical-align: middle;"><td>(১)</td><td>বাম/ডান কনিষ্ঠ</td><td></td></tr>
          <tr style="height: 52px; vertical-align: middle;"><td>(২)</td><td>বাম/ডান অনামিকা</td><td></td></tr>
          <tr style="height: 52px; vertical-align: middle;"><td>(৩)</td><td>বাম/ডান মধ্যমা</td><td></td></tr>
          <tr style="height: 52px; vertical-align: middle;"><td>(৪)</td><td>বাম/ডান তর্জনী</td><td></td></tr>
          <tr style="height: 52px; vertical-align: middle;"><td>(৫)</td><td>বাম/ডান বৃদ্ধাঙ্গুলি</td><td></td></tr>
        </tbody>
      </table>
    </div>

    <div style="font-size: 12.5px; margin-bottom: 28px;">
      ৩। উপর্যুক্ত নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ আমার সম্মুখে প্রদান করা হইয়াছে।
    </div>

    <div style="width: 320px; margin-left: auto; text-align: center; font-size: 12px; line-height: 1.5;">
      <div>সত্যায়নকারী প্রথম শ্রেণির গেজেটেড কর্মকর্তার তারিখসহ স্বাক্ষর</div>
      <div>সীলমোহর (নামযুক্ত)</div>
    </div>
  </div>

  <!-- ================= PAGE 6: ফরোয়ার্ডিং পত্র (ইউএও বরাবরে - ডিডিও স্বাক্ষরের স্পেস > ১ ইঞ্চি) ================= -->
  <div class="page" style="font-size: 14px; line-height: 1.8;">
    <div style="text-align: center; margin-bottom: 22px;">
      <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
      <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 18px;">
      <div>স্মারক নং- <span class="val">${claim.forwardingMemoNo || `উশিঅ/বিবা/সিল/${claim.year}/`}</span></div>
      <div>তারিখ: <span class="val">${claim.forwardingDate || claim.applicationDate}</span></div>
    </div>

    <div style="margin-bottom: 16px;">
      বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের জন্য ক্ষমতাপত্র প্রদান প্রসঙ্গে।
    </div>

    <p style="text-align: justify; text-indent: 32px; margin-bottom: 18px; line-height: 2;">
      উপর্যুক্ত বিষয়ের আলোকে জানানো যাচ্ছে যে, নিম্নোক্ত শিক্ষক <span class="val">${claim.deathDate}</span> তারিখ চাকুরীরত অবস্থায় মৃত্যুবরণ করেন। শিক্ষকের <span class="val">${claim.relationship}</span> তাঁর সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র চেয়ে আবেদন করেছেন। এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য অনুরোধ করা হলো।
    </p>

    <!-- ছক -->
    <table class="bordered-table">
      <thead>
        <tr style="text-align: center; font-size: 12.5px;">
          <th style="width: 55px;">ক্র:নং</th>
          <th>আবেদনকারীর বিবরণ</th>
          <th style="width: 170px;">চূড়ান্ত উত্তোলনের কারণ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; vertical-align: top;">০১</td>
          <td style="padding: 8px; line-height: 1.7;">
            জনাব <span class="val">${claim.applicantName}</span>, (<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span>, <span class="val">${claim.deceasedDesignation}</span>, <span class="val">${claim.schoolName}</span>) <span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।
          </td>
          <td style="text-align: center; vertical-align: middle;">মৃত্যুজনিত কারণে</td>
        </tr>
      </tbody>
    </table>

    <div style="font-size: 13px; margin-bottom: 16px;">
      <div style="text-decoration: underline; margin-bottom: 6px;">সংযুক্তি:</div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>১। আবেদনপত্র-----------------------------------------------------</span>
        <span class="val">${claim.attachmentsCount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>২। অডিট বেঙ্গল ম্যানুয়াল ফরম (পূরণকৃত) ---------------------------</span>
        <span class="val">${claim.attachmentsCount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>৩। সাধারণ ভবিষ্যৎ তহবিল হিসাব বিবরণী এর অনলাইন কপি -----------</span>
        <span class="val">${claim.attachmentsCount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>৪। শিক্ষকের নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত--------</span>
        <span class="val">${claim.attachmentsCount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>৫। অবসর উত্তর ছুটি পিআরএল-এর অনুমতিপত্র ----------------------</span>
        <span class="val">${claim.attachmentsCount}</span>
      </div>
    </div>

    <!-- ডিডিও অংশে স্বাক্ষরের জন্য পর্যাপ্ত স্পেস (এক ইঞ্চির উপরে: margin-top: 110px) ও সেন্টার -->
    <div style="width: 280px; margin-left: auto; text-align: center; font-size: 13px; line-height: 1.5; margin-top: 110px; margin-bottom: 18px;">
      <div>(<span class="val">${claim.ddoName}</span>)</div>
      <div><span class="val">${claim.ddoDesignation}</span></div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>

    <!-- ডিডিও অংশ যে রো-তে শেষ হয়েছে তার পরবর্তী রোতে প্রাপক শব্দ বাদ দিয়ে প্রাপক অংশ -->
    <div style="text-align: left; font-size: 13px; line-height: 1.4;">
      <div>উপজেলা হিসাব রক্ষণ কর্মকর্তা,</div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>
  </div>

  <!-- ================= PAGE 7: ফরোয়ার্ডিং পত্র (ডিপিইও বরাবরে - ডিডিও স্বাক্ষরের স্পেস > ১ ইঞ্চি) ================= -->
  <div class="page" style="font-size: 14px; line-height: 1.8;">
    <div style="text-align: center; margin-bottom: 22px;">
      <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
      <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 18px;">
      <div>স্মারক নং- <span class="val">${claim.forwardingMemoNo || `উশিঅ/বিবা/সিল/${claim.year}/`}</span></div>
      <div>তারিখ: <span class="val">${claim.forwardingDate || claim.applicationDate}</span></div>
    </div>

    <div style="margin-bottom: 16px;">
      বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলন প্রসঙ্গে।
    </div>

    <p style="text-align: justify; text-indent: 32px; margin-bottom: 18px; line-height: 2;">
      উপর্যুক্ত বিষয়ের আলোকে জানানো যাচ্ছে যে, নিম্নোক্ত শিক্ষক <span class="val">${claim.deathDate}</span> তারিখ চাকুরীরত অবস্থায় মৃত্যুবরণ করেন। শিক্ষকের <span class="val">${claim.relationship}</span> তাঁর সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের জন্য অনুমতি চেয়ে আবেদন করেছেন। এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য অনুরোধ করা হলো।
    </p>

    <!-- ছক -->
    <table class="bordered-table">
      <thead>
        <tr style="text-align: center; font-size: 12.5px;">
          <th style="width: 55px;">ক্র:নং</th>
          <th>আবেদনকারীর বিবরণ</th>
          <th style="width: 170px;">চূড়ান্ত উত্তোলনের কারণ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; vertical-align: top;">০১</td>
          <td style="padding: 8px; line-height: 1.7;">
            জনাব <span class="val">${claim.applicantName}</span>, (<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span>, <span class="val">${claim.deceasedDesignation}</span>, <span class="val">${claim.schoolName}</span>) <span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।
          </td>
          <td style="text-align: center; vertical-align: middle;">মৃত্যুজনিত কারণে</td>
        </tr>
      </tbody>
    </table>

    <div style="font-size: 13px; margin-bottom: 16px;">
      <div style="text-decoration: underline; margin-bottom: 6px;">সংযুক্তি:</div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>১। আবেদনপত্র-----------------------------------------------------</span>
        <span class="val">${claim.attachmentsCount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>২। অডিট বেঙ্গল ম্যানুয়াল ফরম (পূরণকৃত) ---------------------------</span>
        <span class="val">${claim.attachmentsCount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>৩। স্থানীয় হিসাবরক্ষণ অফিস কর্তৃক প্রদত্ত ক্ষমতাপত্র --------------------</span>
        <span class="val">${claim.attachmentsCount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>৪। শিক্ষকের নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত--------</span>
        <span class="val">${claim.attachmentsCount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>৫। অবসর উত্তর ছুটি পিআরএল-এর অনুমতিপত্র ----------------------</span>
        <span class="val">${claim.attachmentsCount}</span>
      </div>
    </div>

    <!-- ডিডিও অংশে স্বাক্ষরের জন্য পর্যাপ্ত স্পেস (এক ইঞ্চির উপরে: margin-top: 110px) ও সেন্টার -->
    <div style="width: 280px; margin-left: auto; text-align: center; font-size: 13px; line-height: 1.5; margin-top: 110px; margin-bottom: 18px;">
      <div>(<span class="val">${claim.ddoName}</span>)</div>
      <div><span class="val">${claim.ddoDesignation}</span></div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>

    <!-- ডিডিও অংশ যে রো-তে শেষ হয়েছে তার পরবর্তী রোতে প্রাপক শব্দ বাদ দিয়ে প্রাপক অংশ -->
    <div style="text-align: left; font-size: 13px; line-height: 1.4;">
      <div>জেলা প্রাথমিক শিক্ষা অফিসার,</div>
      <div><span class="val">${claim.districtName}</span>।</div>
    </div>
  </div>

</body>
</html>`;
}

/**
 * Triggers direct browser print for the official 7-page document
 * using an isolated print iframe that bypasses parent layout CSS restrictions.
 */
export function printClaimDocument(claim: GpfDeathClaim) {
  const htmlContent = generateOfficial7PagesHtml(claim);

  // Create an isolated hidden iframe
  const printFrame = document.createElement('iframe');
  printFrame.name = 'gpf_print_frame';
  printFrame.style.position = 'fixed';
  printFrame.style.top = '-10000px';
  printFrame.style.left = '-10000px';
  printFrame.style.width = '1px';
  printFrame.style.height = '1px';
  printFrame.style.border = 'none';

  document.body.appendChild(printFrame);

  const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
  if (frameDoc) {
    frameDoc.open();
    frameDoc.write(htmlContent);
    frameDoc.close();

    // Allow resources to render, then invoke native print
    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print blocked, falling back to window.print():', err);
        window.print();
      }

      // Cleanup frame after print dialog interaction
      setTimeout(() => {
        try {
          document.body.removeChild(printFrame);
        } catch {
          // ignore cleanup errors
        }
      }, 60000);
    }, 250);
  } else {
    window.print();
  }
}

/**
 * Downloads the complete standalone 7-page official document as an HTML file.
 * The downloaded file can be opened offline in any browser and printed cleanly (Ctrl+P).
 */
export function downloadClaimDocument(claim: GpfDeathClaim) {
  const htmlContent = generateOfficial7PagesHtml(claim);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `জিপিএফ_চূড়ান্ত_উত্তোলন_${claim.deceasedEmployeeName}_৭_পেজ.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
