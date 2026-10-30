# Stage 34 — World streaming controls and telemetry

The RPG companion now exposes `renderRadius` (1–4 chunks) and `treeDensity` (0–24 trees per chunk) as `WorldManager` props. The world dispatches `whiskay:world-telemetry` when its center chunk/radius/density changes, with estimated tree count, chunk count and resource marker count. `getWorldStreamingStats()` gives a deterministic estimate; `getWorldResourceMarkers(position, renderRadius)` is radius-aware.

## Performance budget
- Radius 1: 9 chunks; radius 2: 25; radius 3: 49; radius 4: 81.
- Estimated tree instances = chunks × tree density, before LOD/visibility culling.
- Maximum at configured bounds: 81 chunks × 24 trees = 1,944 procedural tree groups, so do not set radius 4 and density 24 on low-memory mobile devices without profiling.
- Existing `Detailed` LOD remains in place. This does not introduce high-poly/photorealistic GLB assets or NPC animation sets.

## QA
`npm run verify:stage34` checks props, bounds, telemetry contract and radius-aware resource markers. It is a static contract check, not an FPS benchmark or mobile-device test.
