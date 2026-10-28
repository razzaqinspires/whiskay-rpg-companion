import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const checks = [];
function check(name, fn) { fn(); checks.push(name); }
check('Inventory page verifies signed game access before rendering data', () => {
  const page = read('app/inventory/page.jsx');
  assert.match(page, /verifyGameAccess\(accessToken, playerId\)/);
  assert.match(page, /<AccessRequired destination="inventory"\s*\/>/);
});
check('Adventure and dungeon routes show the WhatsApp gate when access is missing or invalid', () => {
  for (const file of ['app/adventure/page.jsx','app/dungeon/page.jsx']) {
    const page = read(file);
    assert.match(page, /verifyGameAccess\(access, player\)/);
    assert.match(page, /<AccessRequired destination=/);
  }
});
check('Player snapshot GET endpoint requires a signed token bound to player ID', () => {
  const route = read('app/api/player/route.js');
  assert.match(route, /accessToken/);
  assert.match(route, /verifyGameAccess\(accessToken, player\)/);
  assert.match(route, /player_registration_failed/);
});
check('Inventory UI reads the server snapshot and has no localStorage inventory fallback', () => {
  const page = read('components/InventoryClient.jsx');
  assert.match(page, /\/api\/player\?/);
  assert.doesNotMatch(page, /localStorage\.(getItem|setItem|removeItem)/);
  assert.doesNotMatch(page, /Spirit Seed: Azure|Ashen Core|Potion of Renewal/);
});
check('Dungeon route passes verified player identity to the game', () => {
  assert.match(read('app/dungeon/page.jsx'), /<DungeonEntry playerId=\{player\} accessToken=\{access\}\s*\/>/);
  assert.match(read('components/DungeonEntry.jsx'), /<GameClient playerId=\{playerId\} accessToken=\{accessToken\}\s*\/>/);
});
check('Legacy static HTML entry points cannot bypass App Router guards', () => {
  for (const file of ['index.html','inventory.html','inventory/index.html','dungeon.html','dungeon/index.html']) {
    assert.equal(fs.existsSync(path.join(root, file)), false, `legacy route still exists: ${file}`);
  }
});
check('Player update route preserves per-player dungeon progress fields', () => {
  const route = read('app/api/player/update/route.js');
  assert.match(route, /completedFloors/);
  assert.match(route, /unlockedFloor/);
  assert.match(route, /invalid_completed_floors/);
});
check('Realtime JWT cannot be minted without the signed player access token', () => {
  const route = read('app/api/player/realtime-token/route.js');
  assert.match(route, /verifyGameAccess\(accessToken,playerId\)/);
  assert.match(route, /invalid_access/);
  const sync = read('components/PlayerRealtimeSync.jsx');
  assert.match(sync, /accessToken/);
  assert.doesNotMatch(sync, /sessionStorage\.getItem\('whiskay-player-id'\)/);
});
check('Landing page includes WhatsApp verification modal', () => {
  assert.match(read('app/page.jsx'), /WhatsAppLoginModal/);
  assert.match(read('components/WhatsAppLoginModal.jsx'), /\.enterdungeon/);
});
console.log(`WhatsApp/RPG access verification: ${checks.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`PASS ${item}`);
