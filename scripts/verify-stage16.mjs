import fs from 'node:fs';
const checks = [
 ['floating combat component', 'components/FloatingCombatText.jsx', 'whiskay:combat-hit'],
 ['dynamic equipment mesh swap', 'components/DynamicEquipment.jsx', 'iron-sword'],
 ['combat hook', 'components/AdventureClient.jsx', 'whiskay:combat-hit'],
 ['guild route', 'app/api/player/guild/route.js', 'guild_create'],
 ['guild schema', 'schema.sql', 'create or replace function public.guild_create'],
];
let failed=0; for(const [label,file,needle] of checks){const ok=fs.existsSync(file)&&fs.readFileSync(file,'utf8').includes(needle);console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;} if(failed)process.exitCode=1;
