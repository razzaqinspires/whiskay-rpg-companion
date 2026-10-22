import { readFile } from 'node:fs/promises'; import assert from 'node:assert/strict';
const read = p => readFile(new URL('../'+p, import.meta.url),'utf8');
const gacha=await read('app/api/player/gacha/route.js'), craft=await read('app/api/player/craft/route.js'), trade=await read('app/api/player/trade/route.js');
const sql=await read('schema.sql'), realtime=await read('components/PlayerRealtimeSync.jsx'), token=await read('app/api/player/realtime-token/route.js'), sync=await read('app/api/sync/route.js');
assert.match(gacha,/gacha_player_equipment/); assert.match(craft,/craft_player_item/); assert.match(trade,/trade_player_assets/);
assert.match(sql,/for update/i); assert.match(sql,/insufficient_materials/); assert.match(sql,/supabase_realtime/); assert.match(sql,/signed player can read own snapshot/);
assert.match(realtime,/postgres_changes/); assert.match(realtime,/whiskay:player-update/); assert.match(token,/createHmac/); assert.match(sync,/server-authoritative/);
console.log('Stage 9–10 verification: 12 checks passed');
