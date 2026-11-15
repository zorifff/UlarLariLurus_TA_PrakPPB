import { ensureRegistered } from '../services/playerService.js'
import usePlayer from './usePlayer.js'
import useFetch from './useFetch.js'

/**
 * Profil pemain saya dari server (best_score, rank, skin, statistik).
 * Sekaligus memastikan pemain terdaftar (daftar ulang otomatis kalau database pernah direset).
 */
function useMyProfile() {
  const { player } = usePlayer()
  return useFetch(player ? () => ensureRegistered() : null, [player?.id])
}

export default useMyProfile
