import React, { useState, useEffect } from 'react';
import { X, Code2, Eye, Copy, RotateCcw, Printer, Check, Download, Save, CheckCircle2 } from 'lucide-react';
import { GpfFormData } from '../../src/types';
import { toBanglaDigits } from '../../src/utils/numberToBanglaWords';
import { getSavedCustomHtml, saveCustomHtml, clearCustomHtml } from '../../src/utils/storage';

interface HtmlEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GpfFormData;
  onSaveHtml?: (html: string) => void;
}

export const HtmlEditorModal: React.FC<HtmlEditorModalProps> = ({ isOpen, onClose, data, onSaveHtml }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [activeView, setActiveView] = useState<'editor' | 'preview' | 'split'>('split');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [, setHasSavedCustom] = useState(false);

  // Generate complete standalone HTML string based on current data
  const generateInitialHtml = (d: GpfFormData) => {
    const applyDate = d.applyDate ? toBanglaDigits(d.applyDate) : '........................';
    const rawReceiver = d.receiverInfo || 'উপজেলা শিক্ষা অফিসার, বিয়ানীবাজার, সিলেট।';
    const displayReceiver = rawReceiver.split('\n').map((s) => s.trim()).filter(Boolean).join(', ');
    const installmentNo = d.installmentNo || '১ম কিস্তি';
    const schoolName = d.schoolName || '................................';
    const designation = d.designation || 'সহকারী শিক্ষক';
    const gpfAccNo = d.gpfAccNo ? toBanglaDigits(d.gpfAccNo) : '........................';
    const purpose = d.purpose || 'গৃহমেরামত';
    const requestedAmount = d.requestedAmount ? toBanglaDigits(d.requestedAmount) : '................';
    const requestedAmountWords = d.requestedAmountWords || '................................';
    const applicantName = d.applicantName || '................................';
    const upazilaName = d.upazilaName || 'বিয়ানীবাজার';
    const districtName = d.districtName || 'সিলেট';
    const gpfTotalBalance = d.gpfTotalBalance ? toBanglaDigits(d.gpfTotalBalance) : '................';
    const basicSalary = d.basicSalary ? toBanglaDigits(d.basicSalary) : '................';
    const installmentCount = d.installmentCount ? toBanglaDigits(d.installmentCount) : '২৪';
    const installmentAmount = d.installmentAmount ? toBanglaDigits(d.installmentAmount) : '................';
    const ddoName = d.ddoName || '................................';
    const ddoDesignation = d.ddoDesignation || 'উপজেলা শিক্ষা অফিসার';
    const year = d.year ? toBanglaDigits(d.year) : '২০২৪';
    let rawMemo = d.memoNo || `উশিঅ/বিবা/সা:ভ:তহ:/অগ্রিম/${year}/`;
    rawMemo = rawMemo.replace(/\/৩২২\b|\/322\b/, '/').trim();
    if (rawMemo.includes('উশিঅ/')) {
      rawMemo = rawMemo.replace(/\/(\d{4}|[০-৯]{4}|[০-৯]{4}-[০-৯]{4})\//, `/${year}/`);
    }
    const cleanMemoNo = toBanglaDigits(rawMemo);

    return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>জিপিএফ অগ্রিম উত্তোলন - ৪ পাতার সরকারি ফরম্যাট</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; font-weight: 400 !important; }
    body { font-family: 'Noto Serif Bengali', serif; margin: 0; padding: 20px; background: #fff; color: #000; line-height: 1.6; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto 30px auto; padding: 21mm; background: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); page-break-after: always; }
    .page-1 { padding-top: 35mm; }
    .text-justify { text-align: justify; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .table-bordered { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
    .table-bordered th, .table-bordered td { border: 1px solid #000; padding: 6px 8px; }
    .no-border-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px; }
    .no-border-table td { padding: 8px 4px; vertical-align: top; }
    @media print {
      body { padding: 0; background: transparent; }
      .page { box-shadow: none; margin: 0; width: 100%; }
    }
  </style>
</head>
<body>

  <!-- ================= ১ম পাতা: আবেদনপত্র ================= -->
  <div class="page page-1">
    <div class="text-left" style="margin-bottom: 25px;">তারিখ: ${applyDate} খ্রি.।</div>
    <div style="margin-bottom: 25px;">
      <div>বরাবর</div>
      <div>${d.receiverInfo ? d.receiverInfo.replace(/\n/g, '<br>') : 'উপজেলা শিক্ষা অফিসার<br>বিয়ানীবাজার, সিলেট।'}</div>
    </div>
    <div style="margin-bottom: 25px;">মাধ্যম: যথাযথ কর্তৃপক্ষ।</div>
    <div style="margin-bottom: 25px; font-size: 16px;">
      বিষয়ঃ সাধারণ ভবিষ্য তহবিল হতে ফেরতযোগ্য ${installmentNo} অগ্রিম উত্তোলনের আবেদন।
    </div>
    
    <div class="text-justify" style="line-height: 2;">
      <p style="margin-bottom: 8px; text-align: left;">জনাব,</p>
      <p style="text-align: justify; margin-bottom: 20px;">
        সবিনয় নিবেদন এই যে, আমি নিম্ন স্বাক্ষরকারী ${schoolName} এর ${designation}। আমার সাধারণ ভবিষ্য তহবিল হিসাব নং ${gpfAccNo}। ${purpose} এর লক্ষ্যে আমার সাধারণ ভবিষ্য তহবিলে জমাকৃত টাকা হতে ${requestedAmount} (কথায়: ${requestedAmountWords}) টাকা ${installmentNo} উত্তোলন করা প্রয়োজন। এমতাবস্থায় আমার সাধারণ ভবিষ্য তহবিল হতে প্রার্থীত টাকা ${installmentNo} হিসেবে অগ্রিম উত্তোলনের অনুমতি দানের জন্য মহোদয়ের নিকট বিনীত আবেদন করছি।
      </p>
      <p style="text-align: justify;">
        অতএব, মহোদয়ের নিকট সবিনয় নিবেদন এই যে, আমার সাধারণ ভবিষ্য তহবিল হিসাব এ জমাকৃত টাকা হতে প্রার্থীত টাকা ${installmentNo} অগ্রিম উত্তোলনের অনুমতি দানে আপনার সদয় মর্জি হয়।
      </p>
    </div>

    <div style="margin-top: 60px; text-align: left; line-height: 1.8;">
      <p>বিনীত</p>
      <p>নিবেদক</p>
      <p style="margin-bottom: 30px;">আপনার বিশ্বস্ত</p>
      <div>
        <p>${applicantName}</p>
        <p>${designation}</p>
        <p>${schoolName}</p>
        <p>${upazilaName}, ${districtName}।</p>
      </div>
    </div>
  </div>

  <!-- ================= ২য় পাতা: ফরম ২৬৩৯ ================= -->
  <div class="page">
    <div style="font-size: 12px; margin-bottom: 5px;">বাংলাদেশ ফরম নং ২৬৩৯</div>
    <div class="text-center" style="font-size: 16px; margin-bottom: 20px;">
      সাধারণ ভবিষ্য তহবিল হইতে অগ্রিম গ্রহণের জন্য আবেদনের ফরম
    </div>

    <div style="padding-left: 1in; margin-bottom: 20px; font-size: 14px; display: flex;">
      <span style="white-space: nowrap;">প্রাপকঃ</span>
      <span style="padding-left: 0.75in;">${displayReceiver}</span>
    </div>

    <div class="text-justify" style="font-size: 14px; margin-bottom: 20px;">
      <p style="margin-bottom: 8px; text-align: left;">মহোদয়,</p>
      <p style="text-indent: 40px;">সবিনয় নিবেদন এই যে, আমার ভবিষ্য তহবিলে জমাকৃত টাকা হইতে অগ্রিম টাকা ${requestedAmount} (কথায়: ${requestedAmountWords}) পাওয়ার জন্য আবেদন করিতেছি। আমি নিম্নের প্রতিটি প্রশ্নের সঠিকভাবে উত্তর দিচ্ছি।</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px;">
      <div>
        <p>তারিখ: ${applyDate}</p>
        <p>স্থান: ${upazilaName}, ${districtName}।</p>
      </div>
      <div style="text-align: left; line-height: 1.6;">
        <p>আপনার অনুগত</p>
        <p style="margin-top: 8px;">স্বাক্ষর: .......................................</p>
        <p>পদবী: ${designation}</p>
        <p>ঠিকানা: ${schoolName}</p>
        <p>${upazilaName}, ${districtName}।</p>
      </div>
    </div>

    <table class="no-border-table">
      <tr>
        <td style="width: 65%;">১। পূর্ববর্তী ৩০ শে জুনে আপনার কত টাকা জমা ছিল:</td>
        <td style="width: 35%;">${gpfTotalBalance} টাকা</td>
      </tr>
      <tr>
        <td>২। অগ্রিমের প্রয়োজনীয়তার কারণ কি?</td>
        <td>${purpose}</td>
      </tr>
      <tr>
        <td>৩। আপনার বর্তমান বেতন কত?</td>
        <td>${basicSalary} টাকা</td>
      </tr>
      <tr>
        <td>৪। (ক) পূর্বে কি কোন অগ্রিম লওয়া হইয়াছিল?</td>
        <td>${d.hasPreviousLoan || 'না'}</td>
      </tr>
      <tr>
        <td style="padding-left: 18px; font-size: 13px; color: #333;">(খ) যদি হইয়া থাকে, অগ্রিমের সব টাকা কি পরিশোধ করা হইয়াছে?</td>
        <td style="font-size: 13px;">${d.isPreviousLoanRepaid || 'প্রযোজ্য নয়'}</td>
      </tr>
      <tr>
        <td style="padding-left: 18px; font-size: 13px; color: #333;">(গ) যদি হইয়া থাকে, পরিশোধের শেষ কিস্তি সুদসহ কোন সময়ে দেওয়া হইয়াছিল?</td>
        <td style="font-size: 13px;">${d.lastInstallmentDate || 'প্রযোজ্য নয়'}</td>
      </tr>
      <tr>
        <td style="padding-left: 18px; font-size: 13px; color: #333;">(ঘ) পূর্বের অগ্রিম সম্পূর্ণরূপে পরিশোধ না হইয়া থাকিলে আর কত কিস্তি প্রদেয় আছে?</td>
        <td style="font-size: 13px;">${d.remainingInstallments || 'প্রযোজ্য নয়'}</td>
      </tr>
      <tr>
        <td>৫। কত কিস্তিতে অগ্রিম পরিশোধ করিতে ইচ্ছুক?</td>
        <td>${installmentCount} কিস্তি</td>
      </tr>
      <tr>
        <td>৬। তহবিলে জমাকৃত টাকার কি সুদ হয়?</td>
        <td>${d.hasInterest || 'হ্যাঁ'}</td>
      </tr>
    </table>

    {/* ২ নম্বর পাতার নিচের অংশ: সুপারিশ (বামে) ও স্বাক্ষর (ডানে) এক রোতে সমান্তরাল */}
<div className="pt-2 font-normal border-t border-gray-300 mt-2">
  <div className="grid grid-cols-2 gap-4 items-start text-xs font-normal">
    {/* বাম পাশ: ঊর্ধ্বতন অফিসারের সুপারিশ */}
    <div className="pr-2 space-y-1 text-left">
      <div className="font-bold text-sm text-gray-900 mb-1">
        ঊর্ধ্বতন অফিসারের সুপারিশ:
      </div>
      <p className="text-[11px] text-gray-600">
        নং স(বাঃ বাঃ কো)ভেটিং/ফ-১৩৩/৭৫-৩৬৭৬, তাং ৬-১২-৮৫
      </p>
      <p className="text-[11px] text-gray-600">
        বাঃসঃমুঃ-৯৩/৯৪-১০১০১জে--৫ লক্ষ কপি, ১৯৯৪
      </p>
      <p className="text-xs font-medium text-gray-900 pt-1">
        {advanceAmount || 'প্রযোজ্য'} অগ্রিম মঞ্জুরীর সুপারিশ করা হলো।
      </p>
    </div>

    {/* ডান পাশ: স্বাক্ষর ও পদবী */}
    <div className="pl-4 text-left space-y-0.5 text-xs font-normal">
      <p className="mb-4">স্বাক্ষর .........................................</p>
      <p className="font-medium">পদবী: {designation || 'উপজেলা প্রাথমিক শিক্ষা অফিসার'}</p>
      <p>{officeName || 'উপজেলা শিক্ষা অফিস'}</p>
      <p>{upazilaName || 'বিয়ানীবাজার'}, {districtName || 'সিলেট'}।</p>
    </div>
  </div>
</div>

  <!-- ================= ৩য় পাতা: টি, আর ফরম নং ৩৭ ================= -->
  <div class="page">
    <div style="font-size: 12px;">টি, আর ফরম নং ৩৭ [এস, আর ৩২৪ (১) দ্রষ্টব্য]</div>
    <div class="text-center" style="font-size: 16px; margin: 15px 0;">কর্মচারীদের ভবিষ্য তহবিল হইতে উত্তোলন/অগ্রিম গ্রহণের বিল</div>
    <div class="text-center" style="font-size: 13px; margin-bottom: 15px;">ভবিষ্য তহবিলের শ্রেণী বিন্যাস কোড: ৭২৪৩২০০০০৯১০১</div>

    <table class="table-bordered">
      <tr>
        <th style="width: 8%;">ক্রমিক</th>
        <th style="width: 42%;">চাঁদা প্রদানকারীর নাম ও বিবরণ</th>
        <th style="width: 25%;">ভবিষ্য তহবিলের হিসাব নং</th>
        <th style="width: 15%;">অগ্রিম টাকা</th>
        <th style="width: 10%;">প্রাপ্তির রশিদ</th>
      </tr>
      <tr>
        <td class="text-center">০১</td>
        <td>
          <p>${applicantName}, ${designation}</p>
          <p>${schoolName}</p>
          <p>${upazilaName}, ${districtName} এর সাধারণ ভবিষ্য তহবিল-এ জমাকৃত টাকা অগ্রিম উত্তোলন এর বিল।</p>
          <p style="margin-top: 4px;">মঞ্জুরী নং- ${cleanMemoNo} তারিখ: ${applyDate}</p>
        </td>
        <td class="text-center">${gpfAccNo}</td>
        <td class="text-center">${requestedAmount}</td>
        <td class="text-center" style="font-size: 10px;">রেভিনিউ ষ্ট্যাম্প</td>
      </tr>
    </table>

    <div style="margin: 15px 0; font-size: 13px;">
      প্রয়োজনীয় প্রদেয় টাকা = ${requestedAmount} (কথায়: ${requestedAmountWords}) টাকা বুঝিয়া পাইলাম।
    </div>

    <div style="margin: 20px 0;">
      <div class="text-center" style="font-size: 18px; margin-bottom: 10px;">প্রত্যায়নসমূহ</div>
      <div class="text-justify" style="font-size: 13px; line-height: 1.6;">
        <p>১। প্রত্যায়ন করা যাইতেছে যে এই বিলে গৃহীত টাকা প্রকৃত প্রাপকদের মধ্যে বিলি করা হইয়াছে এবং প্রত্যেক ২০০ টাকার উপর প্রদানের ক্ষেত্রে রেভিনিউ ষ্ট্যাম্প লাগাইয়া সেগুলি যথাযথভাবে বাতিলপূর্বক আমার অফিসে রক্ষিত প্রাপ্তি বহিতে প্রাপ্তির রশিদ গ্রহণ করা হইয়াছে।</p>
        <p style="margin-top: 8px;">২। আরও প্রত্যায়ন করা যাইতেছে যে চাঁদা প্রদানকারীর হিসাবে স্থিতি তাহার অগ্রিম/উত্তোলিত অর্থ অপেক্ষা বেশী। (প্রযোজ্য ক্ষেত্রে) বীমা পলিসি নং *................................... রাষ্ট্রপতির অনুকূলে ন্যস্ত করা হইয়াছে এবং হিসাব রক্ষণ অফিসে দাখিল করিয়াছে অথবা (গৃহীতব্য) পলিসি হিসাব রক্ষণ অফিসে প্রেরণ করা হইয়াছে ও উক্ত অফিস কর্তৃক পত্র নং ..................... মারফত গৃহীত হইয়াছে *যদি একের অধিক পলিসি থাকে তবে তাহার বিবরণ এখানে প্রদান করা যাইতে পারে।</p>
      </div>
    </div>

    <div style="margin-top: 0.5in;">
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 15px;">
        <div>
          <p>স্থান: ${upazilaName}</p>
          <p>তারিখ: ${applyDate}</p>
          <p style="margin-top: 12px; color: #555;">সীল</p>
        </div>
        <div style="text-align: left; line-height: 1.6;">
          <p>আয়ন কর্মকর্তার স্বাক্ষর: .....................................</p>
          <p>নাম: ${ddoName}</p>
          <p>পদবী: ${ddoDesignation}</p>
          <p>${upazilaName}, ${districtName}।</p>
        </div>
      </div>

      <hr style="border: 0; border-top: 1px solid #000; margin: 15px 0;">
      <div class="text-center" style="font-size: 16px; margin-bottom: 15px;">হিসাব রক্ষণ অফিসে ব্যবহারের জন্য</div>
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 25px;">
        <span>টাকা ....................................</span>
        <span>(কথায়) ............................................................................................</span>
        <span>প্রদানের জন্য পাস করা হইল।</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; text-align: left;">
        <div>
          <p>অডিটর</p>
          <p style="margin-top: 8px;">নাম .....................................................</p>
          <p>তারিখ ...................................................</p>
        </div>
        <div>
          <p>সুপার</p>
          <p style="margin-top: 8px;">নাম .....................................................</p>
          <p>তারিখ ...................................................</p>
        </div>
        <div>
          <p>হিসাব রক্ষণ কর্মকর্তা</p>
          <p style="margin-top: 8px;">নাম .....................................................</p>
          <p>তারিখ ...................................................</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= ৪র্থ পাতা: ঋণ মঞ্জুরীপত্র ================= -->
  <div class="page">
    <div class="text-center" style="margin-bottom: 20px;">
      <div style="font-size: 14px;">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
      <div style="font-size: 14px;">উপজেলা শিক্ষা অফিসারের কার্যালয়</div>
      <div style="font-size: 14px;">${upazilaName}, ${districtName}।</div>
      <div style="margin-top: 8px;">
        <span style="border-bottom: 1px solid #000; font-size: 14px; padding-bottom: 2px;">ঋণ মঞ্জুরীপত্র</span>
      </div>
    </div>

    <div class="text-justify" style="font-size: 12px; margin-bottom: 15px;">
      প্রাথমিক ও গণশিক্ষা মন্ত্রণালয়, প্রশাসন-২ অধিশাখা এর ২৩/০৪/২০০৯ খ্রি: তারিখের প্রাগম/প্রশা-২/এল-৯/২০০৭/৩৬২ নং স্মারকে প্রদত্ত ক্ষমতাবলে নিম্নোক্ত ছক মোতাবেক অগ্রিম উত্তোলনের মঞ্জুরী প্রদান করা হল।
    </div>

    <table class="table-bordered">
      <tr>
        <th style="width: 5%;">ক্রমিক নং</th>
        <th style="width: 28%;">কর্মচারীর নাম, পদবী ও কর্মস্থল</th>
        <th style="width: 14%;">জিপিএফ<br>হিসাব নং</th>
        <th style="width: 13%;">জমাকৃত<br>টাকার পরিমাণ</th>
        <th style="width: 13%;">মঞ্জুরীকৃত<br>টাকা</th>
        <th style="width: 11%;">অগ্রিম উত্তোলনের উদ্দেশ্য</th>
        <th style="width: 7%;">কততম অগ্রিম</th>
        <th style="width: 9%;">কিস্তির সংখ্যা ও পরিমাণ</th>
      </tr>
      <tr>
        <td class="text-center">০১</td>
        <td>
          <p>${applicantName}, ${designation}</p>
          <p>${schoolName}</p>
          <p>${upazilaName}, ${districtName}।</p>
        </td>
        <td class="text-center">${gpfAccNo}</td>
        <td class="text-center">${gpfTotalBalance}<br><span style="font-size: 10px; color: #555;">টাকা</span></td>
        <td class="text-center">${requestedAmount}<br><span style="font-size: 10px; color: #555;">টাকা</span></td>
        <td class="text-center">${purpose}</td>
        <td class="text-center">${installmentNo}</td>
        <td class="text-center">${installmentCount}টি<br><span style="font-size: 11px; color: #555;">${installmentAmount} টাকা</span></td>
      </tr>
    </table>

    <div style="font-size: 12px; margin: 20px 0; line-height: 1.6;">
      <p>১। ঋণ মঞ্জুরীপত্র শিক্ষকের আবেদনের প্রেক্ষিতে জারী করা হইল।</p>
      <p>২। তাহার সাধারণ ভবিষ্য তহবিলে জমাকৃত টাকার ৭৫% অপেক্ষা উত্তোলনের জন্য মঞ্জুরকৃত অগ্রিম অধিক নহে।</p>
      <p>৩। মঞ্জুরীকৃত টাকা ফেরত যোগ্য অগ্রিম হিসাবে গণ্য হইবে।</p>
    </div>

    <div style="text-align: right; margin: 30px 0; font-size: 12px;">
      <div style="display: inline-block; text-align: center;">
        <p>(${ddoName})</p>
        <p>${ddoDesignation}</p>
        <p>${upazilaName}, ${districtName}।</p>
      </div>
    </div>

    <div style="font-size: 12px; line-height: 1.6;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <div>স্মারক নং- ${cleanMemoNo}</div>
        <div>তারিখঃ ${applyDate} খ্রি.।</div>
      </div>
      <p>সদয় অবগতি ও প্রয়োজনীয় কার্যার্থে অনুলিপি প্রেরণ করা হলঃ</p>
      <div style="padding-left: 10px;">
        <p>১। জেলা প্রাথমিক শিক্ষা অফিসার, ${districtName}।</p>
        <p>২। উপজেলা হিসাব রক্ষণ অফিসার, ${upazilaName}, ${districtName}।</p>
        <p>৩। জনাব ${applicantName}, ${designation}, ${schoolName}, ${upazilaName}, ${districtName}।</p>
        <p>৪। সংরক্ষণ নথি।</p>
      </div>
    </div>
  </div>

</body>
</html>`;
  };

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedCustomHtml();
      if (saved) {
        setHtmlContent(saved);
        setHasSavedCustom(true);
      } else {
        setHtmlContent(generateInitialHtml(data));
        setHasSavedCustom(false);
      }
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveCustomHtml(htmlContent);
    setIsSaved(true);
    setHasSavedCustom(true);
    if (onSaveHtml) {
      onSaveHtml(htmlContent);
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    clearCustomHtml();
    setHasSavedCustom(false);
    const fresh = generateInitialHtml(data);
    setHtmlContent(fresh);
    if (onSaveHtml) {
      onSaveHtml('');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GPF_Advance_4Page_Form_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="px-6 py-3 bg-slate-850 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">এইচটিএমএল (HTML) কোড এডিটর</h3>
              <p className="text-xs text-slate-400">সরাসরি এইচটিএমএল কোডিং পরিবর্তন ও লাইভ প্রিভিউ দেখুন</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveView('editor')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeView === 'editor' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                কোড এডিটর
              </button>
              <button
                onClick={() => setActiveView('split')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeView === 'split' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                পাশাপাশি (Split)
              </button>
              <button
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeView === 'preview' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                প্রিভিউ
              </button>
            </div>

            {/* Save HTML button */}
            <button
              onClick={handleSave}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/40'
              }`}
              title="এইচটিএমএল কোড পরিবর্তন সংরক্ষণ করুন"
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-white animate-bounce" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'সেইভ হয়েছে!' : 'সেইভ করুন'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="এইচটিএমএল কোড কপি করুন"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="ডিফল্ট কোডে রিসেট করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center transition-colors cursor-pointer"
              title=".html ফাইল ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
              title="এডিট করা এইচটিএমএল প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor & Preview Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Code Editor Pane */}
          {(activeView === 'editor' || activeView === 'split') && (
            <div className={`flex flex-col border-r border-slate-800 ${activeView === 'split' ? 'w-1/2' : 'w-full'}`}>
              <div className="bg-slate-950 px-4 py-1.5 text-[11px] text-slate-400 font-mono border-b border-slate-800 flex justify-between items-center">
                <span>HTML Source Code (সম্পাদনাযোগ্য)</span>
                <span>UTF-8</span>
              </div>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="flex-1 w-full bg-slate-950 text-emerald-300 font-mono text-xs p-4 focus:outline-hidden resize-none leading-relaxed selection:bg-slate-800"
                spellCheck={false}
              />
            </div>
          )}

          {/* Live Preview Pane */}
          {(activeView === 'preview' || activeView === 'split') && (
            <div className={`flex flex-col bg-slate-950/40 ${activeView === 'split' ? 'w-1/2' : 'w-full'}`}>
              <div className="bg-slate-950 px-4 py-1.5 text-[11px] text-slate-400 font-mono border-b border-slate-800 flex justify-between items-center">
                <span>লাইভ প্রিভিউ (Live Preview)</span>
                <span className="text-emerald-400 flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>রিয়েল-টাইম রেন্ডার</span>
                </span>
              </div>
              <iframe
                title="Live HTML Preview"
                srcDoc={htmlContent}
                className="flex-1 w-full h-full bg-white border-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
