import { useCallback } from 'react'
import { KEYS, setLocalPlayer, remove } from '../services/storage.js'
import useStoredValue from './useStoredValue.js'

/**
 * Identitas pemain di perangkat ini: `{ id, username, skinId }` atau null (belum onboarding).
 */
function usePlayer() {
  const player = useStoredValue(KEYS.player, null)

  const updatePlayer = useCallback((patch) => {
    if (player) setLocalPlayer({ ...player, ...patch })
  }, [player])

  const clearPlayer = useCallback(() => remove(KEYS.player), [])

  return { player, savePlayer: setLocalPlayer, updatePlayer, clearPlayer }
}

export default usePlayer
