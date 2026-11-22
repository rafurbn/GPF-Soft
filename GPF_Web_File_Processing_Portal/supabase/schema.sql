create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  upazila_code text not null unique,
  upazila_name_bn text not null,
  district_name_bn text not null,
  role text not null default 'upazila_user'
    check (role in ('upazila_user', 'super_admin', 'account_officer')),
  phone text,
  password_setup_required boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
update public.profiles as profile
set email = auth_user.email
from auth.users as auth_user
where profile.user_id = auth_user.id and profile.email is null;
alter table public.profiles alter column email set not null;
create unique index if not exists profiles_email_unique_idx on public.profiles (email);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'super_admin'
  );
$$;

revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

drop policy if exists "Super admins can read all profiles" on public.profiles;
create policy "Super admins can read all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_super_admin());

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set email = new.email where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists sync_profile_email_after_auth_update on auth.users;
create trigger sync_profile_email_after_auth_update
  after update of email on auth.users
  for each row execute function public.sync_profile_email();

create or replace function public.complete_password_setup()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set password_setup_required = false
  where user_id = auth.uid();
$$;

revoke all on function public.complete_password_setup() from public;
grant execute on function public.complete_password_setup() to authenticated;

alter table public.profiles
  add column if not exists division_name_bn text,
  add column if not exists region_edit_until timestamptz,
  add column if not exists account_status text not null default 'active';

alter table public.profiles
  drop constraint if exists profiles_account_status_check;
alter table public.profiles
  add constraint profiles_account_status_check
  check (account_status in ('active', 'suspended', 'deactivated', 'pending'));

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role = 'super_admin'
      and account_status = 'active'
  );
$$;
revoke all on function public.is_super_admin() from public;
grant execute on function public.is_super_admin() to authenticated;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and account_status = 'active'
  );
$$;
revoke all on function public.is_active_user() from public;
grant execute on function public.is_active_user() to authenticated;

create table if not exists public.login_security_state (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  failed_attempts smallint not null default 0 check (failed_attempts between 0 and 5),
  locked_until timestamptz,
  auto_locked boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.login_security_state add column if not exists auto_locked boolean not null default false;
alter table public.login_security_state enable row level security;
revoke all on public.login_security_state from anon, authenticated;

create or replace function public.record_login_failure(requested_user_id uuid)
returns table (failed_attempts smallint, locked_until timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  state public.login_security_state%rowtype;
begin
  insert into public.login_security_state (user_id, failed_attempts)
  values (requested_user_id, 0)
  on conflict (user_id) do nothing;

  select * into state from public.login_security_state
  where user_id = requested_user_id for update;

  if state.locked_until is not null and state.locked_until > now() then
    return query select state.failed_attempts, state.locked_until;
    return;
  else
    state.failed_attempts := case
      when state.locked_until is not null and state.locked_until <= now() then 1
      else state.failed_attempts + 1
    end;
    state.locked_until := case when state.failed_attempts >= 5 then now() + interval '15 minutes' else null end;
    state.updated_at := now();
    update public.login_security_state
    set failed_attempts = state.failed_attempts,
        locked_until = state.locked_until,
        auto_locked = (state.failed_attempts >= 5),
        updated_at = state.updated_at
    where user_id = requested_user_id;
  end if;

  return query select state.failed_attempts, state.locked_until;
end;
$$;

create or replace function public.clear_login_failures(requested_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.login_security_state where user_id = requested_user_id;
$$;

revoke all on function public.record_login_failure(uuid) from public, anon, authenticated;
revoke all on function public.clear_login_failures(uuid) from public, anon, authenticated;
grant execute on function public.record_login_failure(uuid) to service_role;
grant execute on function public.clear_login_failures(uuid) to service_role;

create table if not exists public.central_claims (
  id text primary key,
  app_type text not null check (app_type in ('app1', 'app2', 'app3', 'app4')),
  upazila_code text not null,
  tracking_no text not null,
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_type, upazila_code, tracking_no)
);
alter table public.central_claims enable row level security;
revoke all on public.central_claims from anon;
grant select, insert, update, delete on public.central_claims to authenticated;

drop policy if exists "Users read own central claims" on public.central_claims;
create policy "Users read own central claims" on public.central_claims
  for select to authenticated
  using (
    public.is_super_admin()
    or (public.is_active_user() and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.upazila_code = central_claims.upazila_code and p.account_status = 'active'
    ))
  );
drop policy if exists "Users write own central claims" on public.central_claims;
create policy "Users write own central claims" on public.central_claims
  for insert to authenticated
  with check (
    public.is_super_admin()
    or (public.is_active_user() and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.upazila_code = central_claims.upazila_code and p.account_status = 'active'
    ))
  );
