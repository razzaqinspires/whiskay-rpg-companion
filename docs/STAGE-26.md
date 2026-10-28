# Stage 26 — Reliability, Event Contracts & Cross-Platform Integrity (Web)

**Version:** 2.6.0 · **Status:** validation contract implemented; realtime delivery remains integration work.

## Five literacies × five categories

### Literacy 1 — Web Event Contract
1. **Typed events:** allow-listed weather, pet, market, Menfess notification, and system health events.
2. **Envelope validation:** require event ID, type, timestamp, and object payload.
3. **Freshness:** reject timestamps older/newer than the five-minute acceptance window.
4. **Payload discipline:** reject arrays/null as event payload objects and unsupported event types.
5. **Trust boundary:** validation is not authentication; route handlers must verify bearer/HMAC before calling it.

### Literacy 2 — RPG State Integrity
1. **Server authority:** damage, inventory, Gold, auction and gacha remain server-authoritative.
2. **Idempotency:** transaction/event IDs must prevent duplicate economy changes.
3. **Optimistic UI:** show pending state and reconcile with authoritative snapshot.
4. **Conflict handling:** compare version/revision before applying stale player snapshots.
5. **Persistence:** keep Supabase service-role keys server-only; enforce RLS for user-facing access.

### Literacy 3 — Realtime World & UI
1. **Weather:** render weather only from validated world state.
2. **Pet model swaps:** subscribe to validated pet growth events and dispose replaced Three.js resources.
3. **Priority toast:** queue and throttle external notification overlays.
4. **Market chart:** chart only persisted transaction aggregates; show unavailable state if no data source.
5. **Mobile input:** request landscape/haptic support conditionally; gracefully degrade when browser APIs are unavailable.

### Literacy 4 — API & Webhook Security
1. **Authentication:** verify service bearer token or HMAC signature on server routes.
2. **Replay protection:** enforce timestamp window and idempotency storage.
3. **Rate limiting:** limit event ingestion by source and event class.
4. **Schema validation:** reject oversized payloads, unknown keys where strict schema is used, and invalid identifiers.
5. **Observability:** log correlation ID, event type, outcome, and latency without tokens or private message text.

### Literacy 5 — Quality, Performance & Docs
1. **Automated tests:** `npm run verify:stage26` covers accepted, unsupported, stale, and malformed events.
2. **Build check:** run production Next.js build once dependencies are installed.
3. **3D performance:** dispose geometries/materials/textures when replacing entities.
4. **Accessibility:** provide readable loading/error states and keyboard alternatives for interactive controls.
5. **Archive continuity:** retain Stage 1–25 docs and link this stage from README and docs index.

## Validation
`npm run verify:stage26` runs five structural checks. It does not prove Supabase Realtime, WebSocket delivery, or production build is live.

## Not yet production-complete
Authenticated event route, durable deduplication store, Realtime subscription wiring, and end-to-end Bot/Web tests remain follow-up tasks.
