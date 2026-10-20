import { GpfDeathClaim } from '../types/gpf';
import { date, money, toBn } from '../../src/lib/format';


/**
 * Generates the complete, standalone HTML document for the official death claim pages.
 * Fully calibrated according to Bangladesh government office norms and cross-browser print specs:
 * - SolaimanLipi, Nikosh, Kalpurush, and Hind Siliguri fonts
 * - Perfect 7 pages in both Google Chrome and Mozilla Firefox (no flex container page-splitting)
 * - Explicit 1.5px table borders so rows and columns stay intact in Firefox on pages 3, 6, and 7
 * - Complete conversion of all dates and numbers to Bengali digits
 * - Zero bold weights (font-weight: 400 throughout) for official letters
 * - One standard type scale only: 11.5pt letter body, 13pt titles, 10.5pt form/table detail, 9.5pt printing note
 */
export function generateOfficial7PagesHtml(claim: GpfDeathClaim): string {
  const formattedAmount = money(claim.depositedAmount);
  const amountInWords = claim.depositedAmountInWords;

  const appDate = date(claim.applicationDate);
  const deathDate = date(claim.deathDate);
  const gpfNo = toBn(claim.gpfAccountNo);
  const yearBn = toBn(claim.year || '২০২৬');
  const attachments = toBn(claim.attachmentsCount || '০২(দুই) খানা');
  const sanctionMemo = claim.sanctionMemoNo ? toBn(claim.sanctionMemoNo) : '....................';
  const sanctionDate = claim.sanctionDate ? date(claim.sanctionDate) : '....................';
  const forwardingMemo = claim.forwardingMemoNo
    ? toBn(claim.forwardingMemoNo)
    : `উশিঅ/বিবা/সিল/${yearBn}/`;
  const forwardingDate = date(claim.forwardingDate || claim.applicationDate);
  const lastDed = claim.lastDeductionAmount ? toBn(claim.lastDeductionAmount) : '০';
  const lastVoucher = claim.lastVoucherNo ? toBn(claim.lastVoucherNo) : '....................';
  const treasury = claim.treasuryOffice || `উপজেলা হিসাবরক্ষণ অফিস, ${claim.upazilaName}, ${claim.districtName}`;
  // Pages 6 and 7 sign off with the dashboard DDO name and designation. A record
  // saved before those rows existed gets the same dotted fill-in line the bill
  // uses instead of an empty bracket.
  const dottedLine = '.'.repeat(20);
  const ddoNameText = (claim.ddoName || '').trim() || dottedLine;
  const ddoDesignationText = (claim.ddoDesignation || '').trim() || dottedLine;

  // The page-2 addressee block under the fixed heading line is the dashboard field:
  // its first line names the office and every line below it is the address. With the
  // field left empty the earlier fixed addressee and district line are printed.
  const recipientLines = (claim.recipient || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const addresseeLines = recipientLines.length
    ? recipientLines
    : ['জেলা প্রাথমিক শিক্ষা অফিসার', `${claim.districtName}।`];

  return `<!doctype html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>জিপিএফ চূড়ান্ত উত্তোলন (ডেথ ক্লেইম) - ${claim.deceasedEmployeeName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 24mm 22mm 15mm 22mm;
    }
    html, body {
      height: auto;
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #000000;
    }
    * {
      box-sizing: border-box;
      -moz-box-sizing: border-box;
      font-weight: 400 !important;
    }
    body {
      font-family: 'SolaimanLipi', 'Nikosh', 'NikoshBAN', 'Kalpurush', 'Hind Siliguri', sans-serif;
      font-weight: 400 !important;
      color: #000000;
      background: #ffffff;
      line-height: 1.55;
      font-size: 11.5pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      display: block;
      position: relative;
      box-sizing: border-box;
      width: 100%;
      height: auto;
      min-height: 0;
      padding: 0;
      margin: 0;
      background: #ffffff;
      font-weight: 400 !important;
      font-size: 11.5pt;
    }
    .page:last-child {
      page-break-after: auto;
      break-after: auto;
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
      margin-bottom: 10px;
    }
    th, td {
      padding: 5px 7px;
      font-weight: 400 !important;
      font-size: 10.5pt;
    }
    /* Explicit 1.5px borders prevent Firefox print engine from hiding table grid */
    .bordered-table {
      width: 100% !important;
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      border: 1.5px solid #000000 !important;
      margin-bottom: 10px !important;
    }
    .bordered-table th, .bordered-table td {
      border: 1.5px solid #000000 !important;
      background-color: transparent !important;
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .borderless-table {
      width: 100% !important;
      border-collapse: collapse !important;
      border-spacing: 0 !important;
    }
    .borderless-table th, .borderless-table td {
      border: none !important;
    }
    /* TR Form 37 Code Boxes */
    .code-box-group {
      display: inline-flex;
      border: 1.5px solid #000000;
      margin: 0 2px;
      vertical-align: middle;
    }
    .code-box-group span {
      width: 20px;
      height: 20px;
      border-right: 1.5px solid #000000;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10.5pt;
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
        max-width: 210mm;
        margin: 0 auto 30px auto;
        background: #ffffff;
        padding: 24mm 22mm 15mm 22mm;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        border-radius: 4px;
      }
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: আবেদনপত্র (উপজেলা হিসাবরক্ষণ কর্মকর্তা বরাবরে) ================= -->
  <div class="page text-left" style="font-size: 11.5pt; line-height: 1.65;">
    <div style="margin-bottom: 16px;">তারিখ: <span class="val">${appDate}</span></div>

    <div style="margin-bottom: 16px; line-height: 1.35;">
      <div>বরাবর</div>
      <div>উপজেলা হিসাবরক্ষণ কর্মকর্তা</div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>

    <div style="margin-bottom: 16px;">মাধ্যম: যথাযথ কর্তৃপক্ষ।</div>

    <div style="margin-bottom: 16px;">
      বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${gpfNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদান প্রসঙ্গে।
    </div>

    <div style="margin-bottom: 12px;">জনাব,</div>

    <div class="text-justify" style="margin-bottom: 18px;">
      সবিনয় নিবেদন এই যে, <span class="val">${claim.schoolName}</span>, <span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span> এর <span class="val">${claim.deceasedDesignation}</span> জনাব <span class="val">${claim.deceasedEmployeeName}</span> আমার <span class="val">${claim.relationship}</span> ছিলেন। তিনি বিগত <span class="val">${deathDate}</span> তারিখ মৃত্যুবরণ করেন। এমতাবস্থায় তাঁর সমগ্র চাকুরীকলে সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${gpfNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদানের জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
    </div>

    <div class="text-justify" style="margin-bottom: 24px;">
      অতএব, মহোদয় নিকট সবিনয় নিবেদন এই যে, আমার <span class="val">${claim.relationship}</span>র সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${gpfNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদানে আপনার সদয় মর্জি হয়।
    </div>

    <div style="margin-top: 15px; line-height: 1.35;">
      <div>বিনীত</div>
      <div>নিবেদক</div>
      <div>আপনার বিশ্বস্ত</div>
      <div style="margin-top: 55px;"><span class="val">${claim.applicantName}</span></div>
      <div>(<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span></div>
      <div><span class="val">${claim.deceasedDesignation}</span></div>
      <div><span class="val">${claim.schoolName}</span></div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>)।</div>
    </div>
  </div>

  <!-- ================= PAGE 2: আবেদনপত্র (জেলা প্রাথমিক শিক্ষা অফিসার বরাবরে) ================= -->
  <div class="page text-left" style="font-size: 11.5pt; line-height: 1.65;">
    <div style="margin-bottom: 16px;">তারিখ: <span class="val">${appDate}</span></div>

    <div style="margin-bottom: 16px; line-height: 1.35;">
      <div>বরাবর</div>
      ${addresseeLines.map((line) => `<div><span class="val">${line}</span></div>`).join('')}
    </div>

    <div style="margin-bottom: 16px;">মাধ্যম: যথাযথ কর্তৃপক্ষ।</div>

    <div style="margin-bottom: 16px;">
      বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${gpfNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলন প্রসঙ্গে।
    </div>

    <div style="margin-bottom: 12px;">জনাব,</div>

    <div class="text-justify" style="margin-bottom: 18px;">
      সবিনয় নিবেদন এই যে, <span class="val">${claim.schoolName}</span>, <span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span> এর <span class="val">${claim.deceasedDesignation}</span> জনাব <span class="val">${claim.deceasedEmployeeName}</span> আমার <span class="val">${claim.relationship}</span> ছিলেন। তিনি বিগত <span class="val">${deathDate}</span> তারিখ মৃত্যুবরণ করেন। এমতাবস্থায় তাঁর সমগ্র চাকুরীকলে সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${gpfNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের অনুমতির জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
    </div>

    <div class="text-justify" style="margin-bottom: 24px;">
      অতএব, মহোদয় নিকট সবিনয় নিবেদন এই যে, আমার সাধারণ ভবিষ্যৎ তহবিল হিসাব নং <span class="val">${gpfNo}</span> এ জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের অনুমতি প্রদানে আপনার সদয় মর্জি হয়।
    </div>

    <div style="margin-top: 15px; line-height: 1.35;">
      <div>বিনীত</div>
      <div>নিবেদক</div>
      <div>আপনার বিশ্বস্ত</div>
      <div style="margin-top: 55px;"><span class="val">${claim.applicantName}</span></div>
      <div>(<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span></div>
      <div><span class="val">${claim.deceasedDesignation}</span></div>
      <div><span class="val">${claim.schoolName}</span></div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>)।</div>
    </div>
  </div>

  <!-- ================= PAGE 3: টি, আর ফরম নং ৩৭ ================= -->
  <div class="page" style="font-size: 11.5pt; line-height: 1.45;">
    <div style="text-align: left; margin-bottom: 8px; line-height: 1.3;">
      <div>টি, আর ফরম নং ৩৭</div>
      <div>[এস, আর ৩২৪ (১) দ্রষ্টব্য]</div>
    </div>

    <div style="text-align: center; font-size: 13pt; font-weight: 500; margin-bottom: 12px;">
      কর্মচারীদের ভবিষ্যৎ তহবিল হইতে উত্তোলন/অগ্রিম গ্রহণের বিল
    </div>

    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
      <div>ভবিষ্যৎ তহবিলের শ্রেণী বিন্যাস কোড</div>
      <div style="display: flex; align-items: center; gap: 8px;">
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

    <div style="margin-bottom: 10px;">টোকেন নং.................. তারিখ.................. ভাউচার নং .................. তারিখ ..................</div>

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
          <td style="text-align: justify; vertical-align: top; line-height: 1.5;">
            জনাব <span class="val">${claim.applicantName}</span> (<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span>, <span class="val">${claim.deceasedDesignation}</span>, <span class="val">${claim.schoolName}</span>) ${claim.upazilaName}, ${claim.districtName} এর সাধারণ ভবিষ্যৎ তহবিল-এ জমাকৃত টাকা চূড়ান্ত উত্তোলন এর বিল।
            <div style="margin-top: 4px;">
              মঞ্জুরী নং- <span class="val">${sanctionMemo}</span> তারিখ: <span class="val">${sanctionDate}</span>
            </div>
          </td>
          <td style="text-align: center; vertical-align: top;"><span class="val">${gpfNo}</span></td>
          <td style="text-align: center; vertical-align: top;"><span class="val">${formattedAmount}/-</span></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-bottom: 10px;">
      প্রয়োজনীয় প্রদেয় টাকা = <span class="val">${formattedAmount}/-</span> (কথায়: <span class="val">${amountInWords}</span>) টাকা বুঝিয়া পাইলাম।
    </div>

    <div style="font-size: 11.5pt; line-height: 1.45; text-align: justify; margin-bottom: 12px;">
      <div style="text-align: center; text-decoration: underline; margin-bottom: 3px;">প্রত্যায়নসমূহ</div>
      <p style="margin-bottom: 4px;">
        ১। প্রত্যায়ন করা যাইতেছে যে এই বিলে গৃহীত টাকা প্রকৃত প্রাপকদের মধ্যে বিলি করা হইয়াছে এবং প্রত্যেক ২০০ টাকার উপর প্রদানের ক্ষেত্রে রেভিনিউ স্ট্যাম্প লাগাইয়া সেগুলি যথাযথভাবে বাতিলপূর্বক আমার অফিসে রক্ষিত প্রাপ্তি বহিতে প্রাপ্তির রশিদ গ্রহণ করা হইয়াছে।
      </p>
      <p>
        ২। আরও প্রত্যায়ন করা যাইতেছে যে চাঁদা প্রদানকারীর হিসাবে স্থিতি তাহার অগ্রিম/উত্তোলিত অর্থ অপেক্ষা বেশী। (প্রযোজ্য ক্ষেত্রে) বীমা পলিসি নং *......................... রাষ্ট্রপতির অনুকূলে ন্যস্ত করা হইয়াছে এবং হিসাব রক্ষণ অফিসে দাখিল করিয়াছে অথবা (গৃহীতব্য) পলিসি হিসাব রক্ষণ অফিসে প্রেরণ করা হইয়াছে ও উক্ত অফিস কর্তৃক পত্র নং ..................... মারফত গৃহীত হইয়াছে *যদি একের অধিক পলিসি থাকে তবে তাহার বিবরণ এখানে প্রদান করা যাইতে পারে।
      </p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <div style="line-height: 1.6;">
        <div>স্থান....................................</div>
        <div>তারিখ ....................................</div>
        <div style="margin-top: 8px;">সীল</div>
      </div>
      <div style="line-height: 1.6;">
        <div>আয়ন কর্মকর্তার স্বাক্ষর ....................................</div>
        <div style="margin-top: 4px;">নাম ....................................................................</div>
        <div style="margin-top: 4px;">পদবী ....................................................................</div>
      </div>
    </div>

    <hr style="border: 0; border-top: 1px solid #000000; margin: 8px 0;">

    <div style="text-align: center; font-size: 13pt; margin-bottom: 6px;">হিসাব রক্ষণ অফিসে ব্যবহারের জন্য</div>

    <div style="margin-bottom: 10px;">
      টাকা .................................... (কথায়) .................................................................... প্রদানের জন্য পাস করা হইল।
    </div>

    <div style="display: flex; justify-content: space-between; text-align: left; font-size: 10.5pt; line-height: 1.6;">
      <div>
        <div>অডিটর</div>
        <div style="margin-top: 4px;">নাম ....................................</div>
        <div style="margin-top: 4px;">তারিখ ....................................</div>
      </div>
      <div>
        <div>সুপার</div>
        <div style="margin-top: 4px;">নাম ....................................</div>
        <div style="margin-top: 4px;">তারিখ ....................................</div>
      </div>
      <div>
        <div>হিসাব রক্ষণ কর্মকর্তা</div>
        <div style="margin-top: 4px;">নাম ....................................</div>
        <div style="margin-top: 4px;">তারিখ ....................................</div>
      </div>
    </div>

    <div style="font-size: 9.5pt; margin-top: 4px;">
      বাঃসঃমুঃ-৯৭/৯৮-১৮০৫১ এফ(কম-১) ১০ লক্ষ কপি, (সি-৫৯) ১৯
    </div>
  </div>

  <!-- ================= PAGE 4: বেঙ্গল অডিট ম্যানুয়েল ৬৬৩ ================= -->
  <div class="page" style="font-size: 11.5pt; line-height: 1.6;">
    <div style="text-align: center; font-size: 13pt; margin-bottom: 14px; line-height: 1.4;">
      <div>অডিট অফিসে প্রোভিডেন্ট ফান্ড চূড়ান্ত অর্থ প্রদানের কেস নিষ্পত্তিকরণের জন্য</div>
      <div style="text-decoration: underline;">বেঙ্গল অডিট ম্যানুয়েলের অনুচ্ছেদ ৬৬৩ অনুযায়ী প্রয়োজনীয় বিবরণ।</div>
    </div>

    <div style="text-align: justify;">
      <div style="margin-bottom: 6px;">১। চাঁদা দাতার নাম: জনাব <span class="val">${claim.deceasedEmployeeName}</span></div>

      <div style="margin-bottom: 6px;">
        ২। অবসর গ্রহণ/পদত্যাগ/কর্মচ্যুতি/কর্মখারিজ/অবসর গ্রহণের পূর্বে প্রস্তুতিমূলক ছুটি/চাকুরি হইতে বিতাড়িত এর প্রকৃত তারিখ-<span class="val">${deathDate}</span>
        <div style="padding-left: 18px; font-size: 10.5pt; line-height: 1.4; margin-top: 2px;">
          <div>(ক) কর্ম খারিজের ক্ষেত্রে উহার কারণ বলিতে হইবে।</div>
          <div>(খ) পদচ্যুতির ক্ষেত্রে কর্মচারী আপীল করিয়াছে কি বা করিতে ইচ্ছা করিয়াছে কি ?</div>
          <div>(গ) পদত্যাগের ক্ষেত্রে বলিতে হইবে যে তাহার পদত্যাগপত্র গ্রহণ করা হইয়াছে কি ?</div>
        </div>
      </div>

      <div style="margin-bottom: 6px;">৩। নির্ভুল জি. পি. ফান্ড হিসাব নং- সাধারণ ভবিষ্যৎ তহবিল হিসাব নং- <span class="val">${gpfNo}</span></div>

      <div style="margin-bottom: 6px;">৪। মঞ্জুরকারী কর্তৃপক্ষের নিকট হইতে একটি সনদপত্র এই মর্মে যে পূর্ববর্তী ১২ (কনটিনজেন্সি ঘটনার ১২) সময়ে তাহাকে জি. পি. ফান্ড হইতে কোন অগ্রিম দেওয়া হইয়াছে কিনা, যদি দেওয়া হইয়া থাকে তা হইলে অগ্রিমের পূর্ণ বিবরণ ...................................প্রযোজ্য নয়.....................................................</div>

      <div style="margin-bottom: 6px;">৫। জি. পি. ফান্ড হিসাব হইতে অর্থ প্রদানকৃত জীবন বীমা পলিসির বিবরণ ১২ মাস (বার মাস) সময়ে প্রিমিয়ামের জন্য উত্তোলনের বিবরণ ................................ প্রযোজ্য নয়.....................................................</div>

      <div style="margin-bottom: 6px;">৬। সর্ব শেষ ফান্ড হইতে কর্তনকৃত চাঁদার পরিমাণ টাকা ..........<span class="val">${lastDed}/-</span>....................এবং ভাউচার নং- .....<span class="val">${lastVoucher}</span>...... টোকেন নং ....................... তাং .................... অগ্রীম উত্তোলন জনিত টাকা বেতন হইতে কর্তনকৃত ফেরত টাকা ।</div>

      <div style="margin-bottom: 6px;">৭। যে ট্রেজারীতে অর্থ প্রদান ইচ্ছা করা হয় তাহার নাম: <span class="val">${treasury}</span>।</div>

      <div style="margin-bottom: 6px;">৮। এই মর্মে একটি সনদপত্র সরকারী কর্মচারী স্থানীয় যাহা বিভাগের প্রধান কর্তৃক প্রেরণ করিতে হইবে।</div>

      <div style="margin-bottom: 6px;">৯। ন্যাশনাল সিকিউরিটি ইন্টেলিজেন্স এর নিকট হইতে অস্থানীয় সরকারী সম্পর্কে একটি সনদপত্রের প্রয়োজন যে সেবা পেশায় থাকাকালীন অবস্থায় তাহার কার্যকলাপ কিরূপ ছিল এবং সে ভবিষ্যতে বাংলাদেশে থাকিতে ইচ্ছা করে কিনা অর্থ মন্ত্রণালয়ের স্মারক নং মে এফ/১৭ ২৩-১-৭৪ ....প্রযোজ্য নয় ।</div>

      <div style="margin-bottom: 6px;">১০। জি. পি. ফান্ডের টাকা দাবী করিয়া চাঁদা দাতা/মনোনীত ব্যক্তির নিকট হইতে প্রাপ্ত মূল দরখাস্তটি অফিস প্রধান কর্তৃক অগ্রবর্তী (ফরওয়ার্ড) করিতে হইবে ..ফরওয়ার্ড করা হইল।</div>

      <div style="margin-bottom: 6px;">১১। মনোনীত ব্যক্তি নাই এমন চাঁদা দাতার ক্ষেত্রে তাহার পরিবারের সদস্যদের বয়স এবং মৃত্যু কালে চাঁদা দাতার সংযোগের সম্পর্কের তালিকা মাইনর পুত্র ও বিবাহিত কন্যা ছাড়া প্রেরণ করিতে হইবে ...........................................</div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 78px; font-size: 10.5pt; line-height: 1.5;">
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
  <div class="page" style="font-size: 11.5pt; line-height: 1.55;">
    <div style="text-align: right; font-size: 10.5pt; margin-bottom: 8px;">সংযোজনী-৬</div>

    <div style="text-align: center; font-size: 13pt; margin-bottom: 16px; text-decoration: underline;">
      নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ
    </div>

    <div style="margin-bottom: 18px;">
      <p style="text-align: justify; margin-bottom: 8px;">
        ১। নিম্নে সাধারণ ভবিষ্যৎ তহবিলে জমাকৃত সমুদয় অর্থ উত্তোলনের জন্য আবেদনকারী জনাব/বেগম <span class="val">${claim.applicantName}</span> (<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span>, <span class="val">${claim.deceasedDesignation}</span>, <span class="val">${claim.schoolName}</span>) ${claim.upazilaName}, ${claim.districtName} এর তিনটি নমুনা স্বাক্ষর সত্যায়িত করা হইল।
      </p>

      <table class="borderless-table">
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

    <div style="margin-bottom: 18px;">
      <p style="text-align: justify; margin-bottom: 8px;">
        ২। নিম্নে সাধারণ ভবিষ্যৎ তহবিলে জমাকৃত সমুদয় অর্থ উত্তোলনের জন্য আবেদনকারী জনাব/বেগম <span class="val">${claim.applicantName}</span> (<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span>, <span class="val">${claim.deceasedDesignation}</span>, <span class="val">${claim.schoolName}</span>) ${claim.upazilaName}, ${claim.districtName} এর হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত করা হইল।
      </p>

      <table class="borderless-table">
        <thead>
          <tr style="text-align: left;">
            <th style="width: 90px;">ক্রমিক নং</th>
            <th style="width: 250px;">আঙ্গুলের নাম</th>
            <th>ছাপ</th>
          </tr>
        </thead>
        <tbody>
          <tr style="height: 66px; vertical-align: middle;"><td>(১)</td><td>বাম/ডান কনিষ্ঠ</td><td></td></tr>
          <tr style="height: 66px; vertical-align: middle;"><td>(২)</td><td>বাম/ডান অনামিকা</td><td></td></tr>
          <tr style="height: 66px; vertical-align: middle;"><td>(৩)</td><td>বাম/ডান মধ্যমা</td><td></td></tr>
          <tr style="height: 66px; vertical-align: middle;"><td>(৪)</td><td>বাম/ডান তর্জনী</td><td></td></tr>
          <tr style="height: 66px; vertical-align: middle;"><td>(৫)</td><td>বাম/ডান বৃদ্ধাঙ্গুলি</td><td></td></tr>
        </tbody>
      </table>
    </div>

    <div style="font-size: 10.5pt; margin-bottom: 20px;">
      ৩। উপর্যুক্ত নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ আমার সম্মুখে প্রদান করা হইয়াছে।
    </div>

    <div style="width: 320px; margin-left: auto; text-align: center; line-height: 1.45;">
      <div>সত্যায়নকারী প্রথম শ্রেণির গেজেটেড কর্মকর্তার তারিখসহ স্বাক্ষর</div>
      <div>সীলমোহর (নামযুক্ত)</div>
    </div>
  </div>

  <!-- ================= PAGE 6: ফরোয়ার্ডিং পত্র (ইউএও বরাবরে) ================= -->
  <div class="page" style="font-size: 11.5pt; line-height: 1.65;">
    <div style="text-align: center; margin-bottom: 16px;">
      <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
      <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 14px;">
      <div>স্মারক নং- <span class="val">${forwardingMemo}</span></div>
      <div>তারিখ: <span class="val">${forwardingDate}</span></div>
    </div>

    <div style="margin-bottom: 12px;">
      বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের জন্য ক্ষমতাপত্র প্রদান প্রসঙ্গে।
    </div>

    <p style="text-align: justify; text-indent: 30px; margin-bottom: 14px; line-height: 1.7;">
      উপর্যুক্ত বিষয়ের আলোকে জানানো যাচ্ছে যে, নিম্নোক্ত শিক্ষক <span class="val">${deathDate}</span> তারিখ চাকুরীরত অবস্থায় মৃত্যুবরণ করেন। শিক্ষকের <span class="val">${claim.relationship}</span> তাঁর সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের ক্ষমতাপত্র চেয়ে আবেদন করেছেন। এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য অনুরোধ করা হলো।
    </p>

    <!-- ছক -->
    <table class="bordered-table">
      <thead>
        <tr style="text-align: center;">
          <th style="width: 55px;">ক্র:নং</th>
          <th>আবেদনকারীর বিবরণ</th>
          <th style="width: 170px;">চূড়ান্ত উত্তোলনের কারণ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; vertical-align: top;">০১</td>
          <td style="padding: 7px; line-height: 1.6;">
            জনাব <span class="val">${claim.applicantName}</span>, (<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span>, <span class="val">${claim.deceasedDesignation}</span>, <span class="val">${claim.schoolName}</span>) <span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।
          </td>
          <td style="text-align: center; vertical-align: middle;">মৃত্যুজনিত কারণে</td>
        </tr>
      </tbody>
    </table>

    <div style="font-size: 10.5pt; margin-bottom: 14px;">
      <div style="text-decoration: underline; margin-bottom: 4px;">সংযুক্তি:</div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>১। আবেদনপত্র-----------------------------------------------------</span>
        <span class="val">${attachments}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>২। অডিট বেঙ্গল ম্যানুয়াল ফরম (পূরণকৃত) ---------------------------</span>
        <span class="val">${attachments}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>৩। সাধারণ ভবিষ্যৎ তহবিল হিসাব বিবরণী এর অনলাইন কপি -----------</span>
        <span class="val">${attachments}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>৪। শিক্ষকের নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত--------</span>
        <span class="val">${attachments}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>৫। অবসর উত্তর ছুটি পিআরএল-এর অনুমতিপত্র ----------------------</span>
        <span class="val">${attachments}</span>
      </div>
    </div>

    <!-- ডিডিও স্বাক্ষর স্পেস -->
    <div style="width: 280px; margin-left: auto; text-align: center; line-height: 1.45; margin-top: 60px; margin-bottom: 14px;">
      <div>(<span class="val">${ddoNameText}</span>)</div>
      <div><span class="val">${ddoDesignationText}</span></div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>

    <!-- প্রাপক অংশ -->
    <div style="text-align: left; line-height: 1.35;">
      <div>উপজেলা হিসাব রক্ষণ কর্মকর্তা,</div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>
  </div>

  <!-- ================= PAGE 7: ফরোয়ার্ডিং পত্র (ডিপিইও বরাবরে) ================= -->
  <div class="page" style="font-size: 11.5pt; line-height: 1.65;">
    <div style="text-align: center; margin-bottom: 16px;">
      <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
      <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 14px;">
      <div>স্মারক নং- <span class="val">${forwardingMemo}</span></div>
      <div>তারিখ: <span class="val">${forwardingDate}</span></div>
    </div>

    <div style="margin-bottom: 12px;">
      বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলন প্রসঙ্গে।
    </div>

    <p style="text-align: justify; text-indent: 30px; margin-bottom: 14px; line-height: 1.7;">
      উপর্যুক্ত বিষয়ের আলোকে জানানো যাচ্ছে যে, নিম্নোক্ত শিক্ষক <span class="val">${deathDate}</span> তারিখ চাকুরীরত অবস্থায় মৃত্যুবরণ করেন। শিক্ষকের <span class="val">${claim.relationship}</span> তাঁর সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমুদয় টাকা চূড়ান্ত উত্তোলনের জন্য অনুমতি চেয়ে আবেদন করেছেন। এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য অনুরোধ করা হলো।
    </p>

    <!-- ছক -->
    <table class="bordered-table">
      <thead>
        <tr style="text-align: center;">
          <th style="width: 55px;">ক্র:নং</th>
          <th>আবেদনকারীর বিবরণ</th>
          <th style="width: 170px;">চূড়ান্ত উত্তোলনের কারণ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; vertical-align: top;">০১</td>
          <td style="padding: 7px; line-height: 1.6;">
            জনাব <span class="val">${claim.applicantName}</span>, (<span class="val">${claim.relationship}</span> মৃত <span class="val">${claim.deceasedEmployeeName}</span>, <span class="val">${claim.deceasedDesignation}</span>, <span class="val">${claim.schoolName}</span>) <span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।
          </td>
          <td style="text-align: center; vertical-align: middle;">মৃত্যুজনিত কারণে</td>
        </tr>
      </tbody>
    </table>

    <div style="font-size: 10.5pt; margin-bottom: 14px;">
      <div style="text-decoration: underline; margin-bottom: 4px;">সংযুক্তি:</div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>১। আবেদনপত্র-----------------------------------------------------</span>
        <span class="val">${attachments}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>২। অডিট বেঙ্গল ম্যানুয়াল ফরম (পূরণকৃত) ---------------------------</span>
        <span class="val">${attachments}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>৩। স্থানীয় হিসাবরক্ষণ অফিস কর্তৃক প্রদত্ত ক্ষমতাপত্র --------------------</span>
        <span class="val">${attachments}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>৪। শিক্ষকের নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত--------</span>
        <span class="val">${attachments}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span>৫। অবসর উত্তর ছুটি পিআরএল-এর অনুমতিপত্র ----------------------</span>
        <span class="val">${attachments}</span>
      </div>
    </div>

    <!-- ডিডিও স্বাক্ষর স্পেস -->
    <div style="width: 280px; margin-left: auto; text-align: center; line-height: 1.45; margin-top: 60px; margin-bottom: 14px;">
      <div>(<span class="val">${ddoNameText}</span>)</div>
      <div><span class="val">${ddoDesignationText}</span></div>
      <div><span class="val">${claim.upazilaName}</span>, <span class="val">${claim.districtName}</span>।</div>
    </div>

    <!-- প্রাপক অংশ -->
    <div style="text-align: left; line-height: 1.35;">
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
        console.error('Iframe print blocked:', err);
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
    // Without a frame there is no 7-page document to print; the app screen
    // is print-hidden and would come out blank.
    console.error('Print frame unavailable: nothing to print.');
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
