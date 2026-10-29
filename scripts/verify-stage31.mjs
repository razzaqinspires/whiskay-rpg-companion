import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseBoundedInteger, parseFiniteCoordinate } from '../lib/stage30/access-policy.mjs';

assert.equal(parseBoundedInteger('25', { min: 1, max: 100 }), 25);
assert.equal(parseBoundedInteger('1.5', { min: 0, max: 10 }), null);
assert.equal(parseBoundedInteger(Number.MAX_SAFE_INTEGER + 1), null);
assert.equal(parseBoundedInteger('1000000001', { min: 0, max: 1000000000 }), null);
assert.equal(parseFiniteCoordinate('-100000'), -100000);
assert.equal(parseFiniteCoordinate('100001'), null);
const route = await readFile(new URL('../app/api/player/update/route.js', import.meta.url), 'utf8');
assert.match(route, /parseBoundedInteger/);
assert.match(route, /invalid_stat/);
assert.match(route, /invalid_position/);
assert.match(route, /verifyGameAccess\(token,playerId\)/);
const readRoute = await readFile(new URL('../app/api/player/route.js', import.meta.url), 'utf8');
assert.match(readRoute, /verifyGameAccess\(accessToken, player\)/);
console.log('Stage 31 web verification passed: bounded RPG stats, coordinate validation and signed player access.');
