import { createHmac } from 'node:crypto';
export const dynamic = 'force-dynamic';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store, max-age=0',Pragma:'no-cache'}});
const b64url=value=>Buffer.from(value).toString('base64url');
export async function POST(request){
 let body; try{body=await request.json();}catch{return json({error:'invalid_json'},400);}
 const playerId=typeof body?.playerId==='string'?body.playerId.trim():'';
 if(!/^[a-f0-9]{32}$/i.test(playerId)) return json({error:'invalid_player_id'},400);
 const secret=process.env.SUPABASE_JWT_SECRET||'';
 if(!secret) return json({error:'realtime_not_configured'},503);
 const now=Math.floor(Date.now()/1000);
 const header=b64url(JSON.stringify({alg:'HS256',typ:'JWT'}));
 const payload=b64url(JSON.stringify({aud:'authenticated',role:'authenticated',sub:playerId,player_id:playerId,iat:now,exp:now+300}));
 const unsigned=`${header}.${payload}`;
 const signature=createHmac('sha256',secret).update(unsigned).digest('base64url');
 return json({token:`${unsigned}.${signature}`,expiresAt:(now+300)*1000});
}
