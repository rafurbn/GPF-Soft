import { describe, expect, it } from 'vitest';
import {
  ACTIVE_SESSION_STALE_MS,
  computeUsageSummary,
  normalizeRemoteActiveSessions,
} from './centralAdminStore';
import { resolveLoginRoutePlan } from './loginRouting';
import { buildUnifiedUpazilaDirectory } from './adminDirectory';
import { findUpazilaByDefaultId } from '../data/upazilaData';

describe('admin control & session logic', () => {
  it('computes isCurrentSession strictly from local sessionId and prunes stale sessions', () => {
    const now = Date.parse('2026-11-21T12:00:00.000Z');
    const sessions = normalizeRemoteActiveSessions(
      [
        {
          session_id: 'sess-admin',
          upazila_code: 'Bea002',
          last_seen_at: new Date(now - 30_000).toISOString(),
          record: { upazilaNameBn: 'বিয়ানীবাজার', isCurrentSession: true },
        },
        {
          session_id: 'sess-other-upazila',
          upazila_code: 'Sav001',
          last_seen_at: new Date(now - 120_000).toISOString(),
          // Simulate an older DB row that mistakenly saved isCurrentSession: true
          record: { upazilaNameBn: 'সাভার', isCurrentSession: true },
        },
        {
          session_id: 'sess-stale-closed-tab',
          upazila_code: 'Dha001',
          last_seen_at: new Date(now - ACTIVE_SESSION_STALE_MS - 10_000).toISOString(),
          record: { upazilaNameBn: 'ধামরাই' },
        },
      ],
      'sess-admin',
      now,
    );

    expect(sessions).toHaveLength(2);
    expect(sessions[0].sessionId).toBe('sess-admin');
    expect(sessions[0].isCurrentSession).toBe(true);
    expect(sessions[1].sessionId).toBe('sess-other-upazila');
    expect(sessions[1].isCurrentSession).toBe(false);
  });

  it('aggregates active windows and app open counts without financial data', () => {
    const now = Date.parse('2026-11-21T12:00:00.000Z');
    const summary = computeUsageSummary(
      [
        {
          upazilaCode: 'Bea002',
          upazilaNameBn: 'বিয়ানীবাজার',
          districtNameBn: 'সিলেট',
          divisionNameBn: 'সিলেট',
          recoveryEmail: '',
          accountStatus: 'active',
          loginCount: 5,
          app1Opens: 3,
          app2Opens: 2,
          app3Opens: 1,
          app4Opens: 0,
          firstSeenAt: new Date(now - 2 * 86_400_000).toISOString(),
          lastSeenAt: new Date(now - 3_600_000).toISOString(), // today
          lastBrowser: 'Chrome',
          updatedAt: new Date(now - 3_600_000).toISOString(),
        },
        {
          upazilaCode: 'Sav001',
          upazilaNameBn: 'সাভার',
          districtNameBn: 'ঢাকা',
          divisionNameBn: 'ঢাকা',
          recoveryEmail: '',
          accountStatus: 'suspended',
          loginCount: 2,
          app1Opens: 1,
          app2Opens: 0,
          app3Opens: 0,
          app4Opens: 1,
          firstSeenAt: new Date(now - 20 * 86_400_000).toISOString(),
          lastSeenAt: new Date(now - 10 * 86_400_000).toISOString(), // within 30d, outside 7d
          lastBrowser: 'Firefox',
          updatedAt: new Date(now - 10 * 86_400_000).toISOString(),
        },
      ],
      now,
    );

    expect(summary.totalActiveUpazilas).toBe(2);
    expect(summary.activeToday).toBe(1);
    expect(summary.activeLast7Days).toBe(1);
    expect(summary.activeLast30Days).toBe(2);
    expect(summary.totalLogins).toBe(7);
    expect(summary.appOpens).toEqual({ app1: 4, app2: 2, app3: 1, app4: 1, total: 8 });
  });

  it('routes admin/email sign-ins strictly to Supabase and upazila dropdown entries to instant check-in', () => {
    const region = findUpazilaByDefaultId('Bea002');
    expect(region).toBeDefined();

    expect(
      resolveLoginRoutePlan({
        loginId: 'ueo.s.beanibazar@gmail.com',
        mode: 'admin_strict',
        matchedRegion: null,
      }),
    ).toEqual({
      strategy: 'supabase_strict',
      identifier: 'ueo.s.beanibazar@gmail.com',
    });

    expect(
      resolveLoginRoutePlan({
        loginId: 'Bea002',
        mode: 'admin_strict',
        matchedRegion: region,
      }),
    ).toEqual({
      strategy: 'supabase_strict',
      identifier: 'Bea002',
    });

    expect(
      resolveLoginRoutePlan({
        loginId: 'Bea002',
        mode: 'upazila',
        matchedRegion: region,
      }),
    ).toEqual({
      strategy: 'upazila_instant',
      identifier: 'Bea002',
    });
  });

  it('merges registered profiles, instant usage stats, and login security into a deduplicated directory', () => {
    const directory = buildUnifiedUpazilaDirectory({
      registeredUsers: [
        {
          id: 'uid-admin',
          email: 'ueo.s.beanibazar@gmail.com',
          upazila_code: 'Bea002',
          upazila_name_bn: 'বিয়ানীবাজার',
          district_name_bn: 'সিলেট',
          division_name_bn: 'সিলেট',
          role: 'super_admin',
          account_status: 'active',
          is_first_login: false,
          phone: '',
          last_login: '—',
        },
      ],
      usageStats: [
        {
          upazilaCode: 'Bea002',
          upazilaNameBn: 'বিয়ানীবাজার',
          districtNameBn: 'সিলেট',
          divisionNameBn: 'সিলেট',
          recoveryEmail: '',
          accountStatus: 'active',
          loginCount: 4,
          app1Opens: 2,
          app2Opens: 0,
          app3Opens: 0,
          app4Opens: 0,
          firstSeenAt: '2026-11-20T00:00:00.000Z',
          lastSeenAt: '2026-11-21T10:00:00.000Z',
          lastBrowser: 'Chrome',
          updatedAt: '2026-11-21T10:00:00.000Z',
        },
        {
          upazilaCode: 'Sav001',
          upazilaNameBn: 'সাভার',
          districtNameBn: 'ঢাকা',
          divisionNameBn: 'ঢাকা',
          recoveryEmail: 'savar@example.com',
          accountStatus: 'active',
          loginCount: 1,
          app1Opens: 1,
          app2Opens: 1,
          app3Opens: 0,
          app4Opens: 0,
          firstSeenAt: '2026-11-21T08:00:00.000Z',
          lastSeenAt: '2026-11-21T11:00:00.000Z',
          lastBrowser: 'Firefox',
          updatedAt: '2026-11-21T11:00:00.000Z',
        },
      ],
      loginSecurity: {
        Sav001: {
          upazilaCode: 'Sav001',
          failedAttempts: 0,
          lockedUntil: null,
          autoLocked: false,
          accountStatus: 'suspended',
        },
      },
    });

    expect(directory).toHaveLength(2);
    expect(directory[0].upazilaCode).toBe('Bea002');
    expect(directory[0].role).toBe('super_admin');
    expect(directory[0].isRegistered).toBe(true);
    expect(directory[0].loginCount).toBe(4);
    expect(directory[1].upazilaCode).toBe('Sav001');
    expect(directory[1].isRegistered).toBe(false);
    expect(directory[1].accountStatus).toBe('suspended');
    expect(directory[1].appOpensTotal).toBe(2);
  });
});
