# Stage 32 — RPG Companion QA Guard

## Analysis decision
The reported failures concern WhatsApp bot controls, energy worker, serializer compatibility, and bot-local leveling. The website source currently validates player IDs with `verifyGameAccess`, bounds integer statistics and coordinates, caps inventory length, and disables caching. No website runtime change was justified by the available evidence.

## Implemented
Added `scripts/verify-stage32.mjs` and wired it into `verify:all`. It asserts the existing player-update contract remains present.

## Evidence
`npm run verify:stage32` must print PASS for scoped access, bounded stats/coordinates, no-store, inventory cap, and token crypto. This is a source-contract check, not a live database integration test.
