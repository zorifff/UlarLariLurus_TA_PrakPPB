// Helper HTTP untuk endpoint /api (Web standard Request/Response).
// File/folder berawalan "_" tidak dijadikan endpoint oleh Vercel.

export class HttpError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

/** Response JSON. `no-cache` = boleh disimpan service worker, tapi selalu cek ulang ke server. */
export function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'cache-control': 'no-cache' },
  })
}

/** Body JSON dari request; error 400 kalau bukan JSON valid. */
export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    throw new HttpError(400, 'INVALID_JSON', 'Body request harus berupa JSON yang valid.')
  }
}

/** Segmen terakhir path, mis. "/api/players/abc" -> "abc" (untuk route [id].js). */
export function lastPathSegment(request) {
  const parts = new URL(request.url).pathname.split('/').filter(Boolean)
  return decodeURIComponent(parts.at(-1) ?? '')
}

// Kode error Postgres -> status HTTP
const PG_ERRORS = {
  '23505': [409, 'DUPLICATE', 'Data sudah ada (duplikat).'],
  '23503': [400, 'INVALID_REFERENCE', 'Data yang dirujuk tidak ditemukan.'],
  '23514': [400, 'CHECK_VIOLATION', 'Data tidak memenuhi aturan validasi.'],
  '23502': [400, 'MISSING_FIELD', 'Ada kolom wajib yang kosong.'],
  '22P02': [400, 'INVALID_FORMAT', 'Format data tidak valid.'],
}

/**
 * Bungkus handler supaya semua error jadi JSON `{ error: { code, message } }`.
 * Pemakaian: `export const GET = handle(async (request) => json(...))`
 */
export function handle(fn) {
  return async (request) => {
    try {
      return await fn(request)
    } catch (err) {
      if (err instanceof HttpError) {
        return json({ error: { code: err.code, message: err.message } }, err.status)
      }
      const pg = PG_ERRORS[err?.code]
      if (pg) {
        const [status, code, message] = pg
        return json({ error: { code, message, detail: err.detail ?? err.message } }, status)
      }
      console.error('[api] unhandled error:', err)
      return json({ error: { code: 'SERVER_ERROR', message: 'Terjadi kesalahan di server.' } }, 500)
    }
  }
}
