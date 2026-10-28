import assert from 'node:assert/strict';
import { validateStage28Event } from '../lib/stage28/event-processor.mjs';
const valid = { event_id:'event_12345678', event_type:'player.snapshot.updated', payload:{ userId:'player-1' }, occurred_at:'2026-10-29T00:00:00.000Z' };
assert.equal(validateStage28Event(valid).ok, true);
assert.equal(validateStage28Event({...valid,event_type:'admin.exec'}).ok, false);
assert.equal(validateStage28Event({...valid,event_id:'x'}).ok, false);
assert.equal(validateStage28Event({...valid,payload:[]}).ok, false);
assert.equal(validateStage28Event(null).ok, false);
console.log('Stage 28 event contract: 5/5 passed');
