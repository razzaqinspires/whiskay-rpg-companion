# Stage 24 — RPG Companion integration notes

The five literacies and their five categories are fully indexed in the bot archive at `docs/stages/STAGE-24.md`. Web-side deliverables in this package:

- Deterministic seeded world marker generator: `lib/world/WorldGen.js`.
- Combat floating damage / critical shake overlay: `components/fx/CombatFX.jsx` (mount in the game overlay and dispatch `whiskay:combat-fx` only for server-confirmed combat).
- RPG loading screen: `components/fx/RPGLoadingScreen.jsx` (use as a React Suspense fallback in client-rendered game surfaces).
- Asset bundle contract: `public/assets/unity_pack/README.md`; no unlicensed or nonexistent models are included.
- Coordinate/seed persistence schema: `player_world_state` in `schema.sql`.

## Operational requirements before production

1. Apply SQL in staging first; verify Supabase constraints and RLS using the service role only on server-side code.
2. Connect position updates to a server-side 30-second coalescing queue. Do not write each render frame to PostgreSQL.
3. Implement WebSocket/Webhook relay with signed short-lived JWTs, per-player authorization, replay protection and rate limits.
4. Add compatible post-processing packages only after checking React Three Fiber / Three.js peer compatibility and mobile GPU cost.
5. Supply licensed low-poly GLB/GLTF assets and WebP textures; test memory and FPS on Android devices.
6. All economy actions, combat damage, gacha results, auction escrow and leaderboard rank must be server-authoritative.

`npm run verify:stage24` runs structural checks only. It does not claim that WebSockets, AI, auction, gacha, live combat relay or production rendering are deployed.
