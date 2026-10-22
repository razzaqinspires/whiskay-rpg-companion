import { createHmac, timingSafeEqual } from 'node:crypto';
export function verifyGameAccess(token, playerId) {
  const secret = String(process.env.BOT_SYNC_TOKEN || process.env.DUNGEON_SYNC_TOKEN || '').trim();
  if (!secret || typeof token !== 'string' || token.length > 2048) return false;
  const parts = token.split('.'); if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = createHmac('sha256', secret).update(payload).digest();
  let supplied; try { supplied = Buffer.from(signature, 'base64url'); } catch { return false; }
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
  try { const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); return typeof data.player === 'string' && data.player === playerId && Number(data.exp) > Math.floor(Date.now()/1000); } catch { return false; }
}
