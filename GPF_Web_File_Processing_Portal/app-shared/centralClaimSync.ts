import type { CentralClaimRecord, SystemAnnouncement } from '../src/types';
import { saveCentralClaim, isAppLocked, getActiveAnnouncementsForUser } from '../src/lib/centralAdminStore';
import { supabase } from '../src/lib/supabase';

/**
 * Syncs a saved claim from any sub-app (App 1, 2, 3, 4) into the central admin claim hub.
 */
export const syncClaimToCentral = async (
  appType: 'app1' | 'app2' | 'app3' | 'app4',
  claimData: {
    id?: string;
    trackingNo?: string;
    employeeName: string;
    designation: string;
    gpfAccNo: string;
    amount: number | string;
    status?: string;
    applyDate?: string;
    upazilaCode?: string;
    upazilaName?: string;
    districtName?: string;
    rawDetails?: any;
  }
): Promise<boolean> => {
  try {
    const titles: Record<string, string> = {
      app1: '১. ফেরতযোগ্য অগ্রিম',
      app2: '২. অফেরতযোগ্য অগ্রিম',
      app3: '৩. চূড়ান্ত উত্তোলন',
      app4: '৪. জিপিএফ মৃত্যুদাবী নিষ্পত্তি',
    };

    const upazilaCode = claimData.upazilaCode || (typeof window !== 'undefined' ? window.localStorage.getItem('gpf-active-upazila-code') : '') || '';
    const upazilaNameBn = claimData.upazilaName || (typeof window !== 'undefined' ? window.localStorage.getItem('gpf-active-upazila-name') : '') || '';
    const districtNameBn = claimData.districtName || (typeof window !== 'undefined' ? window.localStorage.getItem('gpf-active-upazila-district') : '') || '';

    const numAmount = typeof claimData.amount === 'number' ? claimData.amount : parseFloat(String(claimData.amount).replace(/[^\d.]/g, '')) || 0;

    const record: CentralClaimRecord = {
      id: claimData.id || `claim-${appType}-${Date.now()}`,
      appType,
      appTitle: titles[appType] || 'জিপিএফ আবেদন',
      upazilaCode,
      upazilaNameBn,
      districtNameBn,
      trackingNo: claimData.trackingNo || `${appType.toUpperCase()}-${Date.now().toString().slice(-5)}`,
      employeeName: claimData.employeeName,
      designation: claimData.designation,
      gpfAccNo: claimData.gpfAccNo,
      amount: numAmount,
      status: (claimData.status as any) || 'অনুমোদিত',
      applyDate: claimData.applyDate || new Date().toLocaleDateString('bn-BD'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      details: claimData.rawDetails || {},
    };

    saveCentralClaim(record);

    if (!supabase) return false;
    const { error } = await supabase.from('central_claims').upsert({
      id: record.id,
      app_type: record.appType,
      upazila_code: record.upazilaCode,
      tracking_no: record.trackingNo,
      record,
      // Re-saving a claim that was moved to the trash brings it back.
      deleted_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[centralClaimSync] Failed to sync claim:', err);
    return false;
  }
};

/**
 * Checks if the given app is currently locked / under maintenance.
 */
export const checkAppMaintenanceStatus = (appId: 'app1' | 'app2' | 'app3' | 'app4') => {
  return isAppLocked(appId);
};

/**
 * Gets announcements applicable to the current upazila.
 */
export const getUpazilaAnnouncements = (upazilaCode?: string): SystemAnnouncement[] => {
  return getActiveAnnouncementsForUser(upazilaCode);
};
