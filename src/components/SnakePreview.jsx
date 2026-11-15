import { useId } from 'react'
import { DEFAULT_SKIN } from '../game/constants.js'

// Jalur ular berbentuk S di papan 8x7 (kepala dulu), sama dengan ikon aplikasi
const BOARD_PATH = [
  [4, 1], [3, 1], [2, 1], [1, 1],
  [1, 2],
  [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
  [6, 4],
  [6, 5], [5, 5], [4, 5], [3, 5], [2, 5], [1, 5],
]
const BOARD_W = 8
const BOARD_H = 7

/**
 * Pratinjau ular dengan warna skin (SVG).
 * - variant "line": ular lurus `segments` ruas, menghadap kanan
 * - variant "board": ular berbentuk S di atas papan mini
 */
function SnakePreview({ skin, segments = 5, cell = 16, variant = 'line', locked = false, className = '', label }) {
  const clipId = useId()
  const s = skin ?? DEFAULT_SKIN
  const head = s.head_color ?? DEFAULT_SKIN.head_color
  const body = s.body_color ?? DEFAULT_SKIN.body_color
  const alt = s.body_color_alt ?? body

  const isBoard = variant === 'board'
  const width = isBoard ? BOARD_W : segments
  const height = isBoard ? BOARD_H : 1
  const cells = isBoard ? BOARD_PATH : Array.from({ length: segments }, (_, i) => [segments - 1 - i, 0])
  const [hx, hy] = cells[0]

  return (
    <svg
      className={`snake-preview${locked ? ' is-locked' : ''} ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      width={width * cell}
      height={height * cell}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {isBoard && (
        <>
          <clipPath id={clipId}>
            <rect width={BOARD_W} height={BOARD_H} rx="0.5" />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            {Array.from({ length: BOARD_W * BOARD_H }, (_, i) => {
              const x = i % BOARD_W
              const y = Math.floor(i / BOARD_W)
              return <rect key={i} x={x} y={y} width="1.02" height="1.02" fill={(x + y) % 2 ? '#A8D06A' : '#97C459'} />
            })}
          </g>
          <circle cx="6.5" cy="1.53" r="0.36" fill="#E24B4A" />
          <circle cx="6.36" cy="1.4" r="0.08" fill="rgba(255,255,255,0.55)" />
        </>
      )}
      {cells
        .map(([x, y], i) => (
          <rect
            key={i}
            x={x + 0.06}
            y={y + 0.06}
            width="0.88"
            height="0.88"
            rx={i === 0 ? 0.34 : 0.22}
            fill={i === 0 ? head : i % 2 === 1 ? body : alt}
          />
        ))
        .reverse()}
      <circle cx={hx + 0.62} cy={hy + 0.3} r="0.16" fill="#fff" />
      <circle cx={hx + 0.62} cy={hy + 0.7} r="0.16" fill="#fff" />
      <circle cx={hx + 0.68} cy={hy + 0.3} r="0.08" fill="#1A1A1A" />
      <circle cx={hx + 0.68} cy={hy + 0.7} r="0.08" fill="#1A1A1A" />
    </svg>
  )
}

export default SnakePreview
