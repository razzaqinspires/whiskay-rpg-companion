export const dynamic = 'force-dynamic';
export const revalidate = 0;

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' },
});
const getBearer = request => (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();

export async function POST(request) {
  const expected = process.env.BOT_SYNC_TOKEN || process.env.DUNGEON_SYNC_TOKEN || '';
  if (!expected || getBearer(request) !== expected) return json({ ok: false, error: 'unauthorized' }, 401);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid_json' }, 400); }
  const userId = typeof body?.userId === 'string' ? body.userId.trim() : '';
  const item = typeof body?.item === 'string' ? body.item.trim().toLowerCase() : '';
  if (!/^[a-f0-9]{32}$/i.test(userId)) return json({ ok: false, error: 'invalid_user_id' }, 400);
  if (!['potion', 'potion-small', 'small-potion', 'pet-food'].includes(item)) return json({ ok: false, error: 'item_not_available' }, 400);
  const itemId = item === 'pet-food' ? 'pet-food' : 'potion-small';

  const base = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) return json({ ok: false, error: 'database_not_configured' }, 503);

  try {
    const response = await fetch(`${base}/rest/v1/rpc/buy_player_item`, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(7000),
      headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ p_player_id: userId, p_item_id: itemId }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return json({ ok: false, error: 'transaction_failed' }, 502);
    if (result?.error === 'insufficient_gold') return json({ ok: false, error: 'insufficient_gold', gold: result.gold, price: result.price }, 409);
    if (!result?.ok) return json({ ok: false, error: 'transaction_failed' }, 502);
    return json(result);
  } catch (error) {
    return json({ ok: false, error: error?.name === 'TimeoutError' ? 'database_timeout' : 'database_unavailable' }, 502);
  }
}
