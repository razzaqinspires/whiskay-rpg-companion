# Stage 17 — Web RPG audit

## Implemented
- The landing page promotes one open-world entry instead of a separate Dungeon navigation item. Inventory remains available.
- Added a visible low-poly cave entrance at world coordinates `(14, -8)`. Near the entrance, press `E` to open the Dungeonia instance.
- Dungeonia now exposes 100 floor entries derived from the bundled floor archetypes, with enemy HP/damage scaling per cycle and boss encounter every fifth floor.
- `/adventure` and `/dungeon` require a short-lived HMAC-signed access token tied to the player ID. Direct URL access without a valid token shows an access gate. The bot issues links with `.enterdungeon`.
- Added `lib/accessToken.js`; token verification runs server-side using Node crypto and a shared secret.

## Configuration and deploy
Set `BOT_SYNC_TOKEN` and/or `DUNGEON_SYNC_TOKEN` on the website server to exactly match the bot's link-signing token. Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` server-side for player snapshots. Redeploy the bot and website together.

## Security and testing notes
- Access links are bearer credentials and expire after 15 minutes; users should not share them. The game currently verifies access at page render. For production-grade enforcement, also validate the signed token on every state-mutating API and move persistent gameplay mutations into server-side RPCs.
- This source package was statically checked; a full Next.js production build and live Supabase/WhatsApp integration test require installing dependencies and using deployment credentials.
- Combat remains partly client-simulated; the stage does not claim server-authoritative PvP/PvE combat.
