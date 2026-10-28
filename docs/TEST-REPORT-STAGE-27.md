# Stage 27 Test Report — Web Companion

- `npm run verify:stage27`: PASS, 6/6 checks (valid event, allow-list rejection, stale timestamp rejection, non-object payload rejection, payload size rejection, event-type count).
- `npm run verify:all`: PASS in this workspace, including retained historical structural checks.
- Not covered: deployed Supabase permissions, applying schema migration, production HTTP authorization against a real secret, duplicate insert against Supabase, realtime fanout, or end-to-end Bot ↔ Web processing.
