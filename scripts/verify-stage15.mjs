import { readFile } from 'node:fs/promises';
const checks=[];const check=(n,v)=>{if(!v)throw new Error(`FAIL: ${n}`);checks.push(n)};
const adventure=await readFile(new URL('../components/AdventureClient.jsx',import.meta.url),'utf8');
check('patrol movement exists',adventure.includes('home.current.x+Math.cos(t)*1.8'));
check('water shader has animated uniform',adventure.includes('uWhiskayTime')&&adventure.includes('vWhiskayUv'));
check('SpiritSeed loot event exists',adventure.includes('whiskay:spirit-seed-gathered'));
check('expanded camera/world bounds',adventure.includes('Math.max(-60,Math.min(60,p.x+dx))')&&adventure.includes('args={[160,160]}'));
check('inventory HUD shows Spirit Seed',adventure.includes("SEED {materials['Spirit Seed']||0}"));
console.log(`Stage 15 verification: ${checks.length}/${checks.length} passed`);
