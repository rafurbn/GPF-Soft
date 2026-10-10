import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const invalidCredentials = () => new Response(
  JSON.stringify({ error: 'আইডি বা পাসওয়ার্ড সঠিক নয়।' }),
  { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
);

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  let loginId = '';
  let password = '';
  try {
    const body = await request.json();
    loginId = typeof body.loginId === 'string' ? body.loginId.trim() : '';
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return invalidCredentials();
  }

  if (!/^[a-zA-Z0-9_-]{3,32}$/.test(loginId) || password.length < 1 || password.length > 128) {
    return invalidCredentials();
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('MY_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY')
    || Deno.env.get('MY_PUBLISHABLE_KEY')
    || Deno.env.get('SUPABASE_PUBLISHABLE_DEFAULT_KEY');
  if (!supabaseUrl || !serviceRoleKey || !publishableKey) {
    return new Response(JSON.stringify({ error: 'সাইন-ইন সেবা বর্তমানে প্রস্তুত নয়।' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profile } = await adminClient
    .from('profiles')
    .select('email')
    .eq('upazila_code', loginId)
    .maybeSingle();

  if (!profile?.email) return invalidCredentials();

  const authClient = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await authClient.auth.signInWithPassword({ email: profile.email, password });
  if (error || !data.session) return invalidCredentials();

  return new Response(JSON.stringify({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
