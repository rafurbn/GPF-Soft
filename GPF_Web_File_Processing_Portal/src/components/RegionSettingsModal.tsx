import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  MapPin,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  Settings,
  ShieldCheck,
  Building2
} from 'lucide-react';
import {
  getAllDivisions,
  getDistrictsByDivision,
  getAllUpazilas,
  UpazilaRecord
} from '../data/upazilaData';

interface RegionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDivisionEn: string;
  currentDistrictEn: string;
  currentUpazilaCode: string;
  currentEmail: string;
  onSaveAndLock: (
    divisionEn: string,
    districtEn: string,
    upazilaCode: string,
    email: string
  ) => void;
}

export const RegionSettingsModal: React.FC<RegionSettingsModalProps> = ({
  isOpen,
  onClose,
  currentDivisionEn,
  currentDistrictEn,
  currentUpazilaCode,
  currentEmail,
  onSaveAndLock,
}) => {
  const divisions = useMemo(() => getAllDivisions(), []);

  const [division, setDivision] = useState<string>(currentDivisionEn || 'Sylhet');
  const [district, setDistrict] = useState<string>(currentDistrictEn || 'Sylhet');
  const [upazilaCode, setUpazilaCode] = useState<string>(currentUpazilaCode || 'Bea002');
  const [email, setEmail] = useState<string>(currentEmail || '');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setDivision(currentDivisionEn || 'Sylhet');
      setDistrict(currentDistrictEn || 'Sylhet');
      setUpazilaCode(currentUpazilaCode || 'Bea002');
      setEmail(currentEmail || '');
      setErrorMessage('');
    }
  }, [isOpen, currentDivisionEn, currentDistrictEn, currentUpazilaCode, currentEmail]);

  // Current selected division object
  const selectedDivisionObj = useMemo(() => {
    return (
      divisions.find((d) => d.en.toLowerCase() === division.toLowerCase() || d.bn === division) ||
      divisions.find((d) => d.en === 'Sylhet') ||
      divisions[0]
    );
  }, [divisions, division]);

  // Districts for current division
  const currentDistricts = useMemo(() => {
    return getDistrictsByDivision(selectedDivisionObj?.en);
  }, [selectedDivisionObj]);

  // Current selected district object
  const selectedDistrictObj = useMemo(() => {
    return (
      currentDistricts.find((d) => d.en.toLowerCase() === district.toLowerCase() || d.bn === district) ||
      currentDistricts[0]
    );
  }, [currentDistricts, district]);

  // Upazilas for current division & district
  const currentUpazilas = useMemo(() => {
    if (!selectedDivisionObj || !selectedDistrictObj) return [];
    return getAllUpazilas().filter(
      (u) =>
        u.division.toLowerCase() === selectedDivisionObj.en.toLowerCase() &&
        (u.district.toLowerCase() === selectedDistrictObj.en.toLowerCase() || u.districtBn === selectedDistrictObj.bn)
    );
  }, [selectedDivisionObj, selectedDistrictObj]);

  // Selected upazila record
  const selectedUpazilaObj = useMemo(() => {
    return (
      currentUpazilas.find((u) => u.defaultId.toLowerCase() === upazilaCode.toLowerCase()) ||
      currentUpazilas[0] ||
      null
    );
  }, [currentUpazilas, upazilaCode]);

  const handleDivisionChange = (newDivEn: string) => {
    setDivision(newDivEn);
    const newDistricts = getDistrictsByDivision(newDivEn);
    const firstDist = newDistricts[0]?.en || '';
    setDistrict(firstDist);

    const newUpazilas = getAllUpazilas().filter(
      (u) => u.division.toLowerCase() === newDivEn.toLowerCase() && u.district.toLowerCase() === firstDist.toLowerCase()
    );
    const firstUpazila = newUpazilas[0];
    if (firstUpazila) {
      setUpazilaCode(firstUpazila.defaultId);
    }
  };

  const handleDistrictChange = (newDistEn: string) => {
    setDistrict(newDistEn);
    const newUpazilas = getAllUpazilas().filter(
      (u) =>
        u.division.toLowerCase() === selectedDivisionObj.en.toLowerCase() &&
        (u.district.toLowerCase() === newDistEn.toLowerCase() || u.districtBn === newDistEn)
    );
    const firstUpazila = newUpazilas[0];
    if (firstUpazila) {
      setUpazilaCode(firstUpazila.defaultId);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUpazilaObj) {
      setErrorMessage('অনুগ্রহ করে সঠিক উপজেলা নির্বাচন করুন।');
      return;
    }
    onSaveAndLock(
      selectedDivisionObj.en,
      selectedDistrictObj.en,
      selectedUpazilaObj.defaultId,
      email.trim()
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0a1426] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-[#101b30] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>বিভাগ, জেলা, উপজেলা ও রিকভারি সেটিংস</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                লক ও স্থায়ী কনফিগারেশন পপআপ উইন্ডো
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          {/* Information Notice */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              আপনার কর্মরত বিভাগ, জেলা ও উপজেলা নির্বাচন করুন এবং পাসওয়ার্ড উদ্ধারের জন্য রিকভারি ই-মেইল লিখুন। <strong>‘লক করুন’</strong> বাটনে ক্লিক করলে এটি স্থায়ীভাবে সংরক্ষিত হবে এবং মূল সাইন-ইন স্ক্রিনে পরবর্তীতে হাইড হয়ে থাকবে।
            </span>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* বিভাগ ড্রপডাউন */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>বিভাগ নির্বাচন করুন</span>
            </label>
            <select
              value={selectedDivisionObj?.en || ''}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#070e1c] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white focus:outline-hidden focus:border-emerald-500 shadow-inner"
            >
              {divisions.map((d) => (
                <option key={d.en} value={d.en}>
                  {d.bn} ({d.en})
                </option>
              ))}
            </select>
          </div>

          {/* জেলা ড্রপডাউন */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>জেলা নির্বাচন করুন</span>
            </label>
            <select
              value={selectedDistrictObj?.en || ''}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#070e1c] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white focus:outline-hidden focus:border-emerald-500 shadow-inner"
            >
              {currentDistricts.map((d) => (
                <option key={d.en} value={d.en}>
                  {d.bn} ({d.en})
                </option>
              ))}
            </select>
          </div>

          {/* উপজেলা ড্রপডাউন */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>উপজেলা নির্বাচন করুন</span>
            </label>
            <select
              value={selectedUpazilaObj?.defaultId || ''}
              onChange={(e) => setUpazilaCode(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-[#070e1c] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white focus:outline-hidden focus:border-emerald-500 shadow-inner"
            >
              {currentUpazilas.map((u) => (
                <option key={u.defaultId} value={u.defaultId}>
                  {u.upazilaBn} (ID: {u.defaultId})
                </option>
              ))}
            </select>
          </div>

          {/* Login ID Preview */}
          <div className="rounded-xl border border-slate-800 bg-[#070d18] p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                আপনার নির্ধারিত স্থায়ী Login ID
              </span>
              <span className="text-xs text-slate-500">
                (উপজেলা পরিবর্তনের সাথে সাথে স্বয়ংক্রিয়ভাবে পরিবর্তিত হয়)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
                <KeyRound className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-base font-extrabold text-emerald-400 tracking-wider">
                {selectedUpazilaObj?.defaultId || upazilaCode}
              </span>
            </div>
          </div>

          {/* Recovery Email Field (Moved here as requested!) */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recovery email (রিকভারি ই-মেইল)</span>
              </label>
              <span className="text-[10px] text-amber-400/90 font-medium bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/50">
                পরবর্তীতে হাইড থাকবে
              </span>
            </div>
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center absolute left-1.5 top-1/2 -translate-y-1/2">
                <Mail className="w-4 h-4 text-emerald-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল ঠিকানা (যেমন: rafurbn@gmail.com)"
                autoComplete="email"
                className="w-full pl-11 pr-3 py-2.5 text-xs sm:text-sm bg-[#070e1c] border border-slate-700/80 rounded-xl font-medium text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 shadow-inner"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
              ✓ পাসওয়ার্ড ভুলে গেলে এই রিকভারি ই-মেইলে ওটিপি ভেরিফিকেশন পাঠানো হবে। এই ফিল্ডটি মূল সাইন-ইন স্ক্রিনে আর দৃশ্যমান থাকবে না।
            </p>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition cursor-pointer active:scale-98"
            >
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>সংরক্ষণ ও লক করুন (হাইড থাকবে)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
