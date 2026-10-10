import type { UserSession } from '../types';

/**
 * Shared Upazila (selected region) session bridge.
 *
 * The root dashboard owns authentication (Supabase) and is the single source of
 * truth for the selected Upazila. It publishes the active `UserSession` to
 * `localStorage` under this key so the isolated sub-apps (app1/app2/app3) can
 * read the same region without sharing React state or importing the root app.
 *
 * Because all pages are served from the same origin, `localStorage` is shared
 * across them, which is exactly what a Multi-Page Application needs.
 */
export const UPAZILA_SESSION_KEY = 'gpf-active-upazila-session';

// Keys the root app and every sub-app agree on. The root app writes these in
// addition to the JSON session so a sub-app can do a cheap, dependency-free read.
export const UPAZILA_CODE_KEY = 'gpf-active-upazila-code';
export const UPAZILA_NAME_KEY = 'gpf-active-upazila-name';
export const UPAZILA_DISTRICT_KEY = 'gpf-active-upazila-district';

export interface UpazilaSeed {
  upazila_code: string;
  upazila_name_bn: string;
  district_name_bn: string;
  division_name_bn?: string;
  role?: UserSession['role'];
  email?: string;
  id?: string;
}

/** Only the fields a sub-app actually needs to render its letterhead. */
export interface UpazilaContext {
  upazila_code: string;
  upazila_name_bn: string;
  district_name_bn: string;
  division_name_bn: string;
}

/** Builds a value for `window.name`, which survives navigation between pages. */
export const buildUpazilaContext = (seed: UpazilaSeed): UpazilaContext => ({
  upazila_code: seed.upazila_code,
  upazila_name_bn: seed.upazila_name_bn,
  district_name_bn: seed.district_name_bn,
  division_name_bn: seed.division_name_bn || '',
});

/**
 * Persists the Upazila context so any sub-app page can read it. Safe to call
 * from the root dashboard right after a successful sign-in / session restore.
 */
export const persistUpazilaContext = (seed: UpazilaSeed): void => {
  if (typeof window === 'undefined') return;

  const context = buildUpazilaContext(seed);

  try {
    window.localStorage.setItem(UPAZILA_SESSION_KEY, JSON.stringify(seed));
    window.localStorage.setItem(UPAZILA_CODE_KEY, context.upazila_code);
    window.localStorage.setItem(UPAZILA_NAME_KEY, context.upazila_name_bn);
    window.localStorage.setItem(UPAZILA_DISTRICT_KEY, context.district_name_bn);
  } catch {
    // Private browsing can block storage; `window.name` still carries the value.
  }

  // window.name is a same-tab store that survives full-page navigation.
  try {
    window.name = JSON.stringify({ __gpfUpazila: context });
  } catch {
    // Ignore - localStorage above is the primary channel.
  }
};

/** Reads the selected Upazila, or `null` when nothing has been published yet. */
export const readUpazilaContext = (): UpazilaContext | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(UPAZILA_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UpazilaSeed>;
      if (parsed.upazila_code) {
        return buildUpazilaContext(parsed as UpazilaSeed);
      }
    }

    // Fall back to the flat keys (cheap read, no JSON parsing).
    const code = window.localStorage.getItem(UPAZILA_CODE_KEY);
    if (code) {
      return {
        upazila_code: code,
        upazila_name_bn: window.localStorage.getItem(UPAZILA_NAME_KEY) || '',
        district_name_bn: window.localStorage.getItem(UPAZILA_DISTRICT_KEY) || '',
        division_name_bn: '',
      };
    }
    // Fall through to window.name when flat keys are absent.
  } catch {
    // Fall through to the window.name check.
  }

  // Last resort: the same-tab window.name value.
  try {
    const parsedName = window.name ? JSON.parse(window.name) : null;
    if (parsedName?.__gpfUpazila?.upazila_code) {
      return parsedName.__gpfUpazila as UpazilaContext;
    }
  } catch {
    // No usable context.
  }

  return null;
};

/**
 * Reads the Upazila, redirecting to the root dashboard when it is missing so a
 * sub-app can never open without a selected region.
 */
export const requireUpazilaContext = (loginUrl = '/'): UpazilaContext | null => {
  const context = readUpazilaContext();
  if (!context && typeof window !== 'undefined') {
    window.location.replace(loginUrl);
  }
  return context;
};

/** Clears the shared Upazila context, e.g. on logout from a sub-app. */
export const clearUpazilaContext = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(UPAZILA_SESSION_KEY);
    window.localStorage.removeItem(UPAZILA_CODE_KEY);
    window.localStorage.removeItem(UPAZILA_NAME_KEY);
    window.localStorage.removeItem(UPAZILA_DISTRICT_KEY);
  } catch {
    // Nothing to do.
  }
};
