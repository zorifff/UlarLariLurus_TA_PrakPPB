import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

const getSnapshot = () => navigator.onLine
const getServerSnapshot = () => true

/** true kalau browser sedang online (`navigator.onLine`). */
function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export default useOnlineStatus
