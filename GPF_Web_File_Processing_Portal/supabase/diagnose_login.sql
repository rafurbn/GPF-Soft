-- ============================================================================
-- Read-only login diagnostics for the GPF portal.
-- Run this whole file in Supabase Dashboard -> SQL Editor, then paste the
-- result tables back to whoever is fixing the login. It writes nothing.
-- ============================================================================

-- 1. Is there any super_admin profile at all?
--    Zero rows here means nobody can open the admin panel, regardless of password.
select
  count(*) filter (where role = 'super_admin')                      as super_admin_count,
  count(*) filter (where role = 'super_admin' and account_status = 'active') as super_admin_active,
  count(*)                                                          as total_profiles,
  count(*) filter (where account_status = 'suspended')              as suspended,
  count(*) filter (where account_status = 'deactivated')            as deactivated,
  count(*) filter (where account_status = 'pending')                as pending
from public.profiles;

-- 2. Per-account state, including the lockout counters the sign-in function uses.
--    status_now tells you whether the 15-minute lock has already expired.
select
  p.upazila_code,
  p.upazila_name_bn,
  p.role,
  p.account_status,
  coalesce(s.failed_attempts, 0) as failed_attempts,
  s.locked_until,
  s.auto_locked,
  case
    when s.locked_until is null then 'not_locked'
    when s.locked_until > now() then 'locked_for_' || floor(extract(epoch from (s.locked_until - now())) / 60) || '_more_minutes'
    else 'lock_expired'
  end as lock_state,
  p.password_setup_required,
  left(p.email, 3) || '***' || right(p.email, 6) as email_masked,
  p.created_at::date as created_on
from public.profiles p
left join public.login_security_state s on s.user_id = p.user_id
order by coalesce(s.failed_attempts, 0) desc, p.role, p.upazila_code;

-- 3. Accounts that exist in Auth but have no profile row, and profiles whose
--    Auth user is missing. Either one makes sign-in fail with a generic
--    "আইডি অথবা পাসওয়ার্ড সঠিক নয়" message even with the right password.
select 'auth_user_without_profile' as issue, au.id, au.email, au.email_confirmed_at
from auth.users au
left join public.profiles p on p.user_id = au.id
where p.user_id is null
union all
select 'profile_without_auth_user' as issue, p.user_id, p.email, null
from public.profiles p
left join auth.users au on au.id = p.user_id
where au.id is null;

-- 4. Are the tables the panel depends on present, and is RLS on?
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('profiles','login_security_state','central_claims','system_announcements',
                    'app_maintenance_controls','admin_audit_logs','active_sessions')
order by c.relname;
