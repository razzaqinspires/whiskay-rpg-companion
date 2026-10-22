import fs from 'node:fs'; import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL(p,import.meta.url).pathname,'utf8');
const adventure=read('../app/adventure/page.jsx'),dungeon=read('../app/dungeon/page.jsx'),world=read('../components/AdventureClient.jsx'),game=read('../components/GameClient.jsx'),sync=read('../app/api/sync/route.js'),update=read('../app/api/player/update/route.js');
assert.match(adventure,/verifyGameAccess/); assert.match(dungeon,/verifyGameAccess/); assert.match(world,/group position=\{\[14,0,-8\]\}/); assert.match(world,/dungeon\?floor=1/); assert.match(game,/length:100/); assert.match(game,/api\/player\/update/); assert.match(sync,/Supabase RPCs/); assert.match(update,/verifyGameAccess/);
console.log('Stage 17 verification: 8 checks passed');
