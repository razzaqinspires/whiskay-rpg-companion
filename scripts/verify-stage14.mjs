import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const adv=await readFile(new URL('../components/AdventureClient.jsx',import.meta.url),'utf8');
const fx=await readFile(new URL('../components/NextGenPostFX.jsx',import.meta.url),'utf8');
const events=await readFile(new URL('../components/WorldInteractions.jsx',import.meta.url),'utf8');
for(const [name,ok] of [
 ['mobile-gated bloom',fx.includes('UnrealBloomPass')&&adv.includes("enabled={quality==='high'}")],
 ['storm rare spawn',events.includes("weather === 'Rain'")&&events.includes('StormWraith')],
 ['3D fishing asset',events.includes('FishingSpot')&&events.includes('whiskay:fishing-start')],
 ['branching NPC choices',adv.includes('Branching NPC story')&&adv.includes('Tanya tentang badai')],
 ['fishing mini-game',adv.includes('Fishing mini game')&&adv.includes('Aether Fish')],
 ['existing minimap and gathering preserved',adv.includes('<MiniMap')&&adv.includes('setMaterials')],
]){assert.ok(ok,name);console.log('PASS',name)}
