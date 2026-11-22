import React from 'react';
import { ExBangladeshLeaveApplication } from '../types/leave';
import { toBengaliNumber } from '../utils/bengaliWords';
import { extractBengaliYear } from '../utils/dateUtils';

interface LeavePrintEngineProps {
  application: ExBangladeshLeaveApplication | null;
}

export const LeavePrintEngine: React.FC<LeavePrintEngineProps> = ({ application }) => {
  if (!application) return null;

  const bn = toBengaliNumber;
  const appYear = bn(extractBengaliYear(application.applicationDate));
  const hasLeaveTaken =
    (application.leaveTakenYears && application.leaveTakenYears !== '০০' && application.leaveTakenYears !== '00') ||
    (application.leaveTakenMonths && application.leaveTakenMonths !== '০০' && application.leaveTakenMonths !== '00') ||
    (application.leaveTakenDays && application.leaveTakenDays !== '০০' && application.leaveTakenDays !== '00');

  const takenY = bn(application.leaveTakenYears || '০০');
  const takenM = bn(application.leaveTakenMonths || '০০');
  const takenD = bn(application.leaveTakenDays || '০০');

  const Value = ({ children }: { children: React.ReactNode }) => {
    return <span style={{ fontWeight: 400 }}>{children}</span>;
  };

  return (
    <div id="leave-print-document" className="text-black font-bengali">
      <style>{`
        @media screen {
          #leave-print-document {
            display: none !important;
            visibility: hidden !important;
          }
        }
        @media print {
          #leave-print-document {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'SolaimanLipi', 'NikoshBAN', 'Nikosh', 'Siyam Rupali', sans-serif !important;
          }
          #leave-print-document * {
            font-weight: 400 !important;
            font-family: 'SolaimanLipi', 'NikoshBAN', 'Nikosh', 'Siyam Rupali', sans-serif !important;
          }
          header, main, footer, .print-hidden, #leave-dashboard, #leave-table {
            display: none !important;
            visibility: hidden !important;
          }
          @page {
            size: A4 portrait;
            margin: 20mm 18mm 15mm 18mm;
          }
          @page leave-account-landscape {
            size: A4 landscape;
            margin: 15mm 15mm 15mm 15mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-weight: 400 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .leave-print-page {
            page-break-after: always;
            break-after: page;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            font-weight: 400 !important;
          }
          .leave-print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .leave-account-landscape {
            page: leave-account-landscape;
            break-before: page;
            page-break-before: always;
            width: 100% !important;
          }
          .bordered-table th, .bordered-table td {
            border: 1px solid #000000;
            padding: 4px 6px;
            font-weight: 400 !important;
          }
          .app-body-justified {
            text-align: justify !important;
            text-justify: inter-word !important;
          }
        }
      `}</style>

      {/* ================= PAGE 1: আবেদনপত্র ================= */}
      <div className="leave-print-page text-[15px] leading-[2.0] text-left">
        <div className="mb-6 text-left">
          তারিখ: <Value>{bn(application.applicationDate)}</Value> খ্রি.।
        </div>

        <div className="mb-6 text-left space-y-0.5 leading-[1.35]">
          <div>বরাবর</div>
          <div><Value>{application.recipientDesignation}</Value></div>
          <div>প্রাথমিক শিক্ষা</div>
          <div><Value>{application.divisionName}</Value> বিভাগ</div>
          <div><Value>{application.districtName}</Value>।</div>
        </div>

        <div className="mb-6 text-left">মাধ্যম: যথাযথ কর্তৃপক্ষ।</div>

        <div className="mb-6 text-left leading-relaxed">
          বিষয়ঃ <Value>{application.leavePurpose}</Value> <Value>{application.destinationCountry}</Value> গমনের অনুমতিসহ <Value>{bn(application.leaveDays)}</Value> (<Value>{application.leaveDaysWords}</Value>) দিনের বহি:বাংলাদেশ ছুটি মঞ্জুরীর আবেদন।
        </div>

        <div className="mb-3 text-left">জনাব,</div>

        <div className="mb-5 text-justify app-body-justified leading-relaxed">
          সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী <Value>{application.schoolName}</Value>, <Value>{application.upazilaName}</Value>, <Value>{application.districtName}</Value> এর <Value>{application.designation}</Value>। <Value>{application.leavePurpose}</Value> আমি <Value>{application.destinationCountry}</Value> গমন করতে ইচ্ছুক। এমতাবস্থায় আমাকে <Value>{application.destinationCountry}</Value> গমনের অনুমতিসহ <Value>{bn(application.leaveStartDate)}</Value> হতে <Value>{bn(application.leaveEndDate)}</Value> পর্যন্ত <Value>{bn(application.leaveDays)}</Value>(<Value>{application.leaveDaysWords}</Value>) দিনের বহি:বাংলাদেশ ছুটি মঞ্জুরীর জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
        </div>

        <div className="mb-8 text-justify app-body-justified leading-relaxed">
          অতএব, মহোদয় সমীপে প্রার্থনা, আমাকে প্রার্থীত <Value>{bn(application.leaveStartDate)}</Value> হতে <Value>{bn(application.leaveEndDate)}</Value> পর্যন্ত <Value>{bn(application.leaveDays)}</Value>(<Value>{application.leaveDaysWords}</Value>) দিনের জন্য <Value>{application.destinationCountry}</Value> গমন ও অবস্থানের অনুমতিসহ বহি:বাংলাদেশ ছুটি মঞ্জুর করতে আপনার সদয় মর্জি হয়।
        </div>

        <div className="pt-3 text-left leading-[1.35] space-y-0.5">
          <div>বিনীত</div>
          <div>আপনার বিশ্বস্ত</div>
          <div className="h-16 w-48"></div>
          <div>(<Value>{application.applicantName}</Value>)</div>
          <div><Value>{application.designation}</Value></div>
          <div><Value>{application.schoolName}</Value></div>
          <div><Value>{application.upazilaName}</Value>, <Value>{application.districtName}</Value>।</div>
        </div>
      </div>

      {/* ================= PAGE 2: বাংলাদেশ ফরম নম্বর ৪০ ================= */}
      <div className="leave-print-page text-[13px] leading-normal">
        <div className="text-left text-xs mb-1">বাংলাদেশ ফরম নম্বর ৪০</div>

        <div className="text-center mb-3">
          <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
          <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
          <div><Value>{application.upazilaName}</Value>, <Value>{application.districtName}</Value>।</div>
          <div className="mt-1 font-normal underline">ছুটির আবেদনপত্র (নন-গেজেটেড কর্মচারীদের জন্য)</div>
        </div>

        <div className="space-y-1.5 mb-2 text-xs">
          <div className="grid grid-cols-12">
            <span className="col-span-5">১। আবেদনকারীর নাম</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-6">জনাব <Value>{application.applicantName}</Value></span>
          </div>
          <div className="grid grid-cols-12">
            <span className="col-span-5">২। যে কাজের জন্য নিয়োজিত</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-6"><Value>{application.designation}</Value></span>
          </div>
          <div className="grid grid-cols-12">
            <span className="col-span-5">৩। বেতন</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-6"><Value>{bn(application.basicSalary)}</Value></span>
          </div>
          <div className="grid grid-cols-12">
            <span className="col-span-5">৪। প্রার্থীত ছুটির ধরণ ও সময়কাল</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-6">
              বহি:বাংলাদেশ ছুটি <Value>{bn(application.leaveStartDate)}</Value> হতে <Value>{bn(application.leaveEndDate)}</Value> পর্যন্ত <Value>{bn(application.leaveDays)}</Value> দিন।
            </span>
          </div>
          <div className="grid grid-cols-12">
            <span className="col-span-5">৫। কি কারণে</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-6"><Value>{application.leavePurpose}</Value>।</span>
          </div>
          <div className="grid grid-cols-12">
            <span className="col-span-5">৬। ছুটিকালীন ঠিকানা</span>
            <span className="col-span-1 text-center">:</span>
            <span className="col-span-6"><Value>{bn(application.leaveAddress)}</Value>।</span>
          </div>
        </div>

        <div className="flex justify-between items-end text-xs mb-1">
          <div>তারিখ------------------------------{appYear}</div>
          <div className="w-[36%] text-center">
            <div className="mb-0.5">আবেদনকারীর স্বাক্ষর</div>
          </div>
        </div>

        <div className="border border-black flex text-xs mb-2">
          <div className="w-[62%] border-r border-black p-0 flex flex-col justify-between">
            <div>
              <div className="p-1.5 text-center border-b border-black text-[11.5px] leading-tight">
                অফিসের প্রতিবেদন সর্বশেষ ছুটি হইতে প্রত্যাবর্তনের তারিখ
              </div>

              <table className="w-full border-collapse border-b border-black text-[10.5px]">
                <thead>
                  <tr className="text-center">
                    <th rowSpan={2} className="w-[25%] border-r border-b border-black p-1">ছুটি</th>
                    <th colSpan={3} className="border-r border-b border-black p-0.5">অদ্যাবধি অর্জিত ছুটির পরিমাণ</th>
                    <th colSpan={3} className="border-r border-b border-black p-0.5">অদ্যাবধি ভোগকৃত ছুটির পরিমাণ</th>
                    <th colSpan={3} className="border-b border-black p-0.5">প্রাপ্য</th>
                  </tr>
                  <tr className="text-center text-[10px]">
                    <th className="border-r border-b border-black w-[8%] p-0.5">বৎসর</th>
                    <th className="border-r border-b border-black w-[8%] p-0.5">মাস</th>
                    <th className="border-r border-b border-black w-[8%] p-0.5">দিন</th>
                    <th className="border-r border-b border-black w-[8%] p-0.5">বৎসর</th>
                    <th className="border-r border-b border-black w-[8%] p-0.5">মাস</th>
                    <th className="border-r border-b border-black w-[8%] p-0.5">দিন</th>
                    <th className="border-r border-b border-black w-[8%] p-0.5">বৎসর</th>
                    <th className="border-r border-b border-black w-[8%] p-0.5">মাস</th>
                    <th className="border-b border-black w-[8%] p-0.5">দিন</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-r border-b border-black p-1 text-[10px] leading-tight">বিশেষ সুবিধা--------</td>
                    {[1, 2, 3].map((blockIdx) => (
                      <td
                        key={blockIdx}
                        colSpan={3}
                        rowSpan={5}
                        className={`relative p-0 border-b border-black align-top ${blockIdx < 3 ? 'border-r' : ''}`}
                      >
                        <div className="grid grid-rows-5 grid-cols-3 w-full h-[125px]">
                          {Array.from({ length: 15 }).map((_, i) => {
                            const col = i % 3;
                            const row = Math.floor(i / 3);
                            return (
                              <div
                                key={i}
                                className={`${col < 2 ? 'border-r border-black' : ''} ${
                                  row < 4 ? 'border-b border-black' : ''
                                }`}
                              />
                            );
                          })}
                        </div>
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          preserveAspectRatio="none"
                          viewBox="0 0 100 100"
                        >
                          <defs>
                            <marker
                              id={`print-arrow-${blockIdx}`}
                              viewBox="0 0 10 10"
                              refX="6"
                              refY="5"
                              markerWidth="5"
                              markerHeight="5"
                              orient="auto-start-reverse"
                            >
                              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="black" />
                            </marker>
                          </defs>
                          <line
                            x1="3"
                            y1="97"
                            x2="96"
                            y2="4"
                            stroke="black"
                            strokeWidth="1.2"
                            vectorEffect="non-scaling-stroke"
                            markerEnd={`url(#print-arrow-${blockIdx})`}
                          />
                        </svg>
                      </td>
                    ))}
                  </tr>

                  <tr><td className="border-r border-b border-black p-1 text-[10px] leading-tight">অল্পদিনের ছুটি-------</td></tr>
                  <tr><td className="border-r border-b border-black p-1 text-[10px] leading-tight">ডাক্তারের প্রত্যয়ন----</td></tr>
                  <tr><td className="border-r border-b border-black p-1 text-[10px] leading-tight">পত্র-----------------</td></tr>
                  <tr><td className="border-r border-b border-black p-1 text-[10px] leading-tight">গড় বেতন-----------</td></tr>

                  <tr className="text-center font-normal">
                    <td className="border-r border-black p-1 text-left text-[10px] leading-tight">অর্ধ গড় বেতন------</td>
                    <td className="border-r border-black p-0.5"><Value>{bn(application.earnedHalfPayYears)}</Value></td>
                    <td className="border-r border-black p-0.5"><Value>{bn(application.earnedHalfPayMonths)}</Value></td>
                    <td className="border-r border-black p-0.5"><Value>{bn(application.earnedHalfPayDays)}</Value></td>
                    <td className="border-r border-black p-0.5">{hasLeaveTaken ? takenY : '---'}</td>
                    <td className="border-r border-black p-0.5">{hasLeaveTaken ? takenM : '---'}</td>
                    <td className="border-r border-black p-0.5">{hasLeaveTaken ? takenD : '---'}</td>
                    <td className="border-r border-black p-0.5"><Value>{bn(application.balanceYears)}</Value></td>
                    <td className="border-r border-black p-0.5"><Value>{bn(application.balanceMonths)}</Value></td>
                    <td className="p-0.5"><Value>{bn(application.balanceDays)}</Value></td>
                  </tr>
                </tbody>
              </table>

              <div className="p-2 text-[11px] leading-relaxed text-justify">
                প্রত্যয়ন করা যাইতেছে যে, প্রার্থীত ছুটি সিভিল সার্ভিস রেগুলেশন/ফান্ডামেন্টাল রুলস-এর-----------------অনুচ্ছেদ/বিধি অনুযায়ী প্রাপ্য।
              </div>
            </div>

            <div className="p-2 text-xs">তারিখ---------------------{appYear}</div>
          </div>

          <div className="w-[38%] p-2 flex flex-col justify-between">
            <div>
              <div className="text-center text-[11.5px] font-normal leading-snug pb-2 border-b border-black mb-2">
                অফিস প্রধানের সুপারিশ এবং অনুপস্থিতিকালে তাহার কার্য সম্পাদনের ব্যবস্থা।
              </div>
              <p className="text-justify app-body-justified text-[11px] leading-relaxed">
                সংশ্লিষ্ট শিক্ষক <Value>{bn(application.leaveStartDate)}</Value> হতে <Value>{bn(application.leaveEndDate)}</Value> পর্যন্ত অথবা ছুটি ভোগের তারিখ হতে <Value>{bn(application.leaveDays)}</Value>(<Value>{application.leaveDaysWords}</Value>) দিনের জন্য <Value>{application.leavePurpose}</Value> <Value>{application.destinationCountry}</Value> গমন ও অবস্থানের অনুমতি চেয়ে আবেদন করেছেন। প্রার্থীত ছুটি মঞ্জুরসহ উল্লিখিত দেশ গমনের অনুমতি প্রদানের জন্য সুপারিশ করা হলো।
              </p>
            </div>

            <div className="text-xs pt-4">তারিখ----------------------{appYear}</div>
          </div>
        </div>

        <div className="text-center text-xs mb-1">আদেশ</div>
        <div className="text-[11px] leading-normal pt-1">
          <div>নং সম(বাঃ বাঃ কোঃ)/ভেটিং/ফ-১৩৩/৮৫-৩৬৭৪, তাং ৬-১১-৮৫ ইং।</div>
          <div>বাঃ সঃ মুঃ-৯৯/২০০০-১০০৪২এফ (কম-১)-৪ লক্ষ কপি, ২০০০।</div>
        </div>
      </div>

      {/* ================= PAGE 3: বহি: বাংলাদেশ ভ্রমণের জন্য আবেদন ================= */}
      <div className="leave-print-page text-[13px] leading-[1.8] flex flex-col justify-between">
        <div>
          <div className="text-center text-base mb-5 underline font-normal tracking-wide">
            বহি: বাংলাদেশ ভ্রমণের জন্য আবেদন
          </div>

          <div className="space-y-2.5 text-[13px]">
            <div className="grid grid-cols-12">
              <div className="col-span-6">১। আবেদনকারীর নাম</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5">জনাব <Value>{application.applicantName}</Value></div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">২। পিতার নাম</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5">জনাব <Value>{application.fatherName}</Value></div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">৩। পদবী ও অফিসের ঠিকানা</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5 leading-snug">
                <Value>{application.designation}</Value>, <Value>{application.schoolName}</Value>, <Value>{application.upazilaName}</Value>, <Value>{application.districtName}</Value>।
              </div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">৪। বেতন স্কেল</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5"><Value>{bn(application.salaryScale)}</Value></div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">৫। চাকুরিতে যোগদানের তারিখ</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5"><Value>{bn(application.joiningDate)}</Value> খ্রি.।</div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">৬। জন্ম তারিখ</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5"><Value>{bn(application.birthDate)}</Value> খ্রি.।</div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">৭। কোন দেশ ভ্রমণ করিতে ইচ্ছুক/স্থানসমূহ সুনির্দিষ্টভাবে তা উল্লেখ করতে হইবে</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5"><Value>{application.destinationCountry}</Value></div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">৮। ভ্রমণের উদ্দেশ্য</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5"><Value>{application.leavePurpose}</Value>।</div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">৯। প্রস্তাবিত ভ্রমণের সময়কাল</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5 leading-snug">
                <Value>{bn(application.leaveStartDate)}</Value> হতে <Value>{bn(application.leaveEndDate)}</Value> পর্যন্ত বা ছুটি ভোগের তারিখ হতে <Value>{bn(application.leaveDays)}</Value> (<Value>{application.leaveDaysWords}</Value>) দিন।
              </div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">১০। ভ্রমণকালে আবেদনকারী একা থাকিবেন নাকি সংসারের অন্য সদস্যদের বা অন্যান্যদের সাথে থাকিবেন</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5"><Value>{bn(application.familyAccompany)}</Value>।</div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">১১। ভ্রমণে যদি সংসারের অন্য কোন সদস্য বা অন্যান্য কেহ জড়িত থাকেন তবে তাহার নাম, বয়স এবং আবেদনকারীর সঙ্গে তাহার সম্পর্ক বর্ণনা করিতে হইবে</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5"><Value>{bn(application.familyDetails)}</Value>।</div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">১২। ঐ দেশ শেষ বারের মত কখন ভ্রমণ করিয়াছেন এবং স্থায়িত্ব কত দিন ছিল</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5"><Value>{bn(application.previousTravelDetails)}</Value>।</div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">১৩। কাঙ্ক্ষিত ভ্রমণের ব্যয় নির্বাহ কিভাবে করা হইবে (যদি বিদেশে অবস্থানরত কোন আত্মীয় উক্ত ব্যয় বহন করিতে চান তবে তাহার নাম, ঠিকানা ও আবেদনকারীর সঙ্গে তাহার সম্পর্ক বর্ণনা করিতে হইবে)</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5"><Value>{bn(application.expenseSource)}</Value>।</div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">১৪। ছুটি পাওনা আছে কিনা</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5">পাওনা আছে, ছুটির হিসাব বিবরণী সংযুক্ত।</div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6">১৫। ভ্রমণকাল কি হিসাবে গণ্য করা হইবে?</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5"><Value>{application.leaveType}</Value>।</div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="w-72 ml-auto text-center text-xs mb-6">
            <div className="h-12"></div>
            <div>আবেদনকারীর নাম: <Value>{application.applicantName}</Value></div>
          </div>

          <div className="space-y-2 text-xs pt-3 border-t border-black">
            <div className="grid grid-cols-12">
              <div className="col-span-6">১৬। মন্ত্রণালয়/বিভাগীয় অফিস প্রধানের সুপারিশ যিনি এই মর্মে প্রত্যয়ন করিবেন যে, উক্ত ভ্রমণের জন্য কোন বৈদেশিক মুদ্রার প্রয়োজন হইবে না</div>
              <div className="col-span-1 text-center">:</div>
              <div className="col-span-5">প্রত্যয়ন সংযুক্ত।</div>
            </div>

            <div className="w-72 ml-auto text-center text-xs pt-6">
              <div className="h-12"></div>
              <div>মন্ত্রণালয়/বিভাগীয় অফিস প্রধানের স্বাক্ষর</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PAGE 4: বিগত বছরের ভ্রমণ বৃত্তান্ত ও প্রত্যয়ন পত্র ================= */}
      <div className="leave-print-page text-[13px] leading-relaxed">
        <div>
          <div className="text-center text-xs mb-3 font-normal">
            বিদেশ গমনেচ্ছু কর্মকর্তা বিগত বছরের বিদেশ ভ্রমণ/অবস্থান-এর বৃত্তান্ত
          </div>

          <table className="w-full border-collapse bordered-table text-[11px]">
            <thead>
              <tr className="text-center">
                <th className="w-10">ক্রম</th>
                <th className="w-48">কর্মকর্তা/কর্মচারীর নাম, পদবী, বেতনক্রম, বয়স, সংস্থা/দপ্তর, বিভাগ/মন্ত্রণালয়</th>
                <th colSpan={3}>দেশের নাম ও অবস্থান কাল</th>
                <th>ভ্রমণ/অবস্থান-এর উদ্দেশ্য (সরকারি/ব্যক্তিগত কাজ, প্রশিক্ষণ, পোস্টিং, প্রেষণ)</th>
                <th>মন্তব্য (উদ্যোক্তা, খরচের উৎস ও পরিমাণ ইত্যাদি)</th>
              </tr>
              <tr className="text-center text-[10px]">
                <th></th><th></th><th>দেশ</th><th>থেকে</th><th>পর্যন্ত</th><th></th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center align-top">০১</td>
                <td className="p-2 align-top text-xs leading-relaxed">
                  <div>জনাব <Value>{application.applicantName}</Value></div>
                  <div><Value>{application.designation}</Value></div>
                  <div>বেতন ক্রম: <Value>{bn(application.salaryScale)}</Value></div>
                  <div>বয়স: <Value>{bn(application.calculatedAge)}</Value></div>
                </td>
                <td className="text-center align-middle">---</td>
                <td className="text-center align-middle">---</td>
                <td className="text-center align-middle">---</td>
                <td className="text-center align-middle text-xs">প্রযোজ্য নয়</td>
                <td className="text-center align-middle text-xs">প্রযোজ্য নয়</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-28 pt-8">
          <div className="text-center mb-4 leading-tight">
            <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
            <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
            <div><Value>{application.upazilaName}</Value>, <Value>{application.districtName}</Value>।</div>
            <div className="mt-3 text-sm underline font-normal">প্রত্যয়ন পত্র</div>
          </div>

          <p className="text-justify app-body-justified text-xs leading-loose indent-8 mb-14">
            জনাব <Value>{application.applicantName}</Value>, পিতার নাম: <Value>{application.fatherName}</Value>, কর্মস্থল: <Value>{application.schoolName}</Value>, উপজেলা: <Value>{application.upazilaName}</Value>, জেলা: <Value>{application.districtName}</Value>, <Value>{application.designation}</Value> পদে স্থায়ী ভিত্তিতে নিযুক্ত আছেন। পুলিশ বিভাগের মাধ্যমে ইতোপূর্বে পরিচয় ও চরিত্র প্রতিপাদিত হয়েছে। শিক্ষকের বিরুদ্ধে বিভাগীয় মামলা, ফৌজদারী মামলা এবং অডিট আপত্তি নেই এবং তাঁর বিরুদ্ধে কোনরূপ বিরূপ তথ্য নেই।
          </p>

          <div className="w-72 ml-auto text-center text-xs leading-normal">
            <div className="h-20"></div>
            <div>(<Value>{application.ddoName}</Value>)</div>
            <div><Value>{application.ddoDesignation}</Value></div>
            <div><Value>{application.upazilaName}</Value>, <Value>{application.districtName}</Value>।</div>
          </div>
        </div>
      </div>

      {/* ================= PAGE 5: পাঠদান প্রত্যয়ন, বিদ্যালয় পরিসংখ্যান ও অঙ্গীকার নামা ================= */}
      <div className="leave-print-page text-[13px] leading-relaxed">
        <div className="mb-14">
          <div className="text-center mb-3 leading-tight">
            <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
            <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
            <div><Value>{application.upazilaName}</Value>, <Value>{application.districtName}</Value>।</div>
            <div className="mt-2 text-sm underline font-normal">পাঠদান সংক্রান্ত প্রত্যয়ন পত্র</div>
          </div>

          <p className="text-justify app-body-justified text-xs leading-loose indent-8 mb-3">
            প্রত্যয়ন করা যাইতেছে যে, <Value>{application.districtName}</Value> জেলার <Value>{application.upazilaName}</Value> উপজেলাধীন <Value>{application.schoolName}</Value> এ বর্তমানে <Value>{bn(application.workingTeachers)}</Value> (<Value>{application.workingTeachersWords}</Value>) জন শিক্ষক কর্মরত আছেন। <Value>{application.designation}</Value>, জনাব <Value>{application.applicantName}</Value>&apos;কে <Value>{application.leavePurpose}</Value> <Value>{application.destinationCountry}</Value> গমনের অনুমতিসহ <Value>{bn(application.leaveDays)}</Value>(<Value>{application.leaveDaysWords}</Value>) দিনের বহি:বাংলাদেশ ছুটি মঞ্জুর করলে তার ছুটি কালীন স্কুলের পাঠদান কার্যক্রমে যাতে কোনরূপ বিঘ্ন না ঘটে এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণ করা হবে।
          </p>

          <p className="text-left text-xs">
            তার বিদেশ ভ্রমণে সরকারের উপর কোন আর্থিক দায় দায়িত্ব বর্তাবে না।
          </p>
        </div>

        <div className="mb-14">
          <div className="text-center text-xs mb-1 underline">
            বিদ্যালয়ে মঞ্জুরীকৃত পদসংখ্যা, কর্মরত শিক্ষক সংখ্যা এবং ছাত্র/ছাত্রী সংখ্যা সংক্রান্ত তথ্য
          </div>
          <div className="flex justify-between text-xs mb-1">
            <div>উপজেলা: <Value>{application.upazilaName}</Value></div>
            <div>জেলা: <Value>{application.districtName}</Value></div>
          </div>

          <table className="w-full border-collapse bordered-table text-xs">
            <thead>
              <tr className="text-center">
                <th className="w-14">ক্রমিক নং</th>
                <th>বিদ্যালয়ের নাম</th>
                <th className="w-28">মঞ্জুরীকৃত পদসংখ্যা</th>
                <th className="w-28">কর্মরত শিক্ষক সংখ্যা</th>
                <th className="w-36">ছাত্র/ছাত্রী সংখ্যা</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center align-middle">০১</td>
                <td className="p-2 align-middle">
                  <div><Value>{application.schoolName}</Value></div>
                  <div><Value>{application.upazilaName}</Value>, <Value>{application.districtName}</Value>।</div>
                </td>
                <td className="text-center align-middle"><Value>{bn(application.sanctionedPosts)}</Value></td>
                <td className="text-center align-middle"><Value>{bn(application.workingTeachers)}</Value></td>
                <td className="p-2 text-left leading-tight align-middle text-[11px]">
                  <div>ছাত্র= <Value>{bn(application.maleStudents)}</Value> জন</div>
                  <div>ছাত্রী= <Value>{bn(application.femaleStudents)}</Value> জন</div>
                  <div className="border-t border-black pt-0.5 font-normal">মোট= <Value>{bn(application.totalStudents)}</Value> জন</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <div className="text-center text-sm mb-3 underline font-normal">অঙ্গীকার নামা</div>
          <p className="text-justify app-body-justified text-xs leading-loose indent-8 mb-8">
            এই মর্মে ঘোষণা করছি যে, আমি বহি:বাংলাদেশ ছুটি সাপেক্ষে <Value>{bn(application.leaveDays)}</Value>(<Value>{application.leaveDaysWords}</Value>) দিনের জন্য <Value>{application.leavePurpose}</Value> <Value>{application.destinationCountry}</Value> যেতে আগ্রহী। আমার উক্ত বিদেশ গমনের সময় সম্পূর্ণ ব্যয় আমি নিজে বহন করব। আমার এই বিদেশ গমনের সাথে সরকারি ব্যয় বা বৈদেশিক মুদ্রার কোন সম্পর্ক নাই।
          </p>

          <div className="w-72 ml-auto text-center text-xs leading-normal pt-4">
            <div className="h-20"></div>
            <div>(<Value>{application.applicantName}</Value>)</div>
            <div><Value>{application.designation}</Value></div>
            <div><Value>{application.schoolName}</Value></div>
            <div><Value>{application.upazilaName}</Value>, <Value>{application.districtName}</Value>।</div>
          </div>
        </div>
      </div>

      {/* ================= PAGE 6: Leave Account Form (Landscape) ================= */}
      <div className="leave-print-page leave-account-landscape text-[12.5px] leading-normal">
        <div className="text-center text-lg mb-4 font-normal underline tracking-wider">
          Leave Account Form
        </div>

        <div className="flex justify-between items-center text-xs mb-3 px-1">
          <div>Leave Account of: <Value>{application.applicantName}</Value></div>
          <div>Designation: <Value>{application.designation}</Value></div>
          <div>Office: <Value>{application.schoolName}</Value></div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs mb-4 px-1">
          <div>Date of commencement of service: <Value>{bn(application.joiningDate)}</Value> খ্রি.।</div>
          <div className="text-center">Leave Rules: As per PLR- 1959.</div>
          <div className="text-right">Date of Birth: <Value>{bn(application.birthDate)}</Value> খ্রি.।</div>
        </div>

        <table className="w-full border-collapse bordered-table text-[11px] text-center mb-8">
          <thead>
            <tr>
              <th colSpan={5} className="py-1.5">মোট চাকুরী কাল</th>
              <th colSpan={3} className="py-1.5">অর্জিত ছুটি (অর্ধগড় বেতনে)</th>
              <th colSpan={3} className="py-1.5">জমাকৃত প্রাপ্য অর্জিত ছুটি (অর্ধগড় বেতনে)</th>
              <th colSpan={3} className="py-1.5">মোট অর্জিত ছুটি (অর্ধগড় বেতনে)</th>
              <th colSpan={5} className="py-1.5">গৃহীত ছুটি (অর্ধগড় বেতনে)</th>
              <th colSpan={3} className="py-1.5">ব্যালেন্স (অর্ধগড় বেতনে)</th>
              <th rowSpan={3} className="w-16">মন্তব্য</th>
            </tr>
            <tr>
              <th rowSpan={2} className="w-20">হইতে</th>
              <th rowSpan={2} className="w-20">পর্যন্ত</th>
              <th colSpan={3}>সময়</th>
              <th rowSpan={2} className="w-12">বছর</th><th rowSpan={2} className="w-12">মাস</th><th rowSpan={2} className="w-12">দিন</th>
              <th rowSpan={2} className="w-12">বছর</th><th rowSpan={2} className="w-12">মাস</th><th rowSpan={2} className="w-12">দিন</th>
              <th rowSpan={2} className="w-12">বছর</th><th rowSpan={2} className="w-12">মাস</th><th rowSpan={2} className="w-12">দিন</th>
              <th rowSpan={2} className="w-20">হইতে</th>
              <th rowSpan={2} className="w-20">পর্যন্ত</th>
              <th colSpan={3}>সময়</th>
              <th rowSpan={2} className="w-12">বছর</th><th rowSpan={2} className="w-12">মাস</th><th rowSpan={2} className="w-12">দিন</th>
            </tr>
            <tr>
              <th className="w-10">বছর</th><th className="w-10">মাস</th><th className="w-10">দিন</th>
              <th className="w-10">বছর</th><th className="w-10">মাস</th><th className="w-10">দিন</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-9">
              <td className="p-1"><Value>{bn(application.serviceStartDate)}</Value></td>
              <td className="p-1"><Value>{bn(application.serviceCalculationDate)}</Value></td>
              <td><Value>{bn(application.totalServiceYears)}</Value></td>
              <td><Value>{bn(application.totalServiceMonths)}</Value></td>
              <td><Value>{bn(application.totalServiceDays)}</Value></td>
              <td><Value>{bn(application.earnedHalfPayYears)}</Value></td>
              <td><Value>{bn(application.earnedHalfPayMonths)}</Value></td>
              <td><Value>{bn(application.earnedHalfPayDays)}</Value></td>
              <td><Value>{bn(application.earnedHalfPayYears)}</Value></td>
              <td><Value>{bn(application.earnedHalfPayMonths)}</Value></td>
              <td><Value>{bn(application.earnedHalfPayDays)}</Value></td>
              <td><Value>{bn(application.earnedHalfPayYears)}</Value></td>
              <td><Value>{bn(application.earnedHalfPayMonths)}</Value></td>
              <td><Value>{bn(application.earnedHalfPayDays)}</Value></td>
              <td>==</td>
              <td>==</td>
              <td><Value>{takenY}</Value></td>
              <td><Value>{takenM}</Value></td>
              <td><Value>{takenD}</Value></td>
              <td><Value>{bn(application.balanceYears)}</Value></td>
              <td><Value>{bn(application.balanceMonths)}</Value></td>
              <td><Value>{bn(application.balanceDays)}</Value></td>
              <td></td>
            </tr>
            <tr className="h-8">
              <td></td><td></td><td></td><td></td><td></td>
              <td></td><td></td><td></td><td></td><td></td><td></td>
              <td></td><td></td><td></td><td></td><td></td><td></td>
              <td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr className="h-8">
              <td></td><td></td><td></td><td></td><td></td>
              <td></td><td></td><td></td><td></td><td></td><td></td>
              <td></td><td></td><td></td><td></td><td></td><td></td>
              <td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            <tr className="h-8">
              <td></td><td></td><td></td><td></td><td></td>
              <td></td><td></td><td></td><td></td><td></td><td></td>
              <td></td><td></td><td></td><td></td><td></td><td></td>
              <td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between items-end text-xs pt-8 px-4">
          <div className="text-left">
            <div>যাচাইকারী কর্মকর্তার স্বাক্ষর</div>
            <div className="mt-1">সীলমোহর</div>
          </div>
          <div className="text-center">
            <div className="h-16"></div>
            <div>উপজেলা শিক্ষা অফিসার</div>
            <div><Value>{application.upazilaName}</Value>, <Value>{application.districtName}</Value>।</div>
          </div>
        </div>
      </div>
    </div>
  );
};
