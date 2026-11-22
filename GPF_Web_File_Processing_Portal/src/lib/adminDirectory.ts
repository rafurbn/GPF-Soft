import type { LoginSecurityRow } from './adminSecurity';
import type { UpazilaUsageStat, UserAccountStatus, UserRole, UserSession } from '../types';
import { findUpazilaByDefaultId } from '../data/upazilaData';

export interface UnifiedUpazilaRow {
  upazilaCode: string;
  upazilaNameBn: string;
  districtNameBn: string;
  divisionNameBn: string;
  email: string;
  role: UserRole;
  accountStatus: UserAccountStatus;
  isRegistered: boolean;
  loginCount: number;
  appOpensTotal: number;
  app1Opens: number;
  app2Opens: number;
  app3Opens: number;
  app4Opens: number;
  lastSeenAt: string;
  lastBrowser: string;
  security?: LoginSecurityRow;
}

export const buildUnifiedUpazilaDirectory = (params: {
  registeredUsers: UserSession[];
  usageStats: UpazilaUsageStat[];
  loginSecurity: Record<string, LoginSecurityRow>;
}): UnifiedUpazilaRow[] => {
  const byCode = new Map<string, UnifiedUpazilaRow>();

  for (const user of params.registeredUsers) {
    const code = user.upazila_code;
    const sec = params.loginSecurity[code];
    const meta = findUpazilaByDefaultId(code);
    byCode.set(code, {
      upazilaCode: code,
      upazilaNameBn: user.upazila_name_bn || meta?.upazilaBn || code,
      districtNameBn: user.district_name_bn || meta?.districtBn || '—',
      divisionNameBn: user.division_name_bn || meta?.divisionBn || '—',
      email: user.email || '',
      role: user.role,
      accountStatus: sec?.accountStatus || user.account_status || 'active',
      isRegistered: true,
      loginCount: 0,
      appOpensTotal: 0,
      app1Opens: 0,
      app2Opens: 0,
      app3Opens: 0,
      app4Opens: 0,
      lastSeenAt: '',
      lastBrowser: '',
      security: sec,
    });
  }

  for (const stat of params.usageStats) {
    const code = stat.upazilaCode;
    const existing = byCode.get(code);
    const sec = params.loginSecurity[code];
    const meta = findUpazilaByDefaultId(code);
    const appOpensTotal = (stat.app1Opens || 0) + (stat.app2Opens || 0) + (stat.app3Opens || 0) + (stat.app4Opens || 0);

    if (existing) {
      byCode.set(code, {
        ...existing,
        email: existing.email || stat.recoveryEmail || '',
        accountStatus: sec?.accountStatus || existing.accountStatus || stat.accountStatus || 'active',
        loginCount: stat.loginCount || 0,
        appOpensTotal,
        app1Opens: stat.app1Opens || 0,
        app2Opens: stat.app2Opens || 0,
        app3Opens: stat.app3Opens || 0,
        app4Opens: stat.app4Opens || 0,
        lastSeenAt: stat.lastSeenAt || existing.lastSeenAt,
        lastBrowser: stat.lastBrowser || existing.lastBrowser,
        security: sec || existing.security,
      });
    } else {
      byCode.set(code, {
        upazilaCode: code,
        upazilaNameBn: stat.upazilaNameBn || meta?.upazilaBn || code,
        districtNameBn: stat.districtNameBn || meta?.districtBn || '—',
        divisionNameBn: stat.divisionNameBn || meta?.divisionBn || '—',
        email: stat.recoveryEmail || '',
        role: 'upazila_user',
        accountStatus: sec?.accountStatus || stat.accountStatus || 'active',
        isRegistered: false,
        loginCount: stat.loginCount || 0,
        appOpensTotal,
        app1Opens: stat.app1Opens || 0,
        app2Opens: stat.app2Opens || 0,
        app3Opens: stat.app3Opens || 0,
        app4Opens: stat.app4Opens || 0,
        lastSeenAt: stat.lastSeenAt || '',
        lastBrowser: stat.lastBrowser || '',
        security: sec,
      });
    }
  }

  return Array.from(byCode.values()).sort((a, b) => {
    if (a.role === 'super_admin' && b.role !== 'super_admin') return -1;
    if (b.role === 'super_admin' && a.role !== 'super_admin') return 1;
    const aTime = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
    const bTime = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
    if (aTime !== bTime) return bTime - aTime;
    return a.upazilaCode.localeCompare(b.upazilaCode);
  });
};
