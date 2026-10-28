# Stage 28 — Durable Event Processing & Transaction Safety

## Five literacies × five categories

### Literacy 1 — Contract validation
1. Validate event ID. 2. Allow-list event type. 3. Require object payload. 4. Normalize schema version. 5. Preserve timestamp provenance.

### Literacy 2 — Idempotency
1. Deduplicate by event ID. 2. Enforce unique DB index. 3. Return duplicate-safe acknowledgements. 4. Do not trust client-generated business outcomes. 5. Keep dedupe state server-side.

### Literacy 3 — Retry operations
1. Exponential backoff. 2. Maximum delay. 3. Jitter. 4. Dead-letter state. 5. Owner-authorized replay.

### Literacy 4 — Atomic economy and game state
1. Transactional currency debit/credit. 2. Inventory mutation in same transaction. 3. Unique purchase key. 4. Server-side price/damage calculation. 5. Recovery reconciliation.

### Literacy 5 — Release and documentation
1. Add verification script. 2. Preserve Stage 1–27 archive. 3. Update README. 4. Record limitations. 5. Require Supabase integration testing.

## Implementation in this stage
`lib/stage28/event-processor.mjs` validates the event envelope. `scripts/verify-stage28.mjs` has five structural tests. This is not a durable worker or a database transaction implementation by itself. Production idempotency must use a database unique constraint and atomic claims; the event handler and business mutation must share a transaction where possible.

## Verification
Run `npm run verify:stage28` and `npm run verify:all`.
