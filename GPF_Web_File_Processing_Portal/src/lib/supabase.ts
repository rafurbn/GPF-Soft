import { createClient } from '@supabase/supabase-js';

/**
 * Supabase credentials may be supplied with either the Vite (`VITE_`) or the
 * Next.js (`NEXT_PUBLIC_`) variable names. Both prefixes reach the browser
 * bundle through the `envPrefix` list in `vite.config.ts`.
 */
const env = import.meta.env as unknown as Record<string, string | undefined>;

const readEnv = (...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

export const supabaseUrl = readEnv(
  'VITE_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_SUPABASE_URL',
);

const supabaseKey = readEnv(
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_SUPABASE_ANON_KEY',
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;