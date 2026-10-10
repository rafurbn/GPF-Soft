import React from 'react';
import { GpfNonRefundableFormData } from '../../src/types';
import { toBanglaNumber } from '../../src/utils/numberToBanglaWords';

interface DocumentTemplateProps {
  data: GpfNonRefundableFormData;
  pageFilter?: number | 'all';
}

export const DocumentTemplate: React.FC<DocumentTemplateProps> = ({
  data,
  pageFilter = 'all',
}) => {
  const formattedRequestedAmount = toBanglaNumber(data.requested_amount);
  const formattedBalance = toBanglaNumber(data.gpf_total_balance);
  const formattedSalary = toBanglaNumber(data.basic_salary);
  const formattedDob = toBanglaNumber(data.date_of_birth);
  const formattedDate = toBanglaNumber(data.apply_date);
  const formattedAccNo = toBanglaNumber(data.gpf_acc_no);
  const formattedYear = toBanglaNumber(data.year);

  // Helper to decide if page should render
  const shouldRender = (pageNum: number) => {
    return pageFilter === 'all' || pageFilter === pageNum;
  };

  // Single line receiver for Page 2
  const singleLineReceiver = data.receiver_info
    ? data.receiver_info.replace(/\n+/g, ', ')
    : `জেলা প্রাথমিক শিক্ষা অফিসার, ${data.district_name || 'সিলেট'}।`;

  const anyData = data as any;

  return (
    <div id="printable-document" className="w-full flex flex-col items-center gap-8 print:gap-0 print:block font-normal font-bangla-serif">
      {/* ================= ১ম পাতা: আবেদনপত্র ================= */}
      {shouldRender(1) && (
        <div className="a4-page text-[14px] leading-relaxed block border border-slate-200 print:border-none" id="doc-page-1">
          {/* তারিখ */}
          <div className="text-left text-[14px] mb-5 font-normal">
            তারিখ: {formattedDate || '........................'} খ্রি.।
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
            বিষয়ঃ সাধারণ ভবিষ্যৎ তহবিল হতে অফেরতযোগ্য অগ্রিম উত্তোলনের আবেদন।
          </div>

          <div className="mb-3 font-normal">জনাব,</div>

          {/* মূল বক্তব্য */}
          <div className="text-justify mb-5 leading-relaxed font-normal" style={{ textAlign: 'justify' }}>
            সবিনয় নিবেদন এই যে, আমি নিম্ন স্বাক্ষরকারী {data.school_name || '...................................................'} এর {data.designation || '................................'}। আমার সাধারণ ভবিষ্যৎ তহবিল হিসাব নং {formattedAccNo || '............................'}। আমার জন্ম তারিখ: {formattedDob || '.........................'} এবং আমার বয়স ৫২ বছরের ঊর্ধ্বে। গৃহমেরামতের লক্ষ্যে আমার সাধারণ ভবিষ্যৎ তহবিলে জমাকৃত টাকা হতে {formattedRequestedAmount || '..................'} (কথায়: {data.gpf_total_balance_words || '...........................................................................'}) টাকা অফেরতযোগ্য অগ্রিম উত্তোলন করা প্রয়োজন। এমতাবস্থায় আমার সাধারণ ভবিষ্যৎ তহবিল হতে প্রার্থীত টাকা অফেরতযোগ্য অগ্রিম হিসেবে উত্তোলনের অনুমতি দানের জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
          </div>

          <div className="text-justify mb-12 leading-relaxed font-normal" style={{ textAlign: 'justify' }}>
            অতএব, মহোদয়ের নিকট সবিনয় নিবেদন এই যে, আমার সাধারণ ভবিষ্যৎ তহবিল হিসাব এ জমাকৃত টাকা হতে প্রার্থীত টাকা অফেরতযোগ্য অগ্রিম উত্তোলনের অনুমতি দানে আপনার সদয় মর্জি হয়।
          </div>

          {/* স্বাক্ষর অংশ */}
          <div className="text-left text-[14px] leading-normal font-normal">
            <div>বিনীত</div>
            <div>নিবেদক</div>
            <div className="mb-6">আপনার বিশ্বস্ত</div>
            <div>{data.applicant_name || '................................................'}</div>
            <div>{data.designation || '................................'}</div>
            <div>{data.school_name || '................................................'}</div>
            <div>
              {(data.upazila_name || '...............')}, {(data.district_name || '...............')}।
            </div>
          </div>
        </div>
        )}
      {/* ================= PAGE 2: বাংলাদেশ ফরম নং ২৬৩৯ ================= */}
      {shouldRender(2) && (
        <section 
          id="doc-page-2"
          className="print-page a4-page relative mx-auto bg-white p-12 sm:p-16 max-w-[210mm] min-h-[297mm] shadow-lg print:shadow-none print:m-0 print:p-[18mm] print:max-w-none print:w-full break-after-page mt-8 print:mt-0 font-normal space-y-5 border border-slate-200 print:border-none"
          style={{ minHeight: '297mm' }}
        >
          {/* বাংলাদেশ ফরম নং ২৬৩৯ */}
          <div className="text-left">
            <span className="text-xs text-gray-700 font-normal">বাংলাদেশ ফরম নং ২৬৩৯</span>
          </div>

          {/* শিরোনাম */}
          <div className="text-center pt-1 pb-1">
            <h2 className="text-base font-normal text-xl">সাধারণ ভবিষ্য তহবিল হইতে অগ্রিম গ্রহণের জন্য আবেদনের ফরম</h2>
          </div>

          {/* প্রাপক */}
          <div 
            className="flex items-baseline mb-4 text-xl font-normal"
            style={{ paddingLeft: '1in' }}
          >
            <span className="whitespace-nowrap shrink-0 font-normal">প্রাপকঃ</span>
            <span className="font-normal" style={{ paddingLeft: '0.75in' }}>
              {data?.receiver_info?.replace(/\n+/g, ', ') || singleLineReceiver}
            </span>
          </div>

          {/* মূল বক্তব্য */}
          <div className="text-justify text-sm leading-relaxed mb-4 font-normal" style={{ textAlign: 'justify' }}>
            <p className="mb-2 text-left">মহোদয়,</p>
            <p className="indent-10">
              সবিনয় নিবেদন এই যে, আমার ভবিষ্য তহবিলে জমাকৃত টাকা হইতে অগ্রিম টাকা{' '}
              {formattedRequestedAmount || data.requested_amount || anyData.requestedAmount || '..................'}{' '}
              (কথায়: {data.gpf_total_balance_words || anyData.requested_amount_words || anyData.requestedAmountWords || '................................................'}) পাওয়ার জন্য আবেদন করিতেছি। আমি নিম্নের প্রতিটি প্রশ্নের সঠিকভাবে উত্তর দিচ্ছি।
            </p>
          </div>

          <div className="flex justify-between items-start mb-6 text-sm font-normal">
            <div>
              <p>তারিখ: {formattedDate || data.apply_date || anyData.applyDate || '........................'}</p>
              <p>স্থান: {data.upazila_name || anyData.upazilaName || 'বিয়ানীবাজার'}, {data.district_name || anyData.districtName || 'সিলেট'}।</p>
            </div>
            <div className="text-left text-sm leading-snug font-normal">
              <p>আপনার অনুগত</p>
              <p className="mt-3">স্বাক্ষর: .......................................</p>
              <p className="mt-1">পদবী: {data.designation || 'সহকারী শিক্ষক'}</p>
              <p>ঠিকানা: {data.school_name || anyData.schoolName || '................................'}</p>
              <p>{data.upazila_name || anyData.upazilaName || 'বিয়ানীবাজার'}, {data.district_name || anyData.districtName || 'সিলেট'}।</p>
            </div>
          </div>

          {/* প্রশ্নাবলী ও উত্তর অংশ */}
          <div className="mb-6 text-sm font-normal space-y-4">
            <div className="grid grid-cols-12 text-sm font-normal pb-1">
              <div className="col-span-8 text-left font-normal">প্রশ্নাবলী</div>
              <div className="col-span-4 text-left font-normal pl-4">উত্তর</div>
            </div>

            {/* ১ নং প্রশ্ন */}
            <div className="grid grid-cols-12 py-2 items-start font-normal">
              <div className="col-span-8 text-justify pr-10">
                ১। পূর্ববর্তী ৩০ শে জুনে আপনার কত টাকা জমা ছিল (মহা-হিসাব রক্ষক কর্তৃক প্রদত্ত আমানতী হিসাবপত্রের মূল অনুলিপি সংযুক্ত করিতে হইবে এবং ইহা পরীক্ষার পর ফেরত দেওয়া হইবে)।
              </div>
              <div className="col-span-4 pl-4 font-normal">
                {formattedBalance || data.gpf_total_balance || anyData.gpfTotalBalance || '..................'} টাকা
              </div>
            </div>

            {/* ২ নং প্রশ্ন */}
            <div className="grid grid-cols-12 py-1 items-start font-normal">
              <div className="col-span-8 text-left pr-10">
                ২। অগ্রিমের প্রয়োজনীয়তার কারণ কি? (সুদীর্ঘ কারণ হইলে পৃথকভাবে লিপিবদ্ধ করিতে হইবে।)
              </div>
              <div className="col-span-4 pl-4 font-normal">
                {anyData.purpose || 'গৃহমেরামত'}
              </div>
            </div>

            {/* ৩ নং প্রশ্ন */}
            <div className="grid grid-cols-12 py-1 items-start font-normal">
              <div className="col-span-8 text-left pr-10">
                ৩। আপনার বর্তমান বেতন কত?
              </div>
              <div className="col-span-4 pl-4 font-normal">
                {formattedSalary || data.basic_salary || anyData.basicSalary || '..................'} টাকা
              </div>
            </div>

            {/* ৪ নং প্রশ্ন */}
            <div className="grid grid-cols-12 py-1 items-start font-normal">
              <div className="col-span-8 pr-10 space-y-2">
                <p>৪। (ক) পূর্বে কি কোন অগ্রিম লওয়া হইয়াছিল?</p>
                <p className="pl-4 text-xs text-gray-700">(খ) যদি হইয়া থাকে, অগ্রিমের সব টাকা কি পরিশোধ করা হইয়াছে?</p>
                <p className="pl-4 text-xs text-gray-700">(গ) যদি হইয়া থাকে, পরিশোধের শেষ কিস্তি সুদসহ কোন সময়ে দেওয়া হইয়াছিল?</p>
                <p className="pl-4 text-xs text-gray-700">(ঘ) পূর্বের অগ্রিম সম্পূর্ণরূপে পরিশোধ না হইয়া থাকিলে আর কত কিস্তি প্রদেয় আছে?</p>
              </div>
              <div className="col-span-4 pl-4 font-normal space-y-2">
                <p>{anyData.hasPreviousLoan || anyData.has_previous_loan || 'না'}</p>
                <p className="text-xs">{anyData.isPreviousLoanRepaid || anyData.is_previous_loan_repaid || 'প্রযোজ্য নয়'}</p>
                <p className="text-xs">{anyData.lastInstallmentDate || anyData.last_installment_date || 'প্রযোজ্য নয়'}</p>
                <p className="text-xs">{anyData.remainingInstallments || anyData.remaining_installments || 'প্রযোজ্য নয়'}</p>
              </div>
            </div>

            {/* ৫ নং প্রশ্ন */}
            <div className="grid grid-cols-12 py-2 items-start font-normal">
              <div className="col-span-8 text-left pr-10">
                ৫। কত কিস্তিতে (সুদ কিস্তিসহ) অগ্রিম পরিশোধ করিতে ইচ্ছুক?
              </div>
              <div className="col-span-4 pl-4 font-normal">
                {anyData.installmentCount || anyData.installment_count || '২৪'} কিস্তি
              </div>
            </div>

            {/* ৬ নং প্রশ্ন */}
            <div className="grid grid-cols-12 py-2 items-start font-normal">
              <div className="col-span-8 pr-10 text-justify">
                ৬। আপনার তহবিলে জমাকৃত টাকার কি সুদ হয়? (শুধু মাত্র মুসলমান অফিসারগণকে উত্তর দিতে হইবে)।
              </div>
              <div className="col-span-4 pl-4 font-normal">
                {anyData.hasInterest || anyData.has_interest || 'হ্যাঁ'}
              </div>
            </div>
          </div>

          {/* ঊর্ধ্বতন অফিসারের সুপারিশ */}
          <div className="pt-1 font-normal">
            <div className="grid grid-cols-12 items-start text-xs font-normal">
              <div className="col-span-8 pr-3 space-y-1 text-left text-sm font-normal">
                <div className="mb-2 text-left font-bold text-sm">
                  ঊর্ধ্বতন অফিসারের সুপারিশ
                </div>
                <p className="text-xs text-gray-700">নং স(বাঃ বাঃ কো)ভেটিং/ফ-১৩৩/৭৫-৩৬৭৬, তাং ৬-১২-৮৫</p>
                <p className="text-xs text-gray-700">বাঃসঃমুঃ-৯৩/৯৪-১০১০১জে--৫ লক্ষ কপি, ১৯৯৪</p>
                <p className="text-sm font-normal pt-2">
                  {anyData.installmentNo || anyData.installment_no || '১ম'} অগ্রিম মঞ্জুরীর সুপারিশ করা হলো।
                </p>
              </div>

              <div className="col-span-4 pl-4 text-left space-y-1 text-sm font-normal pt-0"> 
                {/* বামের শিরোনামের সাথে ব্যালেন্স করতে pt-7 (Padding Top) দেওয়া হয়েছে */}
                <p>স্বাক্ষর .........................................</p>
                <p>পদবী: {data.designation || 'সহকারী শিক্ষক'}</p>
                <p>{data.school_name || anyData.schoolName || '................................'}</p>
                <p>{data.upazila_name || anyData.upazilaName || 'বিয়ানীবাজার'}, {data.district_name || anyData.districtName || 'সিলেট'}।</p>
              </div>
            </div>
          </div>
        </section>
      )}
      
{/* ================= ৩য় পাতা: টি, আর ফরম নং ৩৭ (বিল) ================= */}
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

     {/* বিল টেবিল — grid technique (matches App 1, borders always print) */}
     <div className="border border-black my-2 text-xs font-normal" style={{ border: '1px solid #000000' }}>
  {/* header row */}
  <div className="grid grid-cols-12 font-normal border-b border-black text-center min-h-[46px]" style={{ borderBottom: '1px solid #000000' }}>
    <div className="col-span-1 border-r border-black font-normal flex items-center justify-center p-1">ক্রমিক নং</div>
    <div className="col-span-5 border-r border-black font-normal flex items-center justify-center p-1">চাঁদা প্রদানকারীর নাম, বেতন মঞ্জুরী পত্রের নং ও তারিখ।</div>
    <div className="col-span-3 border-r border-black font-normal flex items-center justify-center p-1">ভবিষ্য তহবিলের হিসাব নং</div>
    <div className="col-span-2 border-r border-black font-normal flex items-center justify-center p-1">অগ্রিম/উত্তোলন</div>
    <div className="col-span-1 font-normal flex items-center justify-center p-1">প্রাপ্তির রশিদ</div>
  </div>
  {/* body row */}
  <div className="grid grid-cols-12 min-h-[120px] text-xs font-normal items-stretch">
  {/* ক্রমিক নং */}
  <div className="col-span-1 border-r border-black p-2 text-center flex items-center justify-center font-normal">
    ০১
  </div>
  {/* চাঁদা প্রদানকারীর নাম ও বিবরণ */}
  <div className="col-span-5 border-r border-black p-2 text-left font-normal leading-relaxed flex flex-col justify-between">
    <div>
      <p className="font-semibold">{data?.applicant_name || '..............................................'}</p>
      <p>{data?.designation || '..............................................'}</p>
      <p>{data?.school_name || '..............................................'}</p>
      <p>
        {data?.upazila_name || '....................'}, {data?.district_name || '....................'}। এর সাধারণ ভবিষ্য তহবিল-এ জমাকৃত টাকা অফেরতযোগ্য অগ্রিম উত্তোলন এর বিল।
      </p>
    </div>
    <div className="mt-3 flex justify-between text-[11px] items-center">
      <span>মঞ্জুরী নং- {data?.custom_memo_no || '...........................'}</span>
      <span>তারিখ: {data?.apply_date || '০৬/১০/২০২৬'}</span>
    </div>
  </div>

  {/* ভবিষ্য তহবিলের হিসাব নং */}
  <div className="col-span-3 border-r border-black p-2 text-center flex items-center justify-center font-serif text-[13px] font-normal">
    {data?.gpf_acc_no || '....................'}
  </div>

  {/* অগ্রিম/উত্তোলন (টাকা ও পয়সা কলাম) */}
  <div className="col-span-2 border-r border-black grid grid-cols-12 h-full">
    {/* টাকা কলাম */}
    <div className="col-span-9 border-r border-black p-2 text-center flex items-center justify-center font-normal h-full">
      = {data?.requested_amount || '....................'}/-
    </div>
    {/* পয়সা কলাম */}
    <div className="col-span-3 p-2 text-center flex items-center justify-center font-normal text-gray-400 h-full">
      ০০
    </div>
  </div>

  {/* প্রাপ্তির রশিদ / ডিজিটাল স্ট্যাম্প */}
  <div className="col-span-1 p-2 text-center flex flex-col items-center justify-center text-[10px] text-gray-500 font-normal">
    ডিজিটাল স্ট্যাম্প
  </div>
  </div>
</div>

      {/* প্রদেয় টাকা কথায় */}
      <div className="text-[13px] my-5 leading-relaxed font-normal">
        প্রয়োজনীয় প্রদেয় টাকা = {formattedRequestedAmount || '............'}/- (কথায়: {data.gpf_total_balance_words || '........................................................................'}) টাকা বুঝিয়া পাইলাম।
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

          <div className="print-imprint text-[10px] text-gray-600 pt-5 font-normal">
            বাঃসঃমুঃ-৯৭/৯৮-১৮০৫১ এফ(কম-১) ১০ লক্ষ কপি, (সি-৫৯) ১৯
          </div>
        </div>
      )}

      {/* ================= ৪র্থ পাতা: সংযোজনী-৬ (নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ) ================= */}
      {shouldRender(4) && (
        <div className="a4-page text-[13px] leading-normal block border border-slate-200 print:border-none" id="doc-page-4">
          <div className="text-right text-[12px] mb-1 font-normal">সংযোজনী-৬</div>

          {/* শিরোনাম */}
          <div className="text-center text-[15px] mb-4 font-normal">
            নমুনা স্বাক্ষর ও হাতের পাঁচ আঙ্গুলের ছাপ
          </div>

          <div className="mb-4 text-justify leading-relaxed text-[13.5px] font-normal" style={{ textAlign: 'justify' }}>
            ১। নিম্নে অফেরতযোগ্য অগ্রিম উত্তোলনের জন্য আবেদনকারী জনাব/বেগম{' '}
            {data.applicant_name || '................................................'},{' '}
            {data.designation || '................................'},{' '}
            {data.school_name || '................................................'},{' '}
            {data.upazila_name || '...............'},{' '}
            {data.district_name || '...............'} এর তিনটি নমুনা স্বাক্ষর সত্যায়িত করা হইল।
          </div>

          {/* Table 1: Specimen Signatures */}
          <table className="w-full border-none border-collapse text-[12.5px] mb-6 font-normal">
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
            ২। নিম্নে অফেরতযোগ্য অগ্রিম উত্তোলনের জন্য আবেদনকারী জনাব/বেগম{' '}
            {data.applicant_name || '................................................'},{' '}
            {data.designation || '................................'},{' '}
            {data.school_name || '................................................'},{' '}
            {data.upazila_name || '...............'},{' '}
            {data.district_name || '...............'} এর হাতের পাঁচ আঙ্গুলের ছাপ সত্যায়িত করা হইল।
          </div>

          {/* Table 2: Thumb Impressions */}
          <table className="w-full border-none border-collapse text-[12.5px] mb-6 font-normal">
            <thead>
              <tr>
                <th className="border-none p-1.5 w-20 text-center font-normal">ক্রমিক নং</th>
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
                <tr key={idx} className="h-16">
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
          <div className="mt-8 mb-6 flex justify-end">
            <div className="text-center w-72 text-[13px] leading-tight font-normal">
              <div>
                সত্যায়নকারী প্রথম শ্রেণির গেজেটেড কর্মকর্তার
              </div>
              <div className="mt-1">তারিখসহ স্বাক্ষর ..........................................</div>
              <div className="mt-1 text-gray-700">সীলমোহর (নামযুক্ত)</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ৫নং পাতা: ফরোয়ার্ডিং পত্র (উপজেলা শিক্ষা অফিস) ================= */}
      {shouldRender(5) && (
        <div className="a4-page text-[13.5px] leading-relaxed block border border-slate-200 print:border-none" id="doc-page-5">
          <div className="pt-4 text-center mb-5 font-normal">
            <div>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
            <div>উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
            <div>
              {data.upazila_name || 'বিয়ানীবাজার'}, {data.district_name || 'সিলেট'}।
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 font-normal">
            <div>
              স্মারক নং- উশিঅ/{data.upazila_name ? data.upazila_name.substring(0, 4) : 'উশি'}/{data.district_name ? data.district_name.substring(0, 4) : 'জেলা'}/{formattedYear || '২০২৬'}/{data.custom_memo_no || '.........'}
            </div>
            <div>
              তারিখ: {formattedDate || '........................'}
            </div>
          </div>

          <div className="mb-4 text-justify leading-snug font-normal">
            বিষয়: সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত টাকা হতে অফেরতযোগ্য অগ্রিম উত্তোলনের অনুমতি প্রসঙ্গে।
          </div>

          <p className="text-justify mb-4 leading-relaxed font-normal" style={{ textAlign: 'justify' }}>
            উপর্যুক্ত বিষয়ের আলোকে জানানো যাচ্ছে যে, নিম্নোক্ত শিক্ষক তাঁর সাধারণ ভবিষ্যৎ তহবিল হিসাবে জমাকৃত টাকা হতে অফেরতযোগ্য অগ্রিম উত্তোলনের জন্য অনুমতি চেয়ে আবেদন করেছেন। এ বিষয়ে প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য মহোদয়কে বিনীত অনুরোধ করা হলো।
          </p>

          {/* Applicant Summary Table — grid technique (matches App 1, borders always print) */}
          <div
            className="w-full mb-4 text-[13.5px] font-normal"
            style={{ border: '1px solid #000000' }}
          >
            {/* header row */}
            <div
              className="grid grid-cols-12 font-normal text-center border-b border-black"
              style={{ borderBottom: '1px solid #000000' }}
            >
              <div className="col-span-2 p-1.5 text-center font-normal border-r border-black">ক্র:নং</div>
              <div className="col-span-7 p-1.5 text-center font-normal border-r border-black">আবেদনকারীর বিবরণ</div>
              <div className="col-span-3 p-1.5 text-center font-normal">অগ্রিমের ধরন</div>
            </div>
            {/* body row */}
            <div className="grid grid-cols-12 font-normal min-h-[90px]">
              <div className="col-span-2 border-r border-black p-2 text-center align-top font-normal">০১</div>
              <div className="col-span-7 border-r border-black p-2 align-top font-normal leading-relaxed">
                <div>{data.applicant_name || '................................................'}</div>
                <div>{data.designation || '................................'}</div>
                <div>{data.school_name || '................................................'}</div>
                <div>
                  {data.upazila_name || '...............'}, {data.district_name || '...............'}
                </div>
              </div>
              <div className="col-span-3 p-2 text-center flex items-center justify-center font-normal">
               ৫২ বছরের ঊর্ধ্বে হওয়ায়<br />অফেরতযোগ্য অগ্রিম।
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
                <span>২। নির্ধারিত ফরমে আবেদনপত্র (পূরণকৃত)</span>
                <span>০১(এক) খানা।</span>
              </div>
              <div className="flex justify-between">
                <span>৩। নমুনা স্বাক্ষর ও টিপসহি</span>
                <span>০১(এক) খানা।</span>
              </div>
              <div className="flex justify-between">
                <span>৪। এসএসসি সনদ পত্রের ফটোকপি (সত্যায়িত)</span>
                <span>০১(এক) খানা।</span>
              </div>
              <div className="flex justify-between">
                <span>৫। ভোটার আইডি কার্ডের অনুলিপি (সত্যায়িত)</span>
                <span>০১(এক) খানা।</span>
              </div>
              <div className="flex justify-between">
                <span>৬। সাধারণ ভবিষ্যৎ তহবিল হিসাব বিবরণী এর অনলাইন কপি</span>
                <span>০১(এক) খানা।</span>
              </div>
            </div>
          </div>

          {/* DDO & Recipient */}
          <div className="mt-[1in] mb-8 text-[13.5px] font-normal">
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
  );
};
// fix build)
