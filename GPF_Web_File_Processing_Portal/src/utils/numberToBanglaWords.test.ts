import { describe, it, expect } from 'vitest';
import { numberToBanglaWords } from './numberToBanglaWords';
import { numberToBengaliWords } from './bengaliConverter';

describe('numberToBanglaWords', () => {
  it('renders a whole amount without a paisa segment', () => {
    expect(numberToBanglaWords('150000')).toBe('এক লক্ষ পঞ্চাশ হাজার টাকা মাত্র');
  });

  it('appends paisa when the amount has a fraction', () => {
    expect(numberToBanglaWords('150000.75')).toBe(
      'এক লক্ষ পঞ্চাশ হাজার টাকা পঁচাত্তর পয়সা মাত্র'
    );
  });

  it('handles an amount below one taka as paisa only', () => {
    expect(numberToBanglaWords('0.50')).toBe('পঞ্চাশ পয়সা মাত্র');
  });

  it('accepts Bangla digits and comma formatting', () => {
    expect(numberToBanglaWords('২,৫০,০০০.২৫')).toBe(
      'দুই লক্ষ পঞ্চাশ হাজার টাকা পঁচিশ পয়সা মাত্র'
    );
  });
});

describe('numberToBengaliWords (app3)', () => {
  it('renders a whole amount without a paisa segment', () => {
    expect(numberToBengaliWords('1200000')).toBe('বারো লক্ষ টাকা মাত্র');
  });

  it('appends paisa when the amount has a fraction', () => {
    expect(numberToBengaliWords('1200000.05')).toBe('বারো লক্ষ টাকা পাঁচ পয়সা মাত্র');
  });
});
