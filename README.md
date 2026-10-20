# Whiskay RPG Companion — Vercel

## Deploy
1. Import folder `vercel-rpg` as a separate Vercel project (or deploy this folder as project root).
2. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `BOT_SYNC_TOKEN` in Vercel Environment Variables. Never expose service role key to browser.
3. Run `schema.sql` in Supabase SQL editor.
4. Deploy. `/api/floors` serves the 10-floor content, `/api/player?player=<playerId>` reads a snapshot, and `POST /api/sync` writes a snapshot using `Authorization: Bearer BOT_SYNC_TOKEN`.

## Bot sync payload
`POST https://YOUR-VERCEL-DOMAIN/api/sync`
```json
{"playerId":"chatJid|senderJid","payload":{"name":"Player","level":12,"xp":400,"nextXp":700,"hp":240,"maxHp":260,"gold":1500,"weapon":"Stormglass Blade","weaponPower":42,"potions":3,"wins":22,"losses":4,"inventory":[{"name":"Potion of Renewal","quantity":3}]}}
```
Do not sync phone numbers or private WhatsApp message contents. Use a stable opaque player ID or a one-time dashboard token for each player. The included UI has a playable client-side combat prototype; it is not a server-authoritative multiplayer game yet. Replace the demo combat state with signed, authenticated turn actions before production.
