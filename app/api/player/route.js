import { verifyGameAccess } from '../../../lib/accessToken.js';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' } });

export async function GET(request) {
  const urlParams = new URL(request.url).searchParams;
  const player = String(urlParams.get('player') || '').trim();
  const accessToken = String(urlParams.get('accessToken') || '');
  if (!/^[a-f0-9]{32}$/i.test(player) || !verifyGameAccess(accessToken, player)) {
    return json({ error: 'invalid_access' }, 401);
  }
  const base = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  if (!base || !key) return json({ error: 'database_not_configured', message: 'Supabase belum dikonfigurasi; server save tidak tersedia.' }, 503);
  const headers = { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' };
  try {
    const endpoint = `${base}/rest/v1/player_snapshots?player_id=eq.${encodeURIComponent(player)}&select=payload,updated_at&limit=1`;
    const response = await fetch(endpoint, { headers, cache: 'no-store', signal: AbortSignal.timeout(7000) });
    if (!response.ok) return json({ error: 'database_read_failed' }, 502);
    const rows = await response.json();
    let row = rows[0];
    // First successful signed visit registers an isolated server-side character.
    if (!row) {
      const now = new Date().toISOString();
      const initial = { level: 1, xp: 0, hp: 100, maxHp: 100, gold: 0, gems: 0, spiritShards: 0, weapon: 'Training Blade', weaponPower: 8, potions: 0, floor: 1, wins: 0, losses: 0, inventory: [], materials: {}, checkpoint: { x: 0, z: 0 }, registeredAt: now, updatedAt: now };
      const created = await fetch(`${base}/rest/v1/player_snapshots?on_conflict=player_id`, { method: 'POST', headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ player_id: player, payload: initial, updated_at: now }), cache: 'no-store', signal: AbortSignal.timeout(7000) });
      if (!created.ok) return json({ error: 'player_registration_failed' }, 502);
      const createdRows = await created.json().catch(() => []);
      row = createdRows[0] || { payload: initial, updated_at: now };
    }
    return json({ player: row.payload || null, updatedAt: row.updated_at || null, registered: Boolean(row.payload?.registeredAt) });
  } catch (error) {
    return json({ error: error?.name === 'TimeoutError' ? 'database_timeout' : 'database_unavailable' }, 502);
  }
}
