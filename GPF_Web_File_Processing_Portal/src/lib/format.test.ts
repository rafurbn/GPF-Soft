import { describe, expect, it } from 'vitest';
import { count, date, dateTime, money, moneyCompact, toBn, toEn } from './format';

describe('toBn / toEn', () => {
  it('converts both ways without touching other characters', () => {
    expect(toBn('2026-09-23')).toBe('২০২৬-০৯-২৩');
    expect(toBn(7)).toBe('৭');
    expect(toBn(null)).toBe('');
    expect(toEn('৩,০০,০০০')).toBe('3,00,000');
    expect(toEn(toBn('01(এক) খানা'))).toBe('01(এক) খানা');
  });
});

describe('money', () => {
  it('groups in lakh/crore with two decimals', () => {
    expect(money('3000000')).toBe('৩০,০০,০০০.০০');
    expect(money(1234.5)).toBe('১,২৩৪.৫০');
    expect(money('৩০০০০০')).toBe('৩,০০,০০০.০০');
    expect(money('')).toBe('০.০০');
  });

  it('drops decimals for compact totals', () => {
    expect(moneyCompact(1500000)).toBe('১৫,০০,০০০');
    expect(moneyCompact('')).toBe('');
  });
});

describe('date', () => {
  it('flips ISO to dd/mm/yyyy and stays put when already Bengali', () => {
    expect(date('2026-09-23')).toBe('২৩/০৯/২০২৬');
    expect(date('২৩/০৯/২০২৬')).toBe('২৩/০৯/২০২৬');
    expect(date('23-09-2026', '.')).toBe('২৩.০৯.২০২৬');
    expect(date('')).toBe('');
  });

  it('renders date and 24h time in Bengali digits', () => {
    expect(dateTime(new Date(2026, 8, 23, 14, 5))).toBe('২৩/০৯/২০২৬ • ১৪:০৫');
    expect(dateTime('not a date')).toBe('');
  });
});

describe('count', () => {
  it('attaches the Bengali unit', () => {
    expect(count(12)).toBe('১২ টি');
    expect(count(3, 'উপজেলা')).toBe('৩ উপজেলা');
  });
});
