import { LockSettings } from '../types/gpf';

// The only preset app4 ships with: which rows start out locked. The addressee and
// the two DDO rows start unlocked - a locked row that has no value yet can never be
// filled from the dashboard, so it would only ever print empty (app3 uses the same).
// Claim rows themselves always come from this upazila's own saved data.

export const INITIAL_LOCKS: LockSettings = {
  year: true,
  recipient: false,
  ddoName: false,
  ddoDesignation: false,
  upazilaName: true,
  districtName: true,
  attachmentsCount: true,
};

