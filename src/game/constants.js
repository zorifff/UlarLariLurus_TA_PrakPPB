// Konstanta game. Data FALLBACK_* sama dengan seed di db/schema.sql,
// dipakai kalau API belum bisa diakses (offline pertama kali).

export const GRID_SIZE = 15
export const INITIAL_LENGTH = 3

/** Interval tick awal (ms) per pilihan kecepatan di Pengaturan */
export const SPEEDS = { santai: 180, normal: 150, cepat: 120 }
export const SPEED_LABELS = { santai: 'Santai', normal: 'Normal', cepat: 'Cepat' }
export const TICK_STEP = 4 // ms lebih cepat setiap makan
export const MIN_TICK = 80
export const BLINK_TICKS = 15 // bonus berkedip di 15 tick terakhir
export const MAX_QUEUED_TURNS = 2

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
export const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }

export const FALLBACK_FOODS = [
  { id: 'apple', name: 'Apel', description: 'Makanan utama. Selalu ada satu di arena.', points: 10, color: '#E24B4A', spawn_chance: 1, lifetime_ticks: null, is_bonus: false, sort_order: 1 },
  { id: 'orange', name: 'Jeruk', description: 'Bonus yang cukup sering muncul, hilang setelah beberapa saat.', points: 20, color: '#EF9F27', spawn_chance: 0.2, lifetime_ticks: 50, is_bonus: true, sort_order: 2 },
  { id: 'grape', name: 'Anggur', description: 'Bonus bernilai tinggi. Cepat, sebelum hilang!', points: 30, color: '#7F77DD', spawn_chance: 0.12, lifetime_ticks: 40, is_bonus: true, sort_order: 3 },
  { id: 'dragonfruit', name: 'Buah Naga', description: 'Bonus langka dengan poin terbesar.', points: 50, color: '#D4537E', spawn_chance: 0.05, lifetime_ticks: 30, is_bonus: true, sort_order: 4 },
]

export const FALLBACK_SKINS = [
  { id: 1, name: 'Oranye Klasik', description: 'Skin bawaan. Ular oranye yang lari lurus sejak hari pertama.', head_color: '#993C1D', body_color: '#D85A30', body_color_alt: '#E8703F', unlock_score: 0, sort_order: 1 },
  { id: 2, name: 'Daun Muda', description: 'Hijau segar, menyamar di antara rumput arena.', head_color: '#27500A', body_color: '#639922', body_color_alt: '#7FB13A', unlock_score: 50, sort_order: 2 },
  { id: 3, name: 'Biru Laut', description: 'Tenang di luar, cepat di dalam.', head_color: '#0C447C', body_color: '#378ADD', body_color_alt: '#5A9FE6', unlock_score: 150, sort_order: 3 },
  { id: 4, name: 'Ungu Anggur', description: 'Untuk penggemar anggur bonus.', head_color: '#3C3489', body_color: '#7F77DD', body_color_alt: '#958EE4', unlock_score: 300, sort_order: 4 },
  { id: 5, name: 'Kopi Susu', description: 'Cokelat hangat, cocok untuk main sambil begadang.', head_color: '#633806', body_color: '#BA7517', body_color_alt: '#D08F33', unlock_score: 500, sort_order: 5 },
  { id: 6, name: 'Lebah Emas', description: 'Belang hitam kuning. Hanya untuk ular legendaris.', head_color: '#2C2C2A', body_color: '#EF9F27', body_color_alt: '#444441', unlock_score: 1000, sort_order: 6 },
]

export const DEFAULT_SKIN = FALLBACK_SKINS[0]

export const findFallbackSkin = (id) => FALLBACK_SKINS.find((s) => s.id === Number(id)) ?? DEFAULT_SKIN
