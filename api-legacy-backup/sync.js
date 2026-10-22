export default async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
 const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
 if(!process.env.BOT_SYNC_TOKEN||token!==process.env.BOT_SYNC_TOKEN) return res.status(401).json({error:'unauthorized'});
 const {playerId,payload}=req.body||{};
 if(typeof playerId!=='string'||!playerId.trim()||playerId.length>180||!payload||typeof payload!=='object'||Array.isArray(payload))return res.status(400).json({error:'invalid_payload'});
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return res.status(503).json({error:'database_not_configured'});
 try{
  const existingRes=await fetch(`${url}/rest/v1/player_snapshots?player_id=eq.${encodeURIComponent(playerId)}&select=payload&limit=1`,{headers:{apikey:key,authorization:`Bearer ${key}`}});
  let existing={};if(existingRes.ok){const rows=await existingRes.json();existing=rows[0]?.payload||{};}
  const merged={...existing,...payload};
  if(!Array.isArray(payload.inventory)&&Array.isArray(existing.inventory))merged.inventory=existing.inventory;
  const row={player_id:playerId,payload:merged,updated_at:new Date().toISOString()};
  const r=await fetch(`${url}/rest/v1/player_snapshots?on_conflict=player_id`,{method:'POST',headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json',prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(row)});
  if(!r.ok)return res.status(502).json({error:'database_write_failed'});return res.status(200).json({ok:true,updatedAt:row.updated_at});
 }catch{return res.status(502).json({error:'database_unavailable'});}
}