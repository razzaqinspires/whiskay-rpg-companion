import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(); const checks=[];
function check(name,condition){checks.push({name,ok:Boolean(condition)});}
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
check('sync route authenticates bearer token',read('app/api/sync/route.js').includes('unauthorized'));
check('sync route bounds Mod Coin fields',read('app/api/sync/route.js').includes('mod_coins'));
check('sync route bounds battery capacity',read('app/api/sync/route.js').includes('max_battery_capacity'));
check('sync route bounds charging voltage',read('app/api/sync/route.js').includes('current_volt_speed'));
check('realtime sync emits player updates',read('components/PlayerRealtimeSync.jsx').includes("whiskay:player-update"));
check('mobile dock listens for player updates',read('components/MobileSkillDock.jsx').includes("addEventListener('whiskay:player-update'"));
check('world manager reacts to low energy and darkness event',read('components/WorldManager.jsx').includes('darknessEvent') && read('components/WorldManager.jsx').includes('exhausted'));
check('virtual pet reacts to low energy',read('components/VirtualPet.jsx').includes('exhausted'));
check('Mod Coin shop has WhatsApp deep link',read('components/ModCoinShop.jsx').includes('wa.me/') && read('components/ModCoinShop.jsx').includes('.buy modcoin'));
check('Stage 23 docs exist',fs.existsSync(path.join(root,'docs/STAGE-23-IMPLEMENTATION-2026-10-29.md')));
for(const c of checks) console.log(`${c.ok?'PASS':'FAIL'} ${c.name}`);
console.log(`Stage 23 checks: ${checks.filter(c=>c.ok).length}/${checks.length}`);
if(checks.some(c=>!c.ok))process.exitCode=1;
