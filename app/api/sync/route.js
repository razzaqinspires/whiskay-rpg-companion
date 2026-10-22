export const dynamic = 'force-dynamic';
export const revalidate = 0;

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' },
});

function bearer(request) {
  return (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
}

export async function POST(request) {
  const expected = process.env.BOT_SYNC_TOKEN || process.env.DUNGEON_SYNC_TOKEN || '';
  if (!expected || !bearer(request) || bearer(request) !== expected) {
    return json({ error: 'unauthorized' }, 401);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const playerId = body?.playerId;
  const payload = body?.payload;
  if (typeof playerId !== 'string' || !playerId.trim() || playerId.length > 180 ||
      !payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return json({ error: 'invalid_payload' }, 400);
  }

  const base = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return json({ error: 'database_not_configured' }, 503);

  const headers = {
    apikey: key,
    authorization: `Bearer ${key}`,
    'content-type': 'application/json',
  };

  try {
    const read = await fetch(
      `${base}/rest/v1/player_snapshots?player_id=eq.${encodeURIComponent(playerId)}&select=payload&limit=1`,
      { headers, cache: 'no-store', signal: AbortSignal.timeout(6000) },
    );
    if (!read.ok) return json({ error: 'database_read_failed' }, 502);
    const rows = await read.json();
    const existing = rows[0]?.payload && typeof rows[0].payload === 'object' &&
      !Array.isArray(rows[0].payload) ? rows[0].payload : {};
    const merged = { ...existing, ...payload };
    // A partial update must not erase a previously saved inventory.
    if (!Array.isArray(payload.inventory) && Array.isArray(existing.inventory)) {
      merged.inventory = existing.inventory;
    }

    const updatedAt = new Date().toISOString();
    const write = await fetch(`${base}/rest/v1/player_snapshots?on_conflict=player_id`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ player_id: playerId, payload: merged, updated_at: updatedAt }),
      signal: AbortSignal.timeout(6000),
    });
    if (!write.ok) return json({ error: 'database_write_failed' }, 502);
    return json({ ok: true, updatedAt });
  } catch (error) {
    return json({ error: error?.name === 'TimeoutError' ? 'database_timeout' : 'database_unavailable' }, 502);
  }
}
