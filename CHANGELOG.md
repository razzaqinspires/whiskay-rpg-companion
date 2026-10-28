
## [2.6.0] — Stage 26
- Added allow-listed Bot/Web event envelope validation.
- Added Stage 26 structural verification and documentation.

## 2.2.0 — Stage 22 Reliability
- World Boss event now includes a unique eventId and optional boss metadata.
- Added Stage 22 verification script.

## 2026-10-29 — Access, downloader and documentation maintenance

- Added WhatsApp verification modal and route guards for adventure, dungeon and inventory.
- Bound player snapshot reads to a signed access token and per-player ID; initializes a server-side player row on first valid access.
- Removed fake/localStorage inventory fallbacks and legacy static HTML routes; dungeon now receives the validated player identity.
- Added master stage archive, access/inventory security documentation and six structural verification checks.

## Stage 23 — 2026-10-29
- Added the first Stage 23 integration foundation: message wrapper/preferences/charging economy and companion sync/visual-state hooks. See `docs/STAGE-23-IMPLEMENTATION-2026-10-29.md` in the bot archive and the corresponding Stage 23 section in the companion docs.

## [2.4.0] — Stage 24
- Added deterministic seeded world generation, combat FX overlay and RPG loading screen.
- Added persistent world coordinate/seed schema and Stage 24 verification.
- Recorded production integration gates for assets, post-processing, WebSocket relay and economy safety.


## Stage 25 — 2026-10-29
- Added SEO/repository metadata and cross-project environment placeholders.
- Added world economy/event schema, market chart client and structural checks.
- Documented Menfess, GitHub webhook, realtime and Mega AI integration requirements.


## 2.7.0 — Stage 27 (2026-10-29)
- Added durable event outbox foundation and idempotency-key deduplication.
- Added bounded retries, exponential backoff, dead-letter state, and outbox statistics.
- Added authenticated web event ingestion contract and `event_outbox` SQL table with RLS enabled.
- Added Stage 27 verification commands and five-literacy documentation.
- Deferred live worker dispatch and transactional economy effects until production consumers are idempotent.


## Stage 28 — 2.8.0
- Added event validation/idempotency groundwork and Stage 28 verification.
- Expanded README and stage documentation while preserving prior history.
- Production multi-instance transaction guarantees remain dependent on database integration.
