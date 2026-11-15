// Input: keyboard (panah/WASD) dan swipe di canvas.

const KEY_TO_DIRECTION = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

/** 'up' | 'down' | 'left' | 'right' | null */
export function keyToDirection(key) {
  return KEY_TO_DIRECTION[key] ?? KEY_TO_DIRECTION[key?.toLowerCase?.()] ?? null
}

/**
 * Deteksi swipe di elemen (pointer events). Satu gerakan panjang bisa menghasilkan
 * beberapa belokan: titik awal di-reset setiap kali ambang terlewati.
 * @returns {() => void} fungsi untuk melepas listener
 */
export function attachSwipe(element, onDirection, threshold = 20) {
  let start = null

  const onDown = (e) => {
    start = { x: e.clientX, y: e.clientY, id: e.pointerId }
    element.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e) => {
    if (!start || e.pointerId !== start.id) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return
    const direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
    onDirection(direction)
    start = { ...start, x: e.clientX, y: e.clientY }
  }
  const onEnd = () => {
    start = null
  }

  element.addEventListener('pointerdown', onDown)
  element.addEventListener('pointermove', onMove)
  element.addEventListener('pointerup', onEnd)
  element.addEventListener('pointercancel', onEnd)
  return () => {
    element.removeEventListener('pointerdown', onDown)
    element.removeEventListener('pointermove', onMove)
    element.removeEventListener('pointerup', onEnd)
    element.removeEventListener('pointercancel', onEnd)
  }
}
