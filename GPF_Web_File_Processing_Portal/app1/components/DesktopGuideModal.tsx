import React from 'react';
import { X, Monitor, Cpu, Terminal, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DesktopGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopGuideModal: React.FC<DesktopGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ডেস্কটপ (.exe) অ্যাপ্লিকেশনে রূপান্তর গাইড</h3>
              <p className="text-xs text-slate-400">অফলাইন ও ডেস্কটপ পিসিতে ব্যবহারের জন্য ১ ক্লিকে এক্সপোর্ট</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-300 leading-relaxed">
          <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <p className="font-semibold text-emerald-200">
                এই অ্যাপ্লিকেশনটি ১০০% ক্লায়েন্ট-সাইড ও অফলাইন প্রস্তুত!
              </p>
              <p className="text-emerald-300/80">
                এটির সমস্ত ডাটা আপনার লোকাল স্টোরেজে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে এবং প্রিন্ট/পিডিএফ ব্রাউজার ইঞ্জিন থেকেই জেনারেট হয়। কোনো ইন্টারনেটের প্রয়োজন নেই।
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>পদ্ধতি ১: Nativefier দিয়ে মাত্র ১টি কমান্ডে .exe তৈরি (সবচেয়ে সহজ)</span>
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              কম্পিউটারে Node.js ইনস্টল থাকলে কমান্ড প্রম্পটে (CMD) নিচের কমান্ডটি রান করলেই জিপিএফ ড্যাশবোর্ডের পূর্ণাঙ্গ .exe সফটওয়্যার ফাইল তৈরি হয়ে যাবে:
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
              npx nativefier --name "GPF Advance System" "{window.location.origin}" --platform windows
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>পদ্ধতি ২: Electron বা Tauri দিয়ে প্রজেক্ট বান্ডল করা</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pl-1">
              <li>প্রজেক্টটি ডাউনলোড করে <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">npm run build</code> দিয়ে তৈরি করুন।</li>
              <li>ইলেক্ট্রন বিল্ডারে <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">electron-builder</code> রান করলে সরাসরি Windows Setup (.exe) ফাইল পাওয়া যাবে।</li>
            </ol>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <h5 className="font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>অফলাইন ব্যাকআপ ও রিস্টোর সুবিধা:</span>
            </h5>
            <p className="text-slate-400">
              ড্যাশবোর্ডের নিচের টেবিলে <strong className="text-slate-200">"ব্যাকআপ (JSON)"</strong> ও <strong className="text-slate-200">"রিস্টোর / ইম্পোর্ট"</strong> বাটন যুক্ত করা হয়েছে। এর মাধ্যমে যে কোনো সময় আপনার সকল আবেদন ও ডিডিও/উপজেলা সেটিংস ফাইল আকারে সেভ রাখতে ও নতুন কম্পিউটারে স্থানান্তর করতে পারবেন।
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            বুঝেছি, ধন্যবাদ
          </button>
        </div>
      </div>
    </div>
  );
};
