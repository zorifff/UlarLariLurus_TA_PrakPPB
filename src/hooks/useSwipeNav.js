import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const NAV_PATHS = ['/', '/leaderboard', '/history', '/skins', '/about']

const SWIPE_MIN_X = 56 // jarak horizontal minimum (px)
const SWIPE_MAX_TIME_MS = 700 // abaikan tahan terlalu lama
const HORIZONTAL_RATIO = 1.35 // dx harus jauh lebih besar dari dy supaya tidak bentrok dengan scroll vertikal

/**
 * Navigasi geser (slide/swipe) antar 5 menu utama di BottomNav:
 * Main (/) ↔ Peringkat (/leaderboard) ↔ Riwayat (/history) ↔ Skin (/skins) ↔ Tentang (/about)
 *
 * - Geser ke kanan (dx > 0) → pindah ke menu sebelah kanan (mis. Main → Peringkat)
 * - Geser ke kiri  (dx < 0) → kembali ke menu sebelah kiri (mis. Peringkat → Main)
 * - Mendukung layar sentuh (HP) maupun drag mouse (desktop).
 */
function useSwipeNav(pathname) {
  const navigate = useNavigate()
  const index = NAV_PATHS.indexOf(pathname)
  const [navState, setNavState] = useState({ index, dir: null })
  const suppressClickRef = useRef(false)

  if (navState.index !== index) {
    const dir = index !== -1 && navState.index !== -1 ? (index > navState.index ? 'next' : 'prev') : null
    setNavState({ index, dir })
  }

  useEffect(() => {
    if (index === -1) return undefined

    let start = null

    const isIgnoredTarget = (target) =>
      target instanceof Element &&
      Boolean(target.closest('input, textarea, select, [role="radiogroup"], .bottom-nav, canvas'))

    const begin = (x, y, target) => {
      if (isIgnoredTarget(target)) {
        start = null
        return
      }
      start = { x, y, time: Date.now() }
    }

    const finish = (x, y) => {
      if (!start) return
      const dx = x - start.x
      const dy = y - start.y
      const elapsed = Date.now() - start.time
      start = null

      if (elapsed > SWIPE_MAX_TIME_MS) return
      if (Math.abs(dx) < SWIPE_MIN_X || Math.abs(dx) < Math.abs(dy) * HORIZONTAL_RATIO) return

      // Geser dari kanan ke kiri (dx < 0) -> pindah ke menu kanan (index + 1)
      // Geser dari kiri ke kanan (dx > 0) -> kembali ke menu kiri (index - 1)
      const nextIndex = dx < 0 ? index + 1 : index - 1
      if (nextIndex < 0 || nextIndex >= NAV_PATHS.length) return

      suppressClickRef.current = true
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 80)
      navigate(NAV_PATHS[nextIndex])
    }

    // Touch events (HP/tablet: paling konsisten walaupun halaman bisa di-scroll)
    const onTouchStart = (e) => {
      if (e.touches.length !== 1) {
        start = null
        return
      }
      const t = e.touches[0]
      begin(t.clientX, t.clientY, e.target)
    }

    const onTouchEnd = (e) => {
      if (e.changedTouches.length !== 1) return
      const t = e.changedTouches[0]
      finish(t.clientX, t.clientY)
    }

    // Mouse drag (desktop/laptop)
    const onMouseDown = (e) => {
      if (e.button !== 0) return
      begin(e.clientX, e.clientY, e.target)
    }

    const onMouseUp = (e) => {
      finish(e.clientX, e.clientY)
    }

    const onDragStart = (e) => {
      // Cegah browser men-drag link/gambar saat user menggeser layar pakai mouse
      if (start) e.preventDefault()
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('dragstart', onDragStart)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('dragstart', onDragStart)
    }
  }, [index, navigate])

  // Cegah klik tidak sengaja pada kartu/link saat user selesai menggeser layar dengan mouse
  const onClickCapture = useCallback((e) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  return { slideClass: navState.dir ? `app-main--slide-${navState.dir}` : '', onClickCapture }
}

export default useSwipeNav
