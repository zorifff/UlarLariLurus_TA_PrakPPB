// Validasi input sederhana untuk endpoint /api.
import { HttpError } from './http.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/

export const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value)

export function requireUuid(value, field) {
  if (!isUuid(value)) throw new HttpError(400, 'INVALID_FIELD', `${field} harus berupa UUID.`)
  return value.toLowerCase()
}

export function requireUsername(value) {
  if (typeof value !== 'string' || !USERNAME_RE.test(value.trim())) {
    throw new HttpError(400, 'INVALID_USERNAME', 'Username 3–16 karakter, hanya huruf, angka, dan garis bawah (_).')
  }
  return value.trim()
}

/** Bilangan bulat dalam rentang [min, max]. */
export function requireInt(value, field, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new HttpError(400, 'INVALID_FIELD', `${field} harus bilangan bulat ${min}–${max}.`)
  }
  return n
}

/** Query param `limit` dengan default dan batas atas. */
export function readLimit(url, fallback, max = 100) {
  const raw = url.searchParams.get('limit')
  if (raw === null || raw === '') return fallback
  return requireInt(raw, 'limit', { min: 1, max })
}
