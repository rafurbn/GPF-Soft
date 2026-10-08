import { describe, it, expect } from 'vitest';
import { deriveFormData } from './deriveFormData';
import { GpfFormData } from '../types';

const base = (over: Partial<GpfFormData> = {}): GpfFormData =>
  ({
    id: 'test-1',
    year: '2025',
    memoNo: '',
    requestedAmount: '',
    requestedAmountWords: '',
    installmentCount: '',
    installmentAmount: '',
    hasPreviousLoan: '',
    isPreviousLoanRepaid: '',
    lastInstallmentDate: '',
    remainingInstallments: '',
    ...over,
  }) as GpfFormData;

describe('deriveFormData', () => {
  it('does not mutate the previous state', () => {
    const prev = base({ memoNo: 'উশিঅ/বিবা/সা:ভ:তহ:/অগ্রিম/২০২৫/' });
    const snapshot = { ...prev };
    deriveFormData(prev, 'year', '2026');
    expect(prev).toEqual(snapshot);
  });

  describe('year -> memoNo', () => {
    it('seeds memoNo when it is empty', () => {
      const next = deriveFormData(base(), 'year', '2026');
      expect(next.memoNo).toBe('উশিঅ/বিবা/সা:ভ:তহ:/অগ্রিম/২০২৬/');
    });

    it('rewrites the Bangla year inside an existing memoNo', () => {
      const next = deriveFormData(
        base({ memoNo: 'উশিঅ/বিবা/সা:ভ:তহ:/অগ্রিম/২০২৫/' }),
        'year',
        '2027'
      );
      expect(next.memoNo).toBe('উশিঅ/বিবা/সা:ভ:তহ:/অগ্রিম/২০২৭/');
    });

    it('leaves memoNo untouched for unrelated fields', () => {
      const prev = base({ memoNo: 'উশিঅ/বিবা/সা:ভ:তহ:/অগ্রিম/২০২৫/' });
      const next = deriveFormData(prev, 'applicantName', 'রহিম');
      expect(next.memoNo).toBe(prev.memoNo);
    });
  });

  describe('requestedAmount', () => {
    it('generates the amount in Bangla words', () => {
      const next = deriveFormData(base(), 'requestedAmount', '100000');
      expect(next.requestedAmountWords.length).toBeGreaterThan(0);
      expect(next.requestedAmountWords).not.toBe('');
    });

    it('divides by the current installmentCount', () => {
      const next = deriveFormData(
        base({ requestedAmount: '120000', installmentCount: '12' }),
        'requestedAmount',
        '120000'
      );
      expect(next.installmentAmount).toBe('১০,০০০');
    });

    it('defaults to 24 installments when the count is empty', () => {
      const next = deriveFormData(
        base({ requestedAmount: '120000', installmentCount: '' }),
        'requestedAmount',
        '120000'
      );
      expect(next.installmentAmount).toBe('৫,০০০');
    });

    it('does not recompute the installment for a zero amount', () => {
      const next = deriveFormData(
        base({ requestedAmount: '0', installmentAmount: '৫,০০০' }),
        'requestedAmount',
        '0'
      );
      expect(next.installmentAmount).toBe('৫,০০০');
    });
  });

  describe('installmentCount', () => {
    it('recomputes the installment amount using the newly typed count', () => {
      const next = deriveFormData(
        base({ requestedAmount: '120000', installmentCount: '24' }),
        'installmentCount',
        '12'
      );
      expect(next.installmentAmount).toBe('১০,০০০');
    });

    it('does not regenerate the amount words', () => {
      const next = deriveFormData(
        base({ requestedAmount: '120000', requestedAmountWords: 'এক লক্ষ বিশ হাজার টাকা মাত্র' }),
        'installmentCount',
        '6'
      );
      expect(next.requestedAmountWords).toBe('এক লক্ষ বিশ হাজার টাকা মাত্র');
      expect(next.installmentAmount).toBe('২০,০০০');
    });
  });

  describe("hasPreviousLoan === 'না'", () => {
    it('marks the dependent fields as not applicable', () => {
      const next = deriveFormData(base(), 'hasPreviousLoan', 'না');
      expect(next.isPreviousLoanRepaid).toBe('প্রযোজ্য নয়');
      expect(next.lastInstallmentDate).toBe('প্রযোজ্য নয়');
      expect(next.remainingInstallments).toBe('প্রযোজ্য নয়');
    });

    it('leaves the dependent fields alone for other answers', () => {
      const next = deriveFormData(
        base({
          isPreviousLoanRepaid: 'হ্যাঁ',
          lastInstallmentDate: 'জুন ২০২৪',
          remainingInstallments: '১২ কিস্তি',
        }),
        'hasPreviousLoan',
        'হ্যাঁ'
      );
      expect(next.isPreviousLoanRepaid).toBe('হ্যাঁ');
      expect(next.lastInstallmentDate).toBe('জুন ২০২৪');
      expect(next.remainingInstallments).toBe('১২ কিস্তি');
    });
  });

  it('simply assigns the edited field for plain fields', () => {
    const next = deriveFormData(base(), 'schoolName', 'কুড়ার বাজার সরকারি প্রাথমিক বিদ্যালয়');
    expect(next.schoolName).toBe('কুড়ার বাজার সরকারি প্রাথমিক বিদ্যালয়');
  });
});
