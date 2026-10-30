# MEMORY.md — Memori Arahan Stage Whiskay

- Audit source/repo aktual sebelum mengubah apa pun; jika tidak tersedia, minta source/tree/diff dan jangan mengarang analisis.
- Gunakan 5 literasi × 5 kategori × 10 subkategori (250 item) pada setiap stage, dan tandai rencana vs implementasi/test/bukti secara jujur.
- Setiap perubahan wajib memperbarui README, CHANGELOG, dokumentasi stage, test/QA, dan catatan bukti.
- Dokumentasikan formula energi, sumber konsumsi, regenerasi, cooldown, batas, error handling, dan test case.
- Dokumentasikan Coin Mod: definisi, command, konfigurasi, efek ekonomi/energi, migrasi, test, changelog, bukti. Bedakan Coin Mod dari Gold RPG, Premium, Limit, dan uang fiat.
- Jangan klaim payment gateway, ads, affiliate, subscription, database transaksi, atau integrasi live aktif tanpa bukti source dan test/runtime.
- ZIP harus memuat source dan riwayat docs, lolos tes/integrity, dan mengecualikan `.env`, session, data runtime, serta `node_modules`.
- Catat impact, effort, risk, alasan, file/fungsi, dampak ke fitur lama, mitigasi, dan rollback.


## Stage 32 work memory
- Stage 32 reported bugs centered on bot menu/status/profile, energy gating, and local leveling writes. Website gameplay routes were not changed absent a concrete web runtime defect.
- Keep the player update route protected by `verifyGameAccess`, bounded integer stats, bounded finite coordinates, no-store response headers, and inventory caps.
- Never claim the website has a per-user image database schema unless a migration/table and route implementation are present.


## Stage 33 work memory
- When a reference repository only exposes WhatsApp command scripts, do not claim RPG website runtime changes unless analysis establishes a direct web/API gap. Document scope and test existing route contracts instead.
- Keep upstream licensing and source provenance explicit; prefer fresh implementations, not verbatim re-distribution when a license cannot be verified.
