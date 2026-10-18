import React, { useEffect, useState } from 'react';
import { UserSession, ActiveAppTab } from './types';
import { PortalDesktopSignInView } from './components/PortalDesktopSignInView';
import { AccountRegistrationModal } from './components/AccountRegistrationModal';
import { FirstTimePasswordModal } from './components/FirstTimePasswordModal';
import { SuperAdminOverview } from './components/SuperAdminOverview';
import { SuperAdminSuite } from './components/SuperAdminSuite';
import { BroadcastNoticeMarquee } from './components/BroadcastNoticeMarquee';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { loadAllUserSessions, loadUserSession } from './lib/authProfile';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { persistUpazilaContext, clearUpazilaContext } from './lib/upazilaSession';
import { registerActiveSession, addAuditLog, isCurrentSessionTerminated, isCurrentAccountActive, endCurrentSessionOnServer, touchCurrentSession } from './lib/centralAdminStore';
import type { User } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Multi-Page Application (MPA) routes.
//
// Each GPF processing app is now its own HTML page (see `vite.config.ts`).
// The root dashboard is only the secure sign-in window and the app launcher;
// it opens a sub-app as a full page navigation so the sub-app reads the
// selected Upazila straight from localStorage.
// ---------------------------------------------------------------------------
type SubAppRoute = 'gpf_refundable' | 'gpf_non_refundable' | 'gpf_final' | 'gpf_DeathClaim';

const SUB_APP_URLS: Record<SubAppRoute, string> = {
  gpf_refundable: '/app1/index.html',
  gpf_non_refundable: '/app2/index.html',
  gpf_final: '/app3/index.html',
  gpf_DeathClaim: '/app4/index.html',
};

const isSubAppRoute = (tab: string): tab is SubAppRoute => tab in SUB_APP_URLS;

