import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = p => readFile(new URL(p, import.meta.url), 'utf8');
const [route, world, pet, overlay, audio] = await Promise.all([
  read('../app/api/player/pet/route.js'),
  read('../components/AdventureClient.jsx'),
  read('../components/VirtualPet.jsx'),
  read('../components/PetManagementOverlay.jsx'),
  read('../components/AudioDeck.jsx'),
]);
assert.match(route, /pet_food_not_in_inventory/);
assert.match(route, /hatch_cooldown/);
assert.match(world, /function World\(\{[^}]*mount\}\)/);
assert.match(world, /mount=\{mount\}/);
assert.match(world, /isNight && <SpiritSeed/);
assert.match(world, /key=\{`night-seed-/);
assert.match(world, /NightWisp/);
assert.match(pet, /THREE\.MathUtils\.damp/);
assert.match(overlay, /COMPANION/);
assert.match(overlay, /whiskay:sfx/);
assert.match(audio, /pet-feed/);
console.log('Stage 20 web source checks passed.');
