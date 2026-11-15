import { KEYS } from '../services/storage.js'
import useMyProfile from './useMyProfile.js'
import useStoredValue from './useStoredValue.js'

/** Skor terbaik untuk membuka skin: dari server (acuan PATCH), cadangan dari lokal. */
function useUnlockScore() {
  const profile = useMyProfile()
  const localBest = useStoredValue(KEYS.localBest, 0)
  return { best: profile.data?.best_score ?? (Number(localBest) || 0), profile }
}

export default useUnlockScore
