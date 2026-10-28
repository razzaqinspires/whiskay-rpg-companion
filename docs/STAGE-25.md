# Stage 25 — Identity, Menfess, GitHub, World State, Mega AI

**Status:** foundations and contracts; several end-to-end items remain integration work. Stages 1–24 are preserved.

## Literasi 1 — Repository identity (5 categories)
1. Bot `config/repository.json` provides developer/contact/cross-repository URL placeholders; set verified values before publishing.
2. Bot Baileys is pinned to an exact release in package metadata and lockfile. Review lockfile diffs before upgrades; never run unreviewed floating updates in production.
3. Bot provides optional PM2 ecosystem configuration and lifecycle commands.
4. Next.js root metadata now includes author, creator, publisher, SEO keywords, Open Graph and an optional canonical base URL.
5. `.env.example` documents public repository URLs. Put tokens into separate local/Vercel secret stores; never synchronize secrets by committing environment files.

## Literasi 2 — Menfess (5 categories)
1. Session RAM Map with random 128-bit hex ID, alias, sender, target and timestamps is implemented in the bot.
2. Quoted stanza resolution and participant authorization helpers are implemented in `menfessEngine.js`.
3. Outgoing message IDs are captured by `recordMenfessMessage()` when the command send succeeds.
4. Session termination clears indexes and notifies both parties.
5. Number normalization, collision protection, rate limit and 24-hour expiry exist. Automatic interception of every quoted reply is not yet wired into the global message middleware; sessions are lost on restart and are not suitable for multi-instance production without a shared store.

## Literasi 3 — GitHub Suite (5 categories)
1. Existing bot GitHub commands retain repository/commit/issue/workflow read paths.
2. Issue creation should require a repo allowlist, bounded title/body, and minimum token scopes.
3. Workflow dispatch must be owner-only, use an allowlisted workflow/ref and token with minimum Actions permissions.
4. Metric graphics must be generated from real API responses, never fake text-to-image placeholders.
5. GitHub webhook ingress must verify HMAC SHA-256 on the raw body and deduplicate `X-GitHub-Delivery`; the existing world-boss webhook is not a general GitHub webhook.

## Literasi 4 — Companion state (5 categories)
1. `schema.sql` adds `world_economy_ticks` and `world_external_events`, with RLS enabled and no public write policies.
2. Weather and world seed must be read from validated server state.
3. Pet growth should use player-scoped Realtime subscriptions only after access-token verification.
4. `components/stage25/EconomyMarketChart.jsx` polls `/api/economy/market` every 30 seconds and deliberately shows no fabricated data. The API route and authorization still need implementation.
5. Landscape lock and vibration are progressive enhancements because browser APIs vary by device and permissions.

## Literasi 5 — Mega AI (5 categories)
1. Sentiment screening should run before message forwarding, with transparent rejection and false-positive handling.
2. Commit summaries must redact secrets and cap payload length before AI evaluation.
3. Heuristic rate-limit scoring should be observable and advisory before penalties; no AI should directly mutate HP without a deterministic server rule.
4. Mega avatar may expose safe aggregates only, not raw environment variables or sensitive host metrics.
5. Adaptive logger themes need hysteresis and owner override; automatic AI-driven theme changes are not enabled by this stage.

## Tests and limits
- Stage 25 schema and metadata are static additions; run `npm run verify:all` for configured checks.
- No production Next.js build, Supabase migration, GitHub webhook integration, real-time browser event test, or mobile haptics/orientation test is claimed here.
