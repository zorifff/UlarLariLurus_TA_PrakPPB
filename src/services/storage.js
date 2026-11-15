// Semua akses localStorage lewat file ini (dibungkus try/catch).
// Kalau localStorage tidak bisa dipakai (mode privat, kuota penuh), data disimpan di memori selama sesi.

export const KEYS = {
  player: 'ull:player',
  settings: 'ull:settings',
  pendingMatches: 'ull:pendingMatches',
  localBest: 'ull:localBest',
}

export const DEFAULT_SETTINGS = Object.freeze({ sound: true, vibrate: true, speed: 'normal' })
const EMPTY_LIST = Object.freeze([])

const memory = new Map() // fallback kalau localStorage gagal
const cache = new Map() // key -> { raw, value } supaya referensi objek stabil
const listeners = new Map() // key -> Set<callback>

function getRaw(key) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw !== null) return raw
  } catch {
    // abaikan, pakai memori
  }
  return memory.has(key) ? memory.get(key) : null
}

function emit(key) {
  listeners.get(key)?.forEach((callback) => callback())
}

/** Baca nilai JSON. Nilai yang sama mengembalikan referensi objek yang sama. */
export function read(key, fallback = null) {
  const raw = getRaw(key)
  const cached = cache.get(key)
  if (cached && cached.raw === raw && cached.fallback === fallback) return cached.value

  let value = fallback
  if (raw !== null) {
    try {
      value = JSON.parse(raw)
    } catch {
      value = fallback
    }
  }
  cache.set(key, { raw, value, fallback })
  return value
}

export function write(key, value) {
  const raw = JSON.stringify(value)
  try {
    window.localStorage.setItem(key, raw)
    memory.delete(key)
  } catch {
    memory.set(key, raw)
  }
  emit(key)
}

export function remove(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // abaikan
  }
  memory.delete(key)
  emit(key)
}

/** Dengarkan perubahan satu key (termasuk dari tab lain). */
export function subscribe(key, callback) {
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key).add(callback)
  return () => listeners.get(key)?.delete(callback)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === null) Object.values(KEYS).forEach(emit)
    else if (listeners.has(event.key)) emit(event.key)
  })
}

// ---------- Helper per key ----------

/** `{ id, username, skinId }` atau null */
export const getLocalPlayer = () => read(KEYS.player, null)
export const setLocalPlayer = (player) => write(KEYS.player, player)

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, null) }
}
export const setSettings = (settings) => write(KEYS.settings, settings)

export function getPendingMatches() {
  const list = read(KEYS.pendingMatches, EMPTY_LIST)
  return Array.isArray(list) ? list : EMPTY_LIST
}
export const setPendingMatches = (list) => write(KEYS.pendingMatches, list)

export function getLocalBest() {
  const value = read(KEYS.localBest, 0)
  return Number.isFinite(value) ? value : 0
}
export function updateLocalBest(score) {
  if (Number.isFinite(score) && score > getLocalBest()) write(KEYS.localBest, score)
}

/** Hapus semua data lokal aplikasi (dipakai di Pengaturan > Reset). */
export function clearAll() {
  Object.values(KEYS).forEach(remove)
}
