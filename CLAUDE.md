# Ularlarilurus

Game ular klasik (gaya Snake) berbentuk **Progressive Web App**, dibuat sebagai Tugas Akhir individu
Praktikum Pemrograman Perangkat Bergerak (PPB) Ganjil 2026. Platform yang dipakai: **PWA** (materi Modul PWA I & PWA II).

Pemain mengendalikan ular untuk memakan buah. Setiap buah menambah poin dan panjang ular.
Ular mati kalau menabrak **tembok** atau **badannya sendiri**. Skor dikirim ke API dan masuk **leaderboard global**
yang selalu terurut dari skor tertinggi.

Bahasa komunikasi dengan pemilik proyek: **Bahasa Indonesia**. Teks UI juga Bahasa Indonesia.

## Status dan tenggat

- Pengerjaan: 13–24 November 2026. Responsi: 25–28 November 2026.
- Wajib minimal 1x asistensi ke asisten pembimbing sebelum responsi.
- Backend (diputuskan 15 Nov 2026, ganti dari Supabase): **API sendiri** di folder `api/` (Vercel Functions) +
  database **Neon Postgres**. Ini sekaligus memenuhi ketentuan "API dibuat sendiri". Jangan mengganti backend tanpa diminta.

## Ketentuan tugas akhir (wajib terpenuhi, cek setiap selesai fitur)

| # | Ketentuan | Cara dipenuhi |
|---|---|---|
| 1 | API (web service) buatan sendiri | Endpoint REST sendiri `/api/*` (Vercel Functions) di atas Neon Postgres: tabel `players`, `matches`, `match_foods`, `skins`, `foods` + view `leaderboard` (lihat ERD) |
| 2 | Bottom Navigation Bar | `BottomNav` 5 menu: Main, Peringkat, Riwayat, Skin, Tentang |
| 3 | Minimal 5 halaman | Ada 10+ halaman (daftar di bawah) |
| 4 | Min. 2 halaman utama berisi list, item bisa diklik ke detail | Peringkat → Detail Pemain, Riwayat → Detail Match, Skin → Detail Skin |
| 5 | 1 halaman Profile/About | Halaman Tentang (info aplikasi + profil pembuat + panduan makanan) |
| 6 | Source code di GitHub | Repo publik, commit rutin |
| 7 | PWA wajib di-deploy di free hosting | Vercel (sama seperti modul) |

## Tech stack (ikuti modul praktikum, jangan tambah library tanpa alasan kuat)

- **React + Vite**, JavaScript (JSX), **bukan TypeScript**. Function component + hooks saja.
- **vite-plugin-pwa** (`registerType: 'autoUpdate'`), manifest + service worker Workbox. Pola config sama dengan Modul PWA I.
- **axios** untuk HTTP, dengan instance di `src/config/api.js` (`baseURL` = `VITE_API_BASE_URL` atau `/api`,
  interceptor unwrap `response.data` dan normalisasi error dari format `{ error: { code, message } }`) — pola Modul PWA II
  tanpa header Supabase (tidak ada key di browser).
- **API server** di folder `api/`: Vercel Functions dengan handler Web standard (`export const GET = handle(async (request) => ...)`),
  routing berbasis file (`api/skins/[id].js` → `/api/skins/:id`). Database lewat **`@neondatabase/serverless`**
  (tagged template `sql`...``, aman dari SQL injection; `sql.transaction([...])` untuk transaksi). Helper bersama di `api/_lib/`
  (awalan `_` = bukan endpoint). Maksimal 12 file endpoint (batas Vercel Hobby).
- Saat `npm run dev`/`preview`, `/api` dijalankan oleh plugin `scripts/vite-plugin-api.js` (meniru Vercel). Tidak perlu `vercel dev`.
- **react-router-dom** untuk routing (dibutuhkan halaman detail dengan parameter `:id`).
- **HTML5 Canvas** + `requestAnimationFrame` untuk game. **Tanpa game engine** (tanpa Phaser, dsb.).
- CSS biasa (`index.css` untuk variabel/token, `App.css` + file CSS per halaman bila perlu). Tanpa Tailwind/UI kit.
- Ikon: SVG inline atau `lucide-react` (satu-satunya library UI tambahan yang diizinkan).
- **localStorage** untuk identitas pemain, pengaturan, dan antrean skor offline.
- Hosting: **Vercel**, dengan `vercel.json` rewrite semua path selain `/api/*` ke `/index.html` (SPA).

## Environment

`.env` (jangan di-commit; sediakan `.env.example`):

```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require   # khusus server, JANGAN diberi awalan VITE_
# VITE_API_BASE_URL=/api                                        # opsional, default /api
```

`DATABASE_URL` diisi di Vercel > Project Settings > Environment Variables (atau otomatis lewat integrasi Neon di Vercel).
Hanya kode di `api/` yang boleh membaca `process.env.DATABASE_URL`; kode di `src/` tidak pernah menyentuh database langsung.

## Struktur data

@docs/ERD.md

