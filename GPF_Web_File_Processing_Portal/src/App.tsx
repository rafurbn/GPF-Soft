import React, { useEffect, useState } from 'react';
import { UserSession, ActiveAppTab } from './types';
import { PortalDesktopSignInView } from './components/PortalDesktopSignInView';
import { AccountRegistrationModal } from './components/AccountRegistrationModal';
import { FirstTimePasswordModal } from './components/FirstTimePasswordModal';
import { SuperAdminSuite } from './components/SuperAdminSuite';
import { BroadcastNoticeMarquee } from './components/BroadcastNoticeMarquee';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { loadAllUserSessions, loadUserSession } from './lib/authProfile';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { persistUpazilaContext, clearUpazilaContext } from './lib/upazilaSession';
import {
  registerActiveSession,
  addAuditLog,
  isCurrentSessionTerminated,
  isCurrentAccountActive,
  endCurrentSessionOnServer,
  touchCurrentSession,
  recordUpazilaCheckin,
  heartbeatUpazilaSession,
  endUpazilaSessionOnServer,
  setCurrentSessionId,
} from './lib/centralAdminStore';
import type { User } from '@supabase/supabase-js';
import { Toast, useToast } from '../app-shared/ui/Toast';
import { OfflineGuard } from '../app-shared/ui/OfflineGuard';
import { findUpazilaByDefaultId, type UpazilaRecord } from './data/upazilaData';
import {
  buildInstantUpazilaSession,
  clearInstantUpazilaSession,
  isInstantSession,
  readInstantUpazilaSession,
  saveInstantUpazilaSession,
  saveLocalRecoveryInfo,
} from './lib/localUpazilaAuth';
import { resolveLoginRoutePlan, type LoginFlowMode } from './lib/loginRouting';

type SubAppRoute = 'gpf_refundable' | 'gpf_non_refundable' | 'gpf_final' | 'gpf_DeathClaim' | 'gpf_ex_bangladesh';

const SUB_APP_URLS: Record<SubAppRoute, string> = {
  gpf_refundable: '/app1/index.html',
  gpf_non_refundable: '/app2/index.html',
  gpf_final: '/app3/index.html',
  gpf_DeathClaim: '/app4/index.html',
  gpf_ex_bangladesh: '/app6/index.html',
};

const isSubAppRoute = (tab: string): tab is SubAppRoute => tab in SUB_APP_URLS;

const detectBrowserName = (): string =>
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Chrome';

const describeLoginError = async (
  loginError: unknown,
  response: Response | undefined,
  fallback?: string,
): Promise<string> => {
  const err = loginError as { message?: string; name?: string } | null;
  if (err?.name === 'FunctionsFetchError' || /failed to fetch|networkerror|load failed/i.test(err?.message || '')) {
    return 'সার্ভারের সাথে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
  }

  if (response?.status === 404) {
    return 'সাইন-ইন ফাংশন (sign-in-by-upazila) এখনো ডিপ্লয় করা হয়নি। ইমেইল দিয়ে চেষ্টা করুন অথবা অ্যাডমিনের সঙ্গে যোগাযোগ করুন।';
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
      // Body was already consumed or is not JSON.
    }
  }

  return fallback || 'আইডি অথবা পাসওয়ার্ড সঠিক নয়।';
};

