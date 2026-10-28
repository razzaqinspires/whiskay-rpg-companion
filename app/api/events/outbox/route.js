import { validateDurableEvent } from '../../../../lib/stage27/durable-event-contract.mjs';
export const dynamic='force-dynamic'; export const revalidate=0;
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const bearer=(r)=>(r.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
export async function POST(request){
 const secret=process.env.BOT_SYNC_TOKEN||process.env.DUNGEON_SYNC_TOKEN||'';
 if(!secret||bearer(request)!==secret)return json({error:'unauthorized'},401);
 let body;try{body=await request.json()}catch{return json({error:'invalid_json'},400)}
 const checked=validateDurableEvent(body);if(!checked.ok)return json({error:checked.error},400);
 const base=process.env.SUPABASE_URL?.replace(/\/+$/,'');const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!key)return json({error:'database_not_configured'},503);
 try{const response=await fetch(`${base}/rest/v1/event_outbox?on_conflict=event_id`,{method:'POST',headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({event_id:checked.value.eventId,event_type:checked.value.type,payload:checked.value.payload,occurred_at:new Date(checked.value.timestamp).toISOString(),status:'pending'}),signal:AbortSignal.timeout(7000)});if(!response.ok)return json({error:'database_write_failed'},502);return json({ok:true,eventId:checked.value.eventId,accepted:true},202)}catch(error){return json({error:error?.name==='TimeoutError'?'database_timeout':'database_unavailable'},502)}
}
