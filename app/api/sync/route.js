export const dynamic = 'force-dynamic';
export async function POST(request){
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
  const expectedToken=process.env.BOT_SYNC_TOKEN||process.env.DUNGEON_SYNC_TOKEN;if(!expectedToken||token!==expectedToken)return Response.json({error:'unauthorized'},{status:401});
  let body;try{body=await request.json()}catch{return Response.json({error:'invalid_json'},{status:400});}
  const {playerId,payload}=body||{};
  if(typeof playerId!=='string'||!playerId.trim()||playerId.length>180||!payload||typeof payload!=='object'||Array.isArray(payload))return Response.json({error:'invalid_payload'},{status:400});
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return Response.json({error:'database_not_configured'},{status:503});
  try{const base=url.replace(/\/$/,'');const headers={apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json'};const q=await fetch(`${base}/rest/v1/player_snapshots?player_id=eq.${encodeURIComponent(playerId)}&select=payload&limit=1`,{headers,cache:'no-store'});let existing={};if(q.ok){const rows=await q.json();existing=rows[0]?.payload||{};}const merged={...existing,...payload};if(!Array.isArray(payload.inventory)&&Array.isArray(existing.inventory))merged.inventory=existing.inventory;const row={player_id:playerId,payload:merged,updated_at:new Date().toISOString()};const r=await fetch(`${base}/rest/v1/player_snapshots?on_conflict=player_id`,{method:'POST',headers:{...headers,prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(row)});if(!r.ok)return Response.json({error:'database_write_failed'},{status:502});return Response.json({ok:true,updatedAt:row.updated_at});}catch{return Response.json({error:'database_unavailable'},{status:502});}
}
