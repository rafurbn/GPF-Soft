import { ExBangladeshLeaveApplication } from '../types/leave';
import { toBengaliNumber } from './bengaliWords';
import { extractBengaliYear } from './dateUtils';

function escapeHtml(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bnEsc(value: string | number | undefined | null): string {
  return escapeHtml(toBengaliNumber(value));
}

function buildArrowGridHtml(markerId: string): string {
  const cells = Array.from({ length: 15 })
    .map((_, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const borderRight = col < 2 ? 'border-right: 1px solid #000;' : '';
      const borderBottom = row < 4 ? 'border-bottom: 1px solid #000;' : '';
      return `<div style="${borderRight}${borderBottom}"></div>`;
    })
    .join('');

  return `
    <div style="position: relative; width: 100%; height: 125px;">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(5, 1fr); width: 100%; height: 100%;">
        ${cells}
      </div>
      <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <marker id="${markerId}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="black" />
          </marker>
        </defs>
        <line x1="3" y1="97" x2="96" y2="4" stroke="black" stroke-width="1.2" vector-effect="non-scaling-stroke" marker-end="url(#${markerId})" />
      </svg>
    </div>
  `;
}

export function generateExBangladeshLeaveHtml(application: ExBangladeshLeaveApplication): string {
  const e = escapeHtml;
  const b = bnEsc;
  const appYear = b(extractBengaliYear(application.applicationDate));
  const hasLeaveTaken =
    (application.leaveTakenYears && application.leaveTakenYears !== '০০' && application.leaveTakenYears !== '00') ||
    (application.leaveTakenMonths && application.leaveTakenMonths !== '০০' && application.leaveTakenMonths !== '00') ||
    (application.leaveTakenDays && application.leaveTakenDays !== '০০' && application.leaveTakenDays !== '00');

  const takenY = b(application.leaveTakenYears || '০০');
  const takenM = b(application.leaveTakenMonths || '০০');
  const takenD = b(application.leaveTakenDays || '০০');

  return `<!doctype html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>বহি:বাংলাদেশ ছুটি - ${e(application.applicantName)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm 18mm 15mm 18mm;
    }
    @page leave-account-landscape {
      size: A4 landscape;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-weight: 400 !important;
    }
    body {
      font-family: 'SolaimanLipi', 'NikoshBAN', 'Nikosh', 'Siyam Rupali', sans-serif;
      font-weight: 400 !important;
      color: #000000;
      background: #ffffff;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .leave-page {
      page-break-after: always;
      break-after: page;
      background: #ffffff;
    }
    .leave-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .leave-landscape {
      page: leave-account-landscape;
      break-before: page;
      page-break-before: always;
      width: 100%;
    }
    .justify {
      text-align: justify;
      text-justify: inter-word;
    }
    .bordered-table {
      width: 100%;
      border-collapse: collapse;
    }
    .bordered-table th, .bordered-table td {
      border: 1px solid #000000;
      padding: 4px 6px;
      font-weight: 400 !important;
    }
    .row-grid {
      display: grid;
      grid-template-columns: 48% 4% 48%;
      align-items: start;
    }
    .row-grid-p2 {
      display: grid;
      grid-template-columns: 42% 6% 52%;
      align-items: start;
    }
    @media screen {
      body {
        background: #f1f5f9;
        padding: 20px;
      }
      .leave-page {
        max-width: 800px;
        margin: 0 auto 28px auto;
        padding: 42px 38px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }
      .leave-landscape {
        max-width: 1120px;
      }
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: আবেদনপত্র ================= -->
  <div class="leave-page" style="font-size: 15px; line-height: 2.0;">
    <div style="margin-bottom: 22px;">তারিখ: ${b(application.applicationDate)} খ্রি.।</div>

    <div style="margin-bottom: 22px; line-height: 1.4;">
      <div>বরাবর</div>
      <div>${e(application.recipientDesignation)}</div>
      <div>প্রাথমিক শিক্ষা</div>
      <div>${e(application.divisionName)} বিভাগ</div>
      <div>${e(application.districtName)}।</div>
    </div>

    <div style="margin-bottom: 22px;">মাধ্যম: যথাযথ কর্তৃপক্ষ।</div>

    <div style="margin-bottom: 22px; line-height: 1.65;">
      বিষয়ঃ ${e(application.leavePurpose)} ${e(application.destinationCountry)} গমনের অনুমতিসহ ${b(application.leaveDays)} (${e(application.leaveDaysWords)}) দিনের বহি:বাংলাদেশ ছুটি মঞ্জুরীর আবেদন।
    </div>

    <div style="margin-bottom: 12px;">জনাব,</div>

    <div class="justify" style="margin-bottom: 18px; line-height: 1.85;">
      সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${e(application.schoolName)}, ${e(application.upazilaName)}, ${e(application.districtName)} এর ${e(application.designation)}। ${e(application.leavePurpose)} আমি ${e(application.destinationCountry)} গমন করতে ইচ্ছুক। এমতাবস্থায় আমাকে ${e(application.destinationCountry)} গমনের অনুমতিসহ ${b(application.leaveStartDate)} হতে ${b(application.leaveEndDate)} পর্যন্ত ${b(application.leaveDays)}(${e(application.leaveDaysWords)}) দিনের বহি:বাংলাদেশ ছুটি মঞ্জুরীর জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
    </div>

    <div class="justify" style="margin-bottom: 30px; line-height: 1.85;">
      অতএব, মহোদয় সমীপে প্রার্থনা, আমাকে প্রার্থীত ${b(application.leaveStartDate)} হতে ${b(application.leaveEndDate)} পর্যন্ত ${b(application.leaveDays)}(${e(application.leaveDaysWords)}) দিনের জন্য ${e(application.destinationCountry)} গমন ও অবস্থানের অনুমতিসহ বহি:বাংলাদেশ ছুটি মঞ্জুর করতে আপনার সদয় মর্জি হয়।
    </div>

    <div style="line-height: 1.45; margin-top: 12px;">
      <div>বিনীত</div>
      <div>আপনার বিশ্বস্ত</div>
      <div style="height: 64px;"></div>
      <div>(${e(application.applicantName)})</div>
      <div>${e(application.designation)}</div>
      <div>${e(application.schoolName)}</div>
      <div>${e(application.upazilaName)}, ${e(application.districtName)}।</div>
    </div>
  </div>

  <!-- ================= PAGE 2: বাংলাদেশ ফরম নম্বর ৪০ ================= -->
  <div class="leave-page" style="font-size: 13px; line-height: 1.55;">
    <div style="font-size: 12px; margin-bottom: 4px;">বাংলাদেশ ফরম নম্বর ৪০</div>

    <div style="text-align: center; margin-bottom: 12px;">
      <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
      <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
      <div>${e(application.upazilaName)}, ${e(application.districtName)}।</div>
      <div style="margin-top: 4px; text-decoration: underline;">ছুটির আবেদনপত্র (নন-গেজেটেড কর্মচারীদের জন্য)</div>
    </div>

    <div style="font-size: 12px; line-height: 1.85; margin-bottom: 10px;">
      <div class="row-grid-p2"><span>১। আবেদনকারীর নাম</span><span style="text-align: center;">:</span><span>জনাব ${e(application.applicantName)}</span></div>
      <div class="row-grid-p2"><span>২। যে কাজের জন্য নিয়োজিত</span><span style="text-align: center;">:</span><span>${e(application.designation)}</span></div>
      <div class="row-grid-p2"><span>৩। বেতন</span><span style="text-align: center;">:</span><span>${b(application.basicSalary)}</span></div>
      <div class="row-grid-p2"><span>৪। প্রার্থীত ছুটির ধরণ ও সময়কাল</span><span style="text-align: center;">:</span><span>বহি:বাংলাদেশ ছুটি ${b(application.leaveStartDate)} হতে ${b(application.leaveEndDate)} পর্যন্ত ${b(application.leaveDays)} দিন।</span></div>
      <div class="row-grid-p2"><span>৫। কি কারণে</span><span style="text-align: center;">:</span><span>${e(application.leavePurpose)}।</span></div>
      <div class="row-grid-p2"><span>৬। ছুটিকালীন ঠিকানা</span><span style="text-align: center;">:</span><span>${b(application.leaveAddress)}।</span></div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; margin-bottom: 6px;">
      <div>তারিখ------------------------------${appYear}</div>
      <div style="width: 36%; text-align: center;">আবেদনকারীর স্বাক্ষর</div>
    </div>

    <div style="border: 1px solid #000000; display: flex; font-size: 11.5px; margin-bottom: 8px;">
      <div style="width: 62%; border-right: 1px solid #000000; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="padding: 6px; text-align: center; border-bottom: 1px solid #000000; font-size: 11.5px; line-height: 1.3;">
            অফিসের প্রতিবেদন সর্বশেষ ছুটি হইতে প্রত্যাবর্তনের তারিখ
          </div>

          <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #000000; font-size: 10.5px;">
            <thead>
              <tr style="text-align: center;">
                <th rowspan="2" style="width: 25%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;">ছুটি</th>
                <th colspan="3" style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px;">অদ্যাবধি অর্জিত ছুটির পরিমাণ</th>
                <th colspan="3" style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 3px;">অদ্যাবধি ভোগকৃত ছুটির পরিমাণ</th>
                <th colspan="3" style="border-bottom: 1px solid #000; padding: 3px;">প্রাপ্য</th>
              </tr>
              <tr style="text-align: center; font-size: 10px;">
                <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%; padding: 2px;">বৎসর</th>
                <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%; padding: 2px;">মাস</th>
                <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%; padding: 2px;">দিন</th>
                <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%; padding: 2px;">বৎসর</th>
                <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%; padding: 2px;">মাস</th>
                <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%; padding: 2px;">দিন</th>
                <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%; padding: 2px;">বৎসর</th>
                <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; width: 8%; padding: 2px;">মাস</th>
                <th style="border-bottom: 1px solid #000; width: 8%; padding: 2px;">দিন</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">বিশেষ সুবিধা--------</td>
                <td colspan="3" rowspan="5" style="padding: 0; border-right: 1px solid #000; border-bottom: 1px solid #000; vertical-align: top;">
                  ${buildArrowGridHtml('arrow-1')}
                </td>
                <td colspan="3" rowspan="5" style="padding: 0; border-right: 1px solid #000; border-bottom: 1px solid #000; vertical-align: top;">
                  ${buildArrowGridHtml('arrow-2')}
                </td>
                <td colspan="3" rowspan="5" style="padding: 0; border-bottom: 1px solid #000; vertical-align: top;">
                  ${buildArrowGridHtml('arrow-3')}
                </td>
              </tr>
              <tr><td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">অল্পদিনের ছুটি-------</td></tr>
              <tr><td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">ডাক্তারের প্রত্যয়ন----</td></tr>
              <tr><td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">পত্র-----------------</td></tr>
              <tr><td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">গড় বেতন-----------</td></tr>
              <tr style="text-align: center;">
                <td style="border-right: 1px solid #000; padding: 4px; text-align: left; font-size: 10px;">অর্ধ গড় বেতন------</td>
                <td style="border-right: 1px solid #000; padding: 2px;">${b(application.earnedHalfPayYears)}</td>
                <td style="border-right: 1px solid #000; padding: 2px;">${b(application.earnedHalfPayMonths)}</td>
                <td style="border-right: 1px solid #000; padding: 2px;">${b(application.earnedHalfPayDays)}</td>
                <td style="border-right: 1px solid #000; padding: 2px;">${hasLeaveTaken ? takenY : '---'}</td>
                <td style="border-right: 1px solid #000; padding: 2px;">${hasLeaveTaken ? takenM : '---'}</td>
                <td style="border-right: 1px solid #000; padding: 2px;">${hasLeaveTaken ? takenD : '---'}</td>
                <td style="border-right: 1px solid #000; padding: 2px;">${b(application.balanceYears)}</td>
                <td style="border-right: 1px solid #000; padding: 2px;">${b(application.balanceMonths)}</td>
                <td style="padding: 2px;">${b(application.balanceDays)}</td>
              </tr>
            </tbody>
          </table>

          <div class="justify" style="padding: 8px; font-size: 11px; line-height: 1.55;">
            প্রত্যয়ন করা যাইতেছে যে, প্রার্থীত ছুটি সিভিল সার্ভিস রেগুলেশন/ফান্ডামেন্টাল রুলস-এর-----------------অনুচ্ছেদ/বিধি অনুযায়ী প্রাপ্য।
          </div>
        </div>
        <div style="padding: 8px; font-size: 12px;">তারিখ---------------------${appYear}</div>
      </div>

      <div style="width: 38%; padding: 8px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="text-align: center; font-size: 11.5px; line-height: 1.35; padding-bottom: 6px; border-bottom: 1px solid #000; margin-bottom: 8px;">
            অফিস প্রধানের সুপারিশ এবং অনুপস্থিতিকালে তাহার কার্য সম্পাদনের ব্যবস্থা।
          </div>
          <p class="justify" style="font-size: 11px; line-height: 1.65;">
            সংশ্লিষ্ট শিক্ষক ${b(application.leaveStartDate)} হতে ${b(application.leaveEndDate)} পর্যন্ত অথবা ছুটি ভোগের তারিখ হতে ${b(application.leaveDays)}(${e(application.leaveDaysWords)}) দিনের জন্য ${e(application.leavePurpose)} ${e(application.destinationCountry)} গমন ও অবস্থানের অনুমতি চেয়ে আবেদন করেছেন। প্রার্থীত ছুটি মঞ্জুরসহ উল্লিখিত দেশ গমনের অনুমতি প্রদানের জন্য সুপারিশ করা হলো।
          </p>
        </div>
        <div style="font-size: 12px; padding-top: 16px;">তারিখ----------------------${appYear}</div>
      </div>
    </div>

    <div style="text-align: center; font-size: 12px; margin-bottom: 4px;">আদেশ</div>
    <div style="font-size: 11px; line-height: 1.5;">
      <div>নং সম(বাঃ বাঃ কোঃ)/ভেটিং/ফ-১৩৩/৮৫-৩৬৭৪, তাং ৬-১১-৮৫ ইং।</div>
      <div>বাঃ সঃ মুঃ-৯৯/২০০০-১০০৪২এফ (কম-১)-৪ লক্ষ কপি, ২০০০।</div>
    </div>
  </div>

  <!-- ================= PAGE 3: বহি: বাংলাদেশ ভ্রমণের জন্য আবেদন ================= -->
  <div class="leave-page" style="font-size: 13px; line-height: 1.75;">
    <div style="text-align: center; font-size: 16px; text-decoration: underline; margin-bottom: 18px;">
      বহি: বাংলাদেশ ভ্রমণের জন্য আবেদন
    </div>

    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div class="row-grid"><span>১। আবেদনকারীর নাম</span><span style="text-align: center;">:</span><span>জনাব ${e(application.applicantName)}</span></div>
      <div class="row-grid"><span>২। পিতার নাম</span><span style="text-align: center;">:</span><span>জনাব ${e(application.fatherName)}</span></div>
      <div class="row-grid"><span>৩। পদবী ও অফিসের ঠিকানা</span><span style="text-align: center;">:</span><span>${e(application.designation)}, ${e(application.schoolName)}, ${e(application.upazilaName)}, ${e(application.districtName)}।</span></div>
      <div class="row-grid"><span>৪। বেতন স্কেল</span><span style="text-align: center;">:</span><span>${b(application.salaryScale)}</span></div>
      <div class="row-grid"><span>৫। চাকুরিতে যোগদানের তারিখ</span><span style="text-align: center;">:</span><span>${b(application.joiningDate)} খ্রি.।</span></div>
      <div class="row-grid"><span>৬। জন্ম তারিখ</span><span style="text-align: center;">:</span><span>${b(application.birthDate)} খ্রি.।</span></div>
      <div class="row-grid"><span>৭। কোন দেশ ভ্রমণ করিতে ইচ্ছুক/স্থানসমূহ সুনির্দিষ্টভাবে তা উল্লেখ করতে হইবে</span><span style="text-align: center;">:</span><span>${e(application.destinationCountry)}</span></div>
      <div class="row-grid"><span>৮। ভ্রমণের উদ্দেশ্য</span><span style="text-align: center;">:</span><span>${e(application.leavePurpose)}।</span></div>
      <div class="row-grid"><span>৯। প্রস্তাবিত ভ্রমণের সময়কাল</span><span style="text-align: center;">:</span><span>${b(application.leaveStartDate)} হতে ${b(application.leaveEndDate)} পর্যন্ত বা ছুটি ভোগের তারিখ হতে ${b(application.leaveDays)} (${e(application.leaveDaysWords)}) দিন।</span></div>
      <div class="row-grid"><span>১০। ভ্রমণকালে আবেদনকারী একা থাকিবেন নাকি সংসারের অন্য সদস্যদের বা অন্যান্যদের সাথে থাকিবেন</span><span style="text-align: center;">:</span><span>${b(application.familyAccompany)}।</span></div>
      <div class="row-grid"><span>১১। ভ্রমণে যদি সংসারের অন্য কোন সদস্য বা অন্যান্য কেহ জড়িত থাকেন তবে তাহার নাম, বয়স এবং আবেদনকারীর সঙ্গে তাহার সম্পর্ক বর্ণনা করিতে হইবে</span><span style="text-align: center;">:</span><span>${b(application.familyDetails)}।</span></div>
      <div class="row-grid"><span>১২। ঐ দেশ শেষ বারের মত কখন ভ্রমণ করিয়াছেন এবং স্থায়িত্ব কত দিন ছিল</span><span style="text-align: center;">:</span><span>${b(application.previousTravelDetails)}।</span></div>
      <div class="row-grid"><span>১৩। কাঙ্ক্ষিত ভ্রমণের ব্যয় নির্বাহ কিভাবে করা হইবে (যদি বিদেশে অবস্থানরত কোন আত্মীয় উক্ত ব্যয় বহন করিতে চান তবে তাহার নাম, ঠিকানা ও আবেদনকারীর সঙ্গে তাহার সম্পর্ক বর্ণনা করিতে হইবে)</span><span style="text-align: center;">:</span><span>${b(application.expenseSource)}।</span></div>
      <div class="row-grid"><span>১৪। ছুটি পাওনা আছে কিনা</span><span style="text-align: center;">:</span><span>পাওনা আছে, ছুটির হিসাব বিবরণী সংযুক্ত।</span></div>
      <div class="row-grid"><span>১৫। ভ্রমণকাল কি হিসাবে গণ্য করা হইবে?</span><span style="text-align: center;">:</span><span>${e(application.leaveType)}।</span></div>
    </div>

    <div style="width: 280px; margin-left: auto; text-align: center; font-size: 12px; margin-top: 28px; margin-bottom: 24px;">
      <div style="height: 44px;"></div>
      <div>আবেদনকারীর নাম: ${e(application.applicantName)}</div>
    </div>

    <div style="border-top: 1px solid #000; padding-top: 12px; font-size: 12px;">
      <div class="row-grid">
        <span>১৬। মন্ত্রণালয়/বিভাগীয় অফিস প্রধানের সুপারিশ যিনি এই মর্মে প্রত্যয়ন করিবেন যে, উক্ত ভ্রমণের জন্য কোন বৈদেশিক মুদ্রার প্রয়োজন হইবে না</span>
        <span style="text-align: center;">:</span>
        <span>প্রত্যয়ন সংযুক্ত।</span>
      </div>
      <div style="width: 280px; margin-left: auto; text-align: center; padding-top: 20px;">
        <div style="height: 44px;"></div>
        <div>মন্ত্রণালয়/বিভাগীয় অফিস প্রধানের স্বাক্ষর</div>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 4: বিগত বছরের ভ্রমণ বৃত্তান্ত ও প্রত্যয়ন পত্র ================= -->
  <div class="leave-page" style="font-size: 13px; line-height: 1.65;">
    <div style="text-align: center; font-size: 12.5px; margin-bottom: 12px;">
      বিদেশ গমনেচ্ছু কর্মকর্তা বিগত বছরের বিদেশ ভ্রমণ/অবস্থান-এর বৃত্তান্ত
    </div>

    <table class="bordered-table" style="font-size: 11px;">
      <thead>
        <tr style="text-align: center;">
          <th style="width: 38px;">ক্রম</th>
          <th style="width: 190px;">কর্মকর্তা/কর্মচারীর নাম, পদবী, বেতনক্রম, বয়স, সংস্থা/দপ্তর, বিভাগ/মন্ত্রণালয়</th>
          <th colspan="3">দেশের নাম ও অবস্থান কাল</th>
          <th>ভ্রমণ/অবস্থান-এর উদ্দেশ্য (সরকারি/ব্যক্তিগত কাজ, প্রশিক্ষণ, পোস্টিং, প্রেষণ)</th>
          <th>মন্তব্য (উদ্যোক্তা, খরচের উৎস ও পরিমাণ ইত্যাদি)</th>
        </tr>
        <tr style="text-align: center; font-size: 10px;">
          <th></th><th></th><th>দেশ</th><th>থেকে</th><th>পর্যন্ত</th><th></th><th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; vertical-align: top;">০১</td>
          <td style="padding: 8px; font-size: 11.5px; line-height: 1.65;">
            <div>জনাব ${e(application.applicantName)}</div>
            <div>${e(application.designation)}</div>
            <div>বেতন ক্রম: ${b(application.salaryScale)}</div>
            <div>বয়স: ${b(application.calculatedAge)}</div>
          </td>
          <td style="text-align: center;">---</td>
          <td style="text-align: center;">---</td>
          <td style="text-align: center;">---</td>
          <td style="text-align: center; font-size: 11.5px;">প্রযোজ্য নয়</td>
          <td style="text-align: center; font-size: 11.5px;">প্রযোজ্য নয়</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 115px;">
      <div style="text-align: center; margin-bottom: 16px; line-height: 1.45;">
        <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
        <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
        <div>${e(application.upazilaName)}, ${e(application.districtName)}।</div>
        <div style="margin-top: 10px; font-size: 14px; text-decoration: underline;">প্রত্যয়ন পত্র</div>
      </div>

      <p class="justify" style="font-size: 12.5px; line-height: 1.95; text-indent: 32px; margin-bottom: 52px;">
        জনাব ${e(application.applicantName)}, পিতার নাম: ${e(application.fatherName)}, কর্মস্থল: ${e(application.schoolName)}, উপজেলা: ${e(application.upazilaName)}, জেলা: ${e(application.districtName)}, ${e(application.designation)} পদে স্থায়ী ভিত্তিতে নিযুক্ত আছেন। পুলিশ বিভাগের মাধ্যমে ইতোপূর্বে পরিচয় ও চরিত্র প্রতিপাদিত হয়েছে। শিক্ষকের বিরুদ্ধে বিভাগীয় মামলা, ফৌজদারী মামলা এবং অডিট আপত্তি নেই এবং তাঁর বিরুদ্ধে কোনরূপ বিরূপ তথ্য নেই।
      </p>

      <div style="width: 280px; margin-left: auto; text-align: center; font-size: 12px; line-height: 1.5;">
        <div style="height: 75px;"></div>
        <div>(${e(application.ddoName)})</div>
        <div>${e(application.ddoDesignation)}</div>
        <div>${e(application.upazilaName)}, ${e(application.districtName)}।</div>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 5: পাঠদান প্রত্যয়ন, বিদ্যালয় পরিসংখ্যান ও অঙ্গীকার নামা ================= -->
  <div class="leave-page" style="font-size: 13px; line-height: 1.65;">
    <div style="margin-bottom: 48px;">
      <div style="text-align: center; margin-bottom: 12px; line-height: 1.4;">
        <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
        <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
        <div>${e(application.upazilaName)}, ${e(application.districtName)}।</div>
        <div style="margin-top: 8px; font-size: 14px; text-decoration: underline;">পাঠদান সংক্রান্ত প্রত্যয়ন পত্র</div>
      </div>

      <p class="justify" style="font-size: 12px; line-height: 1.95; text-indent: 32px; margin-bottom: 10px;">
        প্রত্যয়ন করা যাইতেছে যে, ${e(application.districtName)} জেলার ${e(application.upazilaName)} উপজেলাধীন ${e(application.schoolName)} এ বর্তমানে ${b(application.workingTeachers)} (${e(application.workingTeachersWords)}) জন শিক্ষক কর্মরত আছেন। ${e(application.designation)}, জনাব ${e(application.applicantName)}'কে ${e(application.leavePurpose)} ${e(application.destinationCountry)} গমনের অনুমতিসহ ${b(application.leaveDays)}(${e(application.leaveDaysWords)}) দিনের বহি:বাংলাদেশ ছুটি মঞ্জুর করলে তার ছুটি কালীন স্কুলের পাঠদান কার্যক্রমে যাতে কোনরূপ বিঘ্ন না ঘটে এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণ করা হবে।
      </p>
      <p style="font-size: 12px;">তার বিদেশ ভ্রমণে সরকারের উপর কোন আর্থিক দায় দায়িত্ব বর্তাবে না।</p>
    </div>

    <div style="margin-bottom: 48px;">
      <div style="text-align: center; font-size: 12px; text-decoration: underline; margin-bottom: 6px;">
        বিদ্যালয়ে মঞ্জুরীকৃত পদসংখ্যা, কর্মরত শিক্ষক সংখ্যা এবং ছাত্র/ছাত্রী সংখ্যা সংক্রান্ত তথ্য
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
        <div>উপজেলা: ${e(application.upazilaName)}</div>
        <div>জেলা: ${e(application.districtName)}</div>
      </div>

      <table class="bordered-table" style="font-size: 12px;">
        <thead>
          <tr style="text-align: center;">
            <th style="width: 55px;">ক্রমিক নং</th>
            <th>বিদ্যালয়ের নাম</th>
            <th style="width: 110px;">মঞ্জুরীকৃত পদসংখ্যা</th>
            <th style="width: 110px;">কর্মরত শিক্ষক সংখ্যা</th>
            <th style="width: 140px;">ছাত্র/ছাত্রী সংখ্যা</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;">০১</td>
            <td style="padding: 8px;">
              <div>${e(application.schoolName)}</div>
              <div>${e(application.upazilaName)}, ${e(application.districtName)}।</div>
            </td>
            <td style="text-align: center;">${b(application.sanctionedPosts)}</td>
            <td style="text-align: center;">${b(application.workingTeachers)}</td>
            <td style="padding: 6px 8px; font-size: 11px; line-height: 1.4;">
              <div>ছাত্র= ${b(application.maleStudents)} জন</div>
              <div>ছাত্রী= ${b(application.femaleStudents)} জন</div>
              <div style="border-top: 1px solid #000; padding-top: 2px;">মোট= ${b(application.totalStudents)} জন</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <div style="text-align: center; font-size: 14px; text-decoration: underline; margin-bottom: 12px;">অঙ্গীকার নামা</div>
      <p class="justify" style="font-size: 12px; line-height: 1.95; text-indent: 32px; margin-bottom: 24px;">
        এই মর্মে ঘোষণা করছি যে, আমি বহি:বাংলাদেশ ছুটি সাপেক্ষে ${b(application.leaveDays)}(${e(application.leaveDaysWords)}) দিনের জন্য ${e(application.leavePurpose)} ${e(application.destinationCountry)} যেতে আগ্রহী। আমার উক্ত বিদেশ গমনের সময় সম্পূর্ণ ব্যয় আমি নিজে বহন করব। আমার এই বিদেশ গমনের সাথে সরকারি ব্যয় বা বৈদেশিক মুদ্রার কোন সম্পর্ক নাই।
      </p>

      <div style="width: 280px; margin-left: auto; text-align: center; font-size: 12px; line-height: 1.5; padding-top: 10px;">
        <div style="height: 68px;"></div>
        <div>(${e(application.applicantName)})</div>
        <div>${e(application.designation)}</div>
        <div>${e(application.schoolName)}</div>
        <div>${e(application.upazilaName)}, ${e(application.districtName)}।</div>
      </div>
    </div>
  </div>

  <!-- ================= PAGE 6: Leave Account Form (Landscape) ================= -->
  <div class="leave-page leave-landscape" style="font-size: 12.5px; line-height: 1.5;">
    <div style="text-align: center; font-size: 18px; text-decoration: underline; margin-bottom: 14px; letter-spacing: 0.4px;">
      Leave Account Form
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 10px;">
      <div>Leave Account of: ${e(application.applicantName)}</div>
      <div>Designation: ${e(application.designation)}</div>
      <div>Office: ${e(application.schoolName)}</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; font-size: 12px; margin-bottom: 14px;">
      <div>Date of commencement of service: ${b(application.joiningDate)} খ্রি.।</div>
      <div style="text-align: center;">Leave Rules: As per PLR- 1959.</div>
      <div style="text-align: right;">Date of Birth: ${b(application.birthDate)} খ্রি.।</div>
    </div>

    <table class="bordered-table" style="font-size: 10.5px; text-align: center; margin-bottom: 28px;">
      <thead>
        <tr>
          <th colspan="5">মোট চাকুরী কাল</th>
          <th colspan="3">অর্জিত ছুটি (অর্ধগড় বেতনে)</th>
          <th colspan="3">জমাকৃত প্রাপ্য অর্জিত ছুটি (অর্ধগড় বেতনে)</th>
          <th colspan="3">মোট অর্জিত ছুটি (অর্ধগড় বেতনে)</th>
          <th colspan="5">গৃহীত ছুটি (অর্ধগড় বেতনে)</th>
          <th colspan="3">ব্যালেন্স (অর্ধগড় বেতনে)</th>
          <th rowspan="3" style="width: 60px;">মন্তব্য</th>
        </tr>
        <tr>
          <th rowspan="2">হইতে</th>
          <th rowspan="2">পর্যন্ত</th>
          <th colspan="3">সময়</th>
          <th rowspan="2">বছর</th><th rowspan="2">মাস</th><th rowspan="2">দিন</th>
          <th rowspan="2">বছর</th><th rowspan="2">মাস</th><th rowspan="2">দিন</th>
          <th rowspan="2">বছর</th><th rowspan="2">মাস</th><th rowspan="2">দিন</th>
          <th rowspan="2">হইতে</th>
          <th rowspan="2">পর্যন্ত</th>
          <th colspan="3">সময়</th>
          <th rowspan="2">বছর</th><th rowspan="2">মাস</th><th rowspan="2">দিন</th>
        </tr>
        <tr>
          <th>বছর</th><th>মাস</th><th>দিন</th>
          <th>বছর</th><th>মাস</th><th>দিন</th>
        </tr>
      </thead>
      <tbody>
        <tr style="height: 36px;">
          <td>${b(application.serviceStartDate)}</td>
          <td>${b(application.serviceCalculationDate)}</td>
          <td>${b(application.totalServiceYears)}</td>
          <td>${b(application.totalServiceMonths)}</td>
          <td>${b(application.totalServiceDays)}</td>
          <td>${b(application.earnedHalfPayYears)}</td>
          <td>${b(application.earnedHalfPayMonths)}</td>
          <td>${b(application.earnedHalfPayDays)}</td>
          <td>${b(application.earnedHalfPayYears)}</td>
          <td>${b(application.earnedHalfPayMonths)}</td>
          <td>${b(application.earnedHalfPayDays)}</td>
          <td>${b(application.earnedHalfPayYears)}</td>
          <td>${b(application.earnedHalfPayMonths)}</td>
          <td>${b(application.earnedHalfPayDays)}</td>
          <td>==</td>
          <td>==</td>
          <td>${takenY}</td>
          <td>${takenM}</td>
          <td>${takenD}</td>
          <td>${b(application.balanceYears)}</td>
          <td>${b(application.balanceMonths)}</td>
          <td>${b(application.balanceDays)}</td>
          <td></td>
        </tr>
        <tr style="height: 30px;">${'<td></td>'.repeat(23)}</tr>
        <tr style="height: 30px;">${'<td></td>'.repeat(23)}</tr>
        <tr style="height: 30px;">${'<td></td>'.repeat(23)}</tr>
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; padding-top: 24px;">
      <div>
        <div>যাচাইকারী কর্মকর্তার স্বাক্ষর</div>
        <div style="margin-top: 4px;">সীলমোহর</div>
      </div>
      <div style="text-align: center;">
        <div style="height: 60px;"></div>
        <div>উপজেলা শিক্ষা অফিসার</div>
        <div>${e(application.upazilaName)}, ${e(application.districtName)}।</div>
      </div>
    </div>
  </div>

</body>
</html>`;
}

export function printLeaveDocument(application: ExBangladeshLeaveApplication): void {
  const htmlContent = generateExBangladeshLeaveHtml(application);

  const printFrame = document.createElement('iframe');
  printFrame.name = 'leave_print_frame';
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

    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print blocked, falling back to window.print():', err);
        window.print();
      }

      setTimeout(() => {
        try {
          if (printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
          }
        } catch {
          // ignore cleanup errors
        }
      }, 60000);
    }, 250);
  } else {
    window.print();
  }
}

export function downloadLeaveDocument(application: ExBangladeshLeaveApplication): void {
  const htmlContent = generateExBangladeshLeaveHtml(application);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeName = (application.applicantName || 'আবেদন').replace(/[/\\?%*:|"<>]/g, '_');
  anchor.href = url;
  anchor.download = `বহি_বাংলাদেশ_ছুটি_${safeName}_৬_পেজ.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
