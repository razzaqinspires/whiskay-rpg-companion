# Stage 20 — 3D Virtual Companion & Night Spawns

Date: 2026-10-27

- A companion state is persisted inside `player_snapshots.payload.pet` via `/api/player/pet`. Pet actions require a server-side token; the Supabase service-role key never reaches the browser.
- `.hatch` creates one Slime, Peri, or Mini Dragon and enforces a 12-hour hatch cooldown. `.feed [item-id]` validates the pet food against web inventory before consuming one item and improving hunger/energy. `.mypet` returns the saved stats.
- `VirtualPet.jsx` adds species-specific low-poly 3D visuals and a damped follower motion. An active, energized pet grants +8% movement speed. `PetManagementOverlay.jsx` shows hunger, energy, active status and realtime sync state.
- Spirit Seed and Night Wisp are night-only in the Open World, based on the game's accelerated clock (night starts at 19:00 and ends at 06:00).
- Web saves are updated through Supabase REST; Supabase Realtime must be enabled for push updates. The existing read/merge/write contract is not fully transactional under concurrent writes, so production-scale pet economy should use an SQL RPC/row lock.

## Deployment and checks
Run `npm ci`, then apply the updated `schema.sql` in the Supabase SQL Editor so `buy_player_item` accepts `pet-food`. Next run `npm run verify:stage20` and `npm run build`. Stage 1–18 and Stage 20 source verification scripts passed in this environment, and JSX/route syntax was parsed; a full Next.js build and live Supabase integration were not run here.

---

## Documentation continuity note (2026-10-29)

This file is retained as part of the historical implementation record. For the current cross-stage status, recent fixes, test commands and known limitations, see [Master Stage Archive](STAGE-1-22-MASTER-ARCHIVE.md) and the [documentation index](README.md). Newer behavior supersedes earlier implementation details only where the dated update explicitly says so; previous decisions and history are not deleted.
