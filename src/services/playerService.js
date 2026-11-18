import api from '../config/api.js'
import { getLocalPlayer, setLocalPlayer, updateLocalBest, wipeRemovedAccount } from './storage.js'

/** POST /players — daftarkan pemain baru (id dibuat di client). */
export const registerPlayer = (id, username) => api.post('/players', { id, username })

/** GET /players?username= — { available } */
export const checkUsername = (username) => api.get('/players', { params: { username } })

/** GET /players/:id — data pemain + skin + rank */
export const getPlayer = (id) => api.get(`/players/${id}`)

/** PATCH /players/:id — hanya { username } dan/atau { skin_id } */
export const updatePlayer = (id, patch) =>
  api.patch(`/players/${id}`, patch).catch((err) => {
    if (isAccountGone(err)) handleAccountRemoved(id)
    throw err
  })

/**
 * Error API yang berarti akun pemain sudah tidak ada di server (dihapus admin).
 * Sengaja memakai kode khusus, bukan sekadar status 404, supaya salah routing tidak menghapus data pemain.
 */
export const isAccountGone = (err) => err?.status === 404 && err?.code === 'PLAYER_NOT_FOUND'

/**
 * Akun `playerId` sudah dihapus admin: hapus progres lokal → layar onboarding muncul lagi.
 * Hanya berlaku kalau identitas lokal masih akun yang sama (hindari menghapus akun baru
 * karena respons lama yang datang terlambat).
 */
export function handleAccountRemoved(playerId) {
  const local = getLocalPlayer()
  if (local && local.id === playerId) wipeRemovedAccount(local.username)
}

/**
 * Samakan identitas lokal dengan server:
 * - pemain ada → sinkronkan username/skin lokal, simpan skor terbaik
 * - pemain tidak ada (dihapus admin / database direset) → hapus progres lokal, pemain diminta
 *   membuat username baru seperti saat pertama main. Mengembalikan null.
 */
export async function ensureRegistered() {
  const local = getLocalPlayer()
  if (!local) return null

  try {
    const remote = await getPlayer(local.id)
    syncLocal(local, remote)
    return remote
  } catch (err) {
    if (!isAccountGone(err)) throw err
    handleAccountRemoved(local.id)
    return null
  }
}

function syncLocal(local, remote) {
  if (!remote) return
  updateLocalBest(remote.best_score)
  if (remote.username !== local.username || remote.skin_id !== local.skinId) {
    setLocalPlayer({ ...local, username: remote.username, skinId: remote.skin_id })
  }
}
