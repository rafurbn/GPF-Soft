import React, { useState } from 'react';
import { KeyRound, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { UserSession } from '../types';

interface FirstTimePasswordModalProps {
  isOpen: boolean;
  currentUser: UserSession;
  onPasswordChanged: (newPassword: string, email: string) => Promise<void>;
  canDismiss?: boolean;
  onClose?: () => void;
}

export const FirstTimePasswordModal: React.FC<FirstTimePasswordModalProps> = ({
  isOpen,
  currentUser,
  onPasswordChanged,
  canDismiss = false,
  onClose,
}) => {
  const [email, setEmail] = useState(currentUser.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('সঠিক ইমেইল ঠিকানা লিখুন');
      return;
    }
    if (newPassword.length < 6) {
      setError('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('উভয় পাসওয়ার্ড একই হতে হবে');
      return;
    }
    if (!acceptedTerms) {
      setError('১৪টি সতর্কতামূলক শর্তাবলী ও নীতিমালায় সম্মতি প্রদান আবশ্যক');
      return;
    }
    setError('');
    try {
      await onPasswordChanged(newPassword, email.trim());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'তথ্য সংরক্ষণ করা যায়নি');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">
              পাসওয়ার্ড পরিবর্তন ও শর্তাবলী অনুমোদন
            </h3>
          </div>
          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">উপজেলা: {currentUser.upazila_name_bn} ({currentUser.upazila_code})</p>
              <p className="mt-0.5 text-amber-800">
                নিরাপত্তার স্বার্থে জিপিএফ পোর্টালে কাজের পূর্বে ব্যক্তিগত গোপন পাসওয়ার্ড সেট করুন এবং সতর্কতামূলক শর্তাবলীর প্রতি একমত পোষণ করুন।
              </p>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ইমেইল ঠিকানা
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ব্যক্তিগত ইমেইল"
                autoComplete="email"
                required
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                নতুন ইমেইল দিলে সেটি যাচাই করার জন্য confirmation link পাঠানো হবে।
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                নতুন পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড লিখুন"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span>
                  আমি জিপিএফ ফাইল প্রসেসিং ও ব্যবহারের <strong>১৪টি সতর্কতামূলক শর্তাবলী</strong> সজ্ঞানে পড়েছি এবং মেনে চলতে বাধ্য থাকব।
                </span>
              </label>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm transition cursor-pointer"
              >
                সংরক্ষণ ও নিশ্চিত করুন
              </button>
              {canDismiss && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition cursor-pointer"
                >
                  বাতিল
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
