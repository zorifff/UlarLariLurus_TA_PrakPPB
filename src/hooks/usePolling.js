import { useEffect, useRef } from 'react'

/**
 * Panggil `callback` setiap `intervalMs` selama tab terlihat, dan langsung saat tab kembali aktif.
 * Dipakai halaman admin supaya data (skor, peringkat) selalu terbaru.
 */
function usePolling(callback, intervalMs) {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const run = () => {
      if (!document.hidden && navigator.onLine !== false) callbackRef.current()
    }
    const timer = window.setInterval(run, intervalMs)
    const onVisible = () => !document.hidden && run()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', run)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', run)
    }
  }, [intervalMs])
}

export default usePolling
