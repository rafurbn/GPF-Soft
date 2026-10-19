import { LockSettings } from '../types/gpf';

// The only preset app4 ships with: which rows start out locked.
// Claim rows themselves always come from this upazila's own saved data.

export const INITIAL_LOCKS: LockSettings = {
  year: true,
  recipient: true,
  ddoName: true,
  ddoDesignation: true,
  upazilaName: true,
  districtName: true,
  attachmentsCount: true,
};

