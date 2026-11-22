import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/index.css';
import type { UserSession } from '../src/types';
import { isSupabaseConfigured, supabase } from '../src/lib/supabase';
import { loadUserSession } from '../src/lib/authProfile';
import {
  getAppMaintenanceStates,
  getRemoteMaintenanceState,
  isCurrentSessionTerminated,
  isCurrentAccountActive,
  touchCurrentSession,
  endCurrentSessionOnServer,
  heartbeatUpazilaSession,
  endUpazilaSessionOnServer,
  recordUpazilaAppOpen,
  setCurrentSessionId,
} from '../src/lib/centralAdminStore';
import {
  clearInstantUpazilaSession,
  isInstantSession,
  readInstantUpazilaSession,
} from '../src/lib/localUpazilaAuth';
import { clearUpazilaContext } from '../src/lib/upazilaSession';
import { registerPwa } from './pwa';
import { OfflineGuard } from './ui/OfflineGuard';

/**
 * Shape every sub-app `App.tsx` exposes. Each app originally lived inside the
 * root portal shell, so it still accepts `onBack` / `onSaveApplication`. In the
 * MPA those become: navigate back to the dashboard, and a no-op (the app already
 * persists its own records in localStorage).
 */
export interface SubAppProps {
  currentUser: UserSession;
  onBack: () => void;
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
 * Boots a standalone GPF sub-app after verifying either a Supabase session or an
 * active instant Upazila session, enforcing maintenance locks and heartbeats.
 */
export const mountSubApp = async (
  moduleLoader: () => Promise<SubAppModule>,
  options: SubAppOptions = {},
): Promise<void> => {
  const { loginUrl = '/', appId } = options;

  registerPwa();

  const container = document.getElementById('root');

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    if (container) {
      createRoot(container).render(
        <StrictMode>
          <OfflineGuard context="অ্যাপটি চালু করা যায়নি — ইন্টারনেট সংযোগ প্রয়োজন" />
        </StrictMode>,
      );
    }
    return;
  }

  let currentUser: UserSession | null = null;
  let hasSupabaseSession = false;

  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const { data: sessionData } = await client.auth.getSession();
    if (sessionData.session?.user) {
      try {
        const loadedUser = await loadUserSession(sessionData.session.user);
        if (loadedUser.account_status && loadedUser.account_status !== 'active') {
          await client.auth.signOut();
          window.location.replace(loginUrl);
          return;
        }
        currentUser = loadedUser;
        hasSupabaseSession = true;
      } catch {
        if (typeof navigator !== 'undefined' && navigator.onLine === false && container) {
          createRoot(container).render(
            <StrictMode>
              <OfflineGuard context="প্রোফাইল যাচাই করা যায়নি — ইন্টারনেট সংযোগ প্রয়োজন" />
            </StrictMode>,
          );
          return;
        }
        await client.auth.signOut();
      }
    }
  }

  if (!currentUser) {
    currentUser = readInstantUpazilaSession();
    if (currentUser && isSupabaseConfigured && supabase) {
      try {
        const check = await heartbeatUpazilaSession(currentUser.upazila_code);
        if (check.terminated || check.accountStatus !== 'active') {
          clearInstantUpazilaSession();
          clearUpazilaContext();
          setCurrentSessionId('');
          window.location.replace(loginUrl);
          return;
        }
      } catch {
        // Keep available during transient network/migration fallback.
      }
    }
  }

  if (!currentUser) {
    window.location.replace(loginUrl);
    return;
  }

  if (!container) return;

  if (appId) {
    const localMaintenance = getAppMaintenanceStates().find((state) => state.appId === appId);
    let maintenance = localMaintenance;
    if (isSupabaseConfigured && supabase) {
      try {
        const remote = await getRemoteMaintenanceState(appId);
        if (remote) maintenance = remote;
      } catch {
        // Fall back to local maintenance state on transient fetch error.
      }
    }
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

    // Track non-sensitive app open count for admin statistics
    void recordUpazilaAppOpen(currentUser, appId);
  }

  let loaded: SubAppModule;
  try {
    loaded = await moduleLoader();
  } catch {
    createRoot(container).render(
      <StrictMode>
        <OfflineGuard context="অ্যাপটি লোড করা যায়নি — ইন্টারনেট সংযোগ প্রয়োজন" />
      </StrictMode>,
    );
    return;
  }

  const RootComponent = loaded.default;
  const handleBack = () => window.location.assign(loginUrl);

  createRoot(container).render(
    <StrictMode>
      <RootComponent
        currentUser={currentUser}
        onBack={handleBack}
      />
    </StrictMode>,
  );

  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const activeUser = currentUser;
    let checking = false;
    const monitor = window.setInterval(async () => {
      if (checking) return;
      checking = true;
      try {
        if (hasSupabaseSession && !isInstantSession(activeUser)) {
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
            setCurrentSessionId('');
            window.location.replace(loginUrl);
          } else {
            await touchCurrentSession();
          }
        } else {
          const heartbeat = await heartbeatUpazilaSession(activeUser.upazila_code);
          if (heartbeat.terminated || heartbeat.accountStatus !== 'active') {
            await endUpazilaSessionOnServer();
            clearInstantUpazilaSession();
            clearUpazilaContext();
            window.location.replace(loginUrl);
          }
        }
      } catch {
        // Keep the app available through a short network interruption.
      } finally {
        checking = false;
      }
    }, 15000);
    window.addEventListener('pagehide', () => window.clearInterval(monitor), { once: true });
  }
};
