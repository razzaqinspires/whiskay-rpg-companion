import { readFile } from 'node:fs/promises';
const route = await readFile(new URL('../app/api/world-boss/announce/route.js', import.meta.url), 'utf8');
const env = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
const checks = [
 ['event has idempotency eventId', route.includes('eventId: randomUUID()')],
 ['Bearer authentication retained', route.includes('authorization: `Bearer ${secret}`')],
 ['manifest resolution retained', route.includes('WHISKAY_TUNNEL_MANIFEST_URL')],
 ['webhook URL validation retained', route.includes("parsed.hostname.endsWith('.trycloudflare.com')")],
 ['tunnel env documented', env.includes('WHISKAY_TUNNEL_MANIFEST_URL')]
];
let failed=false; for(const [name,ok] of checks){ console.log(`${ok?'PASS':'FAIL'} ${name}`); if(!ok) failed=true; }
if(failed) process.exitCode=1;
