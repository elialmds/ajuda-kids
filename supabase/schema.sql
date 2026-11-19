-- ============================================================================
-- AJUDA KIDS 3.0 — SUPABASE POSTGRESQL SCHEMA, RLS POLICIES & REALTIME
-- ============================================================================

create extension if not exists "uuid-ossp";

-- 1. FAMILY_ACCOUNT
create table if not exists public.family_accounts (
  id text primary key,
  parent_user_id uuid references auth.users(id) on delete cascade,
  parent_name text not null,
  parent_email text not null,
  family_name text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. CHILD_PROFILE
create table if not exists public.child_profiles (
  id text primary key,
  family_id text not null references public.family_accounts(id) on delete cascade,
  name text not null,
  nickname text,
  age integer not null,
  birth_date date,
  avatar text not null,
  companion_id text default 'Lumi',
  age_group text not null check (age_group in ('4-6', '7-9', '10-12')),
  learning_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. CHILD_DEVICE
create table if not exists public.child_devices (
  id text primary key,
  child_id text not null references public.child_profiles(id) on delete cascade,
  family_id text not null references public.family_accounts(id) on delete cascade,
  device_name text not null,
  platform text not null,
  last_active_at timestamptz not null default now(),
  status text not null check (status in ('active', 'pending_approval', 'revoked')),
  created_at timestamptz not null default now()
);

-- 4. PAIRING_SESSIONS (QR Code & Single-Use Token Pairing)
create table if not exists public.pairing_sessions (
  code text primary key,
  token text unique not null,
  family_id text not null references public.family_accounts(id) on delete cascade,
  child_id text not null references public.child_profiles(id) on delete cascade,
  child_name text not null,
  child_avatar text not null,
  status text not null check (status in ('waiting', 'claimed_pending_confirm', 'confirmed', 'expired', 'revoked')),
  claimed_device jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- 5. DAILY_JOURNEYS
create table if not exists public.daily_journeys (
  id text primary key,
  child_id text not null references public.child_profiles(id) on delete cascade,
  family_id text not null references public.family_accounts(id) on delete cascade,
  journey_date date not null,
  steps jsonb not null default '[]'::jsonb,
  current_step_index integer not null default 0,
  is_completed boolean not null default false,
  total_minutes_spent integer not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

-- 6. ACTIVITY_COMPLETIONS
create table if not exists public.activity_completions (
  id text primary key,
  child_id text not null references public.child_profiles(id) on delete cascade,
  family_id text not null references public.family_accounts(id) on delete cascade,
  activity_id text not null,
  activity_title text not null,
  area text not null,
  duration_minutes integer not null default 4,
  score integer not null default 100,
  device_id text,
  completed_at timestamptz not null default now()
);

-- 7. GAME_RECORDS
create table if not exists public.game_records (
  id text primary key,
  child_id text not null references public.child_profiles(id) on delete cascade,
  family_id text not null references public.family_accounts(id) on delete cascade,
  game_id text not null,
  play_date date not null,
  duration_seconds integer not null default 0,
  score integer,
  stars integer default 3,
  device_id text,
  created_at timestamptz not null default now()
);

-- 8. SYNC_EVENTS
create table if not exists public.sync_events (
  id text primary key,
  family_id text not null references public.family_accounts(id) on delete cascade,
  child_id text not null,
  device_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.family_accounts enable row level security;
alter table public.child_profiles enable row level security;
alter table public.child_devices enable row level security;
alter table public.pairing_sessions enable row level security;
alter table public.daily_journeys enable row level security;
alter table public.activity_completions enable row level security;
alter table public.game_records enable row level security;
alter table public.sync_events enable row level security;

drop policy if exists "Families manage own account" on public.family_accounts;
create policy "Families manage own account"
  on public.family_accounts
  for all
  using (auth.uid() = parent_user_id);

drop policy if exists "Families manage own children" on public.child_profiles;
create policy "Families manage own children"
  on public.child_profiles
  for all
  using (
    family_id in (
      select id from public.family_accounts where parent_user_id = auth.uid()
    )
  );

drop policy if exists "Families manage own devices" on public.child_devices;
create policy "Families manage own devices"
  on public.child_devices
  for all
  using (
    family_id in (
      select id from public.family_accounts where parent_user_id = auth.uid()
    )
  );

-- 9. AJUDA_KIDS_STATE (Persistência completa do backend serverless para Vercel + Supabase)
-- Acessível exclusivamente no backend com SUPABASE_SERVICE_ROLE_KEY (sem políticas públicas)
create table if not exists public.ajuda_kids_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ajuda_kids_state enable row level security;

-- Enable Realtime on core tables (idempotent)
do $$
declare
  tbl text;
  tables text[] := array[
    'child_profiles',
    'child_devices',
    'daily_journeys',
    'activity_completions',
    'game_records',
    'pairing_sessions'
  ];
begin
  foreach tbl in array tables loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
    end if;
  end loop;
end $$;
