export const dynamic = 'force-dynamic';
export const revalidate = 0;
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store, max-age=0' } });
const bearer = r => (r.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
const validId = v => typeof v === 'string' && /^[a-f0-9]{32}$/i.test(v);
async function rpc(name, args) {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/+$/, ''), key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  if (!base || !key) return { status: 503, data: { ok: false, error: 'database_not_configured' } };
  try {
    const response = await fetch(`${base}/rest/v1/rpc/${name}`, { method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(8000), headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify(args) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { status: 502, data: { ok: false, error: 'transaction_failed' } };
    return { status: data?.ok ? 200 : (['insufficient_gold','already_in_guild','not_guild_leader','not_guild_member','guild_not_found','member_not_found'].includes(data?.error) ? 409 : 400), data };
  } catch (e) { return { status: 502, data: { ok: false, error: e?.name === 'TimeoutError' ? 'database_timeout' : 'database_unavailable' } }; }
}
export async function POST(request) {
  const expected = process.env.BOT_SYNC_TOKEN || process.env.DUNGEON_SYNC_TOKEN || '';
  if (!expected || bearer(request) !== expected) return json({ ok: false, error: 'unauthorized' }, 401);
  let body; try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid_json' }, 400); }
  const userId = body?.userId, action = String(body?.action || 'info');
  if (!validId(userId)) return json({ ok: false, error: 'invalid_user_id' }, 400);
  const actions = {
    create: () => typeof body.name === 'string' && body.name.trim().length >= 3 && body.name.length <= 32 ? rpc('guild_create', { p_player_id: userId, p_name: body.name.trim() }) : Promise.resolve({status:400,data:{ok:false,error:'invalid_guild_name'}}),
    join: () => typeof body.guildId === 'string' && body.guildId.length <= 64 ? rpc('guild_join', { p_player_id: userId, p_guild_id: body.guildId }) : Promise.resolve({status:400,data:{ok:false,error:'guild_not_found'}}),
    kick: () => validId(body.targetId) ? rpc('guild_kick', { p_player_id: userId, p_target_id: body.targetId }) : Promise.resolve({status:400,data:{ok:false,error:'invalid_user_id'}}),
    donate: () => Number.isSafeInteger(Number(body.amount)) && Number(body.amount) > 0 && Number(body.amount) <= 1000000 ? rpc('guild_donate', { p_player_id: userId, p_amount: Number(body.amount) }) : Promise.resolve({status:400,data:{ok:false,error:'invalid_trade'}}),
    info: () => rpc('guild_info', { p_player_id: userId }),
  };
  if (!actions[action]) return json({ ok: false, error: 'invalid_action' }, 400);
  const result = await actions[action](); return json(result.data, result.status);
}
