# Stage 29 — Official Portal & Open-World/Dungeon Navigation

**Release:** 2.9.0 · **Date:** 2026-10-29

## Literasi 1–5 (exactly five categories each)

1. **Menu and global design**
   1. WhiskayBot provides additional Kawaii, Boxed, Japanese and Developer themes.
   2. Widget symbols can be toggled separately from the selected template.
   3. Settings summary and reset are available in the bot.
   4. User-specific settings do not alter global player data.
   5. Configuration and known limitations are documented.
2. **Profile, status and canvas**
   1. Profile displays Mod Coin independently of RPG coin.
   2. Runtime status includes process and memory diagnostics.
   3. Menu canvas V1/V2 selection remains a bot setting.
   4. Profile image selection remains a bot command.
   5. Face/logo asset configuration is optional; fallback rendering remains available.
3. **Quotes and serializer**
   1. Synthetic contact preview values can be configured.
   2. Synthetic product preview name/price can be configured.
   3. Forwarded metadata has full/short/off settings for menu interactive messages.
   4. Synthetic quote is labelled as a preview, not a real identity.
   5. Serializer changes must be checked against the installed Baileys version.
4. **Recommendation and exploration**
   1. Per-user recommendation visibility can be toggled.
   2. Owner can enable/disable global recommendations.
   3. Explore presents personal usage distribution and top commands.
   4. Filters use declared plugin context/access metadata where available.
   5. Percentages represent recorded usage share, not success probability.
5. **Open world, dungeon and official website**
   1. Official home presents Open World and Inventory as primary game areas.
   2. Dungeon is described as part of the same exploration journey, not a separate top-level game tab.
   3. Adventure route validates player token.
   4. Inventory route validates player token.
   5. End-to-end state unification remains pending live deployment verification.

## Literasi 6 — additional features (five categories)

1. Existing GitHub tooling is retained; `.imagine` is added with an optional OpenAI Images API provider.
2. `.character` generates a local deterministic character concept.
3. Menu settings selector exposes three actions: full settings, AI-assisted/locked-structure mode, and response-mode switch.
4. AI mode is explicitly a configuration choice until a real provider is wired and tested.
5. Stage docs, README, changelog and verification script are maintained.

## Access and security

`app/adventure/page.jsx` and `app/inventory/page.jsx` still verify signed access tokens. The landing-page changes do not remove those checks. The official game must be entered using the signed checkpoint URL supplied through the bot; opening the route without a valid token should continue to show the access-required screen.

## Known limitations

- Navigation/copy changes do not mean all dungeon state has been merged into one persistent world scene.
- Live Supabase, WhatsApp and combat/inventory round trips require a deployed integration test.
- A local verification script validates source-level navigation and access checks, not a real browser login session.
