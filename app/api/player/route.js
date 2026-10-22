export const dynamic = 'force-dynamic';
export async function GET(request){
  const player=new URL(request.url).searchParams.get('player')?.trim()||'';
  if(!player||player.length>180)return Response.json({error:'player_required'},{status:400,headers:{'Cache-Control':'no-store'}});
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return Response.json({error:'dashboard_not_connected',message:'Supabase belum dikonfigurasi; server save tidak tersedia.'},{status:503,headers:{'Cache-Control':'no-store'}});
  try{const r=await fetch(`${url.replace(/\/$/,'')}/rest/v1/player_snapshots?player_id=eq.${encodeURIComponent(player)}&select=payload,updated_at&limit=1`,{headers:{apikey:key,authorization:`Bearer ${key}`},cache:'no-store'});if(!r.ok)throw new Error('query failed');const rows=await r.json();return Response.json({player:rows[0]?.payload||null,updatedAt:rows[0]?.updated_at||null},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'database_unavailable'},{status:502,headers:{'Cache-Control':'no-store'}});}
}
