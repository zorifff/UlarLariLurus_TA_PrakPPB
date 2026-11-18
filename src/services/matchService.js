import api from '../config/api.js'
import { handleAccountRemoved, isAccountGone } from './playerService.js'

/**
 * POST /matches — simpan hasil main (+ foods). Idempoten berdasarkan id.
 * Kalau akun sudah dihapus admin, progres lokal dihapus dan onboarding muncul lagi.
 */
export const submitMatch = (payload) =>
  api.post('/matches', payload).catch((err) => {
    if (isAccountGone(err)) handleAccountRemoved(payload.player_id)
    throw err
  })

/** GET /matches?player_id= — riwayat match pemain, terbaru dulu */
export const getMatchesByPlayer = (playerId, limit = 50) =>
  api.get('/matches', { params: { player_id: playerId, limit } })

/** GET /matches/:id — detail match + skin + rincian makanan */
export const getMatch = (id) => api.get(`/matches/${id}`)
