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


-- Stage 9: server-authoritative economy transactions. All RPCs are called by API routes
-- using the Supabase service role; browser clients must never receive this key.
create or replace function public.gacha_player_equipment(p_player_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_payload jsonb; v_inventory jsonb; v_gold integer; v_price integer:=100; v_roll double precision; v_rarity text; v_item jsonb; v_now timestamptz:=now(); v_power integer; v_slot text;
begin
 if p_player_id is null or p_player_id !~ '^[a-fA-F0-9]{32}$' then return jsonb_build_object('ok',false,'error','invalid_user_id'); end if;
 insert into public.player_snapshots(player_id,payload,updated_at) values(p_player_id,jsonb_build_object('gold',0,'inventory','[]'::jsonb),v_now) on conflict(player_id) do nothing;
 select payload into v_payload from public.player_snapshots where player_id=p_player_id for update;
 v_gold:=greatest(0,coalesce(case when coalesce(v_payload->>'gold','') ~ '^-?[0-9]+$' then (v_payload->>'gold')::integer else 0 end,0));
 if v_gold<v_price then return jsonb_build_object('ok',false,'error','insufficient_gold','gold',v_gold,'price',v_price); end if;
 v_roll:=random(); v_rarity:=case when v_roll<0.05 then 'EPIC' when v_roll<0.30 then 'RARE' else 'COMMON' end;
 v_slot:=case when random()<0.5 then 'weapon' else 'armor' end;
 if v_rarity='EPIC' and v_slot='weapon' then v_item:=jsonb_build_object('id','equipment-epic-emberblade','name','Emberblade of the Rift','type','equipment','slot','weapon','rarity','EPIC','power',25,'quantity',1); v_power:=25;
 elsif v_rarity='EPIC' then v_item:=jsonb_build_object('id','equipment-epic-aegis','name','Aegis of the Rift','type','equipment','slot','armor','rarity','EPIC','defense',22,'power',0,'quantity',1); v_power:=22;
 elsif v_rarity='RARE' and v_slot='weapon' then v_item:=jsonb_build_object('id','equipment-rare-moonsteel','name','Moonsteel Edge','type','equipment','slot','weapon','rarity','RARE','power',14,'quantity',1); v_power:=14;
 elsif v_rarity='RARE' then v_item:=jsonb_build_object('id','equipment-rare-moonplate','name','Moonplate Armor','type','equipment','slot','armor','rarity','RARE','defense',12,'power',0,'quantity',1); v_power:=12;
 elsif v_slot='weapon' then v_item:=jsonb_build_object('id','equipment-common-iron','name','Ironbound Sword','type','equipment','slot','weapon','rarity','COMMON','power',7,'quantity',1); v_power:=7;
 else v_item:=jsonb_build_object('id','equipment-common-leather','name','Leather Guard','type','equipment','slot','armor','rarity','COMMON','defense',5,'power',0,'quantity',1); v_power:=5; end if;
 v_inventory:=case when jsonb_typeof(v_payload->'inventory')='array' then v_payload->'inventory' else '[]'::jsonb end;
 v_inventory:=v_inventory||jsonb_build_array(v_item);
 v_payload:=jsonb_set(v_payload,'{gold}',to_jsonb(v_gold-v_price),true);
 v_payload:=jsonb_set(v_payload,'{inventory}',v_inventory,true);
 v_payload:=jsonb_set(v_payload,'{lastGachaAt}',to_jsonb(v_now),true);
 update public.player_snapshots set payload=v_payload,updated_at=v_now where player_id=p_player_id;
 return jsonb_build_object('ok',true,'item',v_item,'rarity',v_rarity,'price',v_price,'gold',v_gold-v_price,'inventory',v_inventory);
end; $$;

create or replace function public.craft_player_item(p_player_id text,p_item_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_payload jsonb; v_inventory jsonb; v_new jsonb:='[]'::jsonb; v_item jsonb; v_id text; v_qty integer; v_herb integer:=0; v_core integer:=0; v_potion integer:=0; v_now timestamptz:=now();
begin
 if p_player_id is null or p_player_id !~ '^[a-fA-F0-9]{32}$' then return jsonb_build_object('ok',false,'error','invalid_user_id'); end if;
 if p_item_id<>'potion-small' then return jsonb_build_object('ok',false,'error','recipe_not_found'); end if;
 insert into public.player_snapshots(player_id,payload,updated_at) values(p_player_id,jsonb_build_object('gold',0,'inventory','[]'::jsonb),v_now) on conflict(player_id) do nothing;
 select payload into v_payload from public.player_snapshots where player_id=p_player_id for update;
 v_inventory:=case when jsonb_typeof(v_payload->'inventory')='array' then v_payload->'inventory' else '[]'::jsonb end;
 for v_item in select value from jsonb_array_elements(v_inventory) loop
   v_id:=v_item->>'id';
   v_qty:=greatest(0,coalesce(case when coalesce(v_item->>'quantity','') ~ '^[0-9]+$' then (v_item->>'quantity')::integer else 1 end,1));
   if v_id='material-herb' then v_herb:=v_herb+v_qty; elsif v_id='ashen-core' then v_core:=v_core+v_qty; end if;
 end loop;
 if v_herb<2 or v_core<1 then return jsonb_build_object('ok',false,'error','insufficient_materials','message',format('Butuh 2× Herb (tersedia %s) dan 1× Ashen Core (tersedia %s).',v_herb,v_core)); end if;
 v_herb:=2; v_core:=1;
 for v_item in select value from jsonb_array_elements(v_inventory) loop
   v_id:=v_item->>'id';
   v_qty:=greatest(0,coalesce(case when coalesce(v_item->>'quantity','') ~ '^[0-9]+$' then (v_item->>'quantity')::integer else 1 end,1));
   if v_id='material-herb' and v_herb>0 then
     if v_qty>v_herb then v_new:=v_new||jsonb_build_array(jsonb_set(v_item,'{quantity}',to_jsonb(v_qty-v_herb),true)); v_herb:=0; else v_herb:=v_herb-v_qty; end if;
   elsif v_id='ashen-core' and v_core>0 then
     if v_qty>v_core then v_new:=v_new||jsonb_build_array(jsonb_set(v_item,'{quantity}',to_jsonb(v_qty-v_core),true)); v_core:=0; else v_core:=v_core-v_qty; end if;
   else v_new:=v_new||jsonb_build_array(v_item); end if;
 end loop;
 v_potion:=0;
 for v_item in select value from jsonb_array_elements(v_new) loop if v_item->>'id'='potion-small' then v_potion:=greatest(0,coalesce((v_item->>'quantity')::integer,0)); end if; end loop;
 if v_potion=0 then v_new:=v_new||jsonb_build_array(jsonb_build_object('id','potion-small','name','Small Potion','type','consumable','slot','consumable','quantity',1,'heal',35));
 else select coalesce(jsonb_agg(case when value->>'id'='potion-small' then jsonb_set(value,'{quantity}',to_jsonb(greatest(0,coalesce((value->>'quantity')::integer,0))+1),true) else value end),'[]'::jsonb) into v_new from jsonb_array_elements(v_new); end if;
 v_payload:=jsonb_set(v_payload,'{inventory}',v_new,true);
 v_payload:=jsonb_set(v_payload,'{potions}',to_jsonb(greatest(0,coalesce(case when coalesce(v_payload->>'potions','') ~ '^[0-9]+$' then (v_payload->>'potions')::integer else 0 end,0))+1),true);
 update public.player_snapshots set payload=v_payload,updated_at=v_now where player_id=p_player_id;
 return jsonb_build_object('ok',true,'item','potion-small','quantity',1,'inventory',v_new);
end; $$;

create or replace function public.trade_player_assets(p_from_player_id text,p_to_player_id text,p_kind text,p_item_id text,p_amount integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_from jsonb; v_to jsonb; v_from_inv jsonb; v_to_inv jsonb; v_new_from jsonb:='[]'::jsonb; v_new_to jsonb; v_item jsonb; v_found jsonb; v_qty integer; v_remaining integer; v_from_gold integer; v_to_gold integer; v_now timestamptz:=now(); v_id text;
begin
 if p_from_player_id is null or p_to_player_id is null or p_from_player_id !~ '^[a-fA-F0-9]{32}$' or p_to_player_id !~ '^[a-fA-F0-9]{32}$' then return jsonb_build_object('ok',false,'error','invalid_user_id'); end if;
 if p_from_player_id=p_to_player_id then return jsonb_build_object('ok',false,'error','cannot_trade_self'); end if;
 if p_kind not in ('gold','item') or p_amount is null or p_amount<1 or p_amount>1000000 then return jsonb_build_object('ok',false,'error','invalid_trade'); end if;
 if p_kind='item' and p_item_id not in ('potion-small','material-herb','ashen-core') then return jsonb_build_object('ok',false,'error','invalid_trade'); end if;
 if not exists (select 1 from public.player_snapshots where player_id=p_to_player_id) then
   return jsonb_build_object('ok',false,'error','recipient_not_found');
 end if;
 insert into public.player_snapshots(player_id,payload,updated_at) values(p_from_player_id,jsonb_build_object('gold',0,'inventory','[]'::jsonb),v_now) on conflict(player_id) do nothing;
 -- Stable lock order prevents opposite-direction trade deadlocks.
 if p_from_player_id<p_to_player_id then
   select payload into v_from from public.player_snapshots where player_id=p_from_player_id for update;
   select payload into v_to from public.player_snapshots where player_id=p_to_player_id for update;
 else
   select payload into v_to from public.player_snapshots where player_id=p_to_player_id for update;
   select payload into v_from from public.player_snapshots where player_id=p_from_player_id for update;
 end if;
 v_from:=coalesce(v_from,'{}'::jsonb); v_to:=coalesce(v_to,'{}'::jsonb);
 v_from_gold:=greatest(0,coalesce(case when coalesce(v_from->>'gold','') ~ '^-?[0-9]+$' then (v_from->>'gold')::integer else 0 end,0));
 v_to_gold:=greatest(0,coalesce(case when coalesce(v_to->>'gold','') ~ '^-?[0-9]+$' then (v_to->>'gold')::integer else 0 end,0));
 if p_kind='gold' then
   if v_from_gold<p_amount then return jsonb_build_object('ok',false,'error','insufficient_gold','gold',v_from_gold,'price',p_amount); end if;
   v_from:=jsonb_set(v_from,'{gold}',to_jsonb(v_from_gold-p_amount),true); v_to:=jsonb_set(v_to,'{gold}',to_jsonb(v_to_gold+p_amount),true);
 else
   v_from_inv:=case when jsonb_typeof(v_from->'inventory')='array' then v_from->'inventory' else '[]'::jsonb end;
   v_to_inv:=case when jsonb_typeof(v_to->'inventory')='array' then v_to->'inventory' else '[]'::jsonb end;
   v_qty:=0; v_found:=null;
   for v_item in select value from jsonb_array_elements(v_from_inv) loop
     if v_item->>'id'=p_item_id then v_found:=v_item; v_qty:=v_qty+greatest(0,coalesce(case when coalesce(v_item->>'quantity','') ~ '^[0-9]+$' then (v_item->>'quantity')::integer else 1 end,1)); end if;
   end loop;
   if v_qty<p_amount then return jsonb_build_object('ok',false,'error','insufficient_item'); end if;
   v_remaining:=p_amount;
   for v_item in select value from jsonb_array_elements(v_from_inv) loop
     if v_item->>'id'=p_item_id and v_remaining>0 then
       v_qty:=greatest(0,coalesce(case when coalesce(v_item->>'quantity','') ~ '^[0-9]+$' then (v_item->>'quantity')::integer else 1 end,1));
       if v_qty>v_remaining then v_new_from:=v_new_from||jsonb_build_array(jsonb_set(v_item,'{quantity}',to_jsonb(v_qty-v_remaining),true)); v_remaining:=0;
       else v_remaining:=v_remaining-v_qty; end if;
     else v_new_from:=v_new_from||jsonb_build_array(v_item); end if;
   end loop;
   v_qty:=0;
   for v_item in select value from jsonb_array_elements(v_to_inv) loop if v_item->>'id'=p_item_id then v_qty:=v_qty+greatest(0,coalesce(case when coalesce(v_item->>'quantity','') ~ '^[0-9]+$' then (v_item->>'quantity')::integer else 1 end,1)); end if; end loop;
   if v_qty=0 then v_to_inv:=v_to_inv||jsonb_build_array(jsonb_set(v_found,'{quantity}',to_jsonb(p_amount),true));
   else select coalesce(jsonb_agg(case when value->>'id'=p_item_id then jsonb_set(value,'{quantity}',to_jsonb(greatest(0,coalesce((value->>'quantity')::integer,0))+p_amount),true) else value end),'[]'::jsonb) into v_to_inv from jsonb_array_elements(v_to_inv); end if;
   v_from:=jsonb_set(v_from,'{inventory}',v_new_from,true); v_to:=jsonb_set(v_to,'{inventory}',v_to_inv,true);
 end if;
 update public.player_snapshots set payload=v_from,updated_at=v_now where player_id=p_from_player_id;
 update public.player_snapshots set payload=v_to,updated_at=v_now where player_id=p_to_player_id;
 return jsonb_build_object('ok',true,'kind',p_kind,'amount',p_amount,'itemId',p_item_id,'senderGold',greatest(0,coalesce(case when coalesce(v_from->>'gold','') ~ '^-?[0-9]+$' then (v_from->>'gold')::integer else 0 end,0)),'recipientGold',greatest(0,coalesce(case when coalesce(v_to->>'gold','') ~ '^-?[0-9]+$' then (v_to->>'gold')::integer else 0 end,0)));
end; $$;

revoke all on function public.gacha_player_equipment(text) from public,anon,authenticated;
revoke all on function public.craft_player_item(text,text) from public,anon,authenticated;
revoke all on function public.trade_player_assets(text,text,text,text,integer) from public,anon,authenticated;
grant execute on function public.gacha_player_equipment(text) to service_role;
grant execute on function public.craft_player_item(text,text) to service_role;
grant execute on function public.trade_player_assets(text,text,text,text,integer) to service_role;

-- Stage 10: Realtime may only read the row matching a short-lived signed player JWT.
grant select on public.player_snapshots to authenticated;
drop policy if exists "signed player can read own snapshot" on public.player_snapshots;
create policy "signed player can read own snapshot" on public.player_snapshots for select to authenticated
using (player_id = (auth.jwt()->>'player_id'));
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='player_snapshots') then
    alter publication supabase_realtime add table public.player_snapshots;
  end if;
end $$;


-- Stage 16: Guild / faction economy. All mutations are performed inside SECURITY DEFINER RPCs.
create table if not exists public.rpg_guilds (
  id text primary key default replace(gen_random_uuid()::text, '-', ''),
  name text not null unique,
  leader_player_id text not null check (leader_player_id ~ '^[a-fA-F0-9]{32}$'),
  level integer not null default 1 check (level >= 1),
  treasury bigint not null default 0 check (treasury >= 0),
  created_at timestamptz not null default now()
);
create table if not exists public.rpg_guild_members (
  player_id text primary key check (player_id ~ '^[a-fA-F0-9]{32}$'),
  guild_id text not null references public.rpg_guilds(id) on delete cascade,
  role text not null default 'member' check (role in ('leader','member')),
  joined_at timestamptz not null default now()
);
alter table public.rpg_guilds enable row level security;
alter table public.rpg_guild_members enable row level security;

create or replace function public.guild_create(p_player_id text, p_name text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare v_payload jsonb; v_gold integer; v_guild public.rpg_guilds; v_now timestamptz:=now();
begin
 if p_player_id !~ '^[a-fA-F0-9]{32}$' or length(trim(p_name))<3 or length(p_name)>32 then return jsonb_build_object('ok',false,'error','invalid_guild_name'); end if;
 if exists(select 1 from public.rpg_guild_members where player_id=p_player_id) then return jsonb_build_object('ok',false,'error','already_in_guild'); end if;
 insert into public.player_snapshots(player_id,payload,updated_at) values(p_player_id,jsonb_build_object('gold',0,'inventory','[]'::jsonb),v_now) on conflict(player_id) do nothing;
 select payload into v_payload from public.player_snapshots where player_id=p_player_id for update;
 v_gold:=greatest(0,coalesce((v_payload->>'gold')::integer,0)); if v_gold<10000 then return jsonb_build_object('ok',false,'error','insufficient_gold','price',10000,'gold',v_gold); end if;
 update public.player_snapshots set payload=jsonb_set(v_payload,'{gold}',to_jsonb(v_gold-10000),true),updated_at=v_now where player_id=p_player_id;
 insert into public.rpg_guilds(name,leader_player_id) values(trim(p_name),p_player_id) returning * into v_guild;
 insert into public.rpg_guild_members(player_id,guild_id,role) values(p_player_id,v_guild.id,'leader');
 return jsonb_build_object('ok',true,'guild',jsonb_build_object('id',v_guild.id,'name',v_guild.name,'level',v_guild.level,'treasury',v_guild.treasury));
exception when unique_violation then return jsonb_build_object('ok',false,'error','guild_name_taken'); end; $$;

create or replace function public.guild_join(p_player_id text,p_guild_id text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare v_guild public.rpg_guilds;
begin
 if p_player_id !~ '^[a-fA-F0-9]{32}$' then return jsonb_build_object('ok',false,'error','invalid_user_id'); end if;
 if exists(select 1 from public.rpg_guild_members where player_id=p_player_id) then return jsonb_build_object('ok',false,'error','already_in_guild'); end if;
 select * into v_guild from public.rpg_guilds where id=p_guild_id for update; if not found then return jsonb_build_object('ok',false,'error','guild_not_found'); end if;
 insert into public.rpg_guild_members(player_id,guild_id,role) values(p_player_id,v_guild.id,'member');
 return jsonb_build_object('ok',true,'guild',jsonb_build_object('id',v_guild.id,'name',v_guild.name,'level',v_guild.level,'treasury',v_guild.treasury));
end; $$;

create or replace function public.guild_kick(p_player_id text,p_target_id text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare v_member public.rpg_guild_members; v_guild public.rpg_guilds; v_target public.rpg_guild_members;
begin
 select * into v_member from public.rpg_guild_members where player_id=p_player_id; if not found then return jsonb_build_object('ok',false,'error','not_guild_member'); end if;
 select * into v_guild from public.rpg_guilds where id=v_member.guild_id for update;
 if v_guild.leader_player_id<>p_player_id then return jsonb_build_object('ok',false,'error','not_guild_leader'); end if;
 select * into v_target from public.rpg_guild_members where player_id=p_target_id and guild_id=v_guild.id; if not found then return jsonb_build_object('ok',false,'error','member_not_found'); end if;
 if p_target_id=p_player_id then return jsonb_build_object('ok',false,'error','invalid_trade'); end if;
 delete from public.rpg_guild_members where player_id=p_target_id;
 return jsonb_build_object('ok',true,'guild',jsonb_build_object('id',v_guild.id,'name',v_guild.name,'level',v_guild.level,'treasury',v_guild.treasury));
end; $$;

create or replace function public.guild_donate(p_player_id text,p_amount integer) returns jsonb
language plpgsql security definer set search_path=public as $$
declare v_member public.rpg_guild_members; v_guild public.rpg_guilds; v_payload jsonb; v_gold integer; v_now timestamptz:=now();
begin
 if p_amount is null or p_amount<1 or p_amount>1000000 then return jsonb_build_object('ok',false,'error','invalid_trade'); end if;
 select * into v_member from public.rpg_guild_members where player_id=p_player_id; if not found then return jsonb_build_object('ok',false,'error','not_guild_member'); end if;
 insert into public.player_snapshots(player_id,payload,updated_at) values(p_player_id,jsonb_build_object('gold',0,'inventory','[]'::jsonb),v_now) on conflict(player_id) do nothing;
 select payload into v_payload from public.player_snapshots where player_id=p_player_id for update;
 v_gold:=greatest(0,coalesce((v_payload->>'gold')::integer,0)); if v_gold<p_amount then return jsonb_build_object('ok',false,'error','insufficient_gold','gold',v_gold,'price',p_amount); end if;
 select * into v_guild from public.rpg_guilds where id=v_member.guild_id for update;
 update public.player_snapshots set payload=jsonb_set(v_payload,'{gold}',to_jsonb(v_gold-p_amount),true),updated_at=v_now where player_id=p_player_id;
 update public.rpg_guilds set treasury=treasury+p_amount, level=1+floor((treasury+p_amount)/10000)::integer where id=v_guild.id returning * into v_guild;
 return jsonb_build_object('ok',true,'guild',jsonb_build_object('id',v_guild.id,'name',v_guild.name,'level',v_guild.level,'treasury',v_guild.treasury));
end; $$;

create or replace function public.guild_info(p_player_id text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare v_member public.rpg_guild_members; v_guild public.rpg_guilds; v_count integer;
begin
 select * into v_member from public.rpg_guild_members where player_id=p_player_id; if not found then return jsonb_build_object('ok',true,'guild',null); end if;
 select * into v_guild from public.rpg_guilds where id=v_member.guild_id; select count(*) into v_count from public.rpg_guild_members where guild_id=v_guild.id;
 return jsonb_build_object('ok',true,'guild',jsonb_build_object('id',v_guild.id,'name',v_guild.name,'level',v_guild.level,'treasury',v_guild.treasury,'members',v_count,'role',v_member.role));
end; $$;

revoke all on function public.guild_create(text,text) from public,anon,authenticated;
revoke all on function public.guild_join(text,text) from public,anon,authenticated;
revoke all on function public.guild_kick(text,text) from public,anon,authenticated;
revoke all on function public.guild_donate(text,integer) from public,anon,authenticated;
revoke all on function public.guild_info(text) from public,anon,authenticated;
grant execute on function public.guild_create(text,text) to service_role;
grant execute on function public.guild_join(text,text) to service_role;
grant execute on function public.guild_kick(text,text) to service_role;
grant execute on function public.guild_donate(text,integer) to service_role;
grant execute on function public.guild_info(text) to service_role;


-- Stage 18: server-authoritative global auction. Every mutation locks player rows and listing rows.
create table if not exists public.rpg_auction_listings (
 id uuid primary key default gen_random_uuid(), seller_player_id text not null, item_id text not null,
 item_payload jsonb not null, price bigint not null check(price > 0 and price <= 100000000),
 status text not null default 'active' check(status in ('active','sold','cancelled')), buyer_player_id text,
 created_at timestamptz not null default now(), sold_at timestamptz
);
create index if not exists rpg_auction_active_created_idx on public.rpg_auction_listings(status,created_at desc);
alter table public.rpg_auction_listings enable row level security;
revoke all on public.rpg_auction_listings from public, anon, authenticated;
create or replace function public.auction_sell_item(p_player_id text,p_item_id text,p_price bigint) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_payload jsonb; v_inventory jsonb; v_item jsonb; v_new jsonb; v_listing public.rpg_auction_listings; v_qty int; v_now timestamptz:=now();
begin
 if p_player_id !~ '^[a-fA-F0-9]{32}$' or p_item_id !~ '^[a-z0-9_-]{2,64}$' or p_price<1 or p_price>100000000 then return jsonb_build_object('ok',false,'error','invalid_listing'); end if;
 select payload into v_payload from public.player_snapshots where player_id=p_player_id for update; if not found then return jsonb_build_object('ok',false,'error','player_not_found'); end if;
 v_inventory:=case when jsonb_typeof(v_payload->'inventory')='array' then v_payload->'inventory' else '[]'::jsonb end;
 select value into v_item from jsonb_array_elements(v_inventory) e(value) where value->>'id'=p_item_id limit 1;
 if v_item is null then return jsonb_build_object('ok',false,'error','insufficient_item'); end if;
 v_qty:=greatest(1,coalesce((v_item->>'quantity')::int,1));
 if v_qty>1 then select coalesce(jsonb_agg(case when value->>'id'=p_item_id then jsonb_set(value,'{quantity}',to_jsonb(v_qty-1),true) else value end),'[]'::jsonb) into v_new from jsonb_array_elements(v_inventory) e(value);
 else select coalesce(jsonb_agg(value),'[]'::jsonb) into v_new from jsonb_array_elements(v_inventory) e(value) where value->>'id'<>p_item_id; end if;
 insert into public.rpg_auction_listings(seller_player_id,item_id,item_payload,price) values(p_player_id,p_item_id,jsonb_set(v_item,'{quantity}',to_jsonb(1),true),p_price) returning * into v_listing;
 update public.player_snapshots set payload=jsonb_set(v_payload,'{inventory}',v_new,true),updated_at=v_now where player_id=p_player_id;
 return jsonb_build_object('ok',true,'listing',jsonb_build_object('id',v_listing.id,'itemId',v_listing.item_id,'price',v_listing.price));
end $$;
create or replace function public.auction_list_items(p_player_id text) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_rows jsonb;
begin if p_player_id !~ '^[a-fA-F0-9]{32}$' then return jsonb_build_object('ok',false,'error','invalid_user_id'); end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'itemId',item_id,'price',price,'sellerId',seller_player_id,'createdAt',created_at) order by created_at desc),'[]'::jsonb) into v_rows from (select * from public.rpg_auction_listings where status='active' order by created_at desc limit 50) a;
 return jsonb_build_object('ok',true,'listings',v_rows); end $$;
create or replace function public.auction_buy_item(p_player_id text,p_listing_id text) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_listing public.rpg_auction_listings; v_buyer jsonb; v_seller jsonb; v_inv jsonb; v_item jsonb; v_gold bigint; v_now timestamptz:=now();
begin if p_player_id !~ '^[a-fA-F0-9]{32}$' then return jsonb_build_object('ok',false,'error','invalid_user_id'); end if;
 select * into v_listing from public.rpg_auction_listings where id::text=p_listing_id and status='active' for update; if not found then return jsonb_build_object('ok',false,'error','listing_not_found'); end if;
 if v_listing.seller_player_id=p_player_id then return jsonb_build_object('ok',false,'error','cannot_buy_own_listing'); end if;
 perform 1 from public.player_snapshots where player_id in (p_player_id,v_listing.seller_player_id) order by player_id for update;
 select payload into v_buyer from public.player_snapshots where player_id=p_player_id; if not found then return jsonb_build_object('ok',false,'error','player_not_found'); end if;
 v_gold:=greatest(0,coalesce((v_buyer->>'gold')::bigint,0)); if v_gold<v_listing.price then return jsonb_build_object('ok',false,'error','insufficient_gold','gold',v_gold,'price',v_listing.price); end if;
 select payload into v_seller from public.player_snapshots where player_id=v_listing.seller_player_id; if not found then return jsonb_build_object('ok',false,'error','seller_not_found'); end if;
 v_inv:=case when jsonb_typeof(v_buyer->'inventory')='array' then v_buyer->'inventory' else '[]'::jsonb end; v_item:=jsonb_set(v_listing.item_payload,'{quantity}',to_jsonb(1),true);
 update public.player_snapshots set payload=jsonb_set(jsonb_set(v_buyer,'{gold}',to_jsonb(v_gold-v_listing.price),true),'{inventory}',v_inv||jsonb_build_array(v_item),true),updated_at=v_now where player_id=p_player_id;
 update public.player_snapshots set payload=jsonb_set(coalesce(v_seller,'{}'::jsonb),'{gold}',to_jsonb(greatest(0,coalesce((v_seller->>'gold')::bigint,0))+v_listing.price),true),updated_at=v_now where player_id=v_listing.seller_player_id;
 update public.rpg_auction_listings set status='sold',buyer_player_id=p_player_id,sold_at=v_now where id=v_listing.id;
 return jsonb_build_object('ok',true,'itemId',v_listing.item_id,'price',v_listing.price,'gold',v_gold-v_listing.price); end $$;
revoke all on function public.auction_sell_item(text,text,bigint) from public,anon,authenticated;
revoke all on function public.auction_list_items(text) from public,anon,authenticated;
revoke all on function public.auction_buy_item(text,text) from public,anon,authenticated;
grant execute on function public.auction_sell_item(text,text,bigint) to service_role;
grant execute on function public.auction_list_items(text) to service_role;
grant execute on function public.auction_buy_item(text,text) to service_role;
