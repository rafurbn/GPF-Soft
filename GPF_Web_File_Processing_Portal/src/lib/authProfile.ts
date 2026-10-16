import type { User } from '@supabase/supabase-js';
import type { UserRole, UserSession } from '../types';
import { supabase } from './supabase';

interface ProfileRow {
  user_id: string;
  email: string;
  upazila_code: string;
  upazila_name_bn: string;
  district_name_bn: string;
  division_name_bn: string | null;
  region_edit_until: string | null;
  role: UserRole;
  phone: string | null;
  password_setup_required: boolean;
}

export const profileToUserSession = (profile: ProfileRow): UserSession => ({
  id: profile.user_id,
  email: profile.email,
  upazila_code: profile.upazila_code,
  upazila_name_bn: profile.upazila_name_bn,
  district_name_bn: profile.district_name_bn,
  division_name_bn: profile.division_name_bn || '',
  region_edit_until: profile.region_edit_until,
  role: profile.role,
  is_first_login: profile.password_setup_required,
  phone: profile.phone || '',
  last_login: '—',
});

const PROFILE_COLUMNS = 'user_id, email, upazila_code, upazila_name_bn, district_name_bn, division_name_bn, region_edit_until, role, phone, password_setup_required';

export const loadUserSession = async (authUser: User): Promise<UserSession> => {
  if (!supabase) throw new Error('Supabase Auth কনফিগার করা হয়নি।');

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('user_id', authUser.id)
    .single();

  if (error || !data) {
    const meta = authUser.user_metadata || {};
    const upazilaCode = meta.upazila_code || (typeof window !== 'undefined' ? window.localStorage.getItem('gpf-active-upazila-code') : '') || 'Bea002';
    const upazilaName = meta.upazila_name_bn || (typeof window !== 'undefined' ? window.localStorage.getItem('gpf-active-upazila-name') : '') || 'বিয়ানীবাজার';
    const districtName = meta.district_name_bn || (typeof window !== 'undefined' ? window.localStorage.getItem('gpf-active-upazila-district') : '') || 'সিলেট';
    const divisionName = meta.division_name_bn || (typeof window !== 'undefined' ? window.localStorage.getItem('gpf-active-upazila-division') : '') || 'সিলেট';

    return {
      id: authUser.id,
      email: authUser.email || (typeof window !== 'undefined' ? window.localStorage.getItem('gpf-active-user-email') : '') || '',
      upazila_code: upazilaCode,
      upazila_name_bn: upazilaName,
      district_name_bn: districtName,
      division_name_bn: divisionName,
      region_edit_until: null,
      role: (meta.role as UserRole) || 'upazila_user',
      is_first_login: false,
      phone: meta.phone || '',
      last_login: new Date().toLocaleDateString('bn-BD'),
    };
  }

  const profile = data as unknown as ProfileRow;
  return {
    ...profileToUserSession(profile),
    email: authUser.email || profile.email,
  };
};

export const loadAllUserSessions = async (): Promise<UserSession[]> => {
  if (!supabase) throw new Error('Supabase Auth কনফিগার করা হয়নি।');
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .order('upazila_code');
  if (error) throw error;
  return ((data || []) as unknown as ProfileRow[]).map(profileToUserSession);
};