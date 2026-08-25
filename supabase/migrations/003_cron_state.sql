create table if not exists public.cron_state (
  key text primary key,
  state jsonb not null,
  revision bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cron_state enable row level security;

revoke all on public.cron_state from anon, authenticated;
grant all privileges on public.cron_state to service_role;
