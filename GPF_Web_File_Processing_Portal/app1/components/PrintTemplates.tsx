import React from 'react';
import { GpfFormData } from '../../src/types';
import { toBanglaDigits } from '../../src/utils/numberToBanglaWords';

interface PrintTemplatesProps {
  data: GpfFormData;
  pageFilter?: number | 'all'; // 1, 2, 3, 4 or 'all'
}

export const PrintTemplates: React.FC<PrintTemplatesProps> = ({ data, pageFilter = 'all' }) => {
  // Normalize fields and ensure fallback
  const applyDate = data.applyDate ? toBanglaDigits(data.applyDate) : '........................';
  const rawReceiver = data.receiverInfo || 'উপজেলা প্রাথমিক শিক্ষা অফিসার\nবিয়ানীবাজার, সিলেট।';
  const receiverLines = rawReceiver.split('\n');
  // For page 2: receiver displayed on a single clean line
  const displayReceiverPage2 = rawReceiver
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(', ');

  const installmentNo = data.installmentNo || '১ম';
  const schoolName = data.schoolName || '................................';
  const designation = data.designation || 'সহকারী শিক্ষক';
  // GPF account number properly formatted in clean Bangla digits
  const gpfAccNo = data.gpfAccNo ? toBanglaDigits(data.gpfAccNo) : '........................';
  const purpose = data.purpose || 'গৃহমেরামত';
  const requestedAmount = data.requestedAmount ? toBanglaDigits(data.requestedAmount) : '................';
  const requestedAmountWords = data.requestedAmountWords || '................................';
  const applicantName = data.applicantName || '................................';
  const upazilaName = data.upazilaName || 'বিয়ানীবাজার';
  const districtName = data.districtName || 'সিলেট';
  const gpfTotalBalance = data.gpfTotalBalance ? toBanglaDigits(data.gpfTotalBalance) : '................';
  const basicSalary = data.basicSalary ? toBanglaDigits(data.basicSalary) : '................';
  const installmentCount = data.installmentCount ? toBanglaDigits(data.installmentCount) : '২৪';
  const installmentAmount = data.installmentAmount ? toBanglaDigits(data.installmentAmount) : '................';
  const ddoName = data.ddoName || '................................';
  const ddoDesignation = data.ddoDesignation || 'উপজেলা প্রাথমিক শিক্ষা অফিসার';
  const year = data.year ? toBanglaDigits(data.year) : '২০২৬';

  // Dynamic memo number linked to Year (সন)
  let rawMemo = data.memoNo || `উশিঅ/বিবা/সা:ভ:তহ:/অগ্রিম/${year}/`;
  rawMemo = rawMemo.replace(/\/৩২২\b|\/322\b/, '/').trim();
  if (rawMemo.includes('উশিঅ/')) {
    rawMemo = rawMemo.replace(/\/(\d{4}|[০-৯]{4}|[০-৯]{4}-[০-৯]{4})\//, `/${year}/`);
  }
  const cleanMemoNo = toBanglaDigits(rawMemo);

  return (
    <div className="print-container bg-white text-black font-bangla-serif text-[15px] leading-relaxed antialiased font-normal selection:bg-slate-200">
      {/* ================= PAGE 1: আবেদনপত্র ================= */}
      {(pageFilter === 'all' || pageFilter === 1) && (
        <section 
          id="print-page-1"
          className="print-page relative mx-auto bg-white px-12 pb-16 pt-[40mm] sm:px-16 max-w-[210mm] min-h-[297mm] shadow-lg print:shadow-none print:m-0 print:px-[20mm] print:pb-[20mm] print:pt-[35mm] print:max-w-none print:w-full break-after-page font-normal border border-slate-200 print:border-none"
          style={{ minHeight: '297mm' }}
        >
          {/* তারিখ */}
          <div className="text-left mb-6 font-normal">
            তারিখ: {applyDate} খ্রি.।
          </div>

          {/* প্রাপক */}
          <div className="mb-6 font-normal">
            <div>বরাবর</div>
            {receiverLines.map((line, idx) => (
              <div key={idx} className="font-normal">{line}</div>
            ))}
          </div>

          {/* মাধ্যম */}
          <div className="mb-6 font-normal">
            মাধ্যম: <span className="font-normal">যথাযথ কর্তৃপক্ষ।</span>
          </div>

          {/* বিষয় */}
          <div className="mb-6 font-normal text-base leading-snug">
            বিষয়ঃ সাধারণ ভবিষ্য তহবিল হতে ফেরতযোগ্য {installmentNo} অগ্রিম উত্তোলনের আবেদন।
          </div>

          {/* মূল বক্তব্য */}
          <div className="text-justify text-[15px] leading-8 font-normal">
            <p className="mb-2 text-left">জনাব,</p>
            <p className="text-justify mb-5" style={{ textAlign: 'justify' }}>
              সবিনয় নিবেদন এই যে, আমি নিম্ন স্বাক্ষরকারী {schoolName} এর{' '}
              {designation}। আমার সাধারণ ভবিষ্য তহবিল হিসাব নং{' '}
              {gpfAccNo}।{' '}
              {purpose} এর লক্ষ্যে আমার সাধারণ ভবিষ্য তহবিলে জমাকৃত টাকা হতে{' '}
              {requestedAmount} (কথায়: {requestedAmountWords}) টাকা{' '}
              {installmentNo} অগ্রিম উত্তোলন করা প্রয়োজন। এমতাবস্থায় আমার সাধারণ ভবিষ্য তহবিল হতে প্রার্থীত টাকা{' '}
              {installmentNo} হিসেবে অগ্রিম উত্তোলনের অনুমতি দানের জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
            </p>
            <p className="text-justify" style={{ textAlign: 'justify' }}>
              অতএব, মহোদয়ের নিকট সবিনয় নিবেদন এই যে, আমার সাধারণ ভবিষ্য তহবিল হিসাব এ জমাকৃত টাকা হতে প্রার্থীত টাকা{' '}
              {installmentNo} অগ্রিম উত্তোলনের অনুমতি দানে আপনার সদয় মর্জি হয়।
            </p>
          </div>

          {/* ইতি / স্বাক্ষর */}
          <div className="mt-14 text-left leading-light font-normal">
            <p>বিনীত</p>
            <p>নিবেদক</p>
            <p className="mb-8">আপনার বিশ্বস্ত</p>
            
            <div className="mt-14 space-y-1 font-normal">
              <p>{applicantName}</p>
              <p>{designation}</p>
              <p>{schoolName}</p>
              <p>{upazilaName}, {districtName}।</p>
            </div>
          </div>
        </section>
      )}

      {/* ================= PAGE 2: বাংলাদেশ ফরম নং ২৬৩৯ ================= */}
      {(pageFilter === 'all' || pageFilter === 2) && (
        <section 
          id="print-page-2"
          className="print-page relative mx-auto bg-white p-12 sm:p-16 max-w-[210mm] min-h-[297mm] shadow-lg print:shadow-none print:m-0 print:p-[18mm] print:max-w-none print:w-full break-after-page mt-8 print:mt-0 font-normal space-y-5 border border-slate-200 print:border-none"
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
              {displayReceiverPage2}
            </span>
          </div>

          {/* মূল বক্তব্য */}
          <div className="text-justify text-sm leading-relaxed mb-4 font-normal" style={{ textAlign: 'justify' }}>
            <p className="mb-2 text-left">মহোদয়,</p>
           <p className="indent-10">
            সবিনয় নিবেদন এই যে, আমার ভবিষ্য তহবিলে জমাকৃত টাকা হইতে অগ্রিম টাকা{' '}
              {requestedAmount} (কথায়: {requestedAmountWords}) পাওয়ার জন্য আবেদন করিতেছি। আমি নিম্নের প্রতিটি প্রশ্নের সঠিকভাবে উত্তর দিচ্ছি।
            </p>
          </div>

          <div className="flex justify-between items-start mb-6 text-sm font-normal">
            <div>
              <p>তারিখ: {applyDate}</p>
              <p>স্থান: {upazilaName}, {districtName}।</p>
            </div>
            <div className="text-left text-sm leading-snug font-normal">
              <p>আপনার অনুগত</p>
              <p className="mt-3">স্বাক্ষর: .......................................</p>
              <p className="mt-1">পদবী: {designation}</p>
              <p>ঠিকানা: {schoolName}</p>
              <p>{upazilaName}, {districtName}।</p>
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
                {gpfTotalBalance} টাকা
              </div>
            </div>

            {/* ২ নং প্রশ্ন */}
            <div className="grid grid-cols-12 py-1 items-start font-normal">
              <div className="col-span-8 text-left pr-10">
                ২। অগ্রিমের প্রয়োজনীয়তার কারণ কি? (সুদীর্ঘ কারণ হইলে পৃথকভাবে লিপিবদ্ধ করিতে হইবে।)
              </div>
              <div className="col-span-4 pl-4 font-normal">
                {purpose}
              </div>
            </div>

            {/* ৩ নং প্রশ্ন */}
            <div className="grid grid-cols-12 py-1 items-start font-normal">
              <div className="col-span-8 text-left pr-10">
                ৩। আপনার বর্তমান বেতন কত?
              </div>
              <div className="col-span-4 pl-4 font-normal">
                {basicSalary} টাকা
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
                <p>{data.hasPreviousLoan || 'না'}</p>
                <p className="text-xs">{data.isPreviousLoanRepaid || 'প্রযোজ্য নয়'}</p>
                <p className="text-xs">{data.lastInstallmentDate || 'প্রযোজ্য নয়'}</p>
                <p className="text-xs">{data.remainingInstallments || 'প্রযোজ্য নয়'}</p>
              </div>
            </div>

            {/* ৫ নং প্রশ্ন */}
            <div className="grid grid-cols-12 py-2 items-start font-normal">
              <div className="col-span-8 text-left pr-10">
                ৫। কত কিস্তিতে (সুদ কিস্তিসহ) অগ্রিম পরিশোধ করিতে ইচ্ছুক?
              </div>
              <div className="col-span-4 pl-4 font-normal">
                {installmentCount} কিস্তি
              </div>
            </div>

            {/* ৬ নং প্রশ্ন */}
            <div className="grid grid-cols-12 py-2 items-start font-normal">
              <div className="col-span-8 pr-10 text-justify">
                ৬। আপনার তহবিলে জমাকৃত টাকার কি সুদ হয়? (শুধু মাত্র মুসলমান অফিসারগণকে উত্তর দিতে হইবে)।
              </div>
              <div className="col-span-4 pl-4 font-normal">
                {data.hasInterest || 'হ্যাঁ'}
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
        {installmentNo} অগ্রিম মঞ্জুরীর সুপারিশ করা হলো।
      </p>
    </div>

              <div className="col-span-4 pl-4 text-left space-y-1 text-sm font-normal pt-0"> 
      {/* বামের শিরোনামের সাথে ব্যালেন্স করতে pt-7 (Padding Top) দেওয়া হয়েছে */}
      <p>স্বাক্ষর .........................................</p>
      <p>পদবী: {designation}</p>
      <p>{schoolName}</p>
      <p>{upazilaName}, {districtName}।</p>
    </div>

  </div>
</div>
</section>
)}


      {/* ================= PAGE 3: টি, আর ফরম নং ৩৭ (বিল) ================= */}
      {(pageFilter === 'all' || pageFilter === 3) && (
        <section 
          id="print-page-3"
          className="print-page relative mx-auto bg-white p-12 sm:p-16 max-w-[210mm] min-h-[297mm] shadow-lg print:shadow-none print:m-0 print:p-[16mm] print:max-w-none print:w-full break-after-page mt-8 print:mt-0 font-normal space-y-4 border border-slate-200 print:border-none"
          style={{ minHeight: '297mm' }}
        >
          <div className="flex justify-between items-start text-xs font-normal mb-1">
            <div>
              <p>টি, আর ফরম নং ৩৭</p>
              <p>[এস, আর ৩২৪ (১) দ্রষ্টব্য]</p>
            </div>
          </div>

          <div className="text-center mb-2">
            <h2 className="text-base font-normal">কর্মচারীদের ভবিষ্য তহবিল হইতে উত্তোলন/অগ্রিম গ্রহণের বিল</h2>
          </div>

          {/* শ্রেণী বিন্যাস কোড */}
          <div className="flex items-center justify-center space-x-2 my-2 text-xs font-normal">
            <span>ভবিষ্য তহবিলের শ্রেণী বিন্যাস কোড:</span>
            <div className="flex border border-black divide-x divide-black font-mono font-normal text-center">
              {['৭', '২', '৪', '৩', '২', '০', '০', '০', '০', '৯', '১', '০', '১'].map((digit, i) => (
                <div key={i} className="w-5 h-6 flex items-center justify-center bg-transparent font-normal">{digit}</div>
              ))}
            </div>
          </div>

          <div className="flex justify-between text-xs my-2 font-normal">
            <div>টোকেন নং: ....................... তারিখ: .......................</div>
            <div>ভাউচার নং: ....................... তারিখ: .......................</div>
          </div>

          {/* বিল টেবিল */}
          <div className="border border-black my-2 text-xs font-normal">
  <div className="grid grid-cols-12 font-normal border-b border-black text-center min-h-[48px]">
    <div className="col-span-1 border-r border-black font-normal flex items-center justify-center p-1">ক্রমিক নং</div>
    <div className="col-span-5 border-r border-black font-normal flex items-center justify-center p-1">চাঁদা প্রদানকারীর নাম, বেতন মঞ্জুরী পত্রের নং ও তারিখ।</div>
    <div className="col-span-3 border-r border-black font-normal flex items-center justify-center p-1">ভবিষ্য তহবিলের হিসাব নং</div>
    <div className="col-span-2 border-r border-black font-normal flex items-center justify-center p-1">অগ্রিম/উত্তোলন টাকা</div>
    <div className="col-span-1 font-normal flex items-center justify-center p-1">প্রাপ্তির রশিদ</div>
  </div>
            <div className="grid grid-cols-12 min-h-[90px] text-xs font-normal">
              <div className="col-span-1 border-r border-black p-2 text-center font-normal">০১</div>
              <div className="col-span-5 border-r border-black p-2 leading-relaxed font-normal">
                <p>{applicantName}, {designation}</p>
                <p>{schoolName}</p>
                <p>{upazilaName}, {districtName} এর সাধারণ ভবিষ্য তহবিল-এ জমাকৃত টাকা অগ্রিম উত্তোলন এর বিল।</p>
                <p className="mt-1">মঞ্জুরী নং- {cleanMemoNo} তারিখ: {applyDate}</p>
              </div>
              <div className="col-span-3 border-r border-black p-2 text-center font-normal flex items-center justify-center font-serif text-sm">
                {gpfAccNo}
              </div>
              <div className="col-span-2 border-r border-black p-2 text-center font-normal flex items-center justify-center">
                {requestedAmount}
              </div>
              <div className="col-span-1 p-2 text-center flex flex-col items-center justify-center text-[10px] text-gray-500 font-normal">
                রেভিনিউ ষ্ট্যাম্প
              </div>
            </div>
          </div>

          {/* প্রদেয় টাকা কথায় */}
          <div className="text-xs font-normal my-2 pt-1">
            প্রয়োজনীয় প্রদেয় টাকা = {requestedAmount} (কথায়: {requestedAmountWords}) টাকা বুঝিয়া পাইলাম।
          </div>

          {/* প্রত্যায়নসমূহ */}
          <div className="space-y-2 text-left pt-2">
            <h3 className="text-lg font-normal text-center">প্রত্যায়নসমূহ</h3>
            <div className="text-[13px] leading-relaxed space-y-2 text-justify font-normal" style={{ textAlign: 'justify' }}>
              <p>
                ১। প্রত্যায়ন করা যাইতেছে যে এই বিলে গৃহীত টাকা প্রকৃত প্রাপকদের মধ্যে বিলি করা হইয়াছে এবং প্রত্যেক ২০০ টাকার উপর প্রদানের ক্ষেত্রে রেভিনিউ ষ্ট্যাম্প লাগাইয়া সেগুলি যথাযথভাবে বাতিলপূর্বক আমার অফিসে রক্ষিত প্রাপ্তি বহিতে প্রাপ্তির রশিদ গ্রহণ করা হইয়াছে।
              </p>
              <p>
                ২। আরও প্রত্যায়ন করা যাইতেছে যে চাঁদা প্রদানকারীর হিসাবে স্থিতি তাহার অগ্রিম/উত্তোলিত অর্থ অপেক্ষা বেশী। (প্রযোজ্য ক্ষেত্রে) বীমা পলিসি নং *................................... রাষ্ট্রপতির অনুকূলে ন্যস্ত করা হইয়াছে এবং হিসাব রক্ষণ অফিসে দাখিল করিয়াছে অথবা (গৃহীতব্য) পলিসি হিসাব রক্ষণ অফিসে প্রেরণ করা হইয়াছে ও উক্ত অফিস কর্তৃক পত্র নং ..................... মারফত গৃহীত হইয়াছে *যদি একের অধিক পলিসি থাকে তবে তাহার বিবরণ এখানে প্রদান করা যাইতে পারে।
              </p>
            </div>
          </div>

          {/* আয়ন কর্মকর্তার স্বাক্ষর অংশ */}
          <div 
            className="pt-2 text-xs font-normal space-y-4"
            style={{ marginTop: '0.5in' }}
          >
            <div className="flex justify-between items-start text-xs font-normal">
              <div className="space-y-1">
                <p>স্থান: {upazilaName}</p>
                <p>তারিখ: {applyDate}</p>
                <p className="pt-3 text-gray-700">সীল</p>
              </div>
              <div className="text-left space-y-1 font-normal">
                <p>আয়ন কর্মকর্তার স্বাক্ষর: .....................................</p>
                <p>নাম: {ddoName}</p>
                <p>পদবী: {ddoDesignation}</p>
                <p>{upazilaName}, {districtName}।</p>
              </div>
            </div>

            <div className="w-full border-t border-black my-3"></div>

            <h4 className="text-base font-normal text-center">হিসাব রক্ষণ অফিসে ব্যবহারের জন্য</h4>
            
            <div className="w-full flex items-baseline justify-between text-xs font-normal">
              <span>টাকা ....................................</span>
              <span>(কথায়) ............................................................................................</span>
              <span>প্রদানের জন্য পাস করা হইল।</span>
            </div>

            <div className="grid grid-cols-3 gap-6 text-left text-xs font-normal pt-2">
              <div className="space-y-3 font-normal">
                <p>অডিটর</p>
                <p className="pt-2">নাম .....................................................</p>
                <p>তারিখ ...................................................</p>
              </div>
              <div className="space-y-3 font-normal">
                <p>সুপার</p>
                <p className="pt-2">নাম .....................................................</p>
                <p>তারিখ ...................................................</p>
              </div>
              <div className="space-y-3 font-normal">
                <p>হিসাব রক্ষণ কর্মকর্তা</p>
                <p className="pt-2">নাম .....................................................</p>
                <p>তারিখ ...................................................</p>
              </div>
            </div>
          </div>

          <div className="print-imprint text-left text-[10px] text-gray-600 pt-2 font-normal">
            বাঃসঃমুঃ-৯৭/৯৮-১৮০৫১ এফ(কম-১) ১০ লক্ষ কপি, (সি-৫৯) ১৯
          </div>
        </section>
      )}

      {/* ================= PAGE 4: ঋণ মঞ্জুরীপত্র ================= */}
      {(pageFilter === 'all' || pageFilter === 4) && (
        <section 
          id="print-page-4"
          className="print-page relative mx-auto bg-white p-12 sm:p-16 max-w-[210mm] min-h-[297mm] shadow-lg print:shadow-none print:m-0 print:p-[18mm] print:max-w-none print:w-full mt-8 print:mt-0 font-normal space-y-4 border border-slate-200 print:border-none"
          style={{ minHeight: '297mm' }}
        >
          {/* হেডার */}
          <div className="text-center space-y-1 mb-4 font-normal">
            <h3 className="text-sm font-normal">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h3>
            <h3 className="text-sm font-normal">উপজেলা শিক্ষা অফিসারের কার্যালয়</h3>
            <h3 className="text-sm font-normal">{upazilaName}, {districtName}।</h3>
            <div className="pt-2">
              <span className="inline-block border-b border-black text-sm px-4 pb-0.5 font-normal">ঋণ মঞ্জুরীপত্র</span>
            </div>
          </div>

          <p className="text-justify text-xs leading-relaxed mb-3 font-normal" style={{ textAlign: 'justify' }}>
            প্রাথমিক ও গণশিক্ষা মন্ত্রণালয়, প্রশাসন-২ অধিশাখা এর ২৩/০৪/২০০৯ খ্রি: তারিখের প্রাগম/প্রশা-২/এল-৯/২০০৭/৩৬২ নং স্মারকে প্রদত্ত ক্ষমতাবলে নিম্নোক্ত ছক মোতাবেক অগ্রিম উত্তোলনের মঞ্জুরী প্রদান করা হল।
          </p>

          {/* মঞ্জুরী ছক */}
          <div className="border border-black text-xs mb-4 font-normal">
            <div className="flex font-normal border-b border-black text-center leading-snug">
              <div className="w-[5%] border-r border-black flex items-center justify-center p-1 font-normal">ক্রমিক নং</div>
              <div className="w-[28%] border-r border-black flex items-center justify-center p-1 font-normal">কর্মচারীর নাম, পদবী ও কর্মস্থল</div>
              <div className="w-[14%] border-r border-black flex flex-col items-center justify-center p-1 font-normal leading-tight">
                <span>জিপিএফ</span>
                <span>হিসাব নং</span>
              </div>
              <div className="w-[13%] border-r border-black flex flex-col items-center justify-center p-1 font-normal leading-tight">
                <span>জমাকৃত</span>
                <span>টাকার পরিমাণ</span>
              </div>
              <div className="w-[13%] border-r border-black flex flex-col items-center justify-center p-1 font-normal leading-tight">
                <span>মঞ্জুরীকৃত</span>
                <span>টাকা</span>
              </div>
              <div className="w-[11%] border-r border-black flex items-center justify-center p-1 font-normal">অগ্রিম উত্তোলনের উদ্দেশ্য</div>
              <div className="w-[7%] border-r border-black flex items-center justify-center p-1 font-normal">কততম অগ্রিম</div>
              <div className="w-[9%] flex items-center justify-center p-1 font-normal">কিস্তির সংখ্যা ও পরিমাণ</div>
            </div>

            <div className="flex text-xs font-normal">
              <div className="w-[5%] border-r border-black p-1 text-center font-normal flex items-center justify-center">
                ০১
              </div>
              <div className="w-[28%] border-r border-black p-2 leading-relaxed text-left font-normal">
                <p>{applicantName}, {designation}</p>
                <p>{schoolName}</p>
                <p>{upazilaName}, {districtName}।</p>
              </div>
              <div className="w-[14%] border-r border-black p-1 text-center flex flex-col items-center justify-center font-normal font-serif text-xs break-all">
                <span>{gpfAccNo}</span>
              </div>
              <div className="w-[13%] border-r border-black p-1 text-center flex flex-col items-center justify-center font-normal text-xs">
                <span>{gpfTotalBalance}</span>
                <span className="text-[10px] text-gray-700">টাকা</span>
              </div>
              <div className="w-[13%] border-r border-black p-1 text-center flex flex-col items-center justify-center font-normal text-xs">
                <span>{requestedAmount}</span>
                <span className="text-[10px] text-gray-700">টাকা</span>
              </div>
              <div className="w-[11%] border-r border-black p-1 text-center flex items-center justify-center font-normal">
                {purpose}
              </div>
              <div className="w-[7%] border-r border-black p-1 text-center flex items-center justify-center font-normal">
                {installmentNo}
              </div>
              <div className="w-[9%] p-1 text-center leading-tight flex flex-col items-center justify-center text-[11px] font-normal">
                <span>{installmentCount}টি</span>
                <span className="text-gray-700 mt-0.5">{installmentAmount} টাকা</span>
              </div>
            </div>
          </div>

          {/* শর্তসমূহ */}
          <div className="text-xs space-y-1 mb-6 font-normal">
            <p>১। ঋণ মঞ্জুরীপত্র শিক্ষকের আবেদনের প্রেক্ষিতে জারী করা হইল।</p>
            <p>২। তাহার সাধারণ ভবিষ্য তহবিলে জমাকৃত টাকার ৭৫% অপেক্ষা উত্তোলনের জন্য মঞ্জুরকৃত অগ্রিম অধিক নহে।</p>
            <p>৩। মঞ্জুরীকৃত টাকা ফেরত যোগ্য অগ্রিম হিসাবে গণ্য হইবে।</p>
          </div>

          {/* মঞ্জুরিকারী অফিসারের স্বাক্ষর */}
          <div className="flex justify-between items-end mb-6 text-xs font-normal">
            <div></div>
            <div className="text-center space-y-0.5 font-normal">
              <p>({ddoName})</p>
              <p>{ddoDesignation}</p>
              <p>{upazilaName}, {districtName}।</p>
            </div>
          </div>

          {/* স্মারক ও অনুলিপি */}
          <div className="pt-2 text-xs leading-relaxed font-normal">
            <div className="flex justify-between mb-3 font-normal">
              <div>স্মারক নং- {cleanMemoNo}</div>
              <div>তারিখঃ {applyDate} খ্রি.।</div>
            </div>

            <p className="mb-2 font-normal">সদয় অবগতি ও প্রয়োজনীয় কার্যার্থে অনুলিপি প্রেরণ করা হলঃ</p>
            <div className="space-y-1.5 pl-2 text-xs font-normal">
              <p>১। জেলা প্রাথমিক শিক্ষা অফিসার, {districtName}।</p>
              <p>২। উপজেলা হিসাব রক্ষণ অফিসার, {upazilaName}, {districtName}।</p>
              <p>৩। জনাব {applicantName}, {designation}, {schoolName}, {upazilaName}, {districtName}।</p>
              <p>৪। সংরক্ষণ নথি।</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
