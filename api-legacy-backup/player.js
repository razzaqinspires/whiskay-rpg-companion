export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET') return res.status(405).json({error:'method_not_allowed'});
 const player=String(req.query.player||'').trim();
 if(!player||player.length>180) return res.status(400).json({error:'player_required'});
 const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key) return res.status(503).json({error:'dashboard_not_connected',message:'Supabase belum dikonfigurasi. Data demo tetap dapat dilihat.'});
 try{const r=await fetch(`${url}/rest/v1/player_snapshots?player_id=eq.${encodeURIComponent(player)}&select=payload,updated_at&limit=1`,{headers:{apikey:key,authorization:`Bearer ${key}`}});if(!r.ok)throw new Error('database_query_failed');const rows=await r.json();return res.status(200).json({player:rows[0]?.payload||null,updatedAt:rows[0]?.updated_at||null});}catch{return res.status(502).json({error:'database_unavailable'});}
}