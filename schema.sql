create table if not exists public.player_snapshots (
  player_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.player_snapshots enable row level security;
-- Keep all access server-side via the service role. Never ship the service-role key to the browser.

-- Atomic transaction functions used only by the authenticated server-side API.
-- player_id is the bot's opaque SHA-256-derived ID, never a raw WhatsApp number.
create or replace function public.claim_player_daily(p_player_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payload jsonb;
  v_last timestamptz;
  v_now timestamptz := now();
  v_reward integer := 100;
begin
  if p_player_id is null or p_player_id !~ '^[a-fA-F0-9]{32}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_user_id');
  end if;
  insert into public.player_snapshots(player_id, payload, updated_at)
  values (p_player_id, jsonb_build_object('gold', 0, 'inventory', jsonb_build_array()), v_now)
  on conflict (player_id) do nothing;
  select payload into v_payload from public.player_snapshots where player_id = p_player_id for update;
  v_payload := coalesce(v_payload, '{}'::jsonb);
  begin
    v_last := nullif(v_payload->>'dailyClaimedAt', '')::timestamptz;
  exception when others then
    v_last := null;
  end;
  if v_last is not null and v_last > v_now - interval '24 hours' then
    return jsonb_build_object('ok', false, 'error', 'cooldown', 'nextClaimAt', to_jsonb(v_last + interval '24 hours'));
  end if;
  v_payload := jsonb_set(v_payload, '{gold}', to_jsonb(greatest(0, coalesce((v_payload->>'gold')::integer, 0)) + v_reward), true);
  v_payload := jsonb_set(v_payload, '{dailyClaimedAt}', to_jsonb(v_now), true);
  update public.player_snapshots set payload = v_payload, updated_at = v_now where player_id = p_player_id;
  return jsonb_build_object('ok', true, 'reward', v_reward, 'gold', (v_payload->>'gold')::integer, 'nextClaimAt', to_jsonb(v_now + interval '24 hours'));
end;
$$;

create or replace function public.buy_player_item(p_player_id text, p_item_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payload jsonb;
  v_inventory jsonb;
  v_item jsonb;
  v_gold integer;
  v_price integer := 25;
  v_found boolean := false;
  v_now timestamptz := now();
begin
  if p_player_id is null or p_player_id !~ '^[a-fA-F0-9]{32}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_user_id');
  end if;
  if p_item_id <> 'potion-small' then
    return jsonb_build_object('ok', false, 'error', 'item_not_available');
  end if;
  insert into public.player_snapshots(player_id, payload, updated_at)
  values (p_player_id, jsonb_build_object('gold', 0, 'inventory', jsonb_build_array()), v_now)
  on conflict (player_id) do nothing;
  select payload into v_payload from public.player_snapshots where player_id = p_player_id for update;
  v_payload := coalesce(v_payload, '{}'::jsonb);
  v_gold := greatest(0, coalesce((v_payload->>'gold')::integer, 0));
  if v_gold < v_price then
    return jsonb_build_object('ok', false, 'error', 'insufficient_gold', 'gold', v_gold, 'price', v_price);
  end if;
  v_inventory := case when jsonb_typeof(v_payload->'inventory') = 'array' then v_payload->'inventory' else '[]'::jsonb end;
  select exists(select 1 from jsonb_array_elements(v_inventory) e(value) where value->>'id' = 'potion-small') into v_found;
  if not v_found then
    v_inventory := v_inventory || jsonb_build_array(jsonb_build_object('id','potion-small','name','Small Potion','type','consumable','slot','consumable','quantity',1,'heal',35));
  else
    -- Rebuild only the matching item quantity while retaining every other inventory entry.
    select coalesce(jsonb_agg(case when value->>'id' = 'potion-small'
      then jsonb_set(value, '{quantity}', to_jsonb(greatest(0, coalesce((value->>'quantity')::integer, 0)) + 1), true)
      else value end), '[]'::jsonb)
      into v_inventory from jsonb_array_elements(case when jsonb_typeof(v_payload->'inventory') = 'array' then v_payload->'inventory' else '[]'::jsonb end);
  end if;
  v_payload := jsonb_set(v_payload, '{gold}', to_jsonb(v_gold - v_price), true);
  v_payload := jsonb_set(v_payload, '{inventory}', v_inventory, true);
  v_payload := jsonb_set(v_payload, '{potions}', to_jsonb(greatest(0, coalesce((v_payload->>'potions')::integer, 0)) + 1), true);
  update public.player_snapshots set payload = v_payload, updated_at = v_now where player_id = p_player_id;
  return jsonb_build_object('ok', true, 'item', 'potion-small', 'quantityAdded', 1, 'price', v_price, 'gold', v_gold - v_price, 'inventory', v_inventory);
end;
$$;

revoke all on function public.claim_player_daily(text) from public, anon, authenticated;
revoke all on function public.buy_player_item(text, text) from public, anon, authenticated;
grant execute on function public.claim_player_daily(text) to service_role;
grant execute on function public.buy_player_item(text, text) to service_role;
