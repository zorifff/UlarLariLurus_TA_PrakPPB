import { useCallback, useMemo } from 'react'
import { KEYS, DEFAULT_SETTINGS, setSettings } from '../services/storage.js'
import useStoredValue from './useStoredValue.js'

/** Pengaturan `{ sound, vibrate, speed }` digabung dengan nilai default. */
function useSettings() {
  const stored = useStoredValue(KEYS.settings, null)
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...stored }), [stored])

  const updateSettings = useCallback((patch) => setSettings({ ...settings, ...patch }), [settings])

  return { settings, updateSettings }
}

export default useSettings
