import React, { useState } from 'react';
import { Building2, KeyRound, ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { UserSession } from '../types';
import logoRF from '../assets/images/logo RF.svg';

interface LoginModalProps {
  onLogin: (upazilaCode: string, passwordPlain: string) => void;
  availableUsers: UserSession[];
  isOpen?: boolean;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  onLogin, 
  availableUsers,
  isOpen = true,
  onClose
}) => {
  const [upazilaCode, setUpazilaCode] = useState('10101');
  const [password, setPassword] = useState('pass1234');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upazilaCode.trim()) {
      setError('উপজেলা কোড বা ইউজারনেম প্রদান করুন');
      return;
    }
    setError('');
    onLogin(upazilaCode, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            ✕
          </button>
        )}
        <div className="text-center mb-6">
          <img
            src={logoRF}
            alt="লোগো"
            className="w-14 h-14 object-contain mx-auto mb-3"
          />
          <h2 className="text-xl font-bold text-slate-900">
            জিপিএফ ফাইল প্রসেসিং পোর্টাল লগইন
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            উপজেলা প্রাথমিক শিক্ষা অফিস সমূহের জন্য নির্ধারিত
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              উপজেলা কোড / ইউজারনেম
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={upazilaCode}
                onChange={(e) => setUpazilaCode(e.target.value)}
                placeholder="যেমন: 10101 বা admin"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              ডেমো অ্যাকাউন্ট: 10101 (বিয়ানীবাজার), 10102 (সিলেট সদর), admin
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>পোর্টালে প্রবেশ করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            কারিগরি সহায়তা ও প্রধান তত্ত্বাবধায়ক: <strong>রফিকুল ইসলাম</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
