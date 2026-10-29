# Stage 30 — Game Request Input Policy

Date: 2026-10-29 · Web version: 2.10.0

## Scope

Adds a small, dependency-free input policy module for route handlers and game-state boundaries:

- `isValidPlayerId`: accepts only 32-character hexadecimal player IDs; rejects JIDs, path fragments and arbitrary strings.
- `parseBoundedInteger`: accepts safe integers within caller-supplied bounds.
- `parseFiniteCoordinate`: accepts finite coordinates within a bounded world range.
- Verification asserts that the existing signed access-token verifier retains constant-time signature comparison and expiration checks.

## Verification

- `npm run verify:stage30`
- `npm run verify:all`

## Integration note

These helpers are available for routes as they are hardened; this stage does not claim every existing route has been migrated to use them. Signed token validation and per-player authorization remain mandatory. Database transactions and end-to-end live deployment require separate integration tests.
