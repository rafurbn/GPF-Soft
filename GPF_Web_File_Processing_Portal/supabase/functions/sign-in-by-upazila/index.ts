import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const reply = (status: number, body: Record<string, unknown>) => new Response(
  JSON.stringify(body),
  { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
);

const invalidCredentials = () => reply(401, { error: 'আইডি অথবা পাসওয়ার্ড সঠিক নয়।' });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return reply(405, { error: 'Method not allowed' });

  let identifier = '';
  let password = '';
  try {
    const body = await request.json();
    identifier = typeof body.identifier === 'string' ? body.identifier.trim() : '';
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return invalidCredentials();
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const isUpazilaCode = /^[a-zA-Z0-9_-]{3,32}$/.test(identifier);
  if ((!isEmail && !isUpazilaCode) || password.length < 1 || password.length > 128) {
    return invalidCredentials();
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    || Deno.env.get('MY_SERVICE_ROLE_KEY')
    || Deno.env.get('SUPABASE_SECRET_KEY');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY')
    || Deno.env.get('MY_PUBLISHABLE_KEY')
    || Deno.env.get('SUPABASE_PUBLISHABLE_DEFAULT_KEY');
  if (!supabaseUrl || !serviceRoleKey || !publishableKey) {
    return reply(503, { error: 'সাইন-ইন সেবা বর্তমানে প্রস্তুত নয়।' });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const profileQuery = adminClient
    .from('profiles')
    .select('user_id, email, upazila_code, account_status')
    .limit(1);
  const { data: profile, error: profileError } = await (isEmail
    ? profileQuery.eq('email', identifier.toLowerCase())
    : profileQuery.eq('upazila_code', identifier)).maybeSingle();

  if (profileError) return reply(503, { error: 'সাইন-ইন সেবা বর্তমানে প্রস্তুত নয়।' });
  if (!profile?.email || !profile.user_id) return invalidCredentials();
  const { data: lockState, error: lockError } = await adminClient
    .from('login_security_state')
    .select('failed_attempts, locked_until, auto_locked')
    .eq('user_id', profile.user_id)
    .maybeSingle();
  if (lockError) return reply(503, { error: 'সাইন-ইন নিরাপত্তা যাচাই করা যায়নি।' });
  if (lockState?.locked_until && new Date(lockState.locked_until).getTime() > Date.now()) {
    return reply(423, { error: '৫ বার ভুল পাসওয়ার্ড দেওয়ায় অ্যাকাউন্টটি ১৫ মিনিটের জন্য লক হয়েছে।' });
  }

  if (profile.account_status !== 'active') {
    const wasAutoLocked = profile.account_status === 'suspended'
      && lockState?.auto_locked
      && lockState.locked_until
      && new Date(lockState.locked_until).getTime() <= Date.now();
    if (wasAutoLocked) {
      const { error: unlockError } = await adminClient.from('profiles')
        .update({ account_status: 'active' })
        .eq('user_id', profile.user_id)
        .eq('account_status', 'suspended');
      if (unlockError) return reply(503, { error: 'অ্যাকাউন্ট পুনরায় চালু করা যায়নি।' });
      const { error: resetError } = await adminClient.from('login_security_state').delete().eq('user_id', profile.user_id);
      if (resetError) return reply(503, { error: 'লগইন নিরাপত্তা তথ্য হালনাগাদ করা যায়নি।' });
      profile.account_status = 'active';
    } else {
      return reply(403, {
        error: profile.account_status === 'deactivated'
          ? 'আপনার উপজেলার অ্যাকাউন্টটি স্থায়ীভাবে নিষ্ক্রিয় করা হয়েছে।'
          : 'আপনার উপজেলার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত। অ্যাডমিনের সাথে যোগাযোগ করুন।',
      });
    }
  }

  const authClient = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await authClient.auth.signInWithPassword({ email: profile.email, password });
  if (error || !data.session) {
    const { data: failureResult, error: failureError } = await adminClient
      .rpc('record_login_failure', { requested_user_id: profile.user_id });
    if (failureError) return reply(503, { error: 'লগইন নিরাপত্তা যাচাই করা যায়নি।' });
    const failure = Array.isArray(failureResult) ? failureResult[0] : failureResult;
    const locked = Boolean(failure?.locked_until && new Date(failure.locked_until).getTime() > Date.now());
    if (locked) {
      const { error: lockProfileError } = await adminClient.from('profiles')
        .update({ account_status: 'suspended' })
        .eq('user_id', profile.user_id)
        .eq('account_status', 'active');
      if (lockProfileError) return reply(503, { error: 'অ্যাকাউন্ট নিরাপত্তা লক প্রয়োগ করা যায়নি।' });
    }
    const logEntry = {
      id: `log-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      eventType: locked ? 'account_locked' : 'failed_login',
      upazilaCode: profile.upazila_code,
      email: profile.email,
      description: locked
        ? `৫ বার ভুল পাসওয়ার্ডের কারণে ${profile.upazila_code} অ্যাকাউন্টটি ১৫ মিনিটের জন্য লক হয়েছে।`
        : `ব্যর্থ সাইন-ইন চেষ্টা: ${profile.upazila_code} অ্যাকাউন্ট। (${failure?.failed_attempts || 0}/৫)`,
      status: locked ? 'danger' : 'warning',
    };
    await adminClient.from('admin_audit_logs').insert({
      id: logEntry.id,
      upazila_code: profile.upazila_code,
      user_id: profile.user_id,
      payload: logEntry,
    });
    if (locked) {
      return reply(423, { error: '৫ বার ভুল পাসওয়ার্ড দেওয়ায় অ্যাকাউন্টটি ১৫ মিনিটের জন্য লক হয়েছে।' });
    }
    const remaining = Math.max(0, 5 - Number(failure?.failed_attempts || 0));
    return reply(401, {
      error: `আইডি অথবা পাসওয়ার্ড সঠিক নয়। অবশিষ্ট সুযোগ: ${remaining} বার।`,
    });
  }

  const { error: resetError } = await adminClient
    .rpc('clear_login_failures', { requested_user_id: profile.user_id });
  if (resetError) return reply(503, { error: 'সাইন-ইন নিরাপত্তা তথ্য হালনাগাদ করা যায়নি।' });

  return reply(200, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});
