create table if not exists public.player_snapshots (
  player_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.player_snapshots enable row level security;
-- Keep all access server-side via the service role. Never ship the service-role key to the browser.
