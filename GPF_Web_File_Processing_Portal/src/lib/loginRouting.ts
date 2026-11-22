import type { UpazilaRecord } from '../data/upazilaData';

export type LoginFlowMode = 'upazila' | 'admin_strict';

export interface LoginRoutePlan {
  strategy: 'supabase_strict' | 'upazila_instant';
  identifier: string;
}

/**
 * Decides whether a sign-in attempt must go strictly through Supabase Auth
 * (never falling back to local instant access) or through zero-friction
 * Upazila check-in.
 */
export const resolveLoginRoutePlan = (params: {
  loginId: string;
  mode?: LoginFlowMode;
  matchedRegion: UpazilaRecord | null | undefined;
}): LoginRoutePlan => {
  const cleanId = params.loginId.trim();
  const looksLikeEmail = cleanId.includes('@');

  if (params.mode === 'admin_strict' || looksLikeEmail || !params.matchedRegion) {
    return {
      strategy: 'supabase_strict',
      identifier: cleanId,
    };
  }

  return {
    strategy: 'upazila_instant',
    identifier: params.matchedRegion.defaultId,
  };
};
