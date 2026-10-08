import { GpfFinalFormData, HtmlTemplate } from '../types';
import { toBengaliDigits, formatBanglaCurrency } from './bengaliConverter';

// Placeholder tag replacement function
export const populateTemplate = (templateHtml: string, data: GpfFinalFormData): string => {
  let populated = templateHtml;

  const replacements: Record<string, string> = {
    '{{applicant_name}}': data.applicantName || 'মোছাঃ ফাহিমা আক্তার',
    '{{designation}}': data.designation || 'সহকারী শিক্ষক',
    '{{school_name}}': data.schoolName || 'মুকুন্দ সরকারি প্রাথমিক বিদ্যালয়',
    '{{birth_date}}': toBengaliDigits(data.birthDate || '০২/০১/১৯৭০'),
    '{{gpf_acc_no}}': toBengaliDigits(data.gpfAccountNo || '৩৯/বিয়ানীবাজার'),
    '{{gpf_total_balance}}': toBengaliDigits(data.totalDepositedAmount || '৪০০০০০'),
    '{{requested_amount_num}}': toBengaliDigits(data.requestedAmountNumber || '৫০০০০০'),
    '{{in_wards_outo_generated}}': data.requestedAmountWords || 'পাঁচ লক্ষ টাকা মাত্র',
    '{{basic_salary}}': toBengaliDigits(data.basicSalary || '২৪২২০'),
    '{{nid_no}}': toBengaliDigits(data.nidNumber || '১৯৭০৯১২৩৪০৫৬৭৮৯০'),
    '{{gpf_year}}': toBengaliDigits(data.yearSession || '২০২৬'),
    '{{apply_date}}': toBengaliDigits(data.applicationDate || '২১/০৯/২০২৬'),
    '{{receiver_info}}': (data.recipient || 'উপজেলা শিক্ষা অফিসার\nবিয়ানীবাজার, সিলেট।').replace(/\n/g, '<br/>'),
    '{{ddo_name}}': data.ddoName || 'রুহুল আমিন সরকার',
    '{{ddo_designation}}': data.ddoDesignation || 'উপজেলা শিক্ষা অফিসার',
    '{{upazila_name}}': data.upazila || 'বিয়ানীবাজার',
    '{{district_name}}': data.district || 'সিলেট',
    '{{formatted_amount}}': formatBanglaCurrency(data.requestedAmountNumber || '500000'),
    '{{formatted_balance}}': formatBanglaCurrency(data.totalDepositedAmount || '400000'),
  };

  for (const [tag, val] of Object.entries(replacements)) {
    // Replace all occurrences of tag
    populated = populated.split(tag).join(val);
  }

  return populated;
};

