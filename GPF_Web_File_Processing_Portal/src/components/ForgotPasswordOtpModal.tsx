import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  RefreshCw, 
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toEnglishDigits } from '../utils/bengaliConverter';

interface ForgotPasswordOtpModalProps {
  initialEmail?: string;
  onClose: () => void;
  onSuccessReset: (email: string, newPassword: string) => void;
}

export const ForgotPasswordOtpModal: React.FC<ForgotPasswordOtpModalProps> = ({
  initialEmail = '',
  onClose,
  onSuccessReset,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Mask email for privacy (e.g., r***n@gmail.com)
  const getMaskedEmail = (email: string) => {
    if (!email) return 'সংরক্ষিত ইমেইল';
    const parts = email.split('@');
    if (parts.length < 2) return email;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  };

  // Step 1: Send OTP to registered email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const email = emailInput.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('অনুগ্রহ করে সঠিক ইমেইল ঠিকানা লিখুন।');
      return;
    }
    if (!supabase) {
      setErrorMsg('Supabase Auth কনফিগার করা হয়নি।');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.toLowerCase().includes('rate limit')) {
        setErrorMsg('ইমেইল ওটিপি পাঠানোর সীমা অতিক্রান্ত। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
      } else {
        setErrorMsg(msg || 'ওটিপি পাঠানো যায়নি। আবার চেষ্টা করুন।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    if (!supabase) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailInput.trim().toLowerCase(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'ওটিপি আবার পাঠানো যায়নি।');
      return;
    } finally {
      setIsSubmitting(false);
    }
    setTimer(60);
    setCanResend(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!supabase) {
      setErrorMsg('Supabase Auth কনফিগার করা হয়নি।');
      return;
    }
    const token = toEnglishDigits(enteredOtp).replace(/\D/g, '').trim();
    if (token.length !== 6) {
      setErrorMsg('অনুগ্রহ করে আপনার ইমেইলে প্রাপ্ত ৬-সংখ্যার ওটিপি কোডটি লিখুন।');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: emailInput.trim().toLowerCase(),
        token,
        type: 'recovery',
      });
      if (error) throw error;
      setStep(3);
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.toLowerCase().includes('expired')) {
        setErrorMsg('ওটিপি কোডের মেয়াদ উত্তীর্ণ হয়ে গেছে। অনুগ্রহ করে নতুন ওটিপি পাঠান।');
      } else if (msg.toLowerCase().includes('invalid')) {
        setErrorMsg('প্রদত্ত ওটিপি কোডটি সঠিক নয়। অনুগ্রহ করে ৬ ডিজিটের কোডটি পুনরায় চেক করুন।');
      } else {
        setErrorMsg(msg || 'ওটিপি কোডটি যাচাই করা যায়নি। আবার চেষ্টা করুন।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Set New Password
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('উভয় পাসওয়ার্ড হুবহু এক হতে হবে।');
      return;
    }

    if (!supabase) {
      setErrorMsg('Supabase Auth কনফিগার করা হয়নি।');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      const { error: setupError } = await supabase.rpc('complete_password_setup');
      if (setupError) throw setupError;
      await supabase.auth.signOut();
      setSuccessMsg('আপনার পাসওয়ার্ড সফলভাবে হালনাগাদ করা হয়েছে!');
      onSuccessReset(emailInput.trim(), newPassword);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'পাসওয়ার্ড হালনাগাদ করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                পাসওয়ার্ড পুনরুদ্ধার ও ইমেইল ওটিপি (OTP)
              </h3>
              <p className="text-[11px] text-slate-300">
                পূর্বে সংরক্ষিত সরকারি ইমেইল ঠিকানায় ওটিপি ভেরিফিকেশন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Indicator */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>১</span>
            <span>ইমেইল</span>
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>২</span>
            <span>ওটিপি যাচাই</span>
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>৩</span>
            <span>নতুন পাসওয়ার্ড</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Send a recovery code to the verified email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label htmlFor="recovery-email" className="mb-1 block text-xs font-semibold text-slate-700">
                  Supabase-এ যাচাইকৃত ইমেইল ঠিকানা
                </label>
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center absolute left-1.5 top-1/2 -translate-y-1/2">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="recovery-email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="আপনার আমন্ত্রিত ইমেইল লিখুন"
                    autoComplete="email"
                    required
                    className="w-full pl-11 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 font-mono text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  এই ঠিকানায় Supabase Auth recovery code পাঠাবে।
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-3d btn-3d-indigo w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>ওটিপি (OTP) পাঠান</span>
              </button>
            </form>
          )}

          {/* STEP 2: Enter & Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              
              {/* Email Sent Notice */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>৬-সংখ্যার ওটিপি কোড পাঠানো হয়েছে!</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  যাচাইকৃত ইমেইল <strong className="font-mono font-bold">{getMaskedEmail(emailInput)}</strong> ঠিকানায় Resend SMTP সার্ভারের মাধ্যমে recovery OTP কোড পাঠানো হয়েছে।
                </p>
              </div>

              {/* OTP Input with Large Spaced Digits */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 text-center">
                  ইমেইলে প্রাপ্ত ৬-সংখ্যার ওটিপি কোড লিখুন
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="w-full py-3.5 px-4 text-center text-2xl font-mono font-bold tracking-[0.5em] bg-slate-50 border-2 border-indigo-400 rounded-xl focus:outline-hidden focus:bg-white focus:border-indigo-600 text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal shadow-inner"
                />
              </div>

              {/* Timer and Resend */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>
                  {timer > 0 ? (
                    <span>পুনরায় পাঠানোর সময় বাকি: <strong className="font-mono text-indigo-600 font-bold">{timer}</strong> সেকেন্ড</span>
                  ) : (
                    <span className="text-amber-600 font-medium">কোড পাননি?</span>
                  )}
                </span>

                <button
                  type="button"
                  disabled={!canResend || isSubmitting}
                  onClick={handleResendOtp}
                  className={`font-bold transition cursor-pointer ${
                    canResend ? 'text-indigo-600 hover:underline' : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  পুনরায় ওটিপি পাঠান
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-3d btn-3d-slate py-2.5 px-4 text-slate-200 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  পিছনে
                </button>

                <button
                  type="submit"
                  className="btn-3d btn-3d-emerald flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ওটিপি যাচাই করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Set New Password with Large Bullet Dots */}
          {step === 3 && (
            <form onSubmit={handleSaveNewPassword} className="space-y-4 text-xs">
              
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs">
                <span>✅ ওটিপি সফলভাবে যাচাই হয়েছে। এবার আপনার নতুন গোপন পাসওয়ার্ড নির্ধারণ করুন।</span>
              </div>

              {/* New Password Input with Large Dots */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    নতুন গোপন পাসওয়ার্ড
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'লুকান' : 'দেখুন'}</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center absolute left-1.5 top-1/2 -translate-y-1/2">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                    className={`w-full pl-11 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 font-bold transition-all text-slate-900 placeholder:text-slate-400 ${
                      showPassword ? 'text-xs sm:text-sm font-mono' : 'text-xl sm:text-2xl tracking-[0.35em]'
                    }`}
                    style={{ letterSpacing: !showPassword && newPassword ? '0.35em' : 'normal' }}
                  />
                </div>
              </div>

              {/* Confirm Password Input with Large Dots */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  নতুন পাসওয়ার্ড পুনরায় লিখুন
                </label>
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center absolute left-1.5 top-1/2 -translate-y-1/2">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="হুবহু একই পাসওয়ার্ড লিখুন"
                    className={`w-full pl-11 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 font-bold transition-all text-slate-900 placeholder:text-slate-400 ${
                      showPassword ? 'text-xs sm:text-sm font-mono' : 'text-xl sm:text-2xl tracking-[0.35em]'
                    }`}
                    style={{ letterSpacing: !showPassword && confirmPassword ? '0.35em' : 'normal' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-3d btn-3d-emerald w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>পাসওয়ার্ড সংরক্ষণ ও সাইন-ইন করুন</span>
              </button>
            </form>
          )}

        </div>

        {/* Modal Footer Assistance */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>জরুরি সহায়তা: WhatsApp+Mobile: 01732-679551 (রফিকুল ইসলাম)</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            বাতিল
          </button>
        </div>

      </div>

    </div>
  );
};
