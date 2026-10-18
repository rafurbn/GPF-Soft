-- ============================================================================
-- ONE-TIME OWNER RECOVERY  (run only from Supabase Dashboard -> SQL Editor)
--
-- There is no in-app way to create the first super_admin: the signup trigger
-- (schema.sql, create_upazila_profile_for_signup) always writes
-- role = 'upazila_user', and every admin RPC is gated on is_super_admin(), which
-- itself requires an *active* super_admin profile. So if the only administrator
-- is suspended, or was never promoted, this file is the recovery path.
--
-- It runs as the dashboard role, which is the only principal that may bypass the
-- role gate. Do not expose it as an RPC.
--
-- Usage: replace the e-mail below with the account owner's sign-up e-mail, then
-- run the whole file. The final SELECT shows what changed.
-- ============================================================================

do $$
declare
  owner_email text := 'CHANGE-ME@example.com';  -- <-- edit this one line
  target uuid;
begin
  select user_id into target
  from public.profiles
  where lower(email) = lower(owner_email);

  if target is null then
    raise exception
      using message = 'No profile for ' || owner_email
        || '. Sign up on the portal first, then re-run this file.';
  end if;

  -- A locked administrator must be able to sign in again.
  delete from public.login_security_state where user_id = target;
  update public.profiles
  set account_status = 'active',
      role = 'super_admin'
  where user_id = target;

  insert into public.admin_audit_logs (id, upazila_code, user_id, payload)
  select
    'bootstrap-' || gen_random_uuid(),
    p.upazila_code,
    p.user_id,
    jsonb_build_object(
      'timestamp', now(),
      'eventType', 'super_admin_bootstrapped',
      'upazilaCode', p.upazila_code,
      'description', 'SQL Editor থেকে অ্যাকাউন্ট পুনরায় সক্রিয় ও super_admin ভূমিকা প্রদান করা হয়েছে।',
      'status', 'danger'
    )
  from public.profiles p where p.user_id = target;

  raise notice 'Recovery complete for %', owner_email;
end $$;

select upazila_code, upazila_name_bn, role, account_status
from public.profiles
where role = 'super_admin'
order by upazila_code;
