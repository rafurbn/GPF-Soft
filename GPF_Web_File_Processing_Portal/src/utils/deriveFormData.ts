import { GpfFormData } from '../types';
import {
  numberToBanglaWords,
  toBanglaDigits,
  cleanNumberString,
  formatBanglaCurrency,
} from './numberToBanglaWords';

/**
 * Pure derivation of the next form state after a single field edit.
 *
 * Applies the same cross-field rules the input table relies on:
 *  - `year`                       -> rewrites (or seeds) `memoNo` with the Bangla year
 *  - `requestedAmount`            -> regenerates `requestedAmountWords`
 *  - `requestedAmount`/`installmentCount` -> recomputes `installmentAmount`
 *  - `hasPreviousLoan` === 'না'    -> marks the dependent fields as not applicable
 *
 * Returns a new object; `prev` is never mutated.
 */
export function deriveFormData<F extends keyof GpfFormData>(
  prev: GpfFormData,
  field: F,
  value: GpfFormData[F]
): GpfFormData {
  const updated: GpfFormData = { ...prev, [field]: value };

  // If year changes, update memoNo with the new year
  if (field === 'year') {
    const bnYear = toBanglaDigits(String(value));
    if (prev.memoNo) {
      updated.memoNo = prev.memoNo.replace(
        /\/(\d{4}|[০-৯]{4}|[০-৯]{4}-[০-৯]{4})\//,
        `/${bnYear}/`
      );
    } else {
      updated.memoNo = `উশিঅ/বিবা/সা:ভ:তহ:/অগ্রিম/${bnYear}/`;
    }
  }

  // If requested amount or installment count changes, auto generate words and installment
  if (field === 'requestedAmount' || field === 'installmentCount') {
    if (field === 'requestedAmount') {
      const words = numberToBanglaWords(String(value));
      if (words) {
        updated.requestedAmountWords = words;
      }
    }

    // Auto calculate installment amount using the merged (current) values
    const amountNum = cleanNumberString(updated.requestedAmount);
    const countNum = cleanNumberString(updated.installmentCount) || 24;
    if (amountNum > 0 && countNum > 0) {
      const perInst = Math.round(amountNum / countNum);
      updated.installmentAmount = formatBanglaCurrency(perInst);
    }
  }

  // If user marks previous loan as "না", set dependents to "প্রযোজ্য নয়"
  if (field === 'hasPreviousLoan' && value === 'না') {
    updated.isPreviousLoanRepaid = 'প্রযোজ্য নয়';
    updated.lastInstallmentDate = 'প্রযোজ্য নয়';
    updated.remainingInstallments = 'প্রযোজ্য নয়';
  }

  return updated;
}
