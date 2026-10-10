import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/index.css';
import { readUpazilaContext } from '../src/lib/upazilaSession';
import type { GpfApplication, UserSession } from '../src/types';

/**
 * Shape every sub-app `App.tsx` exposes. Each app originally lived inside the
 * root portal shell, so it still accepts `onBack` / `onSaveApplication`. In the
 * MPA those become: navigate back to the dashboard, and a no-op (the app already
 * persists its own records in localStorage).
 */
export interface SubAppProps {
  currentUser: UserSession;
  onBack: () => void;
  onSaveApplication: (app: GpfApplication) => void;
}

export interface SubAppModule {
  default: React.ComponentType<SubAppProps>;
}

export interface SubAppOptions {
  /** Root page to send visitors to when no Upazila has been selected. */
  loginUrl?: string;
  /** Upazila shown when the browser has never stored a selection (demo safety net). */
  fallback?: UserSession;
}

const FALLBACK_UPAZILA: UserSession = {
  id: 'guest',
  email: '',
  upazila_code: '10101',
  upazila_name_bn: 'বিয়ানীবাজার',
  district_name_bn: 'সিলেট',
  division_name_bn: 'সিলেট',
  role: 'upazila_user',
  is_first_login: false,
  phone: '',
  last_login: '—',
};

/**
 * Boots a standalone GPF sub-app page.
 *
 * It reads the Upazila selected on the root dashboard out of `localStorage`
 * (the single source of truth owned by `src/App.tsx`) and renders the sub-app
 * with that context. Nothing is imported from the root React tree, so each page
 * compiles and loads independently - a true MPA.
 */
export const mountSubApp = async (
  moduleLoader: () => Promise<SubAppModule>,
  options: SubAppOptions = {},
): Promise<void> => {
  const { loginUrl = '/', fallback = FALLBACK_UPAZILA } = options;

  const context = readUpazilaContext();
  if (!context) {
    // No Upazila chosen yet: bounce back to the secure root dashboard.
    window.location.replace(loginUrl);
    return;
  }

  const currentUser: UserSession = {
    ...fallback,
    upazila_code: context.upazila_code,
    upazila_name_bn: context.upazila_name_bn || fallback.upazila_name_bn,
    district_name_bn: context.district_name_bn || fallback.district_name_bn,
    division_name_bn: context.division_name_bn || fallback.division_name_bn,
  };

  const { default: RootComponent } = await moduleLoader();
  const container = document.getElementById('root');
  if (!container) return;

  // Returning to the dashboard is a real navigation back to the root page.
  const handleBack = () => window.location.assign(loginUrl);

  createRoot(container).render(
    <StrictMode>
      <RootComponent
        currentUser={currentUser}
        onBack={handleBack}
        onSaveApplication={() => {
          // Each sub-app already keeps its own records in localStorage; the
          // portal-wide tracking list is no longer part of this MPA page.
        }}
      />
    </StrictMode>,
  );
};
