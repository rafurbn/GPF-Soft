import React, { useEffect, useState } from 'react';
import { 
  INITIAL_USERS
} from './data/mockData';
import { UserSession, ActiveAppTab } from './types';
import { PortalDesktopSignInView } from './components/PortalDesktopSignInView';
import { AccountRegistrationModal } from './components/AccountRegistrationModal';
import { FirstTimePasswordModal } from './components/FirstTimePasswordModal';
import { SuperAdminOverview } from './components/SuperAdminOverview';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { loadAllUserSessions, loadUserSession } from './lib/authProfile';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { persistUpazilaContext, clearUpazilaContext } from './lib/upazilaSession';
import type { User } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Multi-Page Application (MPA) routes.
//
// Each GPF processing app is now its own HTML page (see `vite.config.ts`).
// The root dashboard is only the secure sign-in window and the app launcher;
// it opens a sub-app as a full page navigation so the sub-app reads the
// selected Upazila straight from localStorage.
// ---------------------------------------------------------------------------
const SUB_APP_URLS: Record<'gpf_refundable' | 'gpf_non_refundable' | 'gpf_final', string> = {
  gpf_refundable: '/app1/index.html',
  gpf_non_refundable: '/app2/index.html',
  gpf_final: '/app3/index.html',
};

// Turns edge-function failures into a short Bangla message for the sign-in form
// instead of exposing raw backend errors to the user.
const describeLoginError = async (
  loginError: unknown,
  response: Response | undefined,
  fallback?: string,
): Promise<string> => {
  if (response?.status === 404) {
    return 'উপজেলা ID সেবা এখনো চালু হয়নি। ইমেইল দিয়ে সাইন-ইন করুন অথবা অ্যাডমিনের সঙ্গে যোগাযোগ করুন।';
  }

  const context = (loginError as { context?: Response } | null)?.context;
  if (typeof context?.json === 'function') {
    try {
      const body = (await context.json()) as { error?: string };
      if (body?.error) return body.error;
    } catch {
      // The body was already consumed or is not JSON - use the default message.
    }
  }

  return fallback || 'আইডি অথবা পাসওয়ার্ড সঠিক নয়।';
};

// ---------------------------------------------------------------------------
// Offline (demo) sign-in
//
// Until the Supabase backend is provisioned (`npm run supabase:setup`) the
// portal stays usable: an identifier that matches the built-in directory signs
// in with a local demo session. Supabase is always tried first, so real
// accounts take over automatically once the backend answers normally.
// ---------------------------------------------------------------------------
const OFFLINE_SESSION_KEY = 'gpf-offline-session';

const findLocalUser = (identifier: string): UserSession | undefined => {
  const value = identifier.trim().toLowerCase();
  return INITIAL_USERS.find(
    (user) => user.upazila_code.toLowerCase() === value || user.email.toLowerCase() === value,
  );
};

