import axios from 'axios'

/**
 * Instance axios untuk API Ularlarilurus (folder /api, Vercel Functions + Neon).
 * - baseURL dari VITE_API_BASE_URL, default '/api' (domain yang sama)
 * - response interceptor: langsung kembalikan response.data
 * - error dinormalisasi menjadi ApiError { message, status, code, isNetwork }
 */
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', isNetwork = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.isNetwork = isNetwork
  }

  /** Error sementara (offline / server bermasalah) yang layak dicoba ulang nanti. */
  get isRetryable() {
    return this.isNetwork || this.status >= 500 || this.status === 408 || this.status === 429
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => {
    // Jaga-jaga: kalau yang datang HTML (salah routing), anggap error server
    if (typeof response.data === 'string' && response.data.trimStart().startsWith('<')) {
      throw new ApiError('Respons server tidak valid.', { status: 502, code: 'BAD_RESPONSE' })
    }
    return response.data
  },
  (error) => Promise.reject(normalizeError(error)),
)

function normalizeError(error) {
  if (error instanceof ApiError) return error

  if (error.response) {
    const { status, data } = error.response
    const body = data?.error
    return new ApiError(body?.message || `Server mengembalikan error (${status}).`, {
      status,
      code: body?.code || `HTTP_${status}`,
    })
  }

  const offline = typeof navigator !== 'undefined' && navigator.onLine === false
  return new ApiError(
    offline ? 'Kamu sedang offline. Periksa koneksi internet.' : 'Tidak dapat terhubung ke server.',
    { code: error.code === 'ECONNABORTED' ? 'TIMEOUT' : 'NETWORK', isNetwork: true },
  )
}

export default api
