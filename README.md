# Ularlarilurus

Game ular klasik berbentuk **Progressive Web App**. Makan buah untuk menambah poin dan panjang ular,
jangan menabrak tembok atau badan sendiri, lalu bersaing di leaderboard global.

Tugas Akhir Praktikum Pemrograman Perangkat Bergerak (PPB) Ganjil 2026.

## Teknologi

- React + Vite (JavaScript)
- vite-plugin-pwa (manifest + service worker Workbox)
- react-router-dom, axios, lucide-react
- Supabase (REST PostgREST) sebagai API
- Deploy: Vercel

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env     # isi VITE_API_BASE_URL dan VITE_SUPABASE_ANON_KEY
npm run dev
```

Uji PWA (service worker hanya aktif di build produksi):

```bash
npm run build
npm run preview -- --host
```

## Struktur data

Lihat [docs/ERD.md](docs/ERD.md) dan skema SQL di [supabase/schema.sql](supabase/schema.sql).
"# UlarLariLurus_TA_PrakPPB" 
