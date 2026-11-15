import { KEYS } from '../services/storage.js'
import useStoredValue from './useStoredValue.js'

const NONE = []

/** Daftar match yang belum terkirim (antrean offline). */
function usePendingMatches() {
  const list = useStoredValue(KEYS.pendingMatches, NONE)
  return Array.isArray(list) ? list : NONE
}

export default usePendingMatches
