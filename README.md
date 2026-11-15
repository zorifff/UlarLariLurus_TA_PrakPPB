# Ularlarilurus

Game ular klasik berbentuk **Progressive Web App**. Makan buah untuk menambah poin dan panjang ular,
jangan menabrak tembok atau badan sendiri, lalu bersaing di leaderboard global.

Tugas Akhir Praktikum Pemrograman Perangkat Bergerak (PPB) Ganjil 2026.

## Fitur

- Game ular di canvas 15×15: kontrol swipe, d-pad, atau keyboard (panah/WASD, spasi untuk jeda).
- Apel selalu ada; buah bonus (jeruk, anggur, buah naga) muncul acak dan hilang setelah beberapa langkah.
- Pemain tanpa login: cukup pilih username. Skor otomatis dikirim ke server setelah game over.
- Peringkat global, riwayat permainan, detail match (rincian makanan), detail pemain.
- 6 skin ular yang terbuka berdasarkan skor terbaik.
- PWA: bisa dipasang di HP, tetap bisa dimainkan offline; skor offline dikirim otomatis saat online lagi.

## Halaman

| Menu (bottom nav) | Halaman list | Halaman detail |
|---|---|---|
| Main | Beranda (`/`), Game (`/play`), Pengaturan (`/settings`) | – |
| Peringkat | `/leaderboard` | Detail Pemain `/leaderboard/:playerId` |
| Riwayat | `/history` | Detail Match `/history/:matchId` |
| Skin | `/skins` | Detail Skin `/skins/:skinId` |
| Tentang | `/about` (profil aplikasi & pembuat) | – |

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