Skema SQL yang bisa dijalankan ada di `db/schema.sql` (tabel, trigger, view leaderboard, seed skin & makanan).
Jalankan di Neon Console > SQL Editor.
**Struktur tabel di ERD adalah acuan utama.** Jangan menambah/mengganti kolom di kode tanpa mengubah `schema.sql`
dan `docs/ERD.md` sekaligus, lalu beri tahu pemilik proyek bahwa SQL perlu dijalankan ulang di Neon.

Aturan penting:
- `best_score`, `total_games`, `total_food`, `best_score_at` di `players` **hanya diubah oleh trigger database**.
  Client cukup `POST /api/matches`. `PATCH /api/players/{id}` hanya menerima kolom `username` dan `skin_id` (dijaga di API).
- `players.id` dan `matches.id` dibuat di client dengan `crypto.randomUUID()`.

## Halaman dan routing

Bottom nav tampil di semua halaman **kecuali** `/play` (game layar penuh) dan halaman onboarding.

| Path | Halaman | Isi | Data |
|---|---|---|---|
| `/` | Main (Home) | Judul + logo, tombol **Main**, sapaan username, skor terbaik saya, skin aktif, ikon ⚙ ke Pengaturan | localStorage + `players` |
| `/play` | Game | Canvas arena, HUD (skor, skor terbaik, jeda), d-pad, layar game over | `foods`, skin aktif; `POST matches` |
| `/leaderboard` | Peringkat (list) | Daftar peringkat (rank, username, mini skin, skor). Baris saya disorot. Pull/klik refresh | view `leaderboard` |
| `/leaderboard/:playerId` | Detail Pemain | Statistik pemain + 10 match terakhir | `players`, `matches` |
| `/history` | Riwayat (list) | Daftar match milik saya (tanggal, skor, durasi, penyebab mati) | `matches` |
| `/history/:matchId` | Detail Match | Skor, panjang ular, durasi, penyebab mati, skin, rincian makanan | `matches` + `match_foods` + `foods` |
| `/skins` | Skin (list) | Grid skin; terkunci/terbuka berdasar skor terbaik saya; tanda skin aktif | `skins` |
| `/skins/:skinId` | Detail Skin | Preview ular berwarna skin, deskripsi, syarat buka, tombol **Pakai skin ini** | `skins`; `PATCH players` |
| `/about` | Tentang | Deskripsi game, cara main, panduan makanan (dari `foods`), versi, profil pembuat, link GitHub | `foods` |
| `/settings` | Pengaturan | Ganti username, suara on/off, getar on/off, kecepatan awal (Santai/Normal/Cepat), reset data lokal | localStorage + `PATCH players` |
| — | Onboarding (modal) | Muncul saat belum ada username: input username → `POST players` | `players` |

## Spesifikasi game

- Arena **15×15** petak (konstanta `GRID_SIZE`), canvas diskalakan sesuai lebar layar (maks ~420px), tajam di layar HiDPI (`devicePixelRatio`).
- Ular awal panjang 3, di kiri tengah, bergerak ke kanan. Game baru mulai saat pemain menekan Mulai.
- Gerak berbasis **tick**: awal 150 ms (Santai 180, Cepat 120), berkurang 4 ms setiap makan, minimum 80 ms.
- Input: tombol panah/WASD, **swipe** di canvas (ambang 20px), **d-pad** di layar. Input berbalik 180° diabaikan.
  Simpan antrean maks 2 input per tick supaya belokan cepat tidak hilang.
- Makanan diambil dari tabel `foods` (cache + fallback konstanta lokal kalau offline):
  - `apple` (+10) selalu ada tepat satu di arena.
  - Makanan bonus (`is_bonus = true`): setiap selesai makan, kocok satu bonus berdasar `spawn_chance`;
    maksimal satu bonus di arena; hilang setelah `lifetime_ticks` (berkedip di 15 tick terakhir).
- Makan: skor += `points`, panjang +1, catat per `food_id` untuk `match_foods`.
- Mati: kepala keluar arena (`death_cause = 'wall'`) atau menabrak badan (`'self'`). Getar (`navigator.vibrate`) bila diaktifkan.
- Jeda otomatis saat tab/app tersembunyi (`visibilitychange`).
- Game over: tampilkan skor, panjang, jumlah makanan, durasi; tombol **Main lagi**, **Lihat peringkat**.
  Hasil **otomatis dikirim** (tidak perlu tombol). Kalau gagal/offline → masuk antrean.
- Pisahkan logika dari tampilan: `src/game/engine.js` (state murni: `createGame`, `tick`, `turn`, tanpa DOM)
  dan `src/game/renderer.js` (gambar ke canvas). `GameCanvas.jsx` hanya menghubungkan keduanya dengan React.

## Offline & PWA

- App shell + aset di-precache (`globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}']`).
- Runtime caching GET ke `/api/*` dengan strategi **NetworkFirst** (leaderboard/skin/makanan tetap tampil saat offline dari cache terakhir).
- Game **bisa dimainkan offline**. Match yang gagal terkirim disimpan di localStorage `ull:pendingMatches`
  dan dikirim ulang saat `online` event / saat app dibuka. Karena `id` dibuat di client dan `POST /api/matches`
  idempoten (`on conflict (id) do nothing`), kirim ulang aman.
