import api from '../config/api.js'
import { getLocalPlayer, setLocalPlayer, remove, KEYS, updateLocalBest } from './storage.js'

/** POST /players — daftarkan pemain baru (id dibuat di client). */
export const registerPlayer = (id, username) => api.post('/players', { id, username })

/** GET /players?username= — { available } */
export const checkUsername = (username) => api.get('/players', { params: { username } })

/** GET /players/:id — data pemain + skin + rank */
export const getPlayer = (id) => api.get(`/players/${id}`)

/** PATCH /players/:id — hanya { username } dan/atau { skin_id } */
export const updatePlayer = (id, patch) => api.patch(`/players/${id}`, patch)

/**
 * Samakan identitas lokal dengan server:
 * - pemain ada → sinkronkan username/skin lokal, simpan skor terbaik
 * - pemain tidak ada (mis. database direset) → daftarkan ulang dengan id & username yang sama
 * - username ternyata sudah dipakai orang lain → hapus identitas lokal (onboarding muncul lagi)
 */
export async function ensureRegistered() {
  const local = getLocalPlayer()
  if (!local) return null

  try {
    const remote = await getPlayer(local.id)
    syncLocal(local, remote)
    return remote
  } catch (err) {
    if (err.status !== 404) throw err
  }

  try {
    const created = await registerPlayer(local.id, local.username)
    syncLocal(local, created)
    return created
  } catch (err) {
    if (err.status === 409) {
      remove(KEYS.player)
      return null
    }
    throw err
  }
}

function syncLocal(local, remote) {
  if (!remote) return
  updateLocalBest(remote.best_score)
  if (remote.username !== local.username || remote.skin_id !== local.skinId) {
    setLocalPlayer({ ...local, username: remote.username, skinId: remote.skin_id })
  }
}
