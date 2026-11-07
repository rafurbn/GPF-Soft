import React, { useEffect, useRef, useState } from 'react';
import { Download, Share } from 'lucide-react';

/** The Chromium install event; not part of the DOM lib types. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * The manifest asks for `display: "browser"`, so the installed icon always opens
 * the site in a normal browser window. These checks only cover browsers that
 * still launch an older install in standalone mode.
 */
const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: window-controls-overlay)').matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true;

/** iOS Safari has no install event, so the button explains the manual route. */
const isIosSafari = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const InstallAppButton: React.FC = () => {
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [canPrompt, setCanPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    setIsIos(isIosSafari());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as BeforeInstallPromptEvent;
      setCanPrompt(true);
    };
    const onInstalled = () => {
      promptRef.current = null;
      setCanPrompt(false);
      setIsIos(false);
      setHintOpen(false);
    };
    const onDisplayMode = (event: MediaQueryListEvent) => {
      if (event.matches) onInstalled();
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    standaloneQuery.addEventListener('change', onDisplayMode);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      standaloneQuery.removeEventListener('change', onDisplayMode);
    };
  }, []);

  // Android/Chrome only fire `beforeinstallprompt` once; if it never arrives the
  // button still shows the manual "Add to Home screen" route instead of hiding.
  if (!canPrompt && !isIos && !hintOpen) return null;
  const showHint = hintOpen || !canPrompt;

  const onClick = async () => {
    if (hintOpen) {
      setHintOpen(false);
      return;
    }
    const deferred = promptRef.current;
    if (!deferred) {
      setHintOpen(true);
      return;
    }
    // The browser's own install dialog is the only way to create the icon.
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') {
      promptRef.current = null;
      setCanPrompt(false);
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        className="group flex items-center gap-2 min-h-[44px] px-3.5 py-2.5 sm:min-h-0 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-b from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-[0_3px_0_0_#064e3b,0_5px_10px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_#064e3b,0_7px_14px_rgba(0,0,0,0.4)] active:translate-y-[2px] active:shadow-[0_1px_0_0_#064e3b] transition-all duration-150 cursor-pointer border border-emerald-500/60 select-none"
        title="হোম স্ক্রিনে gpf-app আইকন তৈরি করুন — এটি শুধু এই ওয়েবসাইটের শর্টকাট, কোনো অ্যাপ ইনস্টল হয় না"
      >
        <Download className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-0.5 transition-transform duration-150" />
        <span className="text-xs sm:text-[13px] font-bold leading-tight">ইনস্টল</span>
      </button>

      {showHint && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-xl p-3 text-left z-50">
          <p className="flex items-center gap-2 text-[13px] font-bold text-white">
            <Share className="w-4 h-4 text-emerald-400" />
            হোম স্ক্রিনে “gpf-app” আইকন তৈরি করুন
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-slate-300">
            ব্রাউজারের <span className="text-emerald-300 font-semibold">Share</span> বোতাম চেপে{' '}
            <span className="text-emerald-300 font-semibold">Add to Home Screen</span> নির্বাচন করুন।
            এতে কোনো অ্যাপ ইনস্টল হবে না — শুধু এই ওয়েবসাইটের একটি শর্টকাট আইকন তৈরি হবে, যা
            চাপ দিলে ব্রাউজারে সাইটটি খুলবে।
          </p>
          <button
            type="button"
            onClick={() => setHintOpen(false)}
            className="mt-2 text-[12px] font-semibold text-emerald-300 hover:text-emerald-200 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      )}
    </div>
  );
};
