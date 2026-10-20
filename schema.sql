create table if not exists public.player_snapshots (
 player_id text primary key,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.player_snapshots enable row level security;
-- No public SELECT policy: all reads go through /api/player using server-side service-role credentials.
-- Keep SUPABASE_SERVICE_ROLE_KEY and BOT_SYNC_TOKEN in Vercel Environment Variables only.
