-- ============================================================================
-- GPF Portal Cloud Sync Tables (App 1, 2, 3, 4 & App 6)
-- Non-destructive migration: does NOT alter any existing tables, auth, or admin panels.
-- ============================================================================

create table if not exists public.portal_app_records (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  upazila_code text not null,
  app_type text not null check (app_type in ('app1', 'app2', 'app3', 'app4', 'app6')),
  record_data jsonb not null,
  client_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, upazila_code, app_type, id)
);

create index if not exists portal_app_records_lookup_idx
  on public.portal_app_records (user_id, upazila_code, app_type, updated_at desc);

alter table public.portal_app_records enable row level security;
revoke all on public.portal_app_records from anon;
grant select, insert, update, delete on public.portal_app_records to authenticated;

drop policy if exists "Users manage own portal app records" on public.portal_app_records;
create policy "Users manage own portal app records"
  on public.portal_app_records
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.portal_app_locks (
  user_id uuid not null references auth.users (id) on delete cascade,
  upazila_code text not null,
  app_type text not null check (app_type in ('app1', 'app2', 'app3', 'app4', 'app6')),
  locks_data jsonb not null default '{}'::jsonb,
  values_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, upazila_code, app_type)
);

alter table public.portal_app_locks enable row level security;
revoke all on public.portal_app_locks from anon;
grant select, insert, update, delete on public.portal_app_locks to authenticated;

drop policy if exists "Users manage own portal app locks" on public.portal_app_locks;
create policy "Users manage own portal app locks"
  on public.portal_app_locks
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
