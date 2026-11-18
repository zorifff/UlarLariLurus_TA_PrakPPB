// Autentikasi admin (hanya satu admin: developer). Tanpa email, cukup kata sandi.
// - Kata sandi disimpan di environment server `ADMIN_PASSWORD` (JANGAN diberi awalan VITE_).
// - Login berhasil -> token bertanda tangan HMAC-SHA256 (berlaku 12 jam), dikirim lewat header
//   `Authorization: Bearer <token>`. Ganti ADMIN_PASSWORD = semua token lama otomatis tidak berlaku.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { HttpError } from './http.js'

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

function getPassword() {
  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    throw new HttpError(500, 'ADMIN_NOT_CONFIGURED', 'ADMIN_PASSWORD belum diisi di environment server.')
  }
  return password
}

const hmac = (data) => createHmac('sha256', `ull-admin:${getPassword()}`).update(data).digest()
const toBase64Url = (value) => Buffer.from(value).toString('base64url')

/** Bandingkan dua buffer tanpa membocorkan informasi lewat waktu eksekusi. */
function safeEqual(a, b) {
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Cek kata sandi. Keduanya di-hash dulu supaya panjangnya sama (aman untuk timingSafeEqual). */
export function checkPassword(input) {
  if (typeof input !== 'string' || !input || input.length > 200) return false
  return safeEqual(hmac(`pw:${input}`), hmac(`pw:${getPassword()}`))
}

/** Buat token sesi admin: `<payload base64url>.<tanda tangan base64url>` */
export function createToken() {
  const expiresAt = Date.now() + TOKEN_TTL_MS
  const payload = toBase64Url(JSON.stringify({ role: 'admin', exp: expiresAt }))
  const signature = hmac(payload).toString('base64url')
  return { token: `${payload}.${signature}`, expires_at: new Date(expiresAt).toISOString() }
}

function verifyToken(token) {
  const [payload, signature, extra] = String(token).split('.')
  if (!payload || !signature || extra !== undefined) return false
  if (!safeEqual(Buffer.from(signature, 'base64url'), hmac(payload))) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return data.role === 'admin' && Number.isFinite(data.exp) && data.exp > Date.now()
  } catch {
    return false
  }
}

/** Lempar 401 kalau request tidak membawa token admin yang valid. */
export function requireAdmin(request) {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token || !verifyToken(token)) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Sesi admin tidak valid atau sudah habis. Silakan masuk lagi.')
  }
}

/** Response JSON khusus admin: jangan pernah disimpan di cache browser / service worker. */
export function adminJson(data, status = 200) {
  return Response.json(data, { status, headers: { 'cache-control': 'no-store' } })
}
