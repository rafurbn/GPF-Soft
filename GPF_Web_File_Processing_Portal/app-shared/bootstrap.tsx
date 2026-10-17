import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/index.css';
import type { GpfApplication, UserSession } from '../src/types';
import { isSupabaseConfigured, supabase } from '../src/lib/supabase';
import { loadUserSession } from '../src/lib/authProfile';
import { getRemoteMaintenanceState, isCurrentSessionTerminated, isCurrentAccountActive, touchCurrentSession, endCurrentSessionOnServer } from '../src/lib/centralAdminStore';

/**
 * Shape every sub-app `App.tsx` exposes. Each app originally lived inside the
 * root portal shell, so it still accepts `onBack` / `onSaveApplication`. In the
 * MPA those become: navigate back to the dashboard, and a no-op (the app already
 * persists its own records in localStorage).
 */
export interface SubAppProps {
  currentUser: UserSession;
  onBack: () => void;
  onSaveApplication: (app: GpfApplication) => void;
}

export interface SubAppModule {
  default: React.ComponentType<SubAppProps>;
}

export interface SubAppOptions {
  /** Root page to send visitors to when no Upazila has been selected. */
  loginUrl?: string;
  appId?: 'app1' | 'app2' | 'app3' | 'app4';
}

/**
 * Boots a standalone GPF sub-app only after checking the Supabase session and
 * authoritative profile. Browser storage is not an authentication source.
 */
export const mountSubApp = async (
  moduleLoader: () => Promise<SubAppModule>,
  options: SubAppOptions = {},
): Promise<void> => {
  const { loginUrl = '/', appId } = options;

  if (!isSupabaseConfigured || !supabase) {
    window.location.replace(loginUrl);
    return;
  }
  const client = supabase;
  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session?.user) {
    window.location.replace(loginUrl);
    return;
  }

  let currentUser: UserSession;
  try {
    currentUser = await loadUserSession(sessionData.session.user);
    if (currentUser.account_status && currentUser.account_status !== 'active') {
      await client.auth.signOut();
      window.location.replace(loginUrl);
      return;
    }
  } catch {
    await client.auth.signOut();
    window.location.replace(loginUrl);
    return;
  }

  const container = document.getElementById('root');
  if (!container) return;

  if (appId) {
    try {
      const maintenance = await getRemoteMaintenanceState(appId);
      if (maintenance?.isLocked) {
        createRoot(container).render(
          <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
            <section className="max-w-xl rounded-2xl border border-amber-700/60 bg-amber-950/40 p-8 text-center">
              <h1 className="text-2xl font-bold">{maintenance.appName} — সাময়িক রক্ষণাবেক্ষণ</h1>
              <p className="mt-4 text-amber-100">{maintenance.lockReason || 'সিস্টেম রক্ষণাবেক্ষণের জন্য অ্যাপটি সাময়িক বন্ধ আছে।'}</p>
              <a className="mt-6 inline-block rounded-lg bg-slate-800 px-4 py-2" href={loginUrl}>ড্যাশবোর্ডে ফিরুন</a>
            </section>
          </main>,
        );
        return;
      }
    } catch {
      createRoot(container).render(
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <section className="max-w-xl rounded-2xl border border-rose-700/60 bg-rose-950/40 p-8 text-center">
            <h1 className="text-xl font-bold">অ্যাপের নিরাপত্তা অবস্থা যাচাই করা যায়নি</h1>
            <p className="mt-4 text-rose-100">কেন্দ্রীয় রক্ষণাবেক্ষণ সেটিংস পাওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।</p>
            <a className="mt-6 inline-block rounded-lg bg-slate-800 px-4 py-2" href={loginUrl}>ড্যাশবোর্ডে ফিরুন</a>
          </section>
        </main>,
      );
      return;
    }
  }

  const { default: RootComponent } = await moduleLoader();

  // Returning to the dashboard is a real navigation back to the root page.
  const handleBack = () => window.location.assign(loginUrl);

  createRoot(container).render(
    <StrictMode>
      <RootComponent
        currentUser={currentUser}
        onBack={handleBack}
        onSaveApplication={() => {
          // Each sub-app already keeps its own records in localStorage; the
          // portal-wide tracking list is no longer part of this MPA page.
        }}
      />
    </StrictMode>,
  );

  let checking = false;
  const monitor = window.setInterval(async () => {
    if (checking) return;
    checking = true;
    try {
      const [terminated, accountActive] = await Promise.all([
        isCurrentSessionTerminated(),
        isCurrentAccountActive(),
      ]);
      if (terminated || !accountActive) {
        try {
          await endCurrentSessionOnServer();
        } catch {
          // Sign out locally even if presence cleanup fails.
        }
        await client.auth.signOut();
        window.sessionStorage.removeItem('gpf-active-session-id');
        window.location.replace(loginUrl);
      } else {
        await touchCurrentSession();
      }
    } catch {
      // Keep the app available through a short network interruption.
    } finally {
      checking = false;
    }
  }, 15000);
  window.addEventListener('pagehide', () => window.clearInterval(monitor), { once: true });
};
