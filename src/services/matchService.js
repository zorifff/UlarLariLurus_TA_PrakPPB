import api from '../config/api.js'

/** POST /matches — simpan hasil main (+ foods). Idempoten berdasarkan id. */
export const submitMatch = (payload) => api.post('/matches', payload)

/** GET /matches?player_id= — riwayat match pemain, terbaru dulu */
export const getMatchesByPlayer = (playerId, limit = 50) =>
  api.get('/matches', { params: { player_id: playerId, limit } })

/** GET /matches/:id — detail match + skin + rincian makanan */
export const getMatch = (id) => api.get(`/matches/${id}`)
