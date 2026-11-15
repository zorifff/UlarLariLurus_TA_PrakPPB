import { useCallback, useSyncExternalStore } from 'react'
import { read, subscribe } from '../services/storage.js'

/** Nilai localStorage yang reaktif (komponen render ulang saat nilainya berubah). */
function useStoredValue(key, fallback = null) {
  const sub = useCallback((callback) => subscribe(key, callback), [key])
  return useSyncExternalStore(sub, () => read(key, fallback), () => fallback)
}

export default useStoredValue