const readOfflineUser = (): UserSession | null => {
  try {
    const raw = window.localStorage.getItem(OFFLINE_SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
};

export default function App() {
  const [users, setUsers] = useState<UserSession[]>(INITIAL_USERS);
  // Default to Beanibazar Upazila (10101)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveAppTab>('gpf_dashboard');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isDemoSession, setIsDemoSession] = useState(false);
  
  // Publish the selected Upazila to localStorage so the standalone sub-app
  // pages (app1/app2/app3) can read the same region without sharing React state.
  useEffect(() => {
    if (currentUser) {
      persistUpazilaContext(currentUser);
    }
  }, [currentUser]);

  // Open a sub-app as a real page navigation (MPA), not an in-tab React switch.
  const openSubApp = (tab: 'gpf_refundable' | 'gpf_non_refundable' | 'gpf_final') => {
    if (currentUser) persistUpazilaContext(currentUser);
    window.location.href = SUB_APP_URLS[tab];
  };

  useEffect(() => {
    const client = supabase;
    let active = true;

    const restoreSession = async () => {
      if (client) {
        const { data } = await client.auth.getSession();
        if (!active) return;

        if (data.session?.user) {
          try {
            const profile = await loadUserSession(data.session.user);
            if (!active) return;
            const accountUsers = profile.role === 'super_admin'
              ? await loadAllUserSessions()
              : [profile];
            if (!active) return;
            setCurrentUser(profile);
            setIsLoggedIn(true);
            setUsers(accountUsers);
            setIsDemoSession(false);
            if (profile.is_first_login) setShowPasswordModal(true);
            return;
          } catch {
            // A stored session without an approved upazila profile is dropped quietly
            // so the sign-in screen never reports a backend error to the visitor.
            await client.auth.signOut();
          }
        }
      }

      // Restore a demo session created by an earlier offline sign-in.
      const offlineUser = readOfflineUser();
      if (!active || !offlineUser) return;
      setCurrentUser(offlineUser);
      setIsLoggedIn(true);
      setUsers([offlineUser]);
      setIsDemoSession(true);
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  // Shared post-authentication step: load the approved profile and open the portal.
  const applySignedInUser = async (authUser: User) => {
    const profile = await loadUserSession(authUser);
    const accountUsers = profile.role === 'super_admin'
      ? await loadAllUserSessions()
      : [profile];
    setCurrentUser(profile);
    setIsLoggedIn(true);
    setUsers(accountUsers);
    setShowPasswordModal(profile.is_first_login);
    setShowRegistrationModal(false);
    setIsDemoSession(false);
  };

  // Signs in through Supabase Auth: an email is verified by Supabase itself,
  // while a upazila ID is resolved by the sign-in-by-upazila edge function.
  const signInWithSupabase = async (identifier: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase Auth সংযোগ প্রস্তুত নয়। আবার চেষ্টা করুন।');
    }

    // An email address is verified by Supabase Auth itself, so it signs in directly.
    if (identifier.includes('@')) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      if (error || !data.user) throw new Error('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।');

      try {
        await applySignedInUser(data.user);
      } catch (profileError) {
        await supabase.auth.signOut();
        throw profileError;
      }
      return;
    }

    // A upazila ID is resolved to its verified email by the sign-in-by-upazila edge function.
    const { data: tokenData, error: loginError, response } = await supabase.functions.invoke<{
      access_token?: string;
      refresh_token?: string;
      error?: string;
    }>('sign-in-by-upazila', {
      body: { loginId: identifier, password },
    });

    if (loginError || !tokenData?.access_token || !tokenData?.refresh_token) {
      throw new Error(await describeLoginError(loginError, response, tokenData?.error));
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    });
    if (error || !data.user) throw new Error('সাইন ইন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।');

    try {
      await applySignedInUser(data.user);
    } catch (profileError) {
      await supabase.auth.signOut();
      throw profileError;
    }
  };

  const applyOfflineUser = (user: UserSession) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setUsers([user]);
    setShowPasswordModal(false);
    setShowRegistrationModal(false);
    setIsDemoSession(true);
    try {
      window.localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(user));
    } catch {
      // Private browsing can block storage; the in-memory session still works.
    }
  };

  // Supabase is attempted first; a known demo account keeps the portal usable
  // while the backend is still being provisioned.
  const handleLogin = async (loginId: string, password: string) => {
    const identifier = loginId.trim();
    const offlineUser = findLocalUser(identifier);

    if (supabase && isSupabaseConfigured) {
      try {
        await signInWithSupabase(identifier, password);
        return;
      } catch (authError) {
        if (!offlineUser) throw authError;
        applyOfflineUser(offlineUser);
        return;
      }
    }

    if (!offlineUser) {
      throw new Error('Supabase Auth সংযোগ প্রস্তুত নয়। আবার চেষ্টা করুন।');
    }
    applyOfflineUser(offlineUser);
  };

  const handleCreateAccount = async (
    region: import('./data/upazilaData').UpazilaRecord,
    email: string,
    password: string,
  ) => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('Supabase Auth কনফিগার করা হয়নি।');
    }

    // The pre-check RPC is a convenience only. When it has not been provisioned the
    // signup is still attempted: the create_upazila_profile_for_signup trigger is the
    // real guard and it rejects a second account for the same upazila on its own.
    const { data: available, error: availabilityError } = await supabase.rpc('is_upazila_available', {
      requested_upazila_code: region.defaultId,
    });
    if (!availabilityError && available === false) {
      throw new Error('এই উপজেলার জন্য account ইতিমধ্যে তৈরি হয়েছে।');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          account_type: 'upazila_user',
          upazila_code: region.defaultId,
          upazila_name_bn: region.upazilaBn,
          district_name_bn: region.districtBn,
          division_name_bn: region.divisionBn,
        },
      },
    });

    if (error) {
      if (error.message.includes('UPAZILA_ALREADY_REGISTERED') || error.message.includes('Database error saving new user')) {
        throw new Error('এই উপজেলার জন্য account ইতিমধ্যে তৈরি হয়েছে।');
      }
      if (error.message.includes('User already registered') || error.status === 422) {
        throw new Error('এই ইমেইল দিয়ে account আগেই তৈরি হয়েছে। ওই ইমেইল দিয়ে সাইন-ইন করুন।');
      }
      throw new Error(error.message);
    }

    if (data.session && data.user) {
      const profile = await loadUserSession(data.user);
      setCurrentUser(profile);
      setIsLoggedIn(true);
      setUsers([profile]);
      setShowRegistrationModal(false);
      return true;
    }
    return false;
  };

  // Handle Logout
  const handleLogout = async () => {
    await supabase?.auth.signOut();
    try {
      window.localStorage.removeItem(OFFLINE_SESSION_KEY);
    } catch {
      // Storage can be unavailable in private browsing; state is cleared below.
    }
    // Drop the shared Upazila context so the sub-app pages can no longer open.
    clearUpazilaContext();
    setIsDemoSession(false);
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('gpf_dashboard');
  };

  // Password Changed
  const handlePasswordChanged = async (newPassword: string, email?: string) => {
    if (!supabase || !currentUser) throw new Error('সক্রিয় Supabase সেশন পাওয়া যায়নি।');

    const updates: { password: string; email?: string } = { password: newPassword };
    if (email?.trim() && email.trim().toLowerCase() !== currentUser.email.toLowerCase()) {
      updates.email = email.trim();
    }

    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;

    if (currentUser.is_first_login) {
      const { error: profileError } = await supabase.rpc('complete_password_setup');
      if (profileError) throw profileError;
    }

    const updated = {
      ...currentUser,
      email: data.user?.email || currentUser.email,
      is_first_login: false,
    };
    setCurrentUser(updated);
    setUsers((previous) => previous.map((user) => user.id === updated.id ? updated : user));
    setShowPasswordModal(false);
  };

  // Send a Supabase recovery email without exposing admin credentials in the browser.
  const handleResetPassword = async (upazilaCode: string) => {
    const target = users.find((user) => user.upazila_code === upazilaCode);
    if (!supabase || !target?.email) {
      window.alert('এই অ্যাকাউন্টের ইমেইল Supabase profile-এ পাওয়া যায়নি।');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(target.email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      window.alert('পাসওয়ার্ড রিকভারি ইমেইল পাঠানো যায়নি। Supabase SMTP সেটিংস যাচাই করুন।');
      return;
    }
    window.alert('পাসওয়ার্ড রিকভারি কোড ব্যবহারকারীর যাচাইকৃত ইমেইলে পাঠানো হয়েছে।');
  };

  return (
    <div className="app-shell min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 
        MAIN DESKTOP SCREEN:
        - Layout based on Image 3
        - Pre-login: Clean sign-in with 14 bullet lines
        - Post-login: Dynamic, colorful right panel with bigger, attractive GPF app cards
        - Automatic first-time password modal removed upon login as requested
      */}
      {activeTab === 'gpf_dashboard' && (
        <PortalDesktopSignInView
          currentUser={currentUser ?? INITIAL_USERS[0]}
          isLoggedIn={isLoggedIn}
          isDemoSession={isDemoSession}
          onLogin={handleLogin}
          onOpenRegistration={() => setShowRegistrationModal(true)}
          onLogout={handleLogout}
          onOpenPasswordModal={() => setShowPasswordModal(true)}
          onNavigateToApp={(tab) => {
            // The three GPF apps are separate MPA pages now: open them as a full
            // page navigation. Local views (admin / architecture) stay in-tab.
            if (tab === 'gpf_refundable' || tab === 'gpf_non_refundable' || tab === 'gpf_final') {
              openSubApp(tab);
              return;
            }
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* এ্যাপ ১ / ২ / ৩ এখন আলাদা MPA পেজ (app1/index.html, app2, app3)।
          মূল ড্যাশবোর্ড শুধু সুরক্ষিত সাইন-ইন ও লঞ্চার — `SUB_APP_URLS` দেখুন। */}

      {/* Super Admin Overview (if admin) */}
      {activeTab === 'admin_overview' && (
        <div className="w-full max-w-[1300px] mx-auto">
          <div className="mb-4">
            <button
              onClick={() => setActiveTab('gpf_dashboard')}
              className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs cursor-pointer"
            >
              ← মূল ড্যাশবোর্ডে ফিরুন
            </button>
          </div>
          <SuperAdminOverview
            users={users}
            gpfApplications={[]}
            onResetPassword={handleResetPassword}
          />
        </div>
      )}

      {/* Architecture Guide (if selected) */}
      {activeTab === 'architecture_guide' && (
        <div className="w-full max-w-[1300px] mx-auto">
          <div className="mb-4">
            <button
              onClick={() => setActiveTab('gpf_dashboard')}
              className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs cursor-pointer"
            >
              ← মূল ড্যাশবোর্ডে ফিরুন
            </button>
          </div>
          <ArchitectureDocsView />
        </div>
      )}

      {/* Manual Password Change Modal (Only when explicitly clicked by user) */}
      {currentUser && (
        <FirstTimePasswordModal
          isOpen={showPasswordModal && isLoggedIn}
          currentUser={currentUser}
          onPasswordChanged={handlePasswordChanged}
          canDismiss={!currentUser.is_first_login}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
      {showRegistrationModal && (
        <AccountRegistrationModal
          onClose={() => setShowRegistrationModal(false)}
          onCreateAccount={handleCreateAccount}
        />
      )}
    </div>
  );
}
