# Stage 18 — RPG implementation & audit

## Scope
- Rebuilt the README with game-specific branding, route/system map, Mermaid synchronization architecture, configuration, caveats, and a full Markdown documentation index.
- Added authenticated `/api/player/auction` API backed by Supabase RPC functions and an `rpg_auction_listings` table.
- Added `/api/world-boss/announce`, which verifies the signed game access token and forwards a fixed event to the bot webhook using server-side configuration.
- Added inventory-driven mount detection, a visible mount indicator, 2× joystick movement, 10% storm movement debuff, and periodic client-side HP attrition when not near cave/NPC shelter points.

## Database migration
Apply the Stage 18 block appended to `schema.sql` in the intended Supabase project. The RPCs lock listing/player rows and perform Gold/item changes in a database transaction. Test with disposable accounts before production.

## Limitations
Mount and weather attrition are client-side prototype effects, not cheat-proof authoritative mechanics. The mount indicator does not replace the hero with a full riding model. Live Supabase and bot webhook connectivity, mobile performance, and production Next.js build were not verified in this environment.

---

## Documentation continuity note (2026-10-29)

This file is retained as part of the historical implementation record. For the current cross-stage status, recent fixes, test commands and known limitations, see [Master Stage Archive](STAGE-1-22-MASTER-ARCHIVE.md) and the [documentation index](README.md). Newer behavior supersedes earlier implementation details only where the dated update explicitly says so; previous decisions and history are not deleted.
