# Ularlarilurus

Game ular klasik berbentuk **Progressive Web App**. Makan buah untuk menambah poin dan panjang ular,
jangan menabrak tembok atau badan sendiri, lalu bersaing di leaderboard global.

Tugas Akhir Praktikum Pemrograman Perangkat Bergerak (PPB) Ganjil 2026.

## Teknologi

- React + Vite (JavaScript)
- vite-plugin-pwa (manifest + service worker Workbox)
- react-router-dom, axios, lucide-react
- API REST sendiri di folder `api/` (Vercel Functions) + database Neon Postgres (`@neondatabase/serverless`)
- Deploy: Vercel

## Menjalankan secara lokal

1. Buat project di [Neon](https://neon.tech), lalu jalankan isi `db/schema.sql` di Neon Console > SQL Editor.
2. Salin connection string (Neon Console > Connect) ke `.env`:

```bash
npm install
cp .env.example .env     # isi DATABASE_URL
npm run dev              # frontend + endpoint /api
```

Cek koneksi database: buka `http://localhost:5173/api/health`.

Uji PWA (service worker hanya aktif di build produksi):

```bash
npm run build
npm run preview -- --host
```

## Struktur data

Lihat [docs/ERD.md](docs/ERD.md) (termasuk daftar endpoint API) dan skema SQL di [db/schema.sql](db/schema.sql).

## Deploy (Vercel)

Import repo ini di Vercel (framework: Vite), lalu isi `DATABASE_URL` di Project Settings > Environment Variables
(atau pasang integrasi Neon dari Vercel Marketplace). Folder `api/` otomatis menjadi Vercel Functions.
UlarLariLurus_TA_PrakPPB


