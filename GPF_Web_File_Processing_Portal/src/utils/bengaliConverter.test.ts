import { describe, it, expect } from 'vitest';
import { numberToBengaliWords } from './bengaliConverter';
import { BN_DIGITS } from '../lib/format';

const DIGITS = new RegExp('[' + BN_DIGITS.join('') + '0-9]');

describe('numberToBengaliWords', () => {
  it('renders a whole amount without a paisa segment', () => {
    expect(numberToBengaliWords('150000')).toBe('এক লক্ষ পঞ্চাশ হাজার টাকা মাত্র');
  });

  it('appends paisa when the amount has a fraction', () => {
    expect(numberToBengaliWords('150000.75')).toBe(
      'এক লক্ষ পঞ্চাশ হাজার টাকা পঁচাত্তর পয়সা মাত্র'
    );
  });

  it('handles an amount below one taka as paisa only', () => {
    expect(numberToBengaliWords('0.50')).toBe('পঞ্চাশ পয়সা মাত্র');
  });

  it('accepts Bangla digits and comma formatting', () => {
    expect(numberToBengaliWords('২,৫০,০০০.২৫')).toBe(
      'দুই লক্ষ পঞ্চাশ হাজার টাকা পঁচিশ পয়সা মাত্র'
    );
  });

  it('renders a twelve-lakh amount the way app3 prints it', () => {
    expect(numberToBengaliWords('1200000')).toBe('বারো লক্ষ টাকা মাত্র');
    expect(numberToBengaliWords('1200000.05')).toBe('বারো লক্ষ টাকা পাঁচ পয়সা মাত্র');
  });

  it('spells crore amounts in words, never in digits', () => {
    const words = numberToBengaliWords('10000000');
    expect(words).not.toMatch(DIGITS);
    expect(words.length).toBeGreaterThan(0);
  });
});
