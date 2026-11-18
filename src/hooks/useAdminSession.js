import { useSyncExternalStore } from 'react'
import { getAdminSession, subscribeAdminSession } from '../services/storage.js'

/** Sesi admin saat ini (`{ token, expires_at }`) atau null kalau belum login / kedaluwarsa. */
function useAdminSession() {
  return useSyncExternalStore(subscribeAdminSession, getAdminSession, () => null)
}

export default useAdminSession
