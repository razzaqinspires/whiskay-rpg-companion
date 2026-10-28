import assert from 'node:assert/strict';
import { validateStage26Event, stage26EventTypes } from '../lib/stage26/event-contract.mjs';
const good = { eventId: 'evt_stage26_001', type: 'world.weather.updated', timestamp: Date.now(), payload: { weather: 'rain' } };
assert.equal(validateStage26Event(good).ok, true);
assert.equal(validateStage26Event({ ...good, type: 'admin.exec' }).ok, false);
assert.equal(validateStage26Event({ ...good, timestamp: 1 }).error, 'stale_timestamp');
assert.equal(validateStage26Event(null).ok, false);
assert.ok(stage26EventTypes.length >= 5);
console.log('Stage 26 event contract: 5/5 checks passed');
