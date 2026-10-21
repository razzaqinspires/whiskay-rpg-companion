# Perbaikan deployment Vercel

Project ini menggunakan Next.js App Router. File `app/page.jsx` adalah homepage `/`,
`app/dungeon/page.jsx` adalah `/dungeon`, dan `app/inventory/page.jsx` adalah `/inventory`.

## Pengaturan Vercel
- Root Directory: `.` (folder yang berisi `package.json` dan folder `app/`).
- Framework Preset: `Next.js`.
- Build Command: biarkan default Next.js atau `npm run build`.
- Output Directory: kosongkan/default; jangan isi `public`, `out`, atau `dist`.
- Install Command: default atau `npm install`.
- Pastikan `app/`, `components/`, `lib/`, `public/`, `package.json`, dan `next.config.mjs` ada di root yang dipilih.
- Deploy ulang dari Production setelah menyimpan pengaturan.

`vercel.json` tidak lagi memaksa `/dungeon` dan `/inventory` ke file HTML prototipe lama; Next.js menangani route tersebut.

## Environment variables
File `.env` lokal tidak disertakan dalam ZIP ini untuk mencegah kebocoran secret. Jika integrasi database/bot digunakan, tambahkan `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dan `BOT_SYNC_TOKEN` melalui Vercel Project Settings → Environment Variables. Jangan gunakan prefix `NEXT_PUBLIC_` untuk secret.