// 5 Official Standard GPF Final Settlement Document Templates
export const DEFAULT_5_TEMPLATES: HtmlTemplate[] = [
  {
    id: 'page-1-final-application',
    name: 'পৃষ্ঠা ১: চূড়ান্ত উত্তোলনের আবেদনপত্র',
    pageNumber: 1,
    htmlContent: `
<div class="gov-document-page">
  <div style="text-align: left; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
    তারিখ: {{apply_date}} খ্রি.<br/>
    বরাবর,<br/>
    {{receiver_info}}
  </div>

  <div style="margin-left: 0; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
    <strong>মাধ্যম:</strong> যথাযথ কর্তৃপক্ষ।
  </div>

  <div style="font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
    <strong>বিষয়: সাধারণ ভবিষ্যৎ তহবিল (জিপিএফ) হিসাব নম্বর- {{gpf_acc_no}} এর চূড়ান্ত স্থিতি উত্তোলনের আবেদন।</strong>
  </div>

  <div style="font-size: 14px; line-height: 1.9; text-align: justify; text-justify: inter-word; margin-bottom: 30px;">
    মহোদয়,<br/>
    যথাবিহিত সম্মান প্রদর্শনপূর্বক বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী <strong>{{applicant_name}}</strong>, পদবী: <strong>{{designation}}</strong>, বিদ্যালয়: <strong>{{school_name}}</strong>, উপজেলা: <strong>{{upazila_name}}</strong>, জেলা: <strong>{{district_name}}</strong> হিসেবে কর্মরত থাকা অবস্থায় সরকারি চাকরি বিধিমালা অনুযায়ী অবসর প্রস্তুতিমূলক ছুটি (PRL) / চূড়ান্ত অবসর গ্রহণ করেছি। আমার জিপিএফ হিসাব নম্বর- <strong>{{gpf_acc_no}}</strong>।
    <br/><br/>
    এমতাবস্থায়, সরকারি বিধি মোতাবেক আমার উক্ত জিপিএফ হিসাবে জমাকৃত সর্বশেষ মোট স্থিতি <strong>{{formatted_amount}}/-</strong> (কথায়: <strong>{{in_wards_outo_generated}}</strong>) সরকারি ট্রেজারি / হিসাবরক্ষণ অফিস হতে চূড়ান্তভাবে উত্তোলনপূর্বক পরিশোধের প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য সবিনয় অনুরোধ জানাচ্ছি।
  </div>

  <div style="margin-top: 50px; font-size: 14px; line-height: 1.8; float: right; text-align: left; width: 280px;">
    বিনীত নিবেদক,<br/><br/><br/>
    স্বাক্ষর: ....................................................<br/>
    নাম: <strong>{{applicant_name}}</strong><br/>
    পদবী: <strong>{{designation}}</strong><br/>
    বিদ্যালয়: <strong>{{school_name}}</strong><br/>
    উপজেলা: <strong>{{upazila_name}}</strong>, জেলা: <strong>{{district_name}}</strong><br/>
    মোবাইল নং: ...............................................
  </div>
  <div style="clear: both;"></div>
</div>
`
  },
  {
    id: 'page-2-form-2639',
    name: 'পৃষ্ঠা ২: বাংলাদেশ ফরম নং ২৬৩৯',
    pageNumber: 2,
    htmlContent: `
<div class="gov-document-page">
  <div style="text-align: right; font-size: 10px; color: #444; margin-bottom: 4px;">
    বাংলাদেশ ফরম নং ২৬৩৯
  </div>
  <div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 15px; border-bottom: 1.5px solid #000; padding-bottom: 6px;">
    সাধারণ ভবিষ্যৎ তহবিল (জিপিএফ) চূড়ান্ত পরিশোধ ও বিবরণী ফরম
  </div>

  <table style="width: 100%; border-collapse: collapse; font-size: 13px; line-height: 1.7; margin-bottom: 25px;">
    <tbody>
      <tr>
        <td style="width: 5%; vertical-align: top; padding: 6px 0;">১।</td>
        <td style="width: 45%; vertical-align: top; padding: 6px 0;">আবেদনকারীর নাম ও পদবী</td>
        <td style="width: 50%; vertical-align: top; padding: 6px 0;">: <strong>{{applicant_name}}</strong>, {{designation}}</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 6px 0;">২।</td>
        <td style="vertical-align: top; padding: 6px 0;">কর্মস্থলের নাম</td>
        <td style="vertical-align: top; padding: 6px 0;">: {{school_name}}, {{upazila_name}}, {{district_name}}</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 6px 0;">৩।</td>
        <td style="vertical-align: top; padding: 6px 0;">জন্ম তারিখ ও জাতীয় পরিচয়পত্র নং</td>
        <td style="vertical-align: top; padding: 6px 0;">: {{birth_date}} খ্রি. | এনআইডি: {{nid_no}}</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 6px 0;">৪।</td>
        <td style="vertical-align: top; padding: 6px 0;">জিপিএফ হিসাব নম্বর</td>
        <td style="vertical-align: top; padding: 6px 0;">: <strong>{{gpf_acc_no}}</strong></td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 6px 0;">৫।</td>
        <td style="vertical-align: top; padding: 6px 0;">সর্বশেষ মূল বেতন ও স্কেল</td>
        <td style="vertical-align: top; padding: 6px 0;">: {{basic_salary}}/- টাকা</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 6px 0;">৬।</td>
        <td style="vertical-align: top; padding: 6px 0;">চূড়ান্ত উত্তোলনের প্রার্থীত অর্থ</td>
        <td style="vertical-align: top; padding: 6px 0;">: <strong>{{formatted_amount}}/-</strong> টাকা<br/>(কথায়: {{in_wards_outo_generated}})</td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 6px 0;">৭।</td>
        <td style="vertical-align: top; padding: 6px 0;">অবসর গ্রহণ / পিআরএল গমনের কারণ</td>
        <td style="vertical-align: top; padding: 6px 0;">: বয়স ৫৯ বছর পূর্ণ হওয়া জনিত স্বাভাবিক অবসর / পিআরএল</td>
      </tr>
    </tbody>
  </table>

  <div style="border: 1px solid #000; padding: 12px; font-size: 13px; line-height: 1.8; margin-bottom: 40px; text-align: justify;">
    <strong>আয়ন ও ব্যয়ন কর্মকর্তার প্রত্যয়ন:</strong><br/>
    প্রত্যয়ন করা যাইতেছে যে, উক্ত আবেদনকারীর জিপিএফ পাসবই ও সার্ভিস বুক যথাযথভাবে পরীক্ষা ও নিরীক্ষা করা হইয়াছে। উক্ত কর্মচারীর নামে সাধারণ ভবিষ্যৎ তহবিল হইতে গৃহীত কোন পূর্ববর্তী ঋণ বা অন্য কোন সরকারি অর্থ অপরিশোধিত বা অনিষ্পন্ন নাই। বিধিমতে তাহার জিপিএফ হিসাবের সমুদয় পাওনা অর্থ চূড়ান্তভাবে পরিশোধের জন্য সুপারিশ করা হইল।
  </div>

  <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 13px; text-align: center;">
    <div style="width: 220px;">
      <br/><br/>
      স্বাক্ষর ও সীল<br/>
      উপজেলা হিসাবরক্ষণ কর্মকর্তা<br/>
      {{upazila_name}}, {{district_name}}
    </div>
    <div style="width: 240px;">
      <br/><br/>
      (<strong>{{ddo_name}}</strong>)<br/>
      {{ddo_designation}}<br/>
      {{upazila_name}}, {{district_name}}
    </div>
  </div>
</div>
`
  },
  {
    id: 'page-3-tr-form-37',
    name: 'পৃষ্ঠা ৩: টি, আর ফরম নং ৩৭ (বিল ফরম)',
    pageNumber: 3,
    htmlContent: `
<div class="gov-document-page">
  <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 5px;">
    <span>টি, আর ফরম নং ৩৭</span>
    <span>হিসাব কোড: ৭২৪৩২০০০০৯১০১</span>
  </div>
  <div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 15px; border-bottom: 1.5px solid #000; padding-bottom: 6px;">
    সাধারণ ভবিষ্যৎ তহবিল (জিপিএফ) চূড়ান্ত পরিশোধ বিল
  </div>

  <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 12px; margin-bottom: 20px;" border="1">
    <thead>
      <tr style="background: #f5f5f5; text-align: center;">
        <th style="padding: 6px; border: 1px solid #000; width: 8%;">ক্রমিক</th>
        <th style="padding: 6px; border: 1px solid #000; width: 42%;">হিসাবের বিবরণ ও আবেদনকারী</th>
        <th style="padding: 6px; border: 1px solid #000; width: 25%;">হিসাব নং ও অনুমোদন আদেশ</th>
        <th style="padding: 6px; border: 1px solid #000; width: 25%;">টাকার পরিমাণ (টাকা)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border: 1px solid #000; text-align: center; vertical-align: top;">০১</td>
        <td style="padding: 10px; border: 1px solid #000; vertical-align: top;">
          নাম: <strong>{{applicant_name}}</strong><br/>
          পদবী: {{designation}}<br/>
          বিদ্যালয়: {{school_name}}<br/>
          উপজেলা: {{upazila_name}}, জেলা: {{district_name}}<br/>
          (চাকরি হতে অবসরজনিত চূড়ান্ত নিষ্পত্তি)
        </td>
        <td style="padding: 10px; border: 1px solid #000; vertical-align: top;">
          জিপিএফ হিসাব নং: <strong>{{gpf_acc_no}}</strong><br/>
          সন: {{gpf_year}}<br/>
          স্মারক নং: ডিডিও/জিপিএফ-চূড়ান্ত/{{gpf_year}}
        </td>
        <td style="padding: 10px; border: 1px solid #000; text-align: right; vertical-align: top; font-weight: bold; font-size: 14px;">
          {{formatted_amount}}/-
        </td>
      </tr>
      <tr>
        <td colspan="3" style="padding: 8px; border: 1px solid #000; text-align: right; font-weight: bold;">
          মোট দাবীকৃত অর্থের পরিমাণ:
        </td>
        <td style="padding: 8px; border: 1px solid #000; text-align: right; font-weight: bold; font-size: 14px;">
          {{formatted_amount}}/-
        </td>
      </tr>
    </tbody>
  </table>

  <div style="font-size: 13px; font-weight: bold; margin-bottom: 15px;">
    কথায়: {{in_wards_outo_generated}}।
  </div>

  <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; font-size: 13px;">
    <div style="border: 1px dashed #666; padding: 12px; text-align: center; width: 140px; height: 90px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #444;">
      ১০/- টাকার<br/>রেভিনিউ স্ট্যাম্প<br/>ও আড়াআড়ি স্বাক্ষর
    </div>

    <div style="text-align: center; width: 250px;">
      স্বাক্ষর ও সীল<br/>
      (<strong>{{ddo_name}}</strong>)<br/>
      {{ddo_designation}}<br/>
      {{upazila_name}}, {{district_name}}
    </div>
  </div>

  <div style="margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; font-size: 12px;">
    <div style="text-align: center; font-weight: bold; margin-bottom: 5px;">(উপজেলা হিসাবরক্ষণ অফিসের ব্যবহারের জন্য)</div>
    টাকা ...................................................... (কথায় .........................................................................................) পাস করা হইল।
    <div style="display: flex; justify-content: space-between; margin-top: 40px; text-align: center;">
      <span>অডিটর</span>
      <span>সুপারিনটেনডেন্ট</span>
      <span>উপজেলা হিসাবরক্ষণ কর্মকর্তা</span>
    </div>
  </div>
</div>
`
  },
  {
    id: 'page-4-annexure-4',
    name: 'পৃষ্ঠা ৪: অনাপত্তি ও দায়মুক্তি সনদ',
    pageNumber: 4,
    htmlContent: `
<div class="gov-document-page">
  <div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 20px; border-bottom: 1.5px solid #000; padding-bottom: 6px;">
    সরকারি পাওনা ও অডিট আপত্তি দায়মুক্তি প্রত্যায়নপত্র
  </div>

  <div style="font-size: 14px; line-height: 2.0; text-align: justify; margin-bottom: 30px;">
    এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <strong>{{applicant_name}}</strong>, পদবী: <strong>{{designation}}</strong>, বিদ্যালয়: <strong>{{school_name}}</strong>, উপজেলা: <strong>{{upazila_name}}</strong>, জেলা: <strong>{{district_name}}</strong>; তাঁহার নিকট অদ্যবধি সাধারণ ভবিষ্যৎ তহবিল (জিপিএফ) হিসাব নম্বর- <strong>{{gpf_acc_no}}</strong> এর বিপরীতে বা সরকারি অন্য কোন খাতে কোন প্রকার বকেয়া, অডিট আপত্তি, বা সরকারি আর্থিক দায়দেনা নাই।
    <br/><br/>
    তাহার নিকট হইতে সরকারি কোন পাওনা দাবী অনাদায়ী না থাকায় তাহার জিপিএফ তহবিলের চূড়ান্ত স্থিতি <strong>{{formatted_amount}}/-</strong> (কথায়: <strong>{{in_wards_outo_generated}}</strong>) পরিশোধে অত্র দপ্তরের কোন আপত্তি নাই।
  </div>

  <div style="border: 1px solid #000; padding: 12px; margin-bottom: 35px;">
    <div style="font-weight: bold; font-size: 13px; margin-bottom: 10px; text-align: center;">আবেদনকারীর সত্যায়িত নমুনা স্বাক্ষর ও বৃদ্ধাঙ্গুলির ছাপ:</div>
    <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 12px;" border="1">
      <tr style="height: 50px;">
        <td style="width: 33%; border: 1px solid #000; padding: 6px;">১. ........................................</td>
        <td style="width: 33%; border: 1px solid #000; padding: 6px;">২. ........................................</td>
        <td style="width: 33%; border: 1px solid #000; padding: 6px;">৩. ........................................</td>
      </tr>
      <tr style="height: 60px;">
        <td colspan="3" style="border: 1px solid #000; padding: 6px; vertical-align: middle;">
          বাম হাতের বৃদ্ধাঙ্গুলির ছাপ: ( .............................................................. )
        </td>
      </tr>
    </table>
  </div>

  <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px;">
    <div style="text-align: center; width: 220px;">
      স্বাক্ষর ও সীল<br/>
      উপজেলা হিসাবরক্ষণ কর্মকর্তা<br/>
      {{upazila_name}}, {{district_name}}
    </div>
    <div style="text-align: center; width: 240px;">
      স্বাক্ষর ও সীল<br/>
      (<strong>{{ddo_name}}</strong>)<br/>
      {{ddo_designation}}<br/>
      {{upazila_name}}, {{district_name}}
    </div>
  </div>
</div>
`
  },
  {
    id: 'page-5-forwarding-letter',
    name: 'পৃষ্ঠা ৫: উপজেলা শিক্ষা অফিসের ফরোয়ার্ডিং পত্র',
    pageNumber: 5,
    htmlContent: `
<div class="gov-document-page">
  <div style="text-align: center; font-size: 15px; font-weight: bold; line-height: 1.5; margin-bottom: 20px;">
    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার<br/>
    উপজেলা শিক্ষা অফিসারের কার্যালয়<br/>
    {{upazila_name}}, {{district_name}}।
  </div>

  <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 20px;">
    <span>স্মারক নং: উশিঅ/{{upazila_name}}/জিপিএফ-চূড়ান্ত/{{gpf_year}}/</span>
    <span>তারিখ: {{apply_date}} খ্রি.</span>
  </div>

  <div style="font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
    বরাবর,<br/>
    {{receiver_info}}
  </div>

  <div style="font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
    <strong>বিষয়: সাধারণ ভবিষ্যৎ তহবিল (জিপিএফ) চূড়ান্ত পরিশোধের আবেদন অগ্রায়ন প্রসঙ্গে।</strong>
  </div>

  <div style="font-size: 14px; line-height: 1.9; text-align: justify; margin-bottom: 25px;">
    সূত্রোক্ত বিষয়ের প্রেক্ষিতে জানানো যাইতেছে যে, <strong>{{applicant_name}}</strong>, পদবী: <strong>{{designation}}</strong>, বিদ্যালয়: <strong>{{school_name}}</strong>, উপজেলা: <strong>{{upazila_name}}</strong>, জেলা: <strong>{{district_name}}</strong> এর জিপিএফ হিসাব নম্বর- <strong>{{gpf_acc_no}}</strong> হইতে চাকরি হইতে অবসরজনিত কারণে চূড়ান্ত পরিশোধের আবেদনপত্র ও সংশ্লিষ্ট কাগজপত্রাদি বিধি মোতাবেক পরীক্ষা-নিরীক্ষাপূর্বক অত্র সঙ্গে অগ্রায়ন করা হইল।
    <br/><br/>
    উক্ত কর্মচারীর অনুকূলে জিপিএফ তহবিলের চূড়ান্ত স্থিতি <strong>{{formatted_amount}}/-</strong> (কথায়: <strong>{{in_wards_outo_generated}}</strong>) পরিশোধের প্রয়োজনীয় সরকারি মঞ্জুরী ও প্রাধিকারপত্র প্রদানের জন্য বিনীত অনুরোধ করা হইল।
  </div>

  <div style="font-size: 13px; margin-bottom: 30px;">
    <strong>সংযুক্তি (কাগজপত্রের বিবরণ):</strong><br/>
    ১। মূল আবেদনপত্র - ০১ ফর্দ।<br/>
    ২। বাংলাদেশ ফরম নং ২৬৩৯ - ০১ ফর্দ।<br/>
    ৩। টি, আর ফরম নং ৩৭ (বিল) - ০১ ফর্দ।<br/>
    ৪। অনাপত্তি ও দায়মুক্তি সনদপত্র - ০১ ফর্দ।<br/>
    ৫। মূল সার্ভিস বুক / চাকরিকালীন বিবরণী।<br/>
    ৬। জিপিএফ পাসবই ও সর্বশেষ হিসাব বিবরণী।<br/>
    ৭। অবসর / পিআরএল মঞ্জুরী আদেশের সত্যায়িত কপি।<br/>
    ৮। জাতীয় পরিচয়পত্র (এনআইডি) ও নমুনা স্বাক্ষর।
  </div>

  <div style="margin-top: 30px; float: right; text-align: center; width: 250px; font-size: 13px; line-height: 1.6;">
    (<strong>{{ddo_name}}</strong>)<br/>
    {{ddo_designation}}<br/>
    {{upazila_name}}, {{district_name}}<br/>
    ফোন: ০১৭০০-০০০০০০
  </div>
  <div style="clear: both;"></div>
</div>
`
  }
];

