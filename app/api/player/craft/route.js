export const dynamic = 'force-dynamic';
export const revalidate = 0;
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' } });
const bearer = request => (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
async function parseBody(request) { try { return await request.json(); } catch { return null; } }
function authorized(request) { const expected = process.env.BOT_SYNC_TOKEN || process.env.DUNGEON_SYNC_TOKEN || ''; return Boolean(expected && bearer(request) && bearer(request) === expected); }
function dbConfig() { return { base: String(process.env.SUPABASE_URL || '').replace(/\/+$/, ''), key: String(process.env.SUPABASE_SERVICE_ROLE_KEY || '') }; }
async function rpc(name, args) {
 const {base,key}=dbConfig(); if(!base||!key) return {response:null,result:{ok:false,error:'database_not_configured'}};
 try { const response=await fetch(`${base}/rest/v1/rpc/${name}`, { method:'POST', cache:'no-store', signal:AbortSignal.timeout(8000), headers:{ apikey:key, authorization:`Bearer ${key}`, 'content-type':'application/json' }, body:JSON.stringify(args) }); const result=await response.json().catch(()=>({})); return {response,result}; }
 catch(error) { return {response:null,result:{ok:false,error:error?.name==='TimeoutError'?'database_timeout':'database_unavailable'}}; }
}
function validId(value) { return typeof value === 'string' && /^[a-f0-9]{32}$/i.test(value); }
function mapResult(response, result) { if(!response) return json(result, result.error==='database_not_configured'?503:502); if(!response.ok) return json({ok:false,error:'transaction_failed'},502); if(result?.ok) return json(result); const status = result?.error==='insufficient_gold'||result?.error==='insufficient_materials'||result?.error==='insufficient_item'||result?.error==='recipient_not_found'?409:result?.error==='invalid_user_id'||result?.error==='invalid_trade'||result?.error==='recipe_not_found'||result?.error==='item_not_available'?400:502; return json(result,status); }

export async function POST(request) {
 if(!authorized(request)) return json({ok:false,error:'unauthorized'},401);
 const body=await parseBody(request); if(!body) return json({ok:false,error:'invalid_json'},400);
 const userId=body.userId; const item=String(body.item||'').toLowerCase();
 if(!validId(userId)) return json({ok:false,error:'invalid_user_id'},400);
 if(!['potion','small-potion','potion-small'].includes(item)) return json({ok:false,error:'recipe_not_found'},400);
 const {response,result}=await rpc('craft_player_item',{p_player_id:userId,p_item_id:'potion-small'}); return mapResult(response,result);
}
