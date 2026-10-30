## 2.15.0 — Stage 35 (2026-10-29)

- Added Stage 35 cross-project integration notes and bot feature contracts to the RPG companion documentation.
- Existing RPG progression and dashboard interfaces remain compatible with the bot XP/leveling contract; no unverified game runtime behavior is claimed.

## [2.10.0] - 2026-10-29

### Added
- Stage 30: context-aware recommendation filtering / game request input policy.
- Stage 30 focused verification script and documentation.


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

## [2.9.0] - 2026-10-29 — Stage 29
- Simplified official portal navigation to Open World and Inventory as the primary game areas.
- Updated copy to describe dungeon access as integrated with the open-world journey, not a separate top-level game tab.
- Added verification for route access gates and landing-page navigation.

## 2.11.0 — Stage 31 (2026-10-29)
- Applied bounded-integer validation to RPG snapshot stats accepted by `/api/player/update`.
- Added finite/range validation for optional checkpoint and position coordinates.
- Added Stage 31 static regression checks for signed player access and rejected out-of-range/fractional values.
- This is input validation, not a claim that the client is fully server-authoritative or cheat-proof.


## [2.12.0] — Stage 32 — 2026-10-29
- Added Stage 32 route security regression guard for player identity, bounded stats, coordinates, and no-store responses.
- No runtime RPG route changed; existing access behavior is covered by static QA.


## [2.13.0] — Stage 33 — 2026-10-29
- Added Stage 33 integration-scope and feature-parity documentation for the Knightbot-MD command audit.
- No RPG runtime routes or game mechanics were changed because the upstream scope was WhatsApp commands and no concrete website parity gap was established.
- Added a static Stage 33 repository contract verification script.


## [2.14.0] — Stage 34 — 2026-10-29
- Added bounded world render radius and configurable procedural tree density to WorldManager.
- Added `whiskay:world-telemetry` event and streaming statistics helper.
- Added Stage 34 static contract verification and documented asset/performance gaps.
