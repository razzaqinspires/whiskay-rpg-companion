import fs from 'node:fs';
const source=fs.readFileSync('components/WorldManager.jsx','utf8');
const checks=[['render radius configurable',/renderRadius=1/.test(source)],['radius bounded to 1..4',/Math\.min\(4/.test(source)],['tree density configurable',/treeDensity=8/.test(source)],['telemetry event emitted',/whiskay:world-telemetry/.test(source)],['streaming stats exported',/export function getWorldStreamingStats/.test(source)],['resource marker radius parameterized',/getWorldResourceMarkers\(position = \{x:0,z:0\}, renderRadius = 1\)/.test(source)]];
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
if(checks.some(([,ok])=>!ok))process.exitCode=1;
