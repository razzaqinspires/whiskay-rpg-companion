import { randomUUID } from 'node:crypto';
import { verifyGameAccess } from '../../../../lib/accessToken.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store' }
});
const WEBHOOK_PATH = '/webhooks/world-boss';
const DEFAULT_MANIFEST_URL = 'https://raw.githubusercontent.com/razzaqinspires/whiskay-rpg-companion/main/.runtime/whiskay-tunnel.json';

function validWebhookUrl(value) {
  try {
    const parsed = new URL(String(value || '').trim());
    return parsed.protocol === 'https:' &&
      parsed.hostname.endsWith('.trycloudflare.com') &&
      parsed.pathname === WEBHOOK_PATH &&
      !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

async function resolveBotWebhookUrl() {
  // Optional stable GitHub raw URL points to a public manifest containing only
  // the temporary endpoint (never the secret). This lets Vercel follow URL
  // rotations without redeploying when GitHub manifest sync is enabled.
  const manifestUrl = String(process.env.WHISKAY_TUNNEL_MANIFEST_URL || '').trim();
  if (manifestUrl) {
    try {
      const response = await fetch(manifestUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
        headers: { accept: 'application/json' }
      });
      if (response.ok) {
        const manifest = await response.json();
        const candidate = String(manifest?.webhookUrl || '');
        if (validWebhookUrl(candidate)) return candidate;
      }
    } catch {
      // Fall back to the explicitly configured environment variable.
    }
  }
  const configured = String(process.env.WHISKAY_BOT_WEBHOOK_URL || '').trim();
  return validWebhookUrl(configured) ? configured : '';
}

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'invalid_json' }, 400); }

  const playerId = String(body?.playerId || '');
  const accessToken = String(body?.accessToken || '');
  if (!/^[a-f0-9]{32}$/i.test(playerId) || !verifyGameAccess(accessToken, playerId)) {
    return json({ ok: false, error: 'unauthorized' }, 401);
  }

  const secret = String(
    process.env.WHISKAY_BOSS_WEBHOOK_SECRET ||
    process.env.BOT_SYNC_TOKEN ||
    process.env.DUNGEON_SYNC_TOKEN ||
    ''
  ).trim();
  if (!secret) return json({ ok: false, error: 'webhook_secret_not_configured' }, 503);

  const url = await resolveBotWebhookUrl();
  if (!url) return json({ ok: false, error: 'bot_webhook_not_configured' }, 503);

  try {
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      headers: {
        authorization: `Bearer ${secret}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ event: 'world_boss_spawned', eventId: randomUUID(), bossName: String(body?.bossName || 'WORLD BOSS').slice(0, 80), floor: Number.isFinite(Number(body?.floor)) ? Number(body.floor) : undefined, at: new Date().toISOString() })
    });
    const data = await response.json().catch(() => ({}));
    return json({ ok: response.ok, ...data }, response.ok ? 200 : 502);
  } catch {
    return json({ ok: false, error: 'bot_webhook_unavailable' }, 502);
  }
}
