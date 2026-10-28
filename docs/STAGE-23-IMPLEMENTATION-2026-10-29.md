# Stage 23 — Companion Sync and UI (2026-10-29)

- `/api/sync` accepts bounded `mod_coins`, `max_battery_capacity`, `current_volt_speed`, `battery_energy`, and `worldEvent` fields after bearer-token authentication.
- `PlayerRealtimeSync.jsx` already emits `whiskay:player-update` from authenticated Supabase Realtime changes; the Stage 23 visual consumers now read those events.
- `MobileSkillDock.jsx` displays a fast-charge indicator for voltages above 5V.
- `WorldManager.jsx` dims lighting below 15% battery and changes the scene background to red for an active `worldEvent.type === 'darkness'` event.
- `VirtualPet.jsx` uses a slower, lower tired pose and a sleep marker below 15% battery.
- `ModCoinShop.jsx` opens WhatsApp with `.buy modcoin <quantity>` prefilled. Without `NEXT_PUBLIC_WHISKAY_BOT_NUMBER`, it uses WhatsApp's contact picker.

## Important limitations
The bot's current `energy-ledger.json` and the web's `player_snapshots` are not yet one transactional source of truth. The sync endpoint has a bot bearer-token guard, but economy changes still require server-authoritative atomic writes and a properly configured Supabase Realtime/RLS policy. Mod Coin invoice generation is not automatic payment verification. World event publishing and scheduled global energy averaging remain unimplemented; the UI reacts only if an authenticated snapshot already contains `worldEvent`.

## Stage 23+ Rev. 2 — kesinambungan lintas literasi
- Kontrak ekonomi yang disinkronkan dari bot: `mod_coins`, `max_battery_capacity`, `current_volt_speed`.
- `/api/sync` menerima perubahan ekonomi dengan autentikasi bearer dan memvalidasi batas angka. Bot mengirim snapshot sesudah transaksi charge/upgrade/reset.
- UI mobile membaca snapshot baterai/voltase dan shop membuka WhatsApp melalui perintah `.buy modcoin`.
- Darkness Event dan respons AI proaktif tetap memerlukan worker terjadwal serta event channel yang benar-benar aktif di deployment; jangan menganggap event live sudah terpasang hanya karena UI dapat merender status event.
- Pemeriksaan parser/statis tidak menggantikan uji Supabase Realtime, autentikasi WhatsApp, build produksi, atau uji perangkat.
