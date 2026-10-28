# Stage 16 — Guild, Combat Feedback & Equipment

## Bot/API guild
Bot plugin: `src/plugins/games/rpg-guild.js`. Website route: `app/api/player/guild/route.js`. Database RPC functions are appended to `schema.sql` and require applying the complete schema on Supabase. Creation costs 10,000 Gold; join uses the ID returned by create; kick requires leader role; donations increase guild treasury and guild level is derived from treasury milestones.

## AI short-term memory
`src/cognitive/short-term-memory.js` keeps up to 8 messages per sender in process memory (max 2,000 sessions). It is intentionally ephemeral and disappears on process restart. No raw conversation is persisted to disk by this module.

## Web combat
`FloatingCombatText.jsx` listens for `whiskay:combat-hit` and renders a one-second floating damage label. The current Adventure attack action emits a local feedback event; it is presentation feedback and is not server-authoritative combat damage. `DynamicEquipment.jsx` swaps a procedural weapon mesh based on the existing `whiskay:player-update` event (`weapon` or `equippedWeapon`). Ensure the web client dispatches the canonical player snapshot after Realtime updates to see remote equipment changes.

## Spatial audio
`AudioDeck.jsx` uses Web Audio PannerNode with HRTF and inverse distance attenuation for attack/mining events. Browser audio requires user interaction and may be unavailable in silent/low-power contexts.

## Verify
Run `npm run verify:stage16` and `npm run build` in the web project. Run `npm test` in the bot project. Integration tests against Supabase and WhatsApp are still required before production.

---

## Documentation continuity note (2026-10-29)

This file is retained as part of the historical implementation record. For the current cross-stage status, recent fixes, test commands and known limitations, see [Master Stage Archive](STAGE-1-22-MASTER-ARCHIVE.md) and the [documentation index](README.md). Newer behavior supersedes earlier implementation details only where the dated update explicitly says so; previous decisions and history are not deleted.
