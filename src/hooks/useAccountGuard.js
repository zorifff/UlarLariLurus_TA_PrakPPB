import { useEffect, useRef } from 'react'
import { ensureRegistered } from '../services/playerService.js'

const CHECK_INTERVAL_MS = 30_000 // cek berkala selama aplikasi terbuka
const MIN_GAP_MS = 5_000 // jangan cek lebih sering dari ini (pindah halaman cepat)

/**
 * Pastikan akun pemain di perangkat ini masih ada di server.
 * Kalau admin menghapus akun, `ensureRegistered()` menghapus progres lokal sehingga
 * layar onboarding (buat username) muncul lagi. Dicek saat app dibuka, pindah halaman,
 * kembali ke tab, kembali online, dan setiap 30 detik.
 */
function useAccountGuard(playerId, pathname) {
  const lastCheck = useRef(0)

  useEffect(() => {
    if (!playerId) return undefined

    const check = (force = false) => {
      if (navigator.onLine === false || document.hidden) return
      const now = Date.now()
      if (!force && now - lastCheck.current < MIN_GAP_MS) return
      lastCheck.current = now
      ensureRegistered().catch(() => {}) // error jaringan diabaikan, dicoba lagi nanti
    }

    const onVisible = () => !document.hidden && check(true)
    const onOnline = () => check(true)
    const timer = window.setInterval(() => check(true), CHECK_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
    }
  }, [playerId])

  // Cek juga setiap pindah halaman (dibatasi MIN_GAP_MS)
  useEffect(() => {
    if (!playerId || navigator.onLine === false) return
    const now = Date.now()
    if (now - lastCheck.current < MIN_GAP_MS) return
    lastCheck.current = now
    ensureRegistered().catch(() => {})
  }, [playerId, pathname])
}

export default useAccountGuard
