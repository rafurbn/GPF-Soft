import React, { useEffect, useRef, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
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

  // The hint must never sit on top of the form: close it on an outside click,
  // on Escape, and on any scroll (the header is sticky, so it would otherwise
  // stay pinned over the fields while the user works).
  useEffect(() => {
    if (!hintOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setHintOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setHintOpen(false);
    };
    const onScroll = () => setHintOpen(false);

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll);
    };
  }, [hintOpen]);

  // The button is always visible. Chrome only fires `beforeinstallprompt` when it
  // decides the site is installable, and it never fires again once the icon is
  // already on the device — hiding the button in that case made it look broken.
  // Without the event the click opens the manual "Add to Home screen" hint.
  const showHint = hintOpen || (!canPrompt && isIos);

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
    <div className="relative shrink-0" ref={wrapperRef}>
      <button
        type="button"
        onClick={onClick}
        aria-expanded={showHint}
        className="group flex items-center gap-2 min-h-[44px] px-3.5 py-2.5 sm:min-h-0 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-b from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-[0_3px_0_0_#064e3b,0_5px_10px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_#064e3b,0_7px_14px_rgba(0,0,0,0.4)] active:translate-y-[2px] active:shadow-[0_1px_0_0_#064e3b] transition-all duration-150 cursor-pointer border border-emerald-500/60 select-none"
        title="হোম স্ক্রিনে gpf-app আইকন তৈরি করুন — এটি শুধু এই ওয়েবসাইটের শর্টকাট, কোনো অ্যাপ ইনস্টল হয় না"
      >
        <Download className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-0.5 transition-transform duration-150" />
        <span className="text-xs sm:text-[13px] font-bold leading-tight">ইনস্টল</span>
      </button>

      {showHint && (
        <div
          role="dialog"
          aria-label="হোম স্ক্রিনে আইকন তৈরি করার নিয়ম"
          className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-xl p-3 text-left z-50"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-2 text-[13px] font-bold text-white">
              <Share className="w-4 h-4 text-emerald-400" />
              হোম স্ক্রিনে “gpf-app” আইকন তৈরি করুন
            </p>
            <button
              type="button"
              onClick={() => setHintOpen(false)}
              aria-label="বন্ধ করুন"
              className="shrink-0 rounded p-0.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-slate-300">
            এতে কোনো অ্যাপ ইনস্টল হবে না — শুধু এই ওয়েবসাইটের একটি শর্টকাট আইকন তৈরি হবে, যা
            চাপ দিলে ব্রাউজারে সাইটটি খুলবে।
          </p>
          <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-slate-300">
            <li>
              <span className="text-emerald-300 font-semibold">Android Chrome:</span> উপরে ডান দিকের ⋮
              মেনু → <span className="text-emerald-300 font-semibold">Add to Home screen</span> / Install app
            </li>
            <li>
              <span className="text-emerald-300 font-semibold">iPhone / iPad (Safari):</span> Share বোতাম →{' '}
              <span className="text-emerald-300 font-semibold">Add to Home Screen</span>
            </li>
            <li>
              <span className="text-emerald-300 font-semibold">কম্পিউটার (Chrome / Edge):</span> অ্যাড্রেস
              বারের ডান পাশের ইনস্টল আইকন, অথবা ⋮ মেনু →{' '}
              <span className="text-emerald-300 font-semibold">Cast, save and share → Install page as app</span>
            </li>
          </ul>
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
