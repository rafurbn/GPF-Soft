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
              <p className="text-xs text-slate-400">অনলাইন পোর্টালটি ডেস্কটপ উইন্ডো হিসেবে ব্যবহারের নির্দেশিকা</p>
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
                আপনার ফাইলের তথ্য পিসিতেই নিরাপদ — তবে পোর্টালটি অনলাইনে চলে
              </p>
              <p className="text-emerald-300/80">
                ক্লেইম ও ফাইল সংক্রান্ত সমস্ত তথ্য আপনার নিজস্ব ব্রাউজারের লোকাল স্টোরেজে সংরক্ষিত থাকে এবং প্রিন্ট/পিডিএফ ব্রাউজার ইঞ্জিন থেকেই জেনারেট হয়। তবে পোর্টাল চালু রাখা ও লগইন যাচাইয়ের জন্য সক্রিয় ইন্টারনেট সংযোগ প্রয়োজন।
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
              <span>লোকাল ব্যাকআপ ও এক্সপোর্ট সুবিধা:</span>
            </h5>
            <p className="text-slate-400">
              প্রতিটি অ্যাপের নিচের টেবিলে <strong className="text-slate-200">"CSV এক্সপোর্ট"</strong> বাটন আছে — এর মাধ্যমে আপনার নিজস্ব পিসির সকল আবেদন এক্সেল ফাইলে সেভ রেখে যেকোনো কম্পিউটারে সংরক্ষণ করা যায়।
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
