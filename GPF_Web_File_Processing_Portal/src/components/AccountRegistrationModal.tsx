import React, { useMemo, useState } from 'react';
import { Check, KeyRound, Lock, Mail, MapPin, X } from 'lucide-react';
import {
  getAllDivisions,
  getDistrictsByDivision,
  getAllUpazilas,
  type UpazilaRecord,
} from '../data/upazilaData';

interface AccountRegistrationModalProps {
  onClose: () => void;
  onCreateAccount: (region: UpazilaRecord, email: string, password: string) => Promise<boolean>;
}

/**
 * এক স্ক্রিনের অ্যাকাউন্ট ফর্ম: বিভাগ → জেলা → উপজেলা, recovery email এবং পছন্দের
 * পাসওয়ার্ড। আলাদা নিশ্চিতকরণ ধাপ, পাসওয়ার্ড পুনরাবৃত্তি বা verification লিংক নেই —
 * সাইন-আপ সফল হলে ইউজার সোজা ড্যাশবোর্ডে ঢুকে যায়। এক উপজেলায় একটি অ্যাকাউন্ট
 * এই নিয়মটি অপরিবর্তিত (সার্ভারের unique index ও signup trigger বহাল)।
 */
export const AccountRegistrationModal: React.FC<AccountRegistrationModalProps> = ({
  onClose,
  onCreateAccount,
}) => {
  const divisions = getAllDivisions();
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [upazilaCode, setUpazilaCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const districts = useMemo(() => getDistrictsByDivision(division), [division]);
  const upazilas = useMemo(
    () => getAllUpazilas().filter((record) => record.division === division && record.district === district),
    [division, district],
  );
  const selectedRegion = upazilas.find((record) => record.defaultId === upazilaCode);

  const handleCreateAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!selectedRegion) {
      setError('বিভাগ, জেলা ও উপজেলা নির্বাচন করুন।');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('সঠিক ইমেইল ঠিকানা লিখুন।');
      return;
    }
    if (password.length !== 8) {
      setError('পাসওয়ার্ড ঠিক ৮ অক্ষরের হতে হবে।');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateAccount(selectedRegion, email.trim(), password);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'অ্যাকাউন্ট তৈরি করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm">
      <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-700/60 bg-emerald-950 text-emerald-400">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold">নতুন উপজেলা অ্যাকাউন্ট</h2>
              <p className="text-xs text-slate-400">প্রতি উপজেলার জন্য একটি ID</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleCreateAccount} className="space-y-4 p-5">
          {error && <div role="alert" className="rounded-lg border border-rose-800 bg-rose-950/50 p-3 text-sm text-rose-200">{error}</div>}

          <label className="block text-sm font-semibold text-slate-200">
            বিভাগ
            <select value={division} onChange={(event) => { setDivision(event.target.value); setDistrict(''); setUpazilaCode(''); }} required className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-normal text-white">
              <option value="">বিভাগ নির্বাচন করুন</option>
              {divisions.map((item) => <option key={item.en} value={item.en}>{item.bn}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-200">
            জেলা
            <select value={district} onChange={(event) => { setDistrict(event.target.value); setUpazilaCode(''); }} required disabled={!division} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-normal text-white disabled:opacity-50">
              <option value="">জেলা নির্বাচন করুন</option>
              {districts.map((item) => <option key={item.en} value={item.en}>{item.bn}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-200">
            উপজেলা
            <select value={upazilaCode} onChange={(event) => setUpazilaCode(event.target.value)} required disabled={!district} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-normal text-white disabled:opacity-50">
              <option value="">উপজেলা নির্বাচন করুন</option>
              {upazilas.map((item) => <option key={item.defaultId} value={item.defaultId}>{item.upazilaBn}</option>)}
            </select>
          </label>

          {/* নির্বাচিত এলাকা ও লগইন ID — শুধু তথ্যের জন্য */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <p className="text-xs text-slate-400">
              আপনার login ID <span className="font-mono text-lg font-bold text-emerald-300">{selectedRegion?.defaultId || '—'}</span>
            </p>
            {selectedRegion && (
              <p className="mt-1 text-xs text-slate-400">
                {selectedRegion.divisionBn} / {selectedRegion.districtBn} / {selectedRegion.upazilaBn}
              </p>
            )}
          </div>

          <label className="block text-sm font-semibold text-slate-200">
            পাসওয়ার্ড রিকভারির ইমেইল
            <span className="relative mt-1.5 block">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="আপনার ইমেইল ঠিকানা" className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 font-normal text-white placeholder:text-slate-500" />
            </span>
          </label>
          <label className="block text-sm font-semibold text-slate-200">
            পাসওয়ার্ড (৮ অক্ষর)
            <span className="relative mt-1.5 block">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={8} autoComplete="new-password" placeholder="পছন্দমত ৮ অক্ষরের পাসওয়ার্ড" className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 font-normal text-white placeholder:text-slate-500" />
            </span>
            <span className="mt-1 block text-xs font-normal text-slate-400">
              <KeyRound className="mr-1 inline h-3 w-3" />
              {password.length}/৮ — পাসওয়ার্ড ভুলে গেলে এই ইমেইলে OTP যাবে
            </span>
          </label>

          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : <><Check className="h-4 w-4" /> অ্যাকাউন্ট তৈরি করুন</>}
          </button>
        </form>
      </section>
    </div>
  );
};
