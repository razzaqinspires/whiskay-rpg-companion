import { verifyGameAccess } from '../../../../lib/accessToken.js';
export const dynamic='force-dynamic'; export const revalidate=0;
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store, max-age=0'}});
export async function POST(request){
 let body;try{body=await request.json()}catch{return json({error:'invalid_json'},400)}
 const playerId=String(body?.playerId||''),token=String(body?.accessToken||''),payload=body?.payload;
 if(!/^[a-f0-9]{32}$/i.test(playerId)||!verifyGameAccess(token,playerId))return json({error:'invalid_access'},401);
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return json({error:'invalid_payload'},400);
 const allowed=['name','level','xp','hp','maxHp','gold','gems','spiritShards','weapon','weaponPower','defense','nextXp','potions','floor','wins','losses','inventory','materials','checkpoint','position','completedFloors','unlockedFloor','pet'];
 const clean={};for(const key of allowed){if(payload[key]!==undefined)clean[key]=payload[key]}
 for(const key of ['level','xp','hp','maxHp','gold','gems','spiritShards','weaponPower','potions','floor','wins','losses'])if(clean[key]!==undefined&&(!Number.isFinite(Number(clean[key]))||Number(clean[key])<0))return json({error:'invalid_stat'},400);
 if(clean.inventory!==undefined&&(!Array.isArray(clean.inventory)||clean.inventory.length>200))return json({error:'invalid_inventory'},400);
 if(clean.completedFloors!==undefined&&(!Array.isArray(clean.completedFloors)||clean.completedFloors.length>100||clean.completedFloors.some(n=>!Number.isInteger(Number(n))||Number(n)<1||Number(n)>100)))return json({error:'invalid_completed_floors'},400);
 if(clean.unlockedFloor!==undefined&&(!Number.isInteger(Number(clean.unlockedFloor))||Number(clean.unlockedFloor)<1||Number(clean.unlockedFloor)>100))return json({error:'invalid_unlocked_floor'},400);
 if(clean.name!==undefined&&(typeof clean.name!=='string'||clean.name.length>48))return json({error:'invalid_name'},400);
 if(clean.materials!==undefined&&(!clean.materials||typeof clean.materials!=='object'||Array.isArray(clean.materials)))return json({error:'invalid_materials'},400);
 if(clean.pet!==undefined&&clean.pet!==null&&(typeof clean.pet!=='object'||Array.isArray(clean.pet)))return json({error:'invalid_pet'},400);
 const base=String(process.env.SUPABASE_URL||'').replace(/\/+$/,''),key=String(process.env.SUPABASE_SERVICE_ROLE_KEY||'');if(!base||!key)return json({error:'database_not_configured'},503);
 const headers={apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json'};
 try{
  const read=await fetch(`${base}/rest/v1/player_snapshots?player_id=eq.${encodeURIComponent(playerId)}&select=payload&limit=1`,{headers,cache:'no-store',signal:AbortSignal.timeout(7000)});if(!read.ok)return json({error:'database_read_failed'},502);
  const rows=await read.json(),existing=rows[0]?.payload&&typeof rows[0].payload==='object'?rows[0].payload:{};
  const merged={...existing,...clean,updatedAt:new Date().toISOString()};
  const write=await fetch(`${base}/rest/v1/player_snapshots?on_conflict=player_id`,{method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({player_id:playerId,payload:merged,updated_at:merged.updatedAt}),signal:AbortSignal.timeout(7000)});
  if(!write.ok)return json({error:'database_write_failed'},502);return json({ok:true,player:merged,updatedAt:merged.updatedAt});
 }catch(e){return json({error:e?.name==='TimeoutError'?'database_timeout':'database_unavailable'},502)}
}
