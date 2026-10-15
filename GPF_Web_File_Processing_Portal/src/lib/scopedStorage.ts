/**
 * Upazila-scoped localStorage keys.
 *
 * Every GPF sub-app keeps its drafts and saved records in `localStorage`, which
 * is shared by the whole origin. Without a scope, two upazilas signing in on the
 * same computer would read and overwrite each other's applications: the keys
 * were plain strings such as `gpf_death_claims_data_v3`.
 *
 * `scopedKey()` prefixes a key with the upazila code, so each upazila gets its
 * own storage namespace on the same browser. `baseKey()` strips the prefix back
 * off, which is what the migration below relies on.
 */
const PREFIX = 'gpf';
const SCOPE_SEPARATOR = '~~';

/** Normalises an upazila code so it is safe inside a storage key. */
const normaliseScope = (upazilaCode: string | undefined | null): string => {
  const raw = (upazilaCode || '').trim();
  if (!raw) return 'shared';
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
};

/**
 * Builds a storage key that belongs to one upazila.
 * Example: `scopedKey('10101', 'gpf_death_claims_data_v3')`
 *          -> `gpf~~10101~~gpf_death_claims_data_v3`
 */
export const scopedKey = (upazilaCode: string | undefined | null, key: string): string =>
  `${PREFIX}${SCOPE_SEPARATOR}${normaliseScope(upazilaCode)}${SCOPE_SEPARATOR}${key}`;

/** True when `key` is already namespaced for any upazila. */
const isScopedKey = (key: string): boolean => key.startsWith(`${PREFIX}${SCOPE_SEPARATOR}`);

/**
 * Reads a value for the given upazila.
 *
 * On the first run after the namespacing update there is no scoped value yet, so
 * a value written by the previous (un-scoped) version of the app is adopted once
 * and then re-saved under the scoped key. This is what keeps records created by
 * users before this update from disappearing.
 */
export const readScoped = (upazilaCode: string | undefined | null, baseKey: string): string | null => {
  if (isScopedKey(baseKey)) return null;

  try {
    const scoped = window.localStorage.getItem(scopedKey(upazilaCode, baseKey));
    if (scoped !== null) return scoped;
  } catch {
    return null;
  }

  // One-time migration from the pre-namespacing key.
  return migrateLegacyValue(upazilaCode, baseKey);
};

/** Writes a value for the given upazila. */
export const writeScoped = (
  upazilaCode: string | undefined | null,
  baseKey: string,
  value: string,
): void => {
  try {
    window.localStorage.setItem(scopedKey(upazilaCode, baseKey), value);
  } catch {
    // Quota exceeded / private browsing: the caller reports this to the user.
  }
};

/**
 * Adopts the legacy (un-scoped) value for this upazila exactly once.
 *
 * The legacy key is only removed after the scoped copy has been written, so a
 * failure never loses the original data.
 */
const migrateLegacyValue = (
  upazilaCode: string | undefined | null,
  baseKey: string,
): string | null => {
  try {
    const legacy = window.localStorage.getItem(baseKey);
    if (legacy === null) return null;

    window.localStorage.setItem(scopedKey(upazilaCode, baseKey), legacy);
    // Only remove the legacy key once the scoped copy is safely on disk.
    window.localStorage.removeItem(baseKey);
    return legacy;
  } catch {
    // If the write half failed the legacy value is still intact; return it so
    // this session keeps working and the migration can be retried next time.
    try {
      return window.localStorage.getItem(baseKey);
    } catch {
      return null;
    }
  }
};
