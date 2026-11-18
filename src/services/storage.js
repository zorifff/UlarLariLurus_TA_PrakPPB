// Semua akses localStorage lewat file ini (dibungkus try/catch).
// Kalau localStorage tidak bisa dipakai (mode privat, kuota penuh), data disimpan di memori selama sesi.

export const KEYS = {
  player: 'ull:player',
  settings: 'ull:settings',
  pendingMatches: 'ull:pendingMatches',
  localBest: 'ull:localBest',
  accountRemoved: 'ull:accountRemoved',
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

/**
 * Akun dihapus admin: hapus semua progres pemain di perangkat ini (identitas + skin, skor terbaik lokal,
 * antrean skor offline), lalu tinggalkan penanda supaya layar onboarding bisa menjelaskan kenapa harus
 * membuat username lagi. Pengaturan perangkat (suara, getar, kecepatan) dibiarkan.
 */
export function wipeRemovedAccount(username) {
  ;[KEYS.pendingMatches, KEYS.localBest].forEach(remove)
  write(KEYS.accountRemoved, { username: username ?? null, at: new Date().toISOString() })
  remove(KEYS.player) // terakhir: memicu App menampilkan onboarding
}

// ---------- Sesi admin (sessionStorage: otomatis hilang saat tab/browser ditutup) ----------

const ADMIN_TOKEN_KEY = 'ull:adminToken'

/** `{ token, expires_at }` atau null kalau belum login / sudah kedaluwarsa */
export function getAdminSession() {
  const session = readSession(ADMIN_TOKEN_KEY)
  if (!session?.token || !(new Date(session.expires_at).getTime() > Date.now())) return null
  return session
}

export function setAdminSession(session) {
  writeSession(ADMIN_TOKEN_KEY, session)
}

export function clearAdminSession() {
  writeSession(ADMIN_TOKEN_KEY, null)
}

export const subscribeAdminSession = (callback) => subscribe(ADMIN_TOKEN_KEY, callback)

const sessionMemory = new Map()
const sessionCache = new Map()

function readSession(key) {
  let raw = sessionMemory.has(key) ? sessionMemory.get(key) : null
  try {
    raw = window.sessionStorage.getItem(key) ?? raw
  } catch {
    // abaikan, pakai memori
  }
  const cached = sessionCache.get(key)
  if (cached && cached.raw === raw) return cached.value
  let value = null
  try {
    value = raw === null ? null : JSON.parse(raw)
  } catch {
    value = null
  }
  sessionCache.set(key, { raw, value })
  return value
}

function writeSession(key, value) {
  try {
    if (value === null) window.sessionStorage.removeItem(key)
    else window.sessionStorage.setItem(key, JSON.stringify(value))
    sessionMemory.delete(key)
  } catch {
    if (value === null) sessionMemory.delete(key)
    else sessionMemory.set(key, JSON.stringify(value))
  }
  emit(key)
}
