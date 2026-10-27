export const dynamic = 'force-dynamic';
export const revalidate = 0;
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' } });
const bearer = request => (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : min));
const speciesPool = [{ species: 'Slime', name: 'Mochi', color: '#70e6ca' }, { species: 'Peri', name: 'Lumi', color: '#bd9cff' }, { species: 'Naga Mini', name: 'Kiro', color: '#f0b96b' }];
function applyPetDecay(pet) {
  if (!pet) return null;
  const now = Date.now(), last = Number(pet.lastTickAt || now), elapsedMinutes = Math.max(0, Math.min(60 * 24 * 30, (now - last) / 60000));
  return { ...pet, hunger: Math.round(clamp(Number(pet.hunger ?? 100) - elapsedMinutes * 0.12, 0, 100)), energy: Math.round(clamp(Number(pet.energy ?? 100) - elapsedMinutes * 0.035, 0, 100)), lastTickAt: now, updatedAt: now };
}
async function supabaseSnapshot(userId, method = 'GET', payload) {
  const base = (process.env.SUPABASE_URL || '').replace(/\/+$/, ''), key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) return { error: 'database_not_configured' };
  const headers = { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' };
  try {
    if (method === 'GET') {
      const r = await fetch(`${base}/rest/v1/player_snapshots?player_id=eq.${encodeURIComponent(userId)}&select=payload,updated_at&limit=1`, { headers, cache: 'no-store', signal: AbortSignal.timeout(7000) });
      if (!r.ok) return { error: 'database_read_failed' };
      const rows = await r.json(); return { payload: rows[0]?.payload && typeof rows[0].payload === 'object' ? rows[0].payload : {}, updatedAt: rows[0]?.updated_at || null };
    }
    const merged = { ...payload, updatedAt: new Date().toISOString() };
    const r = await fetch(`${base}/rest/v1/player_snapshots?on_conflict=player_id`, { method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ player_id: userId, payload: merged, updated_at: merged.updatedAt }), cache: 'no-store', signal: AbortSignal.timeout(7000) });
    if (!r.ok) return { error: 'database_write_failed' };
    return { payload: merged, updatedAt: merged.updatedAt };
  } catch (error) { return { error: error?.name === 'TimeoutError' ? 'database_timeout' : 'database_unavailable' }; }
}
export async function POST(request) {
  const expected = String(process.env.BOT_SYNC_TOKEN || process.env.DUNGEON_SYNC_TOKEN || '').trim();
  if (!expected || bearer(request) !== expected) return json({ ok: false, error: 'unauthorized' }, 401);
  let body; try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid_json' }, 400); }
  const userId = String(body?.userId || '').trim(), action = String(body?.action || '').trim().toLowerCase();
  if (!/^[a-f0-9]{32}$/i.test(userId) || !['hatch', 'feed', 'status'].includes(action)) return json({ ok: false, error: 'invalid_request' }, 400);
  const read = await supabaseSnapshot(userId);
  if (read.error) return json({ ok: false, error: read.error }, read.error === 'database_not_configured' ? 503 : 502);
  const payload = { ...read.payload };
  payload.inventory = Array.isArray(payload.inventory) ? payload.inventory.map(x => ({ ...x })) : [];
  let pet = applyPetDecay(payload.pet || null), itemName = '';
  if (action === 'hatch') {
    if (pet && pet.active !== false) return json({ ok: false, error: 'pet_already_active', pet }, 409);
    const cooldownUntil = Number(payload.petHatchCooldownUntil || 0);
    if (cooldownUntil > Date.now()) return json({ ok: false, error: 'hatch_cooldown', nextHatchAt: cooldownUntil }, 409);
    const seed = Number.parseInt(userId.slice(-6), 16) + Math.floor(Date.now() / 86400000);
    const species = speciesPool[Math.abs(seed) % speciesPool.length];
    pet = { ...species, hunger: 100, energy: 100, active: true, createdAt: Date.now(), updatedAt: Date.now(), lastTickAt: Date.now(), passiveBuff: { movementSpeed: 0.08, healthRegenPerMinute: 0.2 } };
    payload.petHatchCooldownUntil = Date.now() + 12 * 60 * 60 * 1000;
  } else if (action === 'feed') {
    if (!pet || pet.active === false) return json({ ok: false, error: 'pet_not_found' }, 404);
    const requested = String(body?.itemId || 'pet-food').trim().toLowerCase();
    const allowed = new Set(['pet-food', 'slime-jelly', 'monster-meat', 'berry', 'aether-berry', 'pet_snack', 'pet-snack']);
    if (!allowed.has(requested)) return json({ ok: false, error: 'invalid_food_item' }, 400);
    const idx = payload.inventory.findIndex(item => String(item?.id || item?.itemId || item?.name || '').trim().toLowerCase() === requested && Number(item?.quantity ?? 1) > 0);
    if (idx < 0) return json({ ok: false, error: 'pet_food_not_in_inventory', itemId: requested }, 409);
    const item = payload.inventory[idx]; itemName = String(item.name || item.id || requested);
    const quantity = Number(item.quantity ?? 1);
    if (quantity > 1) item.quantity = quantity - 1; else payload.inventory.splice(idx, 1);
    pet.hunger = Math.round(clamp(Number(pet.hunger ?? 100) + 35, 0, 100));
    pet.energy = Math.round(clamp(Number(pet.energy ?? 100) + 12, 0, 100));
    pet.lastFedAt = Date.now(); pet.updatedAt = Date.now(); pet.lastTickAt = Date.now();
  }
  if (action === 'status' && !pet) return json({ ok: true, pet: null, player: payload });
  if (pet) payload.pet = pet;
  payload.petSyncedAt = new Date().toISOString();
  const write = await supabaseSnapshot(userId, 'POST', payload);
  if (write.error) return json({ ok: false, error: write.error }, 502);
  return json({ ok: true, action, pet, itemName: itemName || undefined, player: write.payload, updatedAt: write.updatedAt });
}
