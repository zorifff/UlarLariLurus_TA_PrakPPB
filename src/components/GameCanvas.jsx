import { useEffect, useRef } from 'react'
import { drawGame } from '../game/renderer.js'
import { attachSwipe } from '../game/input.js'

/**
 * Menghubungkan engine & renderer dengan React:
 * - ukuran canvas mengikuti lebar elemen (tajam di layar HiDPI)
 * - satu loop requestAnimationFrame: panggil `onFrame(now)` (logika) lalu gambar `gameRef.current`
 * - swipe di canvas → `onDirection(dir)`
 */
function GameCanvas({ gameRef, skin, foodsById, onFrame, onDirection }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const sizeRef = useRef(0)
  const propsRef = useRef({ skin, foodsById, onFrame, onDirection })

  useEffect(() => {
    propsRef.current = { skin, foodsById, onFrame, onDirection }
  })

  // Ukuran canvas
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const resize = () => {
      const size = Math.floor(wrap.clientWidth)
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      sizeRef.current = size
      canvas.width = Math.round(size * dpr)
      canvas.height = Math.round(size * dpr)
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  // Loop
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    let frameId
    const frame = (now) => {
      const { skin: currentSkin, foodsById: foods, onFrame: step } = propsRef.current
      const progress = step?.(now) ?? 1
      if (gameRef.current && sizeRef.current > 0) {
        drawGame(ctx, gameRef.current, {
          size: sizeRef.current,
          skin: currentSkin,
          foodsById: foods,
          now,
          progress,
        })
      }
      frameId = requestAnimationFrame(frame)
    }
    frameId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(frameId)
  }, [gameRef])

  // Swipe (ambang 12px agar responsif instan saat jari mulai bergeser)
  useEffect(() => attachSwipe(canvasRef.current, (dir) => propsRef.current.onDirection?.(dir), 12), [])

  return (
    <div className="game-canvas" ref={wrapRef}>
      <canvas ref={canvasRef} aria-label="Arena permainan. Geser layar atau pakai tombol arah untuk berbelok." />
    </div>
  )
}

export default GameCanvas
