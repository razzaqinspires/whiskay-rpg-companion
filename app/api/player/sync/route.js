// Next.js App Router endpoint for WhatsApp bot <-> WHISKAY RPG player state.
// Production storage: Supabase REST table `player_snapshots` (player_id TEXT PRIMARY KEY, payload JSONB).
// Without Supabase env vars, this uses a process-local Map mock. Mock data is NOT durable on serverless hosts.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const memoryStore = globalThis.__WHISKAY_PLAYER_SYNC_MOCK__ ||
  (globalThis.__WHISKAY_PLAYER_SYNC_MOCK__ = new Map());

const json = (data, status = 200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' },
});

function authorize(request) {
  const expected = process.env.PLAYER_SYNC_TOKEN || process.env.BOT_SYNC_TOKEN || process.env.DUNGEON_SYNC_TOKEN;
  const supplied = (request.headers.get('authorization') || '').replace(/^Bearer\\s+/i, '').trim();
  // Never expose this endpoint publicly in production without a token.
  return Boolean(expected && supplied && supplied === expected);
}

function normalizePlayerId(value) {
  if (typeof value !== 'string') return '';
  const id = value.trim();
  // Supports phone numbers (+country code, digits) and WhatsApp JIDs.
  if (id.length < 5 || id.length > 180) return '';
  if (/^[+]?\\d[\\d\\s().-]{3,24}$/.test(id)) return id.replace(/[\\s().-]/g, '').replace(/^\\+/, '');
  if (/^\\d{5,24}@s\\.whatsapp\\.net$/.test(id)) return id;
  return '';
}

function sanitizeState(input, previous = {}) {
  const state = { ...previous };
  if (input.gold !== undefined) {
    const n = Number(input.gold);
    if (!Number.isFinite(n) || n < 0) throw new Error('invalid_gold');
    state.gold = Math.floor(Math.min(n, 2_000_000_000));
  }
  if (input.level !== undefined) {
    const n = Number(input.level);
    if (!Number.isInteger(n) || n < 1 || n > 10000) throw new Error('invalid_level');
    state.level = n;
  }
  if (input.floor !== undefined) {
    const n = Number(input.floor);
    if (!Number.isInteger(n) || n < 1 || n > 10000) throw new Error('invalid_floor');
    state.floor = n;
  }
  if (input.equipment !== undefined) {
    if (!input.equipment || typeof input.equipment !== 'object' || Array.isArray(input.equipment)) throw new Error('invalid_equipment');
    const entries = Object.entries(input.equipment);
    if (entries.length > 24 || entries.some(([k,v]) => k.length > 40 || typeof v !== 'string' || v.length > 120)) throw new Error('invalid_equipment');
    state.equipment = Object.fromEntries(entries);
  }
  return state;
}

async function readSupabase(playerId) {
  const base = process.env.SUPABASE_URL?.replace(/\\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return { configured: false, player: memoryStore.get(playerId) || null };
  const r = await fetch(`${base}/rest/v1/player_snapshots?player_id=eq.${encodeURIComponent(playerId)}&select=payload,updated_at&limit=1`, {
    headers: { apikey: key, authorization: `Bearer ${key}` }, cache: 'no-store',
  });
  if (!r.ok) throw new Error('database_read_failed');
  const rows = await r.json();
  return { configured: true, player: rows[0] ? { ...rows[0].payload, updatedAt: rows[0].updated_at } : null };
}

async function writeSupabase(playerId, payload) {
  const base = process.env.SUPABASE_URL?.replace(/\\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const updatedAt = new Date().toISOString();
  const row = { player_id: playerId, payload, updated_at: updatedAt };
  if (!base || !key) {
    memoryStore.set(playerId, { ...payload, updatedAt });
    return { storage: 'memory-mock', updatedAt, durable: false };
  }
  const r = await fetch(`${base}/rest/v1/player_snapshots?on_conflict=player_id`, {
    method: 'POST',
    headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error('database_write_failed');
  return { storage: 'supabase', updatedAt, durable: true };
}

export async function GET(request) {
  if (!authorize(request)) return json({ error: 'unauthorized', message: 'Kirim Authorization: Bearer <PLAYER_SYNC_TOKEN>.' }, 401);
  const url = new URL(request.url);
  const playerId = normalizePlayerId(url.searchParams.get('phone') || url.searchParams.get('playerId') || '');
  if (!playerId) return json({ error: 'invalid_player_id', message: 'Gunakan nomor WhatsApp, mis. 628123456789, atau JID WhatsApp.' }, 400);
  try {
    const result = await readSupabase(playerId);
    return json({ ok: true, playerId, player: result.player, found: Boolean(result.player), storage: result.configured ? 'supabase' : 'memory-mock', durable: result.configured });
  } catch (error) {
    return json({ error: 'database_unavailable', detail: error.message }, 502);
  }
}

export async function POST(request) {
  if (!authorize(request)) return json({ error: 'unauthorized', message: 'Kirim Authorization: Bearer <PLAYER_SYNC_TOKEN>.' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const playerId = normalizePlayerId(body?.phone || body?.playerId || body?.whatsappId || '');
  if (!playerId) return json({ error: 'invalid_player_id' }, 400);
  const patch = body?.player && typeof body.player === 'object' && !Array.isArray(body.player) ? body.player : body;
  try {
    const current = await readSupabase(playerId);
    const previous = current.player || {};
    const state = sanitizeState(patch, previous);
    const result = await writeSupabase(playerId, state);
    return json({ ok: true, playerId, player: state, ...result }, 200);
  } catch (error) {
    const invalid = /^invalid_/.test(error.message);
    return json({ error: invalid ? error.message : 'database_unavailable', detail: invalid ? undefined : error.message }, invalid ? 400 : 502);
  }
}