export default function App() {
  const { toast, showToast } = useToast();
  const [users, setUsers] = useState<UserSession[]>([]);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveAppTab>('gpf_dashboard');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      persistUpazilaContext(currentUser);
    }
  }, [currentUser]);

  const openSubApp = (tab: SubAppRoute) => {
    if (currentUser) persistUpazilaContext(currentUser);
    window.location.assign(SUB_APP_URLS[tab]);
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
            if (profile.account_status && profile.account_status !== 'active') {
              await client.auth.signOut();
            } else {
              registerActiveSession({
                userId: profile.id,
                upazilaCode: profile.upazila_code,
                upazilaNameBn: profile.upazila_name_bn,
                email: profile.email,
                role: profile.role,
                loginTime: new Date().toLocaleTimeString('bn-BD'),
                ipAddress: 'পোর্টাল সেশন',
                browser: detectBrowserName(),
              });
              const accountUsers = profile.role === 'super_admin'
                ? await loadAllUserSessions()
                : [profile];
              if (!active) return;
              setCurrentUser(profile);
              setIsLoggedIn(true);
              setUsers(accountUsers);
              return;
            }
          } catch {
            await client.auth.signOut();
          }
        }
      }

      const instant = readInstantUpazilaSession();
      if (!active || !instant) return;

      if (client && isSupabaseConfigured) {
        try {
          const check = await heartbeatUpazilaSession(instant.upazila_code);
          if (!active) return;
          if (check.terminated || check.accountStatus !== 'active') {
            clearInstantUpazilaSession();
            clearUpazilaContext();
            setCurrentSessionId('');
            return;
          }
        } catch {
          // Keep local session active on transient network error.
        }
      }

      setCurrentUser(instant);
      setIsLoggedIn(true);
      setUsers([instant]);
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  // Live 15s session heartbeat & remote force-logout/suspension check for BOTH
  // Supabase-authenticated users and Instant Upazila users.
  useEffect(() => {
    if (!currentUser || !supabase || !isSupabaseConfigured) return;
    const client = supabase;
    const activeUser = currentUser;
    let active = true;
    let checking = false;

    const forceSignOutLocal = (message: string) => {
      setCurrentSessionId('');
      clearInstantUpazilaSession();
      clearUpazilaContext();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setUsers([]);
      setActiveTab('gpf_dashboard');
      showToast(message, 'warning');
    };

    const checkAccess = async () => {
      if (checking) return;
      checking = true;
      try {
        if (!isInstantSession(activeUser)) {
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
            // Continue clearing auth session locally.
          }
          await client.auth.signOut();
          forceSignOutLocal(
            !accountActive
              ? 'অ্যাডমিন কর্তৃক আপনার অ্যাকাউন্ট স্থগিত বা নিষ্ক্রিয় করা হয়েছে।'
              : 'অ্যাডমিন কর্তৃক আপনার সেশনটি লগআউট করা হয়েছে।',
          );
        } else {
          const heartbeat = await heartbeatUpazilaSession(activeUser.upazila_code);
          if (!active) return;
          if (heartbeat.terminated || heartbeat.accountStatus !== 'active') {
            await endUpazilaSessionOnServer();
            forceSignOutLocal(
              heartbeat.accountStatus !== 'active'
                ? 'অ্যাডমিন কর্তৃক আপনার উপজেলার অ্যাক্সেস সাময়িকভাবে বন্ধ করা হয়েছে।'
                : 'অ্যাডমিন কর্তৃক আপনার সেশনটি লগআউট করা হয়েছে।',
            );
          }
        }
      } catch {
        // Keep current screen during transient network drop.
      } finally {
        checking = false;
      }
    };

    const interval = window.setInterval(() => void checkAccess(), 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [currentUser?.id, currentUser?.upazila_code]);

  const applySignedInUser = async (authUser: User) => {
    const profile = await loadUserSession(authUser);

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
    setShowRegistrationModal(false);

    registerActiveSession({
      userId: profile.id,
      upazilaCode: profile.upazila_code,
      upazilaNameBn: profile.upazila_name_bn,
      email: profile.email,
      role: profile.role,
      loginTime: new Date().toLocaleTimeString('bn-BD'),
      ipAddress: 'পোর্টাল সেশন',
      browser: detectBrowserName(),
    });

    addAuditLog({
      eventType: 'login',
      upazilaCode: profile.upazila_code,
      email: profile.email,
      description: `ব্যবহারকারী সফলভাবে সাইন-ইন করেছেন: ${profile.upazila_name_bn} (${profile.role === 'super_admin' ? 'সুপার এডমিন' : 'উপজেলা ইউজার'})`,
      status: 'success',
    });
  };

  const signInWithSupabaseStrict = async (identifier: string, password: string) => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('Supabase Auth সংযোগ প্রস্তুত নয়। আবার চেষ্টা করুন।');
    }

    const { data: tokenData, error: loginError, response } = await supabase.functions.invoke<{
      access_token?: string;
      refresh_token?: string;
      error?: string;
    }>('sign-in-by-upazila', {
      body: { identifier, password },
    });

    // If the edge function is not yet deployed (404) and the user provided an email,
    // authenticate directly with Supabase Auth so admin sign-in still works.
    if (response?.status === 404 && identifier.includes('@')) {
      const { data: directData, error: directError } = await supabase.auth.signInWithPassword({
        email: identifier.toLowerCase(),
        password,
      });
      if (directError || !directData.user) {
        throw new Error('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।');
      }
      try {
        await applySignedInUser(directData.user);
        return;
      } catch (profileError) {
        await supabase.auth.signOut();
        throw profileError;
      }
    }

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

  const signInInstantUpazila = async (
    region: UpazilaRecord,
    password: string,
    recoveryEmail?: string,
  ) => {
    const cleanEmail = (recoveryEmail || '').trim();
    const checkin = await recordUpazilaCheckin({
      upazilaCode: region.defaultId,
      upazilaNameBn: region.upazilaBn,
      districtNameBn: region.districtBn,
      divisionNameBn: region.divisionBn,
      recoveryEmail: cleanEmail,
      browser: detectBrowserName(),
    });

    if (!checkin.allowed) {
      throw new Error(
        checkin.accountStatus === 'deactivated'
          ? 'আপনার উপজেলার অ্যাক্সেস কেন্দ্রীয় অ্যাডমিন কর্তৃক স্থায়ীভাবে নিষ্ক্রিয় (Deactivated) করা হয়েছে।'
          : 'আপনার উপজেলার অ্যাক্সেস কেন্দ্রীয় অ্যাডমিন কর্তৃক সাময়িকভাবে স্থগিত (Suspended) করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।',
      );
    }

    const session = buildInstantUpazilaSession(region, cleanEmail);
    saveLocalRecoveryInfo(region.defaultId, session.email, password);
    saveInstantUpazilaSession(session);
    persistUpazilaContext(session);
    setCurrentUser(session);
    setIsLoggedIn(true);
    setUsers([session]);
    setShowRegistrationModal(false);

    registerActiveSession({
      userId: session.id,
      upazilaCode: session.upazila_code,
      upazilaNameBn: session.upazila_name_bn,
      email: session.email,
      role: session.role,
      loginTime: new Date().toLocaleTimeString('bn-BD'),
      ipAddress: 'উপজেলা পোর্টাল',
      browser: detectBrowserName(),
    });
  };

  const handleLogin = async (
    loginId: string,
    password: string,
    recoveryEmail?: string,
    regionRecord?: UpazilaRecord | null,
    mode: LoginFlowMode = 'upazila',
  ) => {
    const matchedRegion = regionRecord || findUpazilaByDefaultId(loginId.trim());
    const route = resolveLoginRoutePlan({ loginId, mode, matchedRegion });

    if (route.strategy === 'supabase_strict') {
      await signInWithSupabaseStrict(route.identifier, password);
      clearInstantUpazilaSession();
      return;
    }

    if (!matchedRegion || password.trim().length < 8) {
      throw new Error('উপজেলা নির্বাচন করুন এবং ৮ ডিজিটের পাসওয়ার্ড দিন।');
    }

    await signInInstantUpazila(matchedRegion, password, recoveryEmail);
  };

  const handleCreateAccount = async (
    region: UpazilaRecord,
    email: string,
    password: string,
  ) => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('Supabase Auth কনফিগার করা হয়নি।');
    }

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

    throw new Error(
      `অ্যাকাউন্ট তৈরি হয়েছে। এখন অ্যাডমিন/ইমেইল ট্যাব থেকে ইমেইল অথবা আইডি ${region.defaultId} ও পাসওয়ার্ড দিয়ে সাইন-ইন করুন।`,
    );
  };

  const handleLogout = async () => {
    try {
      if (isInstantSession(currentUser)) {
        await endUpazilaSessionOnServer();
      } else {
        await endCurrentSessionOnServer();
      }
    } catch {
      // Always clear local auth session.
    }
    if (supabase && !isInstantSession(currentUser)) {
      await supabase.auth.signOut();
    }
    clearInstantUpazilaSession();
    setCurrentSessionId('');
    clearUpazilaContext();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsers([]);
    setActiveTab('gpf_dashboard');
  };

  const handlePasswordChanged = async (newPassword: string, email?: string) => {
    if (!currentUser) throw new Error('সক্রিয় সেশন পাওয়া যায়নি।');

    if (isInstantSession(currentUser) || !supabase) {
      const nextEmail = email?.trim() || currentUser.email;
      saveLocalRecoveryInfo(currentUser.upazila_code, nextEmail, newPassword);
      const updated = {
        ...currentUser,
        email: nextEmail,
        is_first_login: false,
      };
      saveInstantUpazilaSession(updated);
      persistUpazilaContext(updated);
      setCurrentUser(updated);
      setUsers((previous) => previous.map((user) => (user.id === updated.id ? updated : user)));
      setShowPasswordModal(false);
      return;
    }

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
    setUsers((previous) => previous.map((user) => (user.id === updated.id ? updated : user)));
    setShowPasswordModal(false);
  };

  return (
    <div className="app-shell min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 lg:p-5 font-sans selection:bg-emerald-500 selection:text-white">
      <OfflineGuard context="জিপিএফ ফাইল প্রসেসিং পোর্টাল" />

      {currentUser && <BroadcastNoticeMarquee userUpazilaCode={currentUser.upazila_code} />}

      {activeTab === 'gpf_dashboard' && (
        <PortalDesktopSignInView
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          visibleUsers={users}
          onLogin={handleLogin}
          onOpenRegistration={() => setShowRegistrationModal(true)}
          onLogout={handleLogout}
          onOpenPasswordModal={() => setShowPasswordModal(true)}
          onOpenConditionNotice={() => setActiveTab('architecture_guide')}
          onNavigateToApp={(tab) => {
            if (isSubAppRoute(tab)) {
              openSubApp(tab);
              return;
            }
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

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

      {currentUser && (
        <FirstTimePasswordModal
          isOpen={showPasswordModal && isLoggedIn}
          currentUser={currentUser}
          onPasswordChanged={handlePasswordChanged}
          canDismiss
          onClose={() => setShowPasswordModal(false)}
        />
      )}
      {showRegistrationModal && (
        <AccountRegistrationModal
          onClose={() => setShowRegistrationModal(false)}
          onCreateAccount={handleCreateAccount}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}