drop policy if exists "Users update own central claims" on public.central_claims;
create policy "Users update own central claims" on public.central_claims
  for update to authenticated
  using (
    public.is_super_admin()
    or (public.is_active_user() and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.upazila_code = central_claims.upazila_code and p.account_status = 'active'
    ))
  )
  with check (
    public.is_super_admin()
    or (public.is_active_user() and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.upazila_code = central_claims.upazila_code and p.account_status = 'active'
    ))
  );
drop policy if exists "Only super admins delete central claims" on public.central_claims;
create policy "Only super admins delete central claims" on public.central_claims
  for delete to authenticated using (public.is_super_admin());

create table if not exists public.system_announcements (
  id text primary key,
  target_upazila_code text,
  is_active boolean not null default true,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.system_announcements enable row level security;
revoke all on public.system_announcements from anon;
grant select, insert, update, delete on public.system_announcements to authenticated;
drop policy if exists "Users read matching active notices" on public.system_announcements;
create policy "Users read matching active notices" on public.system_announcements
  for select to authenticated using (
    public.is_super_admin()
    or (
      is_active
      and public.is_active_user()
      and (target_upazila_code is null or exists (
        select 1 from public.profiles p
        where p.user_id = auth.uid() and p.upazila_code = system_announcements.target_upazila_code and p.account_status = 'active'
      ))
    )
  );
drop policy if exists "Only super admins manage notices" on public.system_announcements;
create policy "Only super admins manage notices" on public.system_announcements
  for all to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

create table if not exists public.app_maintenance_controls (
  app_id text primary key check (app_id in ('app1', 'app2', 'app3', 'app4')),
  app_name text not null,
  is_locked boolean not null default false,
  lock_reason text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.app_maintenance_controls enable row level security;
revoke all on public.app_maintenance_controls from anon;
grant select, insert, update, delete on public.app_maintenance_controls to authenticated;
drop policy if exists "Authenticated users read maintenance state" on public.app_maintenance_controls;
create policy "Authenticated users read maintenance state" on public.app_maintenance_controls
  for select to authenticated using (public.is_active_user());
drop policy if exists "Only super admins manage maintenance state" on public.app_maintenance_controls;
create policy "Only super admins manage maintenance state" on public.app_maintenance_controls
  for all to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

create table if not exists public.admin_audit_logs (
  id text primary key,
  upazila_code text not null,
  user_id uuid references auth.users (id) on delete set null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_logs enable row level security;
revoke all on public.admin_audit_logs from anon;
grant select, insert, delete on public.admin_audit_logs to authenticated;
drop policy if exists "Super admins read audit logs" on public.admin_audit_logs;
create policy "Super admins read audit logs" on public.admin_audit_logs
  for select to authenticated using (public.is_super_admin());
drop policy if exists "Users record own audit events" on public.admin_audit_logs;
create policy "Users record own audit events" on public.admin_audit_logs
  for insert to authenticated with check (
    public.is_super_admin()
    or (
      user_id = auth.uid() and public.is_active_user()
      and exists (
        select 1 from public.profiles p
        where p.user_id = auth.uid() and p.upazila_code = admin_audit_logs.upazila_code and p.account_status = 'active'
      )
    )
  );
drop policy if exists "Only super admins delete audit logs" on public.admin_audit_logs;
create policy "Only super admins delete audit logs" on public.admin_audit_logs
  for delete to authenticated using (public.is_super_admin());

create table if not exists public.active_sessions (
  session_id text primary key,
  user_id uuid references auth.users (id) on delete cascade,
  upazila_code text not null,
  record jsonb not null,
  terminated_at timestamptz,
  last_seen_at timestamptz not null default now()
);
alter table public.active_sessions alter column user_id drop not null;
alter table public.active_sessions enable row level security;
revoke all on public.active_sessions from anon;
grant select, insert, update, delete on public.active_sessions to authenticated;
drop policy if exists "Users read own sessions and admins read all" on public.active_sessions;
create policy "Users read own sessions and admins read all" on public.active_sessions
  for select to authenticated using (public.is_super_admin() or (public.is_active_user() and user_id = auth.uid()));
drop policy if exists "Users create own sessions" on public.active_sessions;
create policy "Users create own sessions" on public.active_sessions
  for insert to authenticated with check (public.is_active_user() and user_id = auth.uid());
drop policy if exists "Users and admins update sessions" on public.active_sessions;
create policy "Users and admins update sessions" on public.active_sessions
  for update to authenticated using (public.is_super_admin() or (public.is_active_user() and user_id = auth.uid()))
  with check (public.is_super_admin() or (public.is_active_user() and user_id = auth.uid()));
drop policy if exists "Users can end their own sessions" on public.active_sessions;
create policy "Users can end their own sessions" on public.active_sessions
  for update to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid() and terminated_at is not null);
drop policy if exists "Only super admins delete sessions" on public.active_sessions;
create policy "Only super admins delete sessions" on public.active_sessions
  for delete to authenticated using (public.is_super_admin());

create table if not exists public.upazila_usage_stats (
  upazila_code text primary key,
  upazila_name_bn text not null default '',
  district_name_bn text not null default '',
  division_name_bn text not null default '',
  recovery_email text not null default '',
  account_status text not null default 'active'
    check (account_status in ('active', 'suspended', 'deactivated')),
  login_count integer not null default 0,
  app1_opens integer not null default 0,
  app2_opens integer not null default 0,
  app3_opens integer not null default 0,
  app4_opens integer not null default 0,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_browser text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.upazila_usage_stats enable row level security;
revoke all on public.upazila_usage_stats from anon, authenticated;
grant select, update on public.upazila_usage_stats to authenticated;
drop policy if exists "Super admins read usage stats" on public.upazila_usage_stats;
create policy "Super admins read usage stats" on public.upazila_usage_stats
  for select to authenticated using (public.is_super_admin());
drop policy if exists "Super admins update usage stats" on public.upazila_usage_stats;
create policy "Super admins update usage stats" on public.upazila_usage_stats
  for update to authenticated using (public.is_super_admin())
  with check (public.is_super_admin());

create or replace function public.set_upazila_account_status(
  requested_upazila_code text,
  requested_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean_code text := trim(coalesce(requested_upazila_code, ''));
begin
  if not public.is_super_admin() then
    raise exception using message = 'SUPER_ADMIN_REQUIRED';
  end if;
  if requested_status not in ('active', 'suspended', 'deactivated', 'pending') then
    raise exception using message = 'INVALID_ACCOUNT_STATUS';
  end if;
  if v_clean_code = '' then
    raise exception using message = 'UPAZILA_PROFILE_NOT_FOUND';
  end if;
  if exists (
    select 1 from public.profiles
    where upazila_code = v_clean_code and role = 'super_admin'
  ) then
    raise exception using message = 'CANNOT_MODIFY_SUPER_ADMIN_STATUS';
  end if;

  update public.profiles
  set account_status = requested_status
  where upazila_code = v_clean_code
    and role <> 'super_admin';

  if requested_status in ('active', 'suspended', 'deactivated') then
    insert into public.upazila_usage_stats (upazila_code, account_status, updated_at)
    values (v_clean_code, requested_status, now())
    on conflict (upazila_code) do update
      set account_status = excluded.account_status,
          updated_at = now();
  end if;

  if requested_status in ('suspended', 'deactivated') then
    update public.active_sessions
    set terminated_at = now()
    where upazila_code = v_clean_code
      and terminated_at is null;
  end if;

  if requested_status = 'active' then
    delete from public.login_security_state
    where user_id = (select user_id from public.profiles where upazila_code = v_clean_code);
  end if;
end;
$$;

revoke all on function public.set_upazila_account_status(text, text) from public;
grant execute on function public.set_upazila_account_status(text, text) to authenticated;

create or replace function public.create_upazila_profile_for_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_metadata jsonb := new.raw_user_meta_data;
begin
  if profile_metadata ->> 'account_type' is distinct from 'upazila_user' then
    return new;
  end if;

  if coalesce(profile_metadata ->> 'upazila_code', '') = ''
    or coalesce(profile_metadata ->> 'upazila_name_bn', '') = ''
    or coalesce(profile_metadata ->> 'district_name_bn', '') = ''
    or coalesce(profile_metadata ->> 'division_name_bn', '') = '' then
    raise exception using message = 'UPAZILA_PROFILE_REQUIRED';
  end if;

  begin
    insert into public.profiles (
      user_id,
      email,
      upazila_code,
      upazila_name_bn,
      district_name_bn,
      division_name_bn,
      role,
      password_setup_required,
      region_edit_until
    ) values (
      new.id,
      new.email,
      profile_metadata ->> 'upazila_code',
      profile_metadata ->> 'upazila_name_bn',
      profile_metadata ->> 'district_name_bn',
      profile_metadata ->> 'division_name_bn',
      'upazila_user',
      false,
      now() + interval '24 hours'
    );
  exception when unique_violation then
    raise exception using message = 'UPAZILA_ALREADY_REGISTERED';
  end;

  return new;
end;
$$;

drop trigger if exists create_upazila_profile_after_signup on auth.users;
create trigger create_upazila_profile_after_signup
  after insert on auth.users
  for each row execute function public.create_upazila_profile_for_signup();

create or replace function public.update_my_upazila_region(
  requested_upazila_code text,
  requested_upazila_name_bn text,
  requested_district_name_bn text,
  requested_division_name_bn text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  edit_deadline timestamptz;
begin
  select region_edit_until into edit_deadline
  from public.profiles
  where user_id = auth.uid() and role = 'upazila_user';

  if edit_deadline is null or now() > edit_deadline then
    raise exception using message = 'REGION_EDIT_WINDOW_EXPIRED';
  end if;

  if coalesce(requested_upazila_code, '') = ''
    or coalesce(requested_upazila_name_bn, '') = ''
    or coalesce(requested_district_name_bn, '') = ''
    or coalesce(requested_division_name_bn, '') = '' then
    raise exception using message = 'UPAZILA_PROFILE_REQUIRED';
  end if;

  begin
    update public.profiles
    set upazila_code = requested_upazila_code,
        upazila_name_bn = requested_upazila_name_bn,
        district_name_bn = requested_district_name_bn,
        division_name_bn = requested_division_name_bn
    where user_id = auth.uid() and role = 'upazila_user';
  exception when unique_violation then
    raise exception using message = 'UPAZILA_ALREADY_REGISTERED';
  end;
end;
$$;

revoke all on function public.update_my_upazila_region(text, text, text, text) from public;
grant execute on function public.update_my_upazila_region(text, text, text, text) to authenticated;

-- Registration pre-check used by the sign-in screen before creating an account.
-- Runs as the definer so it can read the profiles table, but only ever exposes a
-- boolean, never the stored email addresses.
create or replace function public.is_upazila_available(requested_upazila_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles
    where upazila_code = requested_upazila_code
  );
$$;

revoke all on function public.is_upazila_available(text) from public;
grant execute on function public.is_upazila_available(text) to anon, authenticated;

-- ============================================================================
-- Super Admin recovery & lockout visibility.
--
-- `set_upazila_account_status` deliberately refuses to touch super_admin rows so
-- an upazila account can never be used to suspend the owner. That leaves two gaps:
-- a super_admin auto-suspended by 5 failed passwords stays suspended (the sign-in
-- function only self-heals it once the 15 minute lock expires), and the panel has
-- no way to see *why* an account is suspended. These functions close both, and
-- every one of them is gated on is_super_admin().
-- ============================================================================

create or replace function public.admin_get_login_security()
returns table (
  upazila_code text,
  user_id uuid,
  failed_attempts smallint,
  locked_until timestamptz,
  auto_locked boolean,
  account_status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.upazila_code,
    p.user_id,
    coalesce(s.failed_attempts, 0)::smallint as failed_attempts,
    s.locked_until,
    coalesce(s.auto_locked, false) as auto_locked,
    p.account_status
  from public.profiles p
  left join public.login_security_state s on s.user_id = p.user_id
  where public.is_super_admin()
  union all
  select
    u.upazila_code,
    null::uuid as user_id,
    0::smallint as failed_attempts,
    null::timestamptz as locked_until,
    false as auto_locked,
    u.account_status
  from public.upazila_usage_stats u
  where public.is_super_admin()
    and not exists (select 1 from public.profiles p2 where p2.upazila_code = u.upazila_code)
  order by failed_attempts desc, upazila_code;
$$;
revoke all on function public.admin_get_login_security() from public;
grant execute on function public.admin_get_login_security() to authenticated;

-- Unlocks an account and clears its failed-login counter. Unlike
-- set_upazila_account_status this may target a super_admin profile, because the
-- whole point is to recover a locked administrator. It never grants a role.
create or replace function public.admin_unlock_upazila_account(requested_upazila_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.profiles%rowtype;
  v_found boolean := false;
begin
  if not public.is_super_admin() then
    raise exception using message = 'SUPER_ADMIN_REQUIRED';
  end if;

  select * into target from public.profiles
  where upazila_code = requested_upazila_code;
  if found then
    v_found := true;
    delete from public.login_security_state where user_id = target.user_id;
    update public.profiles set account_status = 'active' where user_id = target.user_id;
  end if;

  update public.upazila_usage_stats
  set account_status = 'active', updated_at = now()
  where upazila_code = requested_upazila_code;
  if found then
    v_found := true;
  end if;

  if not v_found then
    raise exception using message = 'UPAZILA_PROFILE_NOT_FOUND';
  end if;

  insert into public.admin_audit_logs (id, upazila_code, user_id, payload)
  values (
    'unlock-' || gen_random_uuid(),
    requested_upazila_code,
    target.user_id,
    jsonb_build_object(
      'id', 'unlock-' || gen_random_uuid(),
      'timestamp', now(),
      'eventType', 'status_change',
      'upazilaCode', requested_upazila_code,
      'email', coalesce(target.email, 'instant-upazila'),
      'description', 'সুপার এডমিন কর্তৃক অ্যাকাউন্টের লকআউট ও ব্যর্থ লগইন গণনা রিসেট করা হয়েছে।',
      'status', 'success'
    )
  );
end;
$$;
revoke all on function public.admin_unlock_upazila_account(text) from public;
grant execute on function public.admin_unlock_upazila_account(text) to authenticated;

-- Role management. Guards: cannot change your own role, cannot remove the last
-- active super_admin, and only the three known roles are accepted.
create or replace function public.admin_set_upazila_role(
  requested_upazila_code text,
  requested_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  target public.profiles%rowtype;
  active_super_admins integer;
begin
  if not public.is_super_admin() then
    raise exception using message = 'SUPER_ADMIN_REQUIRED';
  end if;
  if requested_role not in ('upazila_user', 'super_admin', 'account_officer') then
    raise exception using message = 'INVALID_ROLE';
  end if;

  select * into target from public.profiles
  where upazila_code = requested_upazila_code;
  if not found then
    raise exception using message = 'UPAZILA_PROFILE_NOT_FOUND';
  end if;
  if target.user_id = actor then
    raise exception using message = 'CANNOT_CHANGE_OWN_ROLE';
  end if;

  if target.role = 'super_admin' and requested_role <> 'super_admin' then
    select count(*) into active_super_admins from public.profiles
    where role = 'super_admin' and account_status = 'active' and user_id <> actor;
    if active_super_admins = 0 then
      raise exception using message = 'LAST_SUPER_ADMIN_PROTECTED';
    end if;
  end if;

  update public.profiles set role = requested_role where user_id = target.user_id;

  insert into public.admin_audit_logs (id, upazila_code, user_id, payload)
  values (
    'role-' || gen_random_uuid(),
    target.upazila_code,
    target.user_id,
    jsonb_build_object(
      'id', 'role-' || gen_random_uuid(),
      'timestamp', now(),
      'eventType', 'status_change',
      'upazilaCode', target.upazila_code,
      'email', target.email,
      'description', format('ভূমিকা পরিবর্তন: %s -> %s', target.role, requested_role),
      'status', 'warning'
    )
  );
end;
$$;
revoke all on function public.admin_set_upazila_role(text, text) from public;
grant execute on function public.admin_set_upazila_role(text, text) to authenticated;

-- ============================================================================
-- Trash / restore for central claims (মডিউল ৬) and live notice delivery (মডিউল ৪).
-- Deleting a claim is an everyday action, so it must be reversible: rows move to
-- `deleted_at` and only an explicit purge removes them.
-- ============================================================================

alter table public.central_claims add column if not exists deleted_at timestamptz;
create index if not exists central_claims_trash_idx on public.central_claims (deleted_at)
  where deleted_at is not null;

create or replace function public.admin_soft_delete_central_claim(requested_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception using message = 'SUPER_ADMIN_REQUIRED';
  end if;

  update public.central_claims
  set deleted_at = now(), updated_at = now()
  where id = requested_id and deleted_at is null;
  if not found then
    raise exception using message = 'CLAIM_NOT_FOUND';
  end if;
end;
$$;
revoke all on function public.admin_soft_delete_central_claim(text) from public;
grant execute on function public.admin_soft_delete_central_claim(text) to authenticated;

create or replace function public.admin_restore_central_claim(requested_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception using message = 'SUPER_ADMIN_REQUIRED';
  end if;

  update public.central_claims
  set deleted_at = null, updated_at = now()
  where id = requested_id and deleted_at is not null;
  if not found then
    raise exception using message = 'CLAIM_NOT_IN_TRASH';
  end if;
end;
$$;
revoke all on function public.admin_restore_central_claim(text) from public;
grant execute on function public.admin_restore_central_claim(text) to authenticated;

-- Empties the trash. Returns how many rows were destroyed so the panel can report it.
create or replace function public.admin_purge_trashed_central_claims()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  destroyed integer;
begin
  if not public.is_super_admin() then
    raise exception using message = 'SUPER_ADMIN_REQUIRED';
  end if;

  delete from public.central_claims where deleted_at is not null;
  get diagnostics destroyed = row_count;

  insert into public.admin_audit_logs (id, upazila_code, user_id, payload)
  values (
    'purge-' || gen_random_uuid(),
    '00000',
    auth.uid(),
    jsonb_build_object(
      'timestamp', now(),
      'eventType', 'trash_purged',
      'upazilaCode', '00000',
      'description', format('Trash permanently cleared: %s record(s) destroyed.', destroyed),
      'status', 'danger'
    )
  );

  return destroyed;
end;
$$;
revoke all on function public.admin_purge_trashed_central_claims() from public;
grant execute on function public.admin_purge_trashed_central_claims() to authenticated;

-- ============================================================================
-- Zero-friction Upazila check-in, session heartbeat, app usage counts & public
-- portal state (notices + maintenance locks) for instant-login upazila users.
-- No employee PII or financial amounts are stored or returned here.
-- ============================================================================

create or replace function public.record_upazila_checkin(
  p_upazila_code text,
  p_upazila_name_bn text,
  p_district_name_bn text,
  p_division_name_bn text default '',
  p_recovery_email text default '',
  p_session_id text default '',
  p_browser text default 'Browser'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := trim(coalesce(p_upazila_code, ''));
  v_name text := trim(coalesce(p_upazila_name_bn, ''));
  v_dist text := trim(coalesce(p_district_name_bn, ''));
  v_div text := trim(coalesce(p_division_name_bn, ''));
  v_email text := coalesce(nullif(trim(coalesce(p_recovery_email, '')), ''), 'instant-upazila');
  v_browser text := coalesce(nullif(trim(coalesce(p_browser, '')), ''), 'Browser');
  v_profile_status text;
  v_usage_status text;
  v_effective_status text := 'active';
  v_session_id text;
  v_log_id text;
begin
  if v_code = '' then
    return jsonb_build_object('allowed', false, 'account_status', 'invalid', 'session_id', null);
  end if;

  select account_status into v_profile_status
  from public.profiles
  where upazila_code = v_code
  limit 1;

  select account_status into v_usage_status
  from public.upazila_usage_stats
  where upazila_code = v_code
  limit 1;

  if v_profile_status in ('suspended', 'deactivated', 'pending') then
    v_effective_status := v_profile_status;
  elsif v_usage_status in ('suspended', 'deactivated') then
    v_effective_status := v_usage_status;
  end if;

  if v_effective_status <> 'active' then
    v_log_id := 'blocked-' || gen_random_uuid();
    insert into public.admin_audit_logs (id, upazila_code, user_id, payload)
    values (
      v_log_id,
      v_code,
      null,
      jsonb_build_object(
        'id', v_log_id,
        'timestamp', now(),
        'eventType', 'failed_login',
        'upazilaCode', v_code,
        'email', v_email,
        'description', format('প্রবেশ প্রত্যাখ্যাত (%s): %s (%s)', v_effective_status, coalesce(nullif(v_name, ''), v_code), v_code),
        'status', 'danger'
      )
    );
    return jsonb_build_object('allowed', false, 'account_status', v_effective_status, 'session_id', null);
  end if;

  insert into public.upazila_usage_stats (
    upazila_code,
    upazila_name_bn,
    district_name_bn,
    division_name_bn,
    recovery_email,
    account_status,
    login_count,
    first_seen_at,
    last_seen_at,
    last_browser,
    updated_at
  ) values (
    v_code,
    v_name,
    v_dist,
    v_div,
    case when v_email = 'instant-upazila' then '' else v_email end,
    'active',
    1,
    now(),
    now(),
    v_browser,
    now()
  )
  on conflict (upazila_code) do update
    set upazila_name_bn = coalesce(nullif(excluded.upazila_name_bn, ''), public.upazila_usage_stats.upazila_name_bn),
        district_name_bn = coalesce(nullif(excluded.district_name_bn, ''), public.upazila_usage_stats.district_name_bn),
        division_name_bn = coalesce(nullif(excluded.division_name_bn, ''), public.upazila_usage_stats.division_name_bn),
        recovery_email = coalesce(nullif(excluded.recovery_email, ''), public.upazila_usage_stats.recovery_email),
        login_count = public.upazila_usage_stats.login_count + 1,
        last_seen_at = now(),
        last_browser = excluded.last_browser,
        updated_at = now();

  v_session_id := coalesce(nullif(trim(coalesce(p_session_id, '')), ''), 'sess-' || gen_random_uuid());

  insert into public.active_sessions (
    session_id,
    user_id,
    upazila_code,
    record,
    terminated_at,
    last_seen_at
  ) values (
    v_session_id,
    null,
    v_code,
    jsonb_build_object(
      'sessionId', v_session_id,
      'userId', 'upazila-' || v_code,
      'upazilaCode', v_code,
      'upazilaNameBn', v_name,
      'email', v_email,
      'role', 'upazila_user',
      'loginTime', to_char(now() at time zone 'Asia/Dhaka', 'HH12:MI AM'),
      'lastActiveTime', 'এখনই সক্রিয়',
      'ipAddress', 'উপজেলা পোর্টাল',
      'browser', v_browser
    ),
    null,
    now()
  )
  on conflict (session_id) do update
    set upazila_code = excluded.upazila_code,
        record = excluded.record,
        terminated_at = null,
        last_seen_at = now();

  v_log_id := 'login-' || gen_random_uuid();
  insert into public.admin_audit_logs (id, upazila_code, user_id, payload)
  values (
    v_log_id,
    v_code,
    null,
    jsonb_build_object(
      'id', v_log_id,
      'timestamp', now(),
      'eventType', 'login',
      'upazilaCode', v_code,
      'email', v_email,
      'description', format('উপজেলা প্রবেশ সম্পন্ন: %s (%s)', coalesce(nullif(v_name, ''), v_code), v_code),
      'status', 'success'
    )
  );

  return jsonb_build_object('allowed', true, 'account_status', 'active', 'session_id', v_session_id);
end;
$$;
revoke all on function public.record_upazila_checkin(text, text, text, text, text, text, text) from public;
grant execute on function public.record_upazila_checkin(text, text, text, text, text, text, text) to anon, authenticated;

create or replace function public.heartbeat_upazila_session(
  p_session_id text,
  p_upazila_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_terminated boolean := false;
  v_profile_status text;
  v_usage_status text;
  v_status text := 'active';
  v_code text := trim(coalesce(p_upazila_code, ''));
  v_sid text := trim(coalesce(p_session_id, ''));
begin
  if v_sid <> '' then
    select (terminated_at is not null) into v_terminated
    from public.active_sessions
    where session_id = v_sid
    limit 1;
    v_terminated := coalesce(v_terminated, false);
  end if;

  if v_code <> '' then
    select account_status into v_profile_status from public.profiles where upazila_code = v_code limit 1;
    select account_status into v_usage_status from public.upazila_usage_stats where upazila_code = v_code limit 1;
    if v_profile_status in ('suspended', 'deactivated', 'pending') then
      v_status := v_profile_status;
    elsif v_usage_status in ('suspended', 'deactivated') then
      v_status := v_usage_status;
    end if;
  end if;

  if not v_terminated and v_status = 'active' then
    if v_sid <> '' then
      update public.active_sessions
      set last_seen_at = now()
      where session_id = v_sid and terminated_at is null;
    end if;
    if v_code <> '' then
      update public.upazila_usage_stats
      set last_seen_at = now(), updated_at = now()
      where upazila_code = v_code;
    end if;
  end if;

  return jsonb_build_object('terminated', v_terminated, 'account_status', v_status);
end;
$$;
revoke all on function public.heartbeat_upazila_session(text, text) from public;
grant execute on function public.heartbeat_upazila_session(text, text) to anon, authenticated;

create or replace function public.end_upazila_session(p_session_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.active_sessions
  set terminated_at = now()
  where session_id = trim(coalesce(p_session_id, ''))
    and terminated_at is null;
$$;
revoke all on function public.end_upazila_session(text) from public;
grant execute on function public.end_upazila_session(text) to anon, authenticated;

create or replace function public.record_upazila_app_open(
  p_upazila_code text,
  p_app_id text,
  p_upazila_name_bn text default '',
  p_district_name_bn text default '',
  p_division_name_bn text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := trim(coalesce(p_upazila_code, ''));
begin
  if v_code = '' or p_app_id not in ('app1', 'app2', 'app3', 'app4') then
    return;
  end if;

  insert into public.upazila_usage_stats (
    upazila_code,
    upazila_name_bn,
    district_name_bn,
    division_name_bn,
    app1_opens,
    app2_opens,
    app3_opens,
    app4_opens,
    first_seen_at,
    last_seen_at,
    updated_at
  ) values (
    v_code,
    trim(coalesce(p_upazila_name_bn, '')),
    trim(coalesce(p_district_name_bn, '')),
    trim(coalesce(p_division_name_bn, '')),
    case when p_app_id = 'app1' then 1 else 0 end,
    case when p_app_id = 'app2' then 1 else 0 end,
    case when p_app_id = 'app3' then 1 else 0 end,
    case when p_app_id = 'app4' then 1 else 0 end,
    now(),
    now(),
    now()
  )
  on conflict (upazila_code) do update
    set upazila_name_bn = coalesce(nullif(excluded.upazila_name_bn, ''), public.upazila_usage_stats.upazila_name_bn),
        district_name_bn = coalesce(nullif(excluded.district_name_bn, ''), public.upazila_usage_stats.district_name_bn),
        division_name_bn = coalesce(nullif(excluded.division_name_bn, ''), public.upazila_usage_stats.division_name_bn),
        app1_opens = public.upazila_usage_stats.app1_opens + case when p_app_id = 'app1' then 1 else 0 end,
        app2_opens = public.upazila_usage_stats.app2_opens + case when p_app_id = 'app2' then 1 else 0 end,
        app3_opens = public.upazila_usage_stats.app3_opens + case when p_app_id = 'app3' then 1 else 0 end,
        app4_opens = public.upazila_usage_stats.app4_opens + case when p_app_id = 'app4' then 1 else 0 end,
        last_seen_at = now(),
        updated_at = now();
end;
$$;
revoke all on function public.record_upazila_app_open(text, text, text, text, text) from public;
grant execute on function public.record_upazila_app_open(text, text, text, text, text) to anon, authenticated;

create or replace function public.get_portal_public_state(p_upazila_code text default null)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'announcements', coalesce((
      select jsonb_agg(sa.payload order by sa.created_at desc)
      from public.system_announcements sa
      where sa.is_active = true
        and (sa.target_upazila_code is null or sa.target_upazila_code = nullif(trim(coalesce(p_upazila_code, '')), ''))
    ), '[]'::jsonb),
    'maintenance', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'appId', m.app_id,
          'appName', m.app_name,
          'isLocked', m.is_locked,
          'lockReason', m.lock_reason,
          'updatedAt', m.updated_at
        )
        order by m.app_id
      )
      from public.app_maintenance_controls m
    ), '[]'::jsonb)
  );
$$;
revoke all on function public.get_portal_public_state(text) from public;
grant execute on function public.get_portal_public_state(text) to anon, authenticated;

-- Live notices: push announcement writes to subscribers so a broadcast reaches every
-- upazila screen without waiting for the next poll. Wrapped so re-running the schema
-- (or a project without the publication) never aborts the migration.
do $$
begin
  execute 'alter publication supabase_realtime add table public.system_announcements';
exception
  when duplicate_object then null;
  when insufficient_privilege then null;
  when undefined_object then null;
end $$;