- Tampilkan indikator kecil "Offline" saat `navigator.onLine === false`.
- Manifest: `name: 'Ularlarilurus'`, `short_name: 'Ularlarilurus'`, `display: 'standalone'`, `orientation: 'portrait'`,
  `theme_color` & `background_color` `#173404`, ikon 192 & 512 (maskable).
- Pertahankan komponen `PWABadge` (prompt update/offline-ready) dari modul.

## localStorage keys

| Key | Isi |
|---|---|
| `ull:player` | `{ id, username, skinId }` |
| `ull:settings` | `{ sound: true, vibrate: true, speed: 'normal' }` |
| `ull:pendingMatches` | array payload match + `foods` yang belum terkirim |
| `ull:localBest` | skor terbaik lokal (ditampilkan saat API belum bisa diakses) |

Semua akses localStorage lewat `src/services/storage.js` dan dibungkus try/catch.

## Struktur folder

```
api/               endpoint REST (Vercel Functions): health.js, leaderboard.js, players/, matches/, skins/, foods.js
  _lib/            db.js (koneksi Neon), http.js (json, handle, HttpError)
public/            icon-192.png, icon-512.png, apple-touch-icon.png, favicon.svg
scripts/           vite-plugin-api.js (menjalankan /api saat dev & preview)
src/
  config/api.js            axios instance (pola Modul PWA II)
  services/                playerService.js, matchService.js, skinService.js, foodService.js,
                           leaderboardService.js, storage.js, syncQueue.js
  game/                    engine.js, renderer.js, constants.js, input.js
  hooks/                   usePlayer.js, useSettings.js, useOnlineStatus.js, useFetch.js
  components/              BottomNav.jsx, PageHeader.jsx, SnakePreview.jsx, LoadingState.jsx,
                           ErrorState.jsx, EmptyState.jsx, OnboardingModal.jsx, PWABadge.jsx
  pages/                   Home.jsx, Play.jsx, Leaderboard.jsx, PlayerDetail.jsx, History.jsx,
                           MatchDetail.jsx, Skins.jsx, SkinDetail.jsx, About.jsx, Settings.jsx
  App.jsx  main.jsx  index.css  App.css
db/schema.sql
docs/ERD.md
vercel.json  .env.example  README.md
```

## Gaya visual

Mobile-first (lebar desain 360–430px), satu kolom. Tema hijau gelap, terasa seperti game, bukan dashboard.

```css
--bg: #173404;        /* latar aplikasi */
--surface: #27500A;   /* kartu, bottom nav, tombol sekunder */
--border: #3B6D11;    /* bingkai arena, garis */
--board-a: #97C459;   /* petak arena */
--board-b: #A8D06A;
--text: #EAF3DE;
--text-muted: #C0DD97;
--accent: #97C459;    /* tombol utama (teks #173404) */
--danger: #E24B4A;
```

Warna ular mengikuti skin (`head_color`, `body_color`, `body_color_alt` belang selang-seling). Kepala punya dua mata yang menghadap arah gerak.
Desain harus orisinal, **jangan meniru tampilan/aset Google Snake** (ular biru bermata, buah apel Google, ikon mereka).
Setiap halaman list wajib punya state **loading**, **error (dengan tombol coba lagi)**, dan **kosong**.

## Konvensi kode

- Nama komponen PascalCase, file `.jsx` untuk komponen, `.js` untuk logika. Nama variabel/fungsi kode dalam bahasa Inggris; teks UI Bahasa Indonesia.
- Semua panggilan API lewat `src/services/*`, tidak ada axios langsung di komponen. Semua SQL hanya di `api/`.
- Respons API: JSON langsung (objek/array, nama kolom snake_case sesuai ERD); error `{ error: { code, message } }` + status HTTP.
- Driver Neon mengembalikan `bigint`/`numeric` sebagai string: cast di SQL (`::int`, `::float8`) sebelum dikirim.
- Jangan hardcode URL/connection string; client dari `import.meta.env`, server dari `process.env`.
- Jangan commit `.env`, `node_modules`, `dist`.
- Setelah perubahan, pastikan `npm run build` sukses tanpa error. Uji tampilan mobile dengan `npm run build && npm run preview -- --host`.

## Perintah

```
npm install
npm run dev                          # pengembangan (frontend + /api)
npm run build && npm run preview     # uji service worker / PWA
npm run preview -- --host            # buka di HP (satu jaringan)
```

## Urutan pengerjaan yang disarankan

1. Scaffold Vite + React, PWA config, routing, BottomNav, semua halaman kosong. Deploy awal ke Vercel.
2. Game engine + renderer + kontrol (tanpa API) sampai enak dimainkan di HP.
3. Neon: jalankan `db/schema.sql`, isi `DATABASE_URL`, endpoint `/api`, `config/api.js`, services, onboarding username.
4. Kirim skor + leaderboard + detail pemain.
5. Riwayat + detail match, Skin + detail skin (pakai skin di game).
6. Tentang, Pengaturan, offline queue, polish UI, README, deploy final.
