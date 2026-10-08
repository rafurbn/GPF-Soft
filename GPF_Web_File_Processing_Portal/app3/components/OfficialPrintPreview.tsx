import React, { useState } from 'react';
import { Printer, X, ZoomIn, ZoomOut } from 'lucide-react';
import { GpfFinalFormData } from '../../src/types';
import { formatBanglaCurrency, toBanglaNumber } from '../../src/utils/numberToBanglaWords';
import { calculatePrlDate } from '../../src/utils/bengaliConverter';

interface DocumentTemplateProps {
  formData: GpfFinalFormData;
  pageFilter?: number | 'all';
  onClose?: () => void;
  initialEditMode?: boolean;
  embedded?: boolean;
}

export const OfficialPrintPreview: React.FC<DocumentTemplateProps> = ({
  formData,
  pageFilter = 'all',
  onClose,
  embedded = false,
}) => {
  const [zoom, setZoom] = useState<number>(100);

  const prlDateComputed = formData.prlDate || (formData.birthDate ? calculatePrlDate(formData.birthDate) : '');

  const data = {
    year: formData.yearSession,
    apply_date: formData.applicationDate,
    receiver_info: formData.recipient,
    applicant_name: formData.applicantName,
    designation: formData.designation,
    school_name: formData.schoolName,
    date_of_birth: formData.birthDate,
    prl_date: prlDateComputed,
    gpf_acc_no: formData.gpfAccountNo,
    total_deposited_amount: formData.totalDepositedAmount,
    requested_amount: formData.requestedAmountNumber,
    gpf_total_balance_words: formData.requestedAmountWords,
    basic_salary: formData.basicSalary,
    ddo_name: formData.ddoName,
    ddo_designation: formData.ddoDesignation,
    upazila_name: formData.upazila,
    district_name: formData.district,
    custom_memo_no: '',
  };
  const formattedRequestedAmount = formatBanglaCurrency(data.requested_amount);
  const formattedBalance = formatBanglaCurrency(data.total_deposited_amount);
  const formattedSalary = formatBanglaCurrency(data.basic_salary);
  const formattedDate = toBanglaNumber(data.apply_date);
  const formattedAccNo = toBanglaNumber(data.gpf_acc_no);
  const formattedYear = toBanglaNumber(data.year);
  const formattedPrlDate = data.prl_date ? toBanglaNumber(data.prl_date) : '';
  const cleanReceiver = data.receiver_info.replace(/\n+/g, ' ');
  const singleLineReceiver = cleanReceiver || `উপজেলা শিক্ষা অফিসার, ${data.district_name || 'সিলেট'}`;
  const shouldRender = (page: number) => pageFilter === 'all' || pageFilter === page;

  return (
    <div className={embedded ? 'contents' : 'fixed inset-0 z-50 overflow-auto bg-black/60 p-4 print:static print:overflow-visible print:bg-white print:p-0'} {...(!embedded ? { role: 'dialog', 'aria-modal': true, 'aria-label': 'প্রিন্ট প্রিভিউ' } : {})}>
      {!embedded && <div className="sticky top-0 z-10 mx-auto mb-4 flex max-w-[210mm] items-center justify-between bg-white p-3 shadow print:hidden">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <span className="flex h-8 w-8 items-center justify-center bg-slate-100"><Printer size={18} /></span>
          <span>প্রিন্ট প্রিভিউ</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" title="জুম কমান" aria-label="জুম কমান" className="p-2 hover:bg-slate-100" onClick={() => setZoom((value) => Math.max(70, value - 10))}>
            <ZoomOut size={18} />
          </button>
          <span className="min-w-12 text-center text-sm tabular-nums">{zoom}%</span>
          <button type="button" title="জুম বাড়ান" aria-label="জুম বাড়ান" className="p-2 hover:bg-slate-100" onClick={() => setZoom((value) => Math.min(140, value + 10))}>
            <ZoomIn size={18} />
          </button>
          <button type="button" title="প্রিন্ট" aria-label="প্রিন্ট" className="p-2 hover:bg-slate-100" onClick={() => window.print()}>
            <Printer size={18} />
          </button>
          {onClose && (
            <button type="button" title="বন্ধ করুন" aria-label="বন্ধ করুন" className="p-2 hover:bg-slate-100" onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>}
      <div className="mx-auto w-fit max-w-full overflow-auto">
      <div id="printable-document" className="official-print-document flex w-full flex-col items-center gap-8 print:gap-0 print:block font-normal font-bangla-serif" style={{ zoom: zoom / 100 }}>
      {/* ================= ১ম পাতা: আবেদনপত্র ================= */}
      {shouldRender(1) && (
        <div className="a4-page text-[14px] leading-relaxed block border border-slate-200 print:border-none" id="doc-page-1">
          {/* তারিখ */}
          <div className="text-left text-[14px] mb-5 font-normal">
            তারিখ: {formData.applicationDate} খ্রি.।
          </div>

          {/* প্রাপক */}
          <div className="mb-5 text-left font-normal">
            <div>বরাবর</div>
            <div className="whitespace-pre-line mt-1 font-normal">
              {data.receiver_info || `জেলা প্রাথমিক শিক্ষা অফিসার\n${data.district_name || 'সিলেট'}।`}
            </div>
          </div>

          <div className="mb-5 font-normal">
            মাধ্যম: যথাযথ কর্তৃপক্ষ।
          </div>

          <div className="mb-5 text-justify font-normal">
            বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল এ জমাকৃত সমূদয় টাকা চুড়ান্ত উত্তোলন প্রসঙ্গে।
          </div>

          <div className="mb-3 font-normal">জনাব,</div>

          {/* মূল বক্তব্য */}
          <div className="text-justify mb-5 leading-relaxed font-normal" style={{ textAlign: 'justify' }}>
            সবিনয় নিবেদন এই যে, আমি নিম্ন স্বাক্ষরকারী {data.school_name || '...................................................'} এর {data.designation || '................................'}। আমার সাধারণ ভবিষ্যৎ তহবিল হিসাব নং {formattedAccNo || '............................'}। আমি বিগত {formattedPrlDate || '............................'} তারিখ অবসর উত্তর ছুটি (PRL) এ গমন করেছি। এমতাবস্থায় আমার সাধারণ ভবিষ্যৎ তহবিলে জমাকৃত সমূদয় {formattedRequestedAmount || '..................'} (কথায়: {data.gpf_total_balance_words || '...........................................................................'}) টাকা চুড়ান্ত উত্তোলনের অনুমতি দানের জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
          </div>

          <div className="text-justify mb-12 leading-relaxed font-normal" style={{ textAlign: 'justify' }}>
            অতএব, মহোদয়ের নিকট সবিনয় নিবেদন এই যে, আমার সাধারণ ভবিষ্যৎ তহবিল হিসাব এ জমাকৃত সমূদয় টাকা চুড়ান্ত উত্তোলনের অনুমতি দানে আপনার সদয় মর্জি হয়।
          </div>

          {/* স্বাক্ষর অংশ */}
          <div className="text-left text-[14px] leading-normal font-normal">
            <div>বিনীত</div>
            <div>নিবেদক</div>
            <div className="mb-10">আপনার বিশ্বস্ত</div>
            <div>{data.applicant_name || '................................................'}</div>
            <div>{data.designation || '................................'}</div>
            <div>{data.school_name || '................................................'}</div>
            {(data.upazila_name || '...............')}, {(data.district_name || '...............')}।

          </div>
        </div>
      )}

      {/* ================= ২য় পাতা: ক্ষমতাপত্র প্রসঙ্গে আবেদনপত্র ================= */}
      {shouldRender(1) && (
        <div className="a4-page text-[14px] leading-relaxed block border border-slate-200 print:border-none" id="doc-page-1b">
          {/* তারিখ */}
          <div className="text-left text-[14px] mb-5 font-normal">
            তারিখ: {formData.applicationDate} খ্রি.।
          </div>

          {/* প্রাপক */}
          <div className="mb-5 text-left font-normal">
            <div>বরাবর</div>
            <div className="whitespace-pre-line mt-1 font-normal">
              {data.receiver_info || `উপজেলা হিসাব রক্ষন কর্মকর্তা\n${data.district_name || 'সিলেট'}।`}
            </div>
          </div>

          <div className="mb-5 font-normal">
            মাধ্যম: যথাযথ কর্তৃপক্ষ।
          </div>

          <div className="mb-5 text-justify font-normal">
            বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল এ জমাকৃত সমূদয় টাকা উত্তোলনের ক্ষমতাপত্র প্রদান প্রসঙ্গে।
          </div>

          <div className="mb-3 font-normal">জনাব,</div>

          {/* মূল বক্তব্য */}
          <div className="text-justify mb-5 leading-relaxed font-normal" style={{ textAlign: 'justify' }}>
            সবিনয় নিবেদন এই যে, আমি নিম্ন স্বাক্ষরকারী {data.school_name || '...................................................'} এর {data.designation || '................................'}। আমার সাধারণ ভবিষ্যৎ তহবিল হিসাব নং {formattedAccNo || '............................'}। আমি বিগত {formattedPrlDate || '............................'} তারিখ অবসর উত্তর ছুটি (PRL) এ গমন করেছি। এমতাবস্থায় আমার সাধারণ ভবিষ্যৎ তহবিলে জমাকৃত সমূদয় {formattedRequestedAmount || '..................'} (কথায়: {data.gpf_total_balance_words || '...........................................................................'}) টাকা চুড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদানের জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
          </div>

          <div className="text-justify mb-12 leading-relaxed font-normal" style={{ textAlign: 'justify' }}>
            অতএব, মহোদয়ের নিকট সবিনয় নিবেদন এই যে, আমার সাধারণ ভবিষ্যৎ তহবিল হিসাব এ জমাকৃত সমূদয় টাকা চুড়ান্ত উত্তোলনের ক্ষমতাপত্র প্রদানে আপনার সদয় মর্জি হয়।
          </div>

          {/* স্বাক্ষর অংশ */}
          <div className="text-left text-[14px] leading-normal font-normal">
            <div>বিনীত</div>
            <div>নিবেদক</div>
            <div className="mb-10">আপনার বিশ্বস্ত</div>
            <div>{data.applicant_name || '................................................'}</div>
            <div>{data.designation || '................................'}</div>
            <div>{data.school_name || '................................................'}</div>
            {(data.upazila_name || '...............')}, {(data.district_name || '...............')}।

          </div>
        </div>
      )}


      {/* ==================== ৩নং পাতা: অডিট অফিসে প্রভিডেন্ট ফান্ড চুড়ান্ত অর্থ প্রদানের কেস নিষ্পত্তিকরণের জন্য বেঙ্গল অডিট ম্যানুয়েলের অনুচ্ছেদ ৬৬৩ অনুযায়ী প্রয়োজনীয় বিবরণ। ==================== */}
      {shouldRender(2) && (
      <div className="a4-page text-[13px] leading-[1.6] text-gray-900 bg-white mx-auto shadow-md p-[16mm_16mm] max-w-[210mm] flex flex-col" id="doc-page-2">
        {/* Title Header */}
        <div className="text-center mb-5">
          <h1 className="text-[16px] font-bold leading-relaxed max-w-[92%] mx-auto tracking-normal">
            অডিট অফিসে প্রভিডেন্ট ফান্ড চূড়ান্ত অর্থ প্রদানের কেস নিষ্পত্তিকরণের জন্য <br />
            <span className="underline decoration-1 underline-offset-4">
              বেঙ্গল অডিট ম্যানুয়েলের অনুচ্ছেদ ৬৬৩ অনুযায়ী প্রয়োজনীয় বিবরণ।
            </span>
          </h1>
        </div>

        {/* Numbered items (plain list, no table lines — matches provided layout) */}
        <div className="space-y-5 text-[15px] leading-[2.2]">
          {/* Item 1 */}
          <div className="flex items-start">
            <span className="w-8 font-semibold shrink-0">১ ।</span>
            <div className="grow flex flex-wrap items-baseline gap-x-1">
              <span>চাঁদা দাতার নাম:</span>
              <span className="font-medium border-b border-dotted border-gray-700 px-1">
                {data.applicant_name || '..................'}
              </span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start">
            <span className="w-8 font-semibold shrink-0">২ ।</span>
            <div className="grow space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-1">
                <span>অবসর গ্রহণ/পদত্যাগ/কর্মচ্যুতি/কর্মখারিজ/অবসর গ্রহণের পূর্বে প্রস্তুতিমূলক ছুটি/চাকুরি হইতে বিতাড়িত এর প্রকৃত তারিখ:</span>
                <span className="font-medium border-b border-dotted border-gray-700 px-1">
                  {formattedPrlDate || '........................'}
                </span>
              </div>
              <div className="pl-4 space-y-0.5 text-[12px] text-gray-700">
                <div>(ক) কর্ম খারিজের ক্ষেত্রে উহার কারণ বলিতে হইবে।</div>
                <div>(খ) পদচ্যুতির ক্ষেত্রে কর্মচারী আপীল করিয়াছে কি বা করিতে ইচ্ছা করিয়াছে কি ?</div>
                <div>(গ) পদত্যাগের ক্ষেত্রে বলিতে হইবে যে তাহার পদত্যাগপত্র গ্রহণ করা হইয়াছে কি ?</div>
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start">
            <span className="w-8 font-semibold shrink-0">৩ ।</span>
            <div className="grow flex flex-wrap items-baseline gap-x-1">
              <span>নির্ভুল জি. পি. ফান্ড হিসাব নং-</span>
              <span className="font-medium border-b border-dotted border-gray-700 px-1">
                {formattedAccNo || '........................'}
              </span>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-start">
            <span className="w-8 font-semibold shrink-0">৪ ।</span>
            <div className="grow leading-relaxed">
              মঞ্জুরকারী কর্তৃপক্ষের নিকট হইতে একটি সনদপত্র এই মর্মে যে পূর্ববর্তী ১২ (কনটিনজেন্সি ঘটনার ১২) সময়ে তাহাকে জি. পি. ফান্ড হইতে কোন অগ্রিম দেওয়া হইয়াছে কিনা, জদি দেওয়া হইয়া থাকে তা হইলে অগ্রিমের পূর্ণ বিবরণ{' '}
              <span className="border-b border-dotted border-gray-700 px-2 font-medium">প্রযোজ্য নয়</span>
            </div>
          </div>

          {/* Item 5 */}
          <div className="flex items-start">
            <span className="w-8 font-semibold shrink-0">৫ ।</span>
            <div className="grow leading-relaxed">
              জি. পি. ফান্ড হিসাব হইতে অর্থ প্রদানকৃত জীবন বীমা পলিসির বিবরণ ১২ মাস (বার মাস) সময়ে প্রিমিয়ামের জন্য উত্তোলনের বিবরণ{' '}
              <span className="border-b border-dotted border-gray-700 px-2 font-medium">প্রযোজ্য নয়</span>
            </div>
          </div>

          {/* Item 6 */}
          <div className="flex items-start">
            <span className="w-8 font-semibold shrink-0">৬ ।</span>
            <div className="grow leading-relaxed">
              <span>সর্ব শেষ ফান্ড হইতে কর্তনকৃত চাঁদার পরিমাণ টাকা </span>
              <span className="font-medium border-b border-dotted border-gray-700 px-2">প্রযোজ্য নয়</span>
              <span> এবং ভাউচার নং- </span>
              <span className="font-medium border-b border-dotted border-gray-700 px-2">..........</span>
              <span> টোকেন নং </span>
              <span className="font-medium border-b border-dotted border-gray-700 px-2">..................</span>
              <span> তাং </span>
              <span className="font-medium border-b border-dotted border-gray-700 px-2">..................</span>
              <span> অগ্রিম উত্তোলন জনিত টাকা বেতন হইতে কর্তনকৃত ফেরত টাকা।</span>
            </div>
          </div>

          {/* Item 7 */}
          <div className="flex items-start">
            <span className="w-8 font-semibold shrink-0">৭ ।</span>
            <div className="grow flex flex-wrap items-baseline gap-x-1">
              <span>যে ট্রেজারীতে অর্থ প্রদান ইচ্ছা করা হয় তাহার নাম: </span>
              <span className="font-medium border-b border-dotted border-gray-700 px-1">
                উপজেলা হিসাবরক্ষণ অফিস, {data.upazila_name || 'বিয়ানীবাজার'}, {data.district_name || 'সিলেট'}।
              </span>
            </div>
          </div>

          {/* Item 8 */}
          <div className="flex items-start">
            <span className="w-8 font-semibold shrink-0">৮ ।</span>
            <div className="grow">
              এই মর্মে একটি সনদপত্র সরকারী কর্মচারী স্থানীয় যথা বিভাগের প্রধান কর্তৃক প্রেরণ করিতে হইবে।
            </div>
          </div>

          {/* Item 9 */}
          <div className="flex items-start">
            <span className="w-8 font-semibold shrink-0">৯ ।</span>
            <div className="grow leading-relaxed">
              ন্যাশনাল সিকিউরিটি ইন্টেলিজেন্স এর নিকট হইতে অনুসন্ধানী সরকারী সম্পর্কে একটি সনদপত্রের প্রয়োজন যে সেবা পেশায় থাকাকালীন অবস্থায় তাহার কার্যকলাপ কিরূপ ছিল এবং সে ভবিষ্যতে বাংলাদেশে থাকিতে ইচ্ছা করে কিনা অর্থ মন্ত্রণালয়ের স্মারক নং মে এফ/১৭ ২৩-১-৭৪{' '}
              <span className="border-b border-dotted border-gray-700 px-2 font-medium">প্রযোজ্য নয় ।</span>
            </div>
          </div>

          {/* Item 10 */}
          <div className="flex items-start">
            <span className="w-8 font-semibold shrink-0">১০ ।</span>
            <div className="grow leading-relaxed">
              জি. পি. ফান্ডের টাকা দাবী করিয়া চাঁদা দাতা/মনোনীত ব্যক্তির নিকট হইতে প্রাপ্ত মূল দরখাস্তটি অফিস প্রধান কর্তৃক অগ্রবর্তী (ফরওয়ার্ড) করিতে হইবে{' '}
              <span className="border-b border-dotted border-gray-700 px-2 font-medium">ফরওয়ার্ড করা হইল।</span>
            </div>
          </div>

          {/* Item 11 */}
          <div className="flex items-start">
            <span className="w-8 font-semibold shrink-0">১১ ।</span>
            <div className="grow leading-relaxed">
              মনোনীত ব্যক্তি নাই এমন চাঁদা দাতার ক্ষেত্রে তাহার পরিবারের সদস্যদের বয়স এবং মৃত্যু কালে চাঁদা দাতার সংসার সম্পর্কে এর তালিকা মাইনর পুত্র ও বিবাহিত কন্যা ছাড়া প্রেরণ করিতে হইবে{' '}
              <span className="border-b border-dotted border-gray-700 px-2 font-medium">প্রযোজ্য নয়।</span>
            </div>
          </div>
        </div>

        {/* Footer Note — two columns with top border (matches provided image) */}
        <div className="mt-auto grid grid-cols-2 gap-6 text-[12.5px] leading-relaxed text-justify pt-4">
          <div style={{ borderTop: '1px solid #000000' }} className="pt-2">
            গেজেটেড চাঁদা দাতার ক্ষেত্রে একটি সনদপত্র উপরোক্ত ৩ ও ৭ অনুযায়ী যে কর্তৃপক্ষ চাঁদা দাতাকে অগ্রিম মঞ্জুরী করিতে যোগ্য তাহার দ্বারা প্রেরণ করিতে হইবে।
          </div>
          <div style={{ borderTop: '1px solid #000000' }} className="pt-2">
            নন-গেজেটেড চাঁদা দাতার ক্ষেত্রে অফিস প্রধানের স্বাক্ষর অথবা গেজেটেড অফিসারের ক্ষেত্রে চাঁদা দাতার নিজের স্বাক্ষর।
          </div>
        </div>
      </div>
  )}

      {/* ================= ৪নং পাতা: টি, আর ফরম নং ৩৭ (বিল) ================= */}
      {shouldRender(3) && (
        <div className="a4-page text-[12px] leading-normal block border border-slate-200 print:border-none" id="doc-page-3">
          <div className="text-left text-[12px] leading-tight mb-2 font-normal">
            <div>টি, আর ফরম নং ৩৭</div>
            <div>[এস, আর ৩২৪ (১) দ্রষ্টব্য]</div>
          </div>

          <div className="text-center text-[14px] mb-2 font-normal">
            কর্মচারীদের ভবিষ্যৎ তহবিল হইতে উত্তোলন/অগ্রিম গ্রহণের বিল
          </div>

          {/* Classification Code */}
          <div className="flex items-center justify-center gap-2 my-2.5 text-[11px] font-normal">
            <span>ভবিষ্যৎ তহবিলের শ্রেণী বিন্যাস কোড</span>
            <div className="flex border border-black">
              {['৭', '২', '৪', '৩', '২', '০', '০', '০', '০', '৯', '১', '০', '১'].map((digit, i) => (
                <span key={i} className="w-4 h-5 border-r border-black last:border-r-0 flex items-center justify-center font-normal">
                  {digit}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between text-[11px] mb-2 font-normal">
            <div>টোকেন নং................... তারিখ........................</div>
            <div>ভাউচার নং ........................... তারিখ .................</div>
          </div>

          {/* Main Bill Table — grid technique (borders always print) */}
          <div className="w-full my-2.5 text-[11px] font-normal" style={{ border: '1px solid #000000' }}>
            <div className="grid grid-cols-12 text-center font-normal" style={{ borderBottom: '1px solid #000000' }}>
              <div className="col-span-1 p-1 font-normal" style={{ borderRight: '1px solid #000000' }}>ক্রমিক নং</div>
              <div className="col-span-4 p-1 font-normal" style={{ borderRight: '1px solid #000000' }}>চাঁদা প্রদানকারীর নাম, বেতন মঞ্জুরী পত্রের নং ও তারিখ।</div>
              <div className="col-span-2 p-1 font-normal" style={{ borderRight: '1px solid #000000' }}>ভবিষ্যৎ তহবিলের হিসাব নং</div>
              <div className="col-span-3 font-normal" style={{ borderRight: '1px solid #000000' }}>
                <div className="p-1 font-normal" style={{ borderBottom: '1px solid #000000' }}>অগ্রিম/উত্তোলন</div>
                <div className="grid grid-cols-4 font-normal">
                  <div className="col-span-3 p-1 font-normal" style={{ borderRight: '1px solid #000000' }}>টাকা</div>
                  <div className="col-span-1 p-1 font-normal leading-none">পঃ</div>
                </div>
              </div>
              <div className="col-span-2 p-1 font-normal">প্রাপ্তির রশিদ</div>
            </div>
            {/* Body row */}
            <div className="grid grid-cols-12 font-normal items-stretch">
              <div className="col-span-1 p-2 text-center align-top font-normal" style={{ borderRight: '1px solid #000000' }}>১</div>
              <div className="col-span-4 p-2 align-top text-justify font-normal" style={{ borderRight: '1px solid #000000' }}>
                  <div>{data.applicant_name || '................................................'}</div>
                  <div>{data.designation || '................................'}</div>
                  <div>{data.school_name || '................................................'}</div>
                  <div>
                    {data.upazila_name || '...............'}, {data.district_name || '...............'}।
                  </div>
                  <div className="mt-1 text-justify font-normal">
                    এর সাধারণ ভবিষ্যৎ তহবিল-এ জমাকৃত সমূদয় টাকা চুড়ান্ত উত্তোলন এর বিল।
                  </div>
                  <div className="mt-1 font-normal">
                    মঞ্জুরী নং- .......................... তারিখ: .........................
                  </div>
              </div>
              <div className="col-span-2 p-2 text-center align-top font-normal" style={{ borderRight: '1px solid #000000' }}>
                {formattedAccNo || '................'}
              </div>
              <div className="col-span-3 font-normal" style={{ borderRight: '1px solid #000000' }}>
                <div className="grid grid-cols-4 h-full font-normal">
                  <div className="col-span-3 p-2 text-right align-top font-normal whitespace-nowrap" style={{ borderRight: '1px solid #000000' }}>
                    ={formattedRequestedAmount || '.........'}/-
                  </div>
                  <div className="col-span-1 p-2 text-center align-top font-normal">০০</div>
                </div>
              </div>
              <div className="col-span-2 p-2 text-center flex items-center justify-center font-normal">
                <div className="w-16 h-16 border border-dashed border-gray-400 mx-auto flex items-center justify-center text-[9px] text-gray-500 font-normal text-center leading-tight">
                  রেভিনিউ স্ট্যাম্প
                </div>
              </div>
            </div>
          </div>

          {/* প্রদেয় টাকা কথায় */}
          <div className="text-[13px] my-5 leading-relaxed font-normal">
            প্রয়োজনীয় প্রদেয় টাকা = {formattedRequestedAmount || '............'}/- (কথায়: {data.gpf_total_balance_words || '....................................................................................'}) টাকা বুঝিয়া পাইলাম।
          </div>

          {/* প্রত্যায়নসমূহ */}
          <div className="text-[12px] leading-relaxed my-5 font-normal">
            <div className="text-center mb-2.5 text-[13px] font-normal">প্রত্যয়নসমূহ</div>
            <p className="text-justify mb-4 leading-relaxed font-normal" style={{ textAlign: 'justify' }}>
              ১। প্রত্যয়ন করা যাইতেছে যে এই বিলে গৃহীত টাকা প্রকৃত প্রাপকদের মধ্যে বিলি করা হইয়াছে এবং প্রত্যেক ২০০ টাকার উপর প্রদানের ক্ষেত্রে রেভিনিউ স্ট্যাম্প লাগাইয়া সেগুলি যথাযথভাবে বাতিলপূর্বক আমার অফিসে রক্ষিত প্রাপ্তি বহিতে প্রাপ্তির রশিদ গ্রহণ করা হইয়াছে।
            </p>
            <p className="text-justify leading-relaxed font-normal" style={{ textAlign: 'justify' }}>
              ২। আরও প্রত্যয়ন করা যাইতেছে যে চাঁদা প্রদানকারীর হিসাবে স্থিতি তাহার অগ্রিম/উত্তোলিত অর্থ অপেক্ষা বেশী। (প্রযোজ্য ক্ষেত্রে) বীমা পলিসি নং *................................... রাষ্ট্রপতির অনুকূলে ন্যস্ত করা হইয়াছে এবং হিসাব রক্ষণ অফিসে দাখিল করিয়াছে অথবা (গৃহীতব্য) পলিসি হিসাব রক্ষণ অফিসে প্রেরণ করা হইয়াছে ও উক্ত অফিস কর্তৃক পত্র নং ..................... মারফত গৃহীত হইয়াছে *যদি একের অধিক পলিসি থাকে তবে তাহার বিবরণ এখানে প্রদান করা যাইতে পারে।
            </p>
          </div>

          {/* আয়ন কর্মকর্তা স্বাক্ষর */}
          <div className="flex justify-between items-end text-[12.5px] my-6 font-normal">
            <div className="leading-relaxed font-normal">
              <div>স্থান: {data.upazila_name || '.........................'}</div>
              <div className="mt-2.5">তারিখ: .........................</div>
              <div className="mt-2.5 text-gray-600">সীল</div>
            </div>
            <div className="text-left w-68 leading-normal font-normal">
              <div>আয়ন কর্মকর্তার স্বাক্ষর ........................................</div>
              <div className="mt-2.5">নাম: ..............................................................</div>
              <div className="mt-2.5">পদবী: ............................................................</div>
            </div>
          </div>

          {/* হিসাবরক্ষণ অফিস */}
          <div className="border-t border-black pt-5 mt-6 text-[12px] leading-relaxed font-normal">
            <div className="text-center mb-2.5 text-[12.5px] font-normal">হিসাব রক্ষণ অফিসে ব্যবহারের জন্য</div>
            <div className="mb-5 text-center leading-relaxed font-normal">
              টাকা .......................... (কথায়) ................................................................ প্রদানের জন্য পাস করা হইল।
            </div>
            <div className="flex justify-between text-center pt-3 font-normal">
              <div>
                <div>অডিটর</div>
                <div className="mt-2.5">নাম ...................................</div>
                <div className="mt-2.5">তারিখ ................................</div>
              </div>
              <div>
                <div>সুপার</div>
                <div className="mt-2.5">নাম ...................................</div>
                <div className="mt-2.5">তারিখ ................................</div>
              </div>
              <div>
                <div>হিসাব রক্ষণ কর্মকর্তা</div>
                <div className="mt-2.5">নাম ......................................</div>
                <div className="mt-2.5">তারিখ ...................................</div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-600 pt-5 font-normal">
            বাঃসঃমুঃ-৯৭/৯৮-১৮০৫১ এফ(কম-১) ১০ লক্ষ কপি, (সি-৫৯) ১৯
          </div>
        </div>
      )}

      {/* ================= ৬নং পাতা: সংযোজনী-৬ (নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ) ================= */}
      {shouldRender(4) && (
        <div className="a4-page text-[13px] leading-normal block border border-slate-200 print:border-none" id="doc-page-4">
          <div className="text-right text-[12px] mb-1 font-normal">সংযোজনী-৬</div>

          {/* শিরোনাম */}
          <div className="text-center text-[15px] mb-4 font-normal">
            নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ
          </div>

          <div className="mb-4 text-justify leading-relaxed text-[13.5px] font-normal" style={{ textAlign: 'justify' }}>
            ১। নিম্নে সাধারণ ভবিষ্য তহবিলে জমাকৃত সমূদয় টাকা চুড়ান্ত উত্তোলনের জন্য আবেদনকারী জনাব/বেগম{' '}
            {data.applicant_name || '................................................'},{' '}
            {data.designation || '................................'},{' '}
            {data.school_name || '................................................'},{' '}
            {data.upazila_name || '...............'},{' '}
            {data.district_name || '...............'} এর তিনটি নমুনা স্বাক্ষর সত্যায়িত করা হইল।
          </div>

          {/* Table 1: Specimen Signatures */}
          <table className="w-full border-none border-collapse text-[12.5px] mb-4 font-normal">
            <thead>
              <tr>
                <th className="border-none p-1.5 w-20 text-center font-normal">ক্রমিক নং</th>
                <th className="border-none p-1.5 text-center font-normal">পূর্ণ স্বাক্ষর</th>
                <th className="border-none p-1.5 text-center font-normal">সংক্ষিপ্ত স্বাক্ষর</th>
              </tr>
            </thead>
            <tbody>
              {[
                { num: '(১)' },
                { num: '(২)' },
                { num: '(৩)' }
              ].map((row, idx) => (
                <tr key={idx} className="h-16">
                  <td className="border-none p-1 text-center align-middle font-normal">{row.num}</td>
                  <td className="border-none p-1 text-center"></td>
                  <td className="border-none p-1 text-center"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mb-4 text-justify leading-relaxed text-[13.5px] font-normal" style={{ textAlign: 'justify' }}>
            ২। নিম্নে সাধারণ ভবিষ্য তহবিলে জমাকৃত সমূদয় টাকা চুড়ান্ত উত্তোলনের জন্য আবেদনকারী জনাব/বেগম{' '}
            {data.applicant_name || '................................................'},{' '}
            {data.designation || '................................'},{' '}
            {data.school_name || '................................................'},{' '}
            {data.upazila_name || '...............'},{' '}
            {data.district_name || '...............'} এর হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত করা হইল।
          </div>

          {/* Table 2: Thumb Impressions */}
          <table className="w-full border-none border-collapse text-[12.5px] mb-4 font-normal">
            <thead>
              <tr>
                <th className="border-none p-1.5 w-15 text-center font-normal">ক্রমিক নং</th>
                <th className="border-none p-1.5 w-44 text-left font-normal">আঙ্গুলের নাম</th>
                <th className="border-none p-1.5 text-center font-normal">ছাপ</th>
              </tr>
            </thead>
            <tbody>
              {[
                { num: '(১)', name: 'বাম/ডান কনিষ্ঠ' },
                { num: '(২)', name: 'বাম/ডান অনামিকা' },
                { num: '(৩)', name: 'বাম/ডান মধ্যমা' },
                { num: '(৪)', name: 'বাম/ডান তর্জনী' },
                { num: '(৫)', name: 'বাম/ডান বৃদ্ধাঙ্গুলি' },
              ].map((row, idx) => (
                <tr key={idx} className="h-15">
                  <td className="border-none p-1 text-center align-middle font-normal">{row.num}</td>
                  <td className="border-none p-1 text-left align-middle font-normal">{row.name}</td>
                  <td className="border-none p-1"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-justify mb-8 text-[13.5px] leading-relaxed font-normal" style={{ textAlign: 'justify' }}>
            ৩। উপযুক্ত নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ আমার সম্মুখে প্রদান করা হইয়াছে।
          </div>

          {/* সত্যায়নকারী সেকশন */}
          <div className="mt-8 mb-8 flex justify-end">
            <div className="text-center w-60 text-[13px] leading-tight font-normal">
              <div>
                সত্যায়নকারী প্রথম শ্রেণির গেজেটেড কর্মকর্তার
              </div>
              <div className="mt-1">তারিখসহ স্বাক্ষর ..........................................</div>
              <div className="mt-1 text-gray-700">সীলমোহর (নামযুক্ত)</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ৬নং পাতা: ফরোয়ার্ডিং পত্র (উপজেলা শিক্ষা অফিস) ================= */}
      {shouldRender(5) && (
        <div className="a4-page text-[13.5px] leading-relaxed block border border-slate-200 print:border-none" id="doc-page-5">
          <div className="pt-4 text-center mb-6 font-normal">
            <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
            <div>উপজেলা প্রাথমিক শিক্ষা অফিসারের কার্যালয়</div>
            <div>
              {data.upazila_name || 'বিয়ানীবাজার'}, {data.district_name || 'সিলেট'}।
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 font-normal">
            <div>
              স্মারক নং- উশিঅ/{data.upazila_name ? data.upazila_name.substring(0, 4) : 'উশি'}/{data.district_name ? data.district_name.substring(0, 4) : 'জেলা'}/{formattedYear || '২০২৬'}/{data.custom_memo_no || '.........'}
            </div>
            <div>
              তারিখ: {formattedDate || '........................'}
            </div>
          </div>

          <div className="mb-8 text-justify leading-snug font-normal">
            বিষয়: সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমূদয় টাকা চুড়ান্ত উত্তোলনের অনুমতি প্রসঙ্গে।
          </div>

          <p className="text-justify indent-10 mb-4 leading-relaxed font-normal" style={{ textAlign: 'justify' }}>
            উপর্যুক্ত বিষয়ের আলোকে জানানো যাচ্ছে যে, নিম্নোক্ত শিক্ষক তাঁর সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত সমূদয় টাকা চুড়ান্ত উত্তোলনের জন্য অনুমতি চেয়ে আবেদন করেছেন। এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য মহোদয়কে বিনীত অনুরোধ করা হলো।
          </p>

          {/* Applicant Summary Table */}
          <div className="w-full mb-4 text-[13.5px] font-normal" style={{ border: '1px solid #000000' }}>
            <div className="grid grid-cols-12 font-normal text-center" style={{ borderBottom: '1px solid #000000' }}>
              <div className="col-span-2 p-1.5 font-normal" style={{ borderRight: '1px solid #000000' }}>ক্র:নং</div>
              <div className="col-span-7 p-1.5 font-normal" style={{ borderRight: '1px solid #000000' }}>আবেদনকারীর বিবরণ</div>
              <div className="col-span-3 p-1.5 font-normal">অগ্রিমের ধরন</div>
            </div>
            <div className="grid grid-cols-12 font-normal min-h-[90px]">
              <div className="col-span-2 p-2 text-center align-top font-normal" style={{ borderRight: '1px solid #000000' }}>০১</div>
              <div className="col-span-7 p-2 align-top font-normal leading-relaxed" style={{ borderRight: '1px solid #000000' }}>
                  <div>{data.applicant_name || '................................................'}</div>
                  <div>{data.designation || '................................'}</div>
                  <div>{data.school_name || '................................................'}</div>
                  <div>
                    {data.upazila_name || '...............'}, {data.district_name || '...............'}
                  </div>
              </div>
              <div className="col-span-3 p-2 text-center flex items-center justify-center font-normal">
                চুড়ান্ত উত্তোলন
              </div>
            </div>
          </div>

          {/* সংযুক্তি অংশ */}
          <div className="mb-5 text-[13.5px] font-normal">
            <div className="mb-2 font-normal">সংযুক্তি:</div>
            <div className="space-y-1.5 pl-2 font-normal">
              <div className="flex justify-between">
                <span>১। আবেদনপত্র</span>
                <span>০১(এক) খানা।</span>
              </div>
              <div className="flex justify-between">
                <span>২। অডিট বেঙ্গল ম্যানুয়াল ফরম (পূরণকৃত)</span>
                <span>০১(এক) খানা।</span>
              </div>
              <div className="flex justify-between">
                <span>৩। নমুনা স্বাক্ষর ও টিপসহি</span>
                <span>০১(এক) খানা।</span>
              </div>
              <div className="flex justify-between">
                <span>৪। স্থানীয় হিসাব রক্ষণ অফিস কর্তৃক প্রদত্ত ক্ষমতাপত্রের কপি</span>
                <span>০১(এক) খানা।</span>
              </div>
              </div>
          </div>

          {/* DDO & Recipient */}
          <div className="mt-10 mb-8 text-[13.5px] font-normal">
            <div className="flex justify-end font-normal">
              <div className="text-center leading-normal space-y-0.5 font-normal">
                <div>({data.ddo_name || 'নৃপেন্দ্র নাথ সরকার'})</div>
                <div>{data.ddo_designation || 'উপজেলা প্রাথমিক শিক্ষা অফিসার'}</div>
                <div>
                  {data.upazila_name || 'বিয়ানীবাজার'}, {data.district_name || 'সিলেট'}।
                </div>
              </div>
            </div>

            <div className="text-left mt-2 leading-normal font-normal">
              <div>জেলা প্রাথমিক শিক্ষা অফিসার</div>
              <div>{data.district_name ? `${data.district_name}।` : 'সিলেট।'}</div>
            </div>
          </div>
        </div>
  )}
      </div>
      </div>
    </div>
  );
};
