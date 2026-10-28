# Stage 11 — World Environment

`WorldManager.jsx` now owns smoothly interpolated ambient, directional and hemisphere lighting plus rain particles. `AdventureClient.jsx` passes `worldHour` and current weather into it, and removes duplicate light/rain renderers. Day/night lighting is smoothed per frame; rain uses a capped 180-particle buffer for mobile.

## Test
- `npm run verify:stage11`
- `npm run build`
- On device, switch weather to Rain and watch lighting at dawn, noon, dusk, and night. The existing game clock advances 0.025 hours per second; the lighting eases between states.

---

## Documentation continuity note (2026-10-29)

This file is retained as part of the historical implementation record. For the current cross-stage status, recent fixes, test commands and known limitations, see [Master Stage Archive](../STAGE-1-22-MASTER-ARCHIVE.md) and the [documentation index](../README.md). Newer behavior supersedes earlier implementation details only where the dated update explicitly says so; previous decisions and history are not deleted.
