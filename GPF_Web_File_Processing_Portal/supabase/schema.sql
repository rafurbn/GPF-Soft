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
  add column if not exists region_edit_until timestamptz;

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