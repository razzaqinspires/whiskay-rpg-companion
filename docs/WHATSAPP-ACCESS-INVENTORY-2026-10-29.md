# WhatsApp access gate and per-player inventory — 2026-10-29

## User journey

1. Website landing page displays the WhatsApp login/registration dialog.
2. User opens WhatsApp and sends `.enterdungeon` to the Whiskay bot.
3. Bot derives a stable 32-character player ID from the WhatsApp chat/sender and signs an expiring HMAC access token.
4. The bot sends the temporary link. Opening it returns the player to `/adventure` with `player` and `access` query parameters.
5. The route checks signature, expiration and player binding before rendering the game. `/inventory` and `/dungeon` use the same gate.
6. A valid signed read creates a default `player_snapshots` row if this player has no row yet. Inventory then renders only that row's `payload.inventory`.

## Security changes

- `GET /api/player` rejects requests without a valid access token matching the requested player ID.
- The service-role key is only used on the server; never move it into `NEXT_PUBLIC_*`.
- Inventory UI no longer hydrates a shared device's `localStorage` data or shows hard-coded starter items as if they belonged to a user.
- Legacy static `index.html`, `inventory.html`, `inventory/index.html`, `dungeon.html`, and `dungeon/index.html` entry points were removed so they cannot shadow the guarded App Router pages.
- The game client receives the validated player identity and signed token; dungeon reads/writes are bound to that same identity.

## Configuration

Set these values in the website's deployment environment:

- `BOT_SYNC_TOKEN` or `DUNGEON_SYNC_TOKEN`: same secret as the bot's RPG sync secret.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase credentials.
- Optional `NEXT_PUBLIC_WHISKAY_BOT_NUMBER`: bot phone number in international digits without `+`, used to open a direct WhatsApp chat. If unset, the link opens WhatsApp's contact/chat picker and the user must select the bot.

The shared secret must be high entropy and identical between bot and website. The access link expires after 15 minutes in the current bot command.

## Known limitations and next hardening

- The signed token is carried in a URL, so it should be treated as a bearer credential. Avoid logging full query strings, set a strict referrer policy, and consider exchanging it for a secure, HttpOnly session cookie in a future release.
- The current `player/update` endpoint validates the signed player binding but still accepts a limited client-supplied player payload. Production economy, inventory grants, consumables, and combat rewards should move to server-authoritative RPCs rather than trusting browser-supplied amounts.
- Website-side WhatsApp verification is a handoff to the existing bot command, not an embedded WhatsApp OAuth flow. Registration succeeds when the bot-issued signed link is opened and the initial server snapshot is created.
- Two-account isolation must be checked against a configured Supabase project; local structural tests cannot prove production row-level isolation.

## Verification

```bash
npm run verify:whatsapp-inventory
npm run verify:all
npm run build
```

The verification script checks route guards, signed snapshot reads, no fake/localStorage inventory fallback, identity forwarding to dungeon, removal of legacy static entry points, and presence of the WhatsApp modal.
