import React, { useEffect, useRef, useState } from 'react';
import { Download, ExternalLink, Share, X } from 'lucide-react';

/** The Chromium install event; not part of the DOM lib types. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isStandalone = (): boolean =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true);

/** iOS Safari has no install event, so the button explains the manual route. */
const isIosSafari = (): boolean =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

export const InstallAppButton: React.FC = () => {
  const promptRef = useRef<BeforeInstallPromptEvent | null>(
    typeof window !== 'undefined' && window.__gpfDeferredPrompt ? window.__gpfDeferredPrompt : null,
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [canPrompt, setCanPrompt] = useState<boolean>(
    () => typeof window !== 'undefined' && Boolean(window.__gpfDeferredPrompt),
  );
  const [isIos, setIsIos] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    if (isStandalone()) return;
    setIsIos(isIosSafari());

    // Check if prompt was already captured globally
    if (typeof window !== 'undefined' && window.__gpfDeferredPrompt) {
      promptRef.current = window.__gpfDeferredPrompt;
      setCanPrompt(true);
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as BeforeInstallPromptEvent;
      if (typeof window !== 'undefined') {
        window.__gpfDeferredPrompt = event;
      }
      setCanPrompt(true);
    };

    const onInstalled = () => {
      promptRef.current = null;
      if (typeof window !== 'undefined') {
        window.__gpfDeferredPrompt = null;
      }
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

  // Close hint on outside click, Escape key, or scroll
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

  const showHint = hintOpen;

  const onClick = async () => {
    if (hintOpen) {
      setHintOpen(false);
      return;
    }

    const deferred = promptRef.current || (typeof window !== 'undefined' ? window.__gpfDeferredPrompt : null);
    if (deferred) {
      try {
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === 'accepted') {
          promptRef.current = null;
          if (typeof window !== 'undefined') window.__gpfDeferredPrompt = null;
          setCanPrompt(false);
          setHintOpen(false);
          return;
        }
      } catch {
        // Fall back to showing manual instructions
      }
    }

    // If deferred prompt is not available (in an iframe, on iOS, or already dismissed by browser)
    setHintOpen(true);
  };

  return (
    <div className="relative shrink-0" ref={wrapperRef}>
      <button
        type="button"
        onClick={onClick}
        aria-expanded={showHint}
        className="group flex items-center gap-2 min-h-[44px] px-3.5 py-2.5 sm:min-h-0 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-b from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-[0_3px_0_0_#064e3b,0_5px_10px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_#064e3b,0_7px_14px_rgba(0,0,0,0.4)] active:translate-y-[2px] active:shadow-[0_1px_0_0_#064e3b] transition-all duration-150 cursor-pointer border border-emerald-500/60 select-none"
        title="ডিভাইসে gpf-app আইকন ইনস্টল করুন"
      >
        <Download className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-0.5 transition-transform duration-150" />
        <span className="text-xs sm:text-[13px] font-bold leading-tight">ইনস্টল</span>
      </button>

      {showHint && (
        <div
          role="dialog"
          aria-label="হোম স্ক্রিনে আইকন তৈরি করার নিয়ম"
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-xl bg-slate-900 border border-emerald-500/50 shadow-2xl p-4 text-left z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
            <p className="flex items-center gap-2 text-[13px] font-bold text-white">
              <Share className="w-4 h-4 text-emerald-400" />
              ডিভাইসে “gpf-app” আইকন তৈরি করুন
            </p>
            <button
              type="button"
              onClick={() => setHintOpen(false)}
              aria-label="বন্ধ করুন"
              className="shrink-0 rounded p-1 text-slate-400 hover:text-white cursor-pointer hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isIframe && (
            <div className="my-2.5 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-xs">
              <p className="font-semibold text-emerald-200">
                ⚠️ আপনি প্রিভিউ ফ্রেমে আছেন। সরাসরি ব্রাউজারে ইনস্টল করতে সাইটটি নতুন ট্যাবে খুলুন:
              </p>
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[12px] transition w-full justify-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                নতুন উইন্ডোতে খুলুন ও ইনস্টল করুন
              </a>
            </div>
          )}

          <p className="mt-2 text-[12px] font-semibold text-emerald-300">
            ডিভাইসে আইকন যুক্ত করার নিয়ম:
          </p>

          <ul className="mt-1.5 space-y-2 text-[12px] leading-relaxed text-slate-300">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span>
                <strong className="text-emerald-300">কম্পিউটার (Chrome / Edge):</strong> ব্রাউজারের উপরে অ্যাড্রেস বারের (URL bar) ডানপাশে থাকা <strong className="text-white">ইনস্টল আইকন (🖥️ বা ⬇️)</strong> চাপুন, অথবা ⋮ মেনু → <strong className="text-white">Install gpf-app</strong> চাপুন।
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span>
                <strong className="text-emerald-300">Android মোবাইল:</strong> Chrome-এর উপরে ডান দিকের ৩-ডট (⋮) মেনু → <strong className="text-white">Install app</strong> অথবা <strong className="text-white">Add to Home screen</strong> চাপুন।
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span>
                <strong className="text-emerald-300">iPhone / iPad (Safari):</strong> নিচের <strong className="text-white">Share</strong> বোতাম → <strong className="text-white">Add to Home Screen</strong> চাপুন।
              </span>
            </li>
          </ul>

          <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setHintOpen(false)}
              className="text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
