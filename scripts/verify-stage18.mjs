import fs from 'node:fs'; import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const auction=read('../app/api/player/auction/route.js'), announce=read('../app/api/world-boss/announce/route.js'), schema=read('../schema.sql'), adventure=read('../components/AdventureClient.jsx'), boss=read('../components/WorldBoss.jsx'), readme=read('../README.md');
assert.match(auction,/auction_sell_item/); assert.match(auction,/auction_buy_item/); assert.match(schema,/create table if not exists public\.rpg_auction_listings/); assert.match(schema,/for update/); assert.match(announce,/verifyGameAccess/); assert.match(announce,/WHISKAY_BOT_WEBHOOK_URL/); assert.match(boss,/whiskay:worldboss-spawned/); assert.match(adventure,/speedFactor=\(mount\?2:1\)/); assert.match(adventure,/Storm/); assert.match(readme,/📚 Documentation & Archives/); assert.match(readme,/graph TD/);
console.log('Stage 18 verification: 10 checks passed');
