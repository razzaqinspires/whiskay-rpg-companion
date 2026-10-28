# Stage 22 — RPG to Bot Reliability

The World Boss announce route now includes a unique `eventId` so the bot can safely deduplicate retries. It retains game-access validation, Bearer authentication, strict HTTPS Quick Tunnel URL validation, manifest lookup and fallback to `WHISKAY_BOT_WEBHOOK_URL`.

Set `WHISKAY_TUNNEL_MANIFEST_URL` in Vercel to the public raw URL of `.runtime/whiskay-tunnel.json`. The manifest must contain only public URL metadata, never secrets. The route still requires a valid `playerId` and `accessToken` from the game session.

Run `npm run verify:stage22` and `npm run build` before deployment.

---

## Documentation continuity note (2026-10-29)

This file is retained as part of the historical implementation record. For the current cross-stage status, recent fixes, test commands and known limitations, see [Master Stage Archive](STAGE-1-22-MASTER-ARCHIVE.md) and the [documentation index](README.md). Newer behavior supersedes earlier implementation details only where the dated update explicitly says so; previous decisions and history are not deleted.
