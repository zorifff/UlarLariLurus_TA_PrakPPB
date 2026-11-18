// Antrean match offline (localStorage `ull:pendingMatches`).
// Match yang gagal terkirim karena offline/server error disimpan, lalu dikirim ulang
// saat event `online` atau saat aplikasi dibuka. Aman dikirim ulang: POST /matches idempoten.
import { getPendingMatches, setPendingMatches } from './storage.js'
import { submitMatch } from './matchService.js'
import { ensureRegistered, isAccountGone } from './playerService.js'

export function enqueueMatch(payload) {
  const pending = getPendingMatches()
  if (pending.some((m) => m.id === payload.id)) return
  setPendingMatches([...pending, payload])
}

function removePending(id) {
  setPendingMatches(getPendingMatches().filter((m) => m.id !== id))
}

let running = null

/**
 * Kirim semua match di antrean. Berhenti di error sementara (offline/5xx);
 * match yang ditolak server (4xx) dibuang supaya antrean tidak macet.
 * @returns {Promise<{ sent: number, dropped: number, remaining: number }>}
 */
export function flushQueue() {
  if (running) return running

  running = (async () => {
    let sent = 0
    let dropped = 0
    const pending = getPendingMatches()
    if (!pending.length || navigator.onLine === false) {
      return { sent, dropped, remaining: pending.length }
    }

    // Pastikan akun masih ada di server dulu (kalau sudah dihapus admin, antrean ikut dibuang)
    const player = await ensureRegistered().catch(() => null)
    if (!player) return { sent, dropped, remaining: pending.length }

    for (const match of pending) {
      try {
        await submitMatch(match)
        removePending(match.id)
        sent++
      } catch (err) {
        if (err.isRetryable) break
        if (isAccountGone(err)) return { sent, dropped, remaining: 0 } // akun dihapus: antrean ikut dibuang
        removePending(match.id)
        dropped++
      }
    }
    return { sent, dropped, remaining: getPendingMatches().length }
  })().finally(() => {
    running = null
  })

  return running
}
