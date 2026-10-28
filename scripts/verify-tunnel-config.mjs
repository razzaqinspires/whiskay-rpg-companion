import { readFile } from 'node:fs/promises';

const route = await readFile(new URL('../app/api/world-boss/announce/route.js', import.meta.url), 'utf8');
const envExample = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
const checks = [
  ['route validates game access', route.includes('verifyGameAccess')],
  ['route sends Bearer auth', route.includes('authorization: `Bearer ${secret}`')],
  ['route uses webhook URL env', route.includes('WHISKAY_BOT_WEBHOOK_URL')],
  ['env example documents webhook URL', envExample.includes('WHISKAY_BOT_WEBHOOK_URL')],
  ['event name matches bot', route.includes('world_boss_spawned')]
];
let failed = false;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed = true;
}
if (failed) process.exitCode = 1;