// Turns edge-function failures into a short Bangla message for the sign-in form
// instead of exposing raw backend errors to the user.
const describeLoginError = async (
  loginError: unknown,
  response: Response | undefined,
  fallback?: string,
): Promise<string> => {
  // The edge function was unreachable (offline, DNS, CORS preflight blocked).
  const err = loginError as { message?: string; name?: string } | null;
  if (err?.name === 'FunctionsFetchError' || /failed to fetch|networkerror|load failed/i.test(err?.message || '')) {
    return 'সার্ভারের সাথে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
  }

  if (response?.status === 404) {
    return 'উপজেলা ID সেবা এখনো চালু হয়নি। ইমেইল দিয়ে সাইন-ইন করুন অথবা অ্যাডমিনের সঙ্গে যোগাযোগ করুন।';
  }
  if (response?.status === 429) {
    return 'অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।';
  }
  if (response && response.status >= 500) {
    return 'সাইন-ইন সার্ভারে সাময়িক ত্রুটি হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।';
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

export default function App() {
  // No built-in account directory: every sign-in is verified by Supabase Auth.
  const [users, setUsers] = useState<UserSession[]>([]);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveAppTab>('gpf_dashboard');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Publish the selected Upazila to localStorage so the standalone sub-app
  // pages (app1/app2/app3) can read the same region without sharing React state.
  useEffect(() => {
    if (currentUser) {
      persistUpazilaContext(currentUser);
    }
  }, [currentUser]);

  // Open a sub-app as a real page navigation (MPA), not an in-tab React switch.
  const openSubApp = (tab: SubAppRoute) => {
    if (currentUser) persistUpazilaContext(currentUser);
    // A real navigation keeps the sub-app out of the dashboard's React state; the
    // browser Back button then returns to the dashboard without re-opening the app.
    window.location.assign(SUB_APP_URLS[tab]);
  };

  useEffect(() => {
    const client = supabase;
    let active = true;

    // Only a real Supabase session is ever restored. There is deliberately no
    // local/demo fallback: a failed sign-in must never open the portal.
    const restoreSession = async () => {
      if (!client) return;

      const { data } = await client.auth.getSession();
      if (!active) return;
      if (!data.session?.user) return;

      try {
        const profile = await loadUserSession(data.session.user);
        if (!active) return;
        if (profile.account_status && profile.account_status !== 'active') {
          await client.auth.signOut();
          return;
        }
        registerActiveSession({
          userId: profile.id,
          upazilaCode: profile.upazila_code,
          upazilaNameBn: profile.upazila_name_bn,
          email: profile.email,
          role: profile.role,
          loginTime: new Date().toLocaleTimeString('bn-BD'),
          ipAddress: 'সার্ভার থেকে উপলভ্য নয়',
          browser: typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Chrome',
          isCurrentSession: true,
        });
        const accountUsers = profile.role === 'super_admin'
          ? await loadAllUserSessions()
          : [profile];
        if (!active) return;
        setCurrentUser(profile);
        setIsLoggedIn(true);
        setUsers(accountUsers);
        if (profile.is_first_login) setShowPasswordModal(true);
      } catch {
        // A stored session without an approved upazila profile is dropped quietly
        // so the sign-in screen never reports a backend error to the visitor.
        await client.auth.signOut();
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUser || !supabase) return;
    const client = supabase;
    let active = true;
    let checking = false;
    const checkAccess = async () => {
      if (checking) return;
      checking = true;
      try {
        const [terminated, accountActive] = await Promise.all([
          isCurrentSessionTerminated(),
          isCurrentAccountActive(),
        ]);
        if (!active) return;
        if (!terminated && accountActive) {
          await touchCurrentSession();
          return;
        }
        try {
          await endCurrentSessionOnServer();
        } catch {
          // Auth is still cleared if the server cannot close presence state.
        }
        await client.auth.signOut();
        window.sessionStorage.removeItem('gpf-active-session-id');
        clearUpazilaContext();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUsers([]);
        setActiveTab('gpf_dashboard');
      } catch {
        // Keep the current screen during a transient network failure.
      } finally {
        checking = false;
      }
    };
    const interval = window.setInterval(() => void checkAccess(), 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [currentUser?.id]);

  // Shared post-authentication step: load the approved profile and open the portal.
  const applySignedInUser = async (authUser: User) => {
    const profile = await loadUserSession(authUser);

    // Check account status (মডিউল ১: এক ক্লিকে সাসপেন্ড বা ডিঅ্যাক্টিভেশন কার্যকর করা)
    if (profile.account_status === 'suspended') {
      throw new Error('আপনার উপজেলার অ্যাকাউন্টটি কেন্দ্রীয় অ্যাডমিন কর্তৃক সাময়িকভাবে স্থগিত (Suspended) রাখা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।');
    }
    if (profile.account_status === 'deactivated') {
      throw new Error('আপনার উপজেলার অ্যাকাউন্টটি স্থায়ীভাবে নিষ্ক্রিয় (Deactivated) করা হয়েছে।');
    }
    if (profile.account_status === 'pending') {
      throw new Error('আপনার অ্যাকাউন্টটি এখনো সক্রিয় করা হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।');
    }

    const accountUsers = profile.role === 'super_admin'
      ? await loadAllUserSessions()
      : [profile];
    setCurrentUser(profile);
    setIsLoggedIn(true);
    setUsers(accountUsers);
    setShowPasswordModal(profile.is_first_login);
    setShowRegistrationModal(false);

    // Register active session & audit log (মডিউল ৩)
    registerActiveSession({
      userId: profile.id,
      upazilaCode: profile.upazila_code,
      upazilaNameBn: profile.upazila_name_bn,
      email: profile.email,
      role: profile.role,
      loginTime: new Date().toLocaleTimeString('bn-BD'),
      ipAddress: 'সার্ভার থেকে উপলভ্য নয়',
      browser: typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Chrome',
      isCurrentSession: true,
    });

    addAuditLog({
      eventType: 'login',
      upazilaCode: profile.upazila_code,
      email: profile.email,
      description: `ব্যবহারকারী সফলভাবে সাইন-ইন করেছেন: ${profile.upazila_name_bn} (${profile.role === 'super_admin' ? 'সুপার এডমিন' : 'উপজেলা ইউজার'})`,
      status: 'success',
    });
  };

  // All login identifiers go through the server function so lockouts and account status
  // are enforced consistently for email and upazila-code sign-ins.
  const signInWithSupabase = async (identifier: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase Auth সংযোগ প্রস্তুত নয়। আবার চেষ্টা করুন।');
    }

    const { data: tokenData, error: loginError, response } = await supabase.functions.invoke<{
      access_token?: string;
      refresh_token?: string;
      error?: string;
    }>('sign-in-by-upazila', {
      body: { identifier, password },
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

  const handleLogin = async (loginId: string, password: string) => {
    // Never infer privilege from user input or allow a localStorage-only session.
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('Supabase Auth সংযোগ প্রস্তুত নয়। সাইন-ইন করতে সার্ভার কনফিগার করতে হবে।');
    }
    await signInWithSupabase(loginId.trim(), password);
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
    try {
      await endCurrentSessionOnServer();
    } catch {
      // Always clear the local auth session, even if presence cleanup fails.
    }
    await supabase?.auth.signOut();
    window.sessionStorage.removeItem('gpf-active-session-id');
    // Drop the shared Upazila context so the sub-app pages can no longer open.
    clearUpazilaContext();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsers([]);
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
      {/* কেন্দ্রীয় নোটিশ ও ব্রডকাস্ট ব্যানার (মডিউল ৪) */}
      {currentUser && <BroadcastNoticeMarquee userUpazilaCode={currentUser.upazila_code} />}

      {/*
        MAIN DESKTOP SCREEN:
        - Layout based on Image 3
        - Pre-login: Clean sign-in with 14 bullet lines
        - Post-login: Dynamic, colorful right panel with bigger, attractive GPF app cards
        - Automatic first-time password modal removed upon login as requested
      */}
      {activeTab === 'gpf_dashboard' && (
        <PortalDesktopSignInView
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          // A super-admin session receives every account; a upazila user only
          // receives its own, so the launcher statistics stay admin-only.
          visibleUsers={users}
          onLogin={handleLogin}
          onOpenRegistration={() => setShowRegistrationModal(true)}
          onLogout={handleLogout}
          onOpenPasswordModal={() => setShowPasswordModal(true)}
          // The 14 conditions are a post-login notice board again; the launcher
          // itself no longer renders them.
          onOpenConditionNotice={() => setActiveTab('architecture_guide')}
          onNavigateToApp={(tab) => {
            // Every GPF processing app (app1-app4) is its own MPA page.
            if (isSubAppRoute(tab)) {
              openSubApp(tab);
              return;
            }
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Super Admin Control Suite (মডিউল ১ থেকে ৬) */}
      {(activeTab === 'super_admin_suite' || activeTab === 'admin_overview') && currentUser?.role === 'super_admin' && (
        <SuperAdminSuite
          users={users}
          currentUser={currentUser}
          onBackToDashboard={() => {
            setActiveTab('gpf_dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onRefreshUsers={async () => {
            if (currentUser.role === 'super_admin') {
              const reloaded = await loadAllUserSessions();
              setUsers(reloaded);
            }
          }}
        />
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
