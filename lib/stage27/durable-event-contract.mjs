export const DURABLE_EVENT_TYPES = Object.freeze(['player.snapshot.updated','player.position.updated','player.inventory.updated','player.combat.logged','world.event.updated','economy.transaction.created','pet.stage.updated','menfess.notification.created']);
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
export function validateDurableEvent(input, now = Date.now()) {
 if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok:false,error:'invalid_event' };
 if (typeof input.eventId !== 'string' || !ID.test(input.eventId)) return { ok:false,error:'invalid_event_id' };
 if (!DURABLE_EVENT_TYPES.includes(input.type)) return { ok:false,error:'event_type_not_allowed' };
 if (!Number.isFinite(input.timestamp) || Math.abs(now-input.timestamp)>300000) return { ok:false,error:'invalid_timestamp' };
 if (!input.payload || typeof input.payload !== 'object' || Array.isArray(input.payload)) return { ok:false,error:'invalid_payload' };
 if (JSON.stringify(input.payload).length>64000) return { ok:false,error:'payload_too_large' };
 return {ok:true,value:{eventId:input.eventId,type:input.type,timestamp:input.timestamp,payload:input.payload}};
}
