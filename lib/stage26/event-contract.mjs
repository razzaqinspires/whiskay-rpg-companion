/** Shared shape contract for authenticated Bot -> Web events. Validation only; callers must verify auth/signature first. */
const ALLOWED_TYPES = new Set(['world.weather.updated', 'player.pet.updated', 'economy.market.updated', 'menfess.notification', 'system.health.updated']);
export function validateStage26Event(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'invalid_payload' };
  if (typeof input.eventId !== 'string' || input.eventId.length < 8 || input.eventId.length > 128) return { ok: false, error: 'invalid_event_id' };
  if (!ALLOWED_TYPES.has(input.type)) return { ok: false, error: 'unsupported_event_type' };
  if (!Number.isFinite(input.timestamp) || Math.abs(Date.now() - input.timestamp) > 5 * 60 * 1000) return { ok: false, error: 'stale_timestamp' };
  if (typeof input.payload !== 'object' || input.payload === null || Array.isArray(input.payload)) return { ok: false, error: 'invalid_event_payload' };
  return { ok: true, value: { eventId: input.eventId, type: input.type, timestamp: input.timestamp, payload: input.payload } };
}
export const stage26EventTypes = Object.freeze([...ALLOWED_TYPES]);
