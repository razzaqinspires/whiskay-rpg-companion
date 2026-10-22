# Stage 19 — Dual-Update Compatibility Note

Stage 19 changes the WhatsApp bot's menu rendering, Canvas V2 profile-card delivery, and timed energy/charging commands. The website source is intentionally kept independent and no new web gameplay or API behavior is claimed in this stage.

## Integration contract

- The website remains a separate Next.js application and should be deployed from its own ZIP.
- The bot's `.raidboss` command is a local simulation/entry point; it does not claim to create an authoritative boss encounter in Supabase.
- Profile-card avatar images are managed by the bot and do not change the RPG website's player avatar or inventory records.
- Bot energy and charging remain in the bot's persistent JSON ledger. They are not the same field as website RPG health, stamina, or Gold.

## Validation scope

The Stage 18 web package is retained intact apart from this compatibility document. No website production build or live Supabase test was performed for Stage 19 because this stage's requested code changes target the WhatsApp bot.
