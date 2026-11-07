import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * The portal is an online service: nothing works without the internet.
 *
 * This guard is the single place that enforces that rule. It watches the
 * browser's connectivity and, the moment the connection drops, covers the whole
 * page with a blocking warning so no form can be filled in or submitted while
 * offline. When the connection comes back the warning disappears by itself and
 * the user continues exactly where they were.
 *
 * It is mounted by the root dashboard and by every sub-app (app1-app4), so the
 * behaviour is identical everywhere.
 */

/** `navigator.onLine` is only a hint, so a failed probe also counts as offline. */
const probe = async (): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
  try {
    const response = await fetch(`/manifest.webmanifest?ping=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const useOnlineStatus = (): boolean => {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine !== false,
  );

  useEffect(() => {
    let active = true;

    const verify = async () => {
      const reachable = await probe();
      if (active) setOnline(reachable);
    };

    const onOnline = () => void verify();
    const onOffline = () => setOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    // A device can stay "online" while the network is dead (captive portal,
    // dropped Wi-Fi); re-check whenever the tab is brought back to the front.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void verify();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      active = false;
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return online;
};

export interface OfflineGuardProps {
  /** Extra line under the heading, e.g. the app name that is paused. */
  context?: string;
}

/**
 * Full-screen blocking warning. Rendered above everything (z-[100]) and it
 * swallows pointer events, so the work underneath is paused, not just hidden.
 */
export const OfflineGuard: React.FC<OfflineGuardProps> = ({ context }) => {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4 print:hidden"
    >
      <section className="w-full max-w-md rounded-2xl border border-rose-600/60 bg-rose-950/50 p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 border border-rose-500/40">
          <WifiOff className="h-7 w-7 text-rose-300" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-white">ইন্টারনেট সংযোগ নেই</h2>
        <p className="mt-2 text-sm leading-relaxed text-rose-100">
          এই পোর্টালটি অনলাইনে চলে। ইন্টারনেট সংযোগ না থাকলে কোনো কাজ করা যাবে না, তাই
          কার্যক্রম সাময়িকভাবে বন্ধ রাখা হয়েছে।
        </p>
        {context && <p className="mt-2 text-xs font-semibold text-rose-200/80">{context}</p>}
        <p className="mt-4 text-xs text-rose-200/70">
          ইন্টারনেট সংযোগ ফিরে এলে এই বার্তাটি নিজে থেকেই সরে যাবে এবং আপনি যেখানে ছিলেন
          সেখান থেকেই কাজ চালিয়ে যেতে পারবেন।
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-500 transition-colors cursor-pointer"
        >
          আবার চেষ্টা করুন
        </button>
      </section>
    </div>
  );
};
