/** Stage 28: server-side validation helpers; persistence/transaction handled by trusted server DB layer. */
const ALLOWED = new Set(['player.snapshot.updated','player.position.updated','player.inventory.updated','player.combat.logged','world.event.updated','economy.transaction.created','pet.stage.updated','menfess.notification.created']);
export function validateStage28Event(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok:false, error:'event must be an object' };
  if (typeof input.event_id !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(input.event_id)) return { ok:false, error:'invalid event_id' };
  if (!ALLOWED.has(input.event_type)) return { ok:false, error:'unsupported event_type' };
  if (!input.payload || typeof input.payload !== 'object' || Array.isArray(input.payload)) return { ok:false, error:'payload must be an object' };
  if (input.payload.userId && typeof input.payload.userId !== 'string') return { ok:false, error:'invalid userId' };
  return { ok:true, event:{ event_id:input.event_id, event_type:input.event_type, payload:input.payload, occurred_at: typeof input.occurred_at === 'string' ? input.occurred_at : new Date().toISOString(), schema_version:1 } };
}
