import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const world = await readFile(new URL('../components/WorldManager.jsx', import.meta.url), 'utf8');
const destructible = await readFile(new URL('../components/DestructibleObject.jsx', import.meta.url), 'utf8');
const minimap = await readFile(new URL('../components/MiniMap.jsx', import.meta.url), 'utf8');
const adventure = await readFile(new URL('../components/AdventureClient.jsx', import.meta.url), 'utf8');
for (const [label, ok] of [
 ['day/night lighting', world.includes('DayNightLighting') && world.includes('directionalLight')],
 ['rain particles', world.includes('RainParticles')],
 ['destructible resources', world.includes('DestructibleObject') && destructible.includes('whiskay:resource-gathered')],
 ['attack token integration', adventure.includes('attackToken={actionState.attack}')],
 ['material inventory feedback', adventure.includes('setMaterials') && adventure.includes('whiskay:resource-gathered')],
 ['minimap component', minimap.includes('Adventure minimap') && adventure.includes('<MiniMap')],
 ['boss and resource markers', minimap.includes('World Boss') && minimap.includes('nearResources')],
]) { assert.ok(ok, label); console.log('PASS', label); }