// Unified 5-Page HTML builder for display and high-fidelity print
export const generateUnified5PagesHtml = (
  templates: HtmlTemplate[],
  data: GpfFinalFormData,
  isScreenPreview: boolean = true
): string => {
  const pagesHtml = templates
    .map((tpl) => {
      const filled = populateTemplate(tpl.htmlContent, data);
      return `
        <div class="print-page-wrapper">
          ${filled}
        </div>
      `;
    })
    .join('\n');

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <title>জিপিএফ চূড়ান্ত উত্তোলন আবেদনপত্র</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: ${isScreenPreview ? '20px 10px' : '0'};
      background-color: ${isScreenPreview ? '#091120' : '#ffffff'};
      font-family: 'Noto Serif Bengali', 'Hind Siliguri', serif;
      color: #000000;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .print-page-wrapper {
      width: 210mm;
      min-height: 297mm;
      padding: 22mm 24mm;
      margin-bottom: ${isScreenPreview ? '24px' : '0'};
      background: #ffffff;
      box-shadow: ${isScreenPreview ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'};
      position: relative;
      page-break-after: always;
      break-after: page;
      box-sizing: border-box;
    }
    .print-page-wrapper:last-child {
      page-break-after: auto;
      break-after: auto;
      margin-bottom: 0;
    }
    .gov-document-page {
      width: 100%;
      height: 100%;
      font-size: 14px;
      line-height: 1.8;
      color: #000000;
    }
    table {
      border-collapse: collapse;
    }
    th, td {
      border-color: #000000 !important;
    }
    @media print {
      @page {
        size: A4 portrait;
        margin: 12mm 15mm 12mm 15mm;
      }
      body {
        padding: 0 !important;
        background: transparent !important;
      }
      .print-page-wrapper {
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        min-height: auto !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .print-page-wrapper:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>
  `;
};
