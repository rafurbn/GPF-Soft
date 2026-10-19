import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SubAppFooter, SubAppHeader } from './SubAppChrome';
import type { UserSession } from '../../src/types';

const user = {
  upazila_code: 'Bea002',
  upazila_name_bn: 'বেগমগঞ্জ',
  district_name_bn: 'নরসিংদী',
  division_name_bn: 'ঢাকা বিভাগ',
} as UserSession;

/** Text nodes only — attributes (`z-50`, the wa.me number) are excluded. */
const textNodes = (html: string) =>
  html
    .replace(/<[^>]*>/g, '\n')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

const apps = [
  { appNumber: 1, title: 'জিপিএফ ফেরতযোগ্য অগ্রিম উত্তোলন ফাইল প্রসেসিং', short: 'ফেরতযোগ্য অগ্রিম উত্তোলন' },
  { appNumber: 2, title: 'জিপিএফ অফেরতযোগ্য অগ্রিম উত্তোলন ফাইল প্রসেসিং', short: 'অফেরতযোগ্য অগ্রিম উত্তোলন' },
  { appNumber: 3, title: 'জিপিএফ চূড়ান্ত উত্তোলন ফাইল প্রসেসিং', short: 'চূড়ান্ত উত্তোলন ও অদাবী' },
  { appNumber: 4, title: 'জিপিএফ চূড়ান্ত উত্তোলন ফাইল প্রসেসিং (ডেথ ক্লেইম)', short: 'ডেথ ক্লেইম চূড়ান্ত উত্তোলন' },
];

describe('shared sub-app chrome', () => {
  it('gives every app the same header skeleton', () => {
    for (const app of apps) {
      const html = renderToStaticMarkup(
        <SubAppHeader appNumber={app.appNumber} title={app.title} onBack={() => {}} currentUser={user} savedCount={12} />
      );
      expect(html).toContain('sticky top-0 z-50');
      expect(html.match(/<h1/g)).toHaveLength(1);
      expect(html).toContain(`এ্যাপ ${['', '১', '২', '৩', '৪'][app.appNumber]}`);
      expect(html).toContain('ব্যাকপেইজ');
      expect(html).toContain('ড্যাশবোর্ডে ফিরুন');
      expect(html).toContain('১২ টি সংরক্ষিত');
      expect(html).toContain('বেগমগঞ্জ (Bea002), নরসিংদী');
    }
  });

  it('renders the four footer slots with Bengali digits only', () => {
    for (const app of apps) {
      const html = renderToStaticMarkup(<SubAppFooter appNumber={app.appNumber} appShortName={app.short} currentUser={user} />);
      const text = textNodes(html).join(' ');
      expect(text).toContain('উপজেলা প্রাথমিক শিক্ষা জিপিএফ পোর্টাল');
      expect(text).toContain('প্রাথমিক শিক্ষা অধিদপ্তর (ডিপিই)');
      expect(text).toContain('রফিকুল ইসলাম');
      expect(text).toContain('সংস্করণ ২.৬.০');
      expect(text).toContain('WhatsApp+Mobile: ০১৭৩২-৬৭৯৫৫১');
      // The upazila code is an ID and stays Latin by design.
      expect(text.replace('(Bea002)', '')).not.toMatch(/[0-9]/);
    }
  });

  it('drops the division when the session has none', () => {
    const html = renderToStaticMarkup(
      <SubAppFooter appNumber={1} appShortName='ফেরতযোগ্য অগ্রিম উত্তোলন' currentUser={{ ...user, division_name_bn: '' } as UserSession} />
    );
    expect(html).toContain('বেগমগঞ্জ (Bea002), নরসিংদী ·');
    expect(html).not.toContain('ঢাকা বিভাগ');
  });
});
