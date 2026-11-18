// Menggambar state game ke canvas 2D. Tidak mengubah state.
import { BLINK_TICKS, DIRECTIONS, DEFAULT_SKIN } from './constants.js'

const BOARD_A = '#97C459'
const BOARD_B = '#A8D06A'

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h) // browser lama
  ctx.fill()
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

/** Gambar satu makanan berpusat di (cx, cy) dengan ukuran petak `cell`. */
export function drawFood(ctx, foodId, color, cx, cy, cell) {
  const r = cell * 0.36
  switch (foodId) {
    case 'apple': {
      circle(ctx, cx, cy + cell * 0.03, r, color)
      ctx.fillStyle = '#6B3A1E' // tangkai
      roundRect(ctx, cx - cell * 0.035, cy - r - cell * 0.1, cell * 0.07, cell * 0.16, cell * 0.03)
      circle(ctx, cx - r * 0.38, cy - r * 0.3, r * 0.22, 'rgba(255,255,255,0.55)')
      break
    }
    case 'orange': {
      circle(ctx, cx, cy, r, color)
      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      for (const [dx, dy] of [[-0.3, -0.2], [0.25, -0.05], [-0.05, 0.3], [0.2, 0.35], [-0.35, 0.2]]) {
        ctx.beginPath()
        ctx.arc(cx + dx * r, cy + dy * r, r * 0.08, 0, Math.PI * 2)
        ctx.fill()
      }
      circle(ctx, cx, cy - r * 0.92, r * 0.2, '#3B6D11')
      break
    }
    case 'grape': {
      const g = r * 0.36
      const spots = [[-1, -0.9], [0, -0.9], [1, -0.9], [-0.5, 0], [0.5, 0], [0, 0.9]]
      for (const [dx, dy] of spots) circle(ctx, cx + dx * g * 1.05, cy + dy * g * 1.05 + g * 0.2, g, color)
      for (const [dx, dy] of spots) circle(ctx, cx + dx * g * 1.05 - g * 0.3, cy + dy * g * 1.05 - g * 0.1, g * 0.3, 'rgba(255,255,255,0.4)')
      ctx.fillStyle = '#3B6D11'
      roundRect(ctx, cx - cell * 0.03, cy - r - cell * 0.06, cell * 0.06, cell * 0.14, cell * 0.03)
      break
    }
    case 'dragonfruit': {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.ellipse(cx, cy, r * 0.85, r, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#7FB13A' // sisik hijau
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6
        const bx = cx + Math.cos(a) * r * 0.75
        const by = cy + Math.sin(a) * r * 0.85
        ctx.beginPath()
        ctx.moveTo(bx + Math.cos(a) * r * 0.45, by + Math.sin(a) * r * 0.45)
        ctx.lineTo(bx + Math.cos(a + 1.6) * r * 0.2, by + Math.sin(a + 1.6) * r * 0.2)
        ctx.lineTo(bx + Math.cos(a - 1.6) * r * 0.2, by + Math.sin(a - 1.6) * r * 0.2)
        ctx.fill()
      }
      circle(ctx, cx - r * 0.3, cy - r * 0.35, r * 0.16, 'rgba(255,255,255,0.45)')
      break
    }
    default:
      circle(ctx, cx, cy, r, color)
  }
}

function drawEyes(ctx, cx, cy, cell, direction, dead) {
  const d = DIRECTIONS[direction] ?? DIRECTIONS.right
  const perp = { x: -d.y, y: d.x }
  for (const side of [-1, 1]) {
    const ex = cx + d.x * cell * 0.12 + perp.x * side * cell * 0.2
    const ey = cy + d.y * cell * 0.12 + perp.y * side * cell * 0.2
    if (dead) {
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = Math.max(1.5, cell * 0.07)
      ctx.lineCap = 'round'
      const s = cell * 0.1
      ctx.beginPath()
      ctx.moveTo(ex - s, ey - s)
      ctx.lineTo(ex + s, ey + s)
      ctx.moveTo(ex + s, ey - s)
      ctx.lineTo(ex - s, ey + s)
      ctx.stroke()
    } else {
      circle(ctx, ex, ey, cell * 0.16, '#FFFFFF')
      circle(ctx, ex + d.x * cell * 0.06, ey + d.y * cell * 0.06, cell * 0.08, '#1A1A1A')
    }
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx  sudah diskalakan devicePixelRatio
 * @param {object} state  state dari engine
 * @param {{ size: number, skin?: object, foodsById: Record<string, object>, now: number, progress?: number }} options
 */
export function drawGame(ctx, state, { size, skin = DEFAULT_SKIN, foodsById = {}, now = 0, progress = 1 }) {
  const { gridSize } = state
  const cell = size / gridSize
  const t = state.status === 'running' || state.status === 'paused' ? Math.max(0, Math.min(1, progress)) : 1

  // Papan kotak-kotak
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? BOARD_A : BOARD_B
      ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5)
    }
  }

  // Makanan yang baru dimakan di tick ini: mengecil saat kepala ular melintasinya
  if (state.justAte && t < 0.72) {
    const eatenFood =
      foodsById[state.justAte.foodId] ??
      state.bonusFoods?.find((f) => f.id === state.justAte.foodId) ??
      state.mainFood
    if (eatenFood) {
      const scale = t <= 0.35 ? 1 : (0.72 - t) / 0.37
      const cx = (state.justAte.x + 0.5) * cell
      const cy = (state.justAte.y + 0.5) * cell
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(scale, scale)
      drawFood(ctx, eatenFood.id, eatenFood.color, 0, 0, cell)
      ctx.restore()
    }
  }

  // Makanan utama
  if (state.food) {
    const food = foodsById[state.food.foodId] ?? state.mainFood
    const cx = (state.food.x + 0.5) * cell
    const cy = (state.food.y + 0.5) * cell
    const popScale = state.justAte?.foodId === state.food.foodId ? Math.min(1, t * 1.8) : 1
    if (popScale < 1) {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(popScale, popScale)
      drawFood(ctx, food.id, food.color, 0, 0, cell)
      ctx.restore()
    } else {
      drawFood(ctx, food.id, food.color, cx, cy, cell)
    }
  }

  // Bonus: berdenyut, berkedip di 15 tick terakhir
  if (state.bonus) {
    const food = foodsById[state.bonus.foodId] ?? state.bonusFoods.find((f) => f.id === state.bonus.foodId)
    const blinking = state.bonus.ticksLeft <= BLINK_TICKS
    const visible = !blinking || Math.floor(now / 140) % 2 === 0
    if (food && visible) {
      const pulse = 1 + Math.sin(now / 160) * 0.06
      const cx = (state.bonus.x + 0.5) * cell
      const cy = (state.bonus.y + 0.5) * cell
      circle(ctx, cx, cy, cell * 0.48, 'rgba(255,255,255,0.35)')
      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(pulse, pulse)
      drawFood(ctx, food.id, food.color, 0, 0, cell)
      ctx.restore()
    }
  }

  // Ular: interpolasi sub-tick (60/120 FPS) dari ekor ke kepala, belang selang-seling tanpa celah di tikungan
  const { snake } = state
  const prevSnake = state.prevSnake ?? snake
  const pos = snake.map((part, i) => {
    const prev = prevSnake[i] ?? prevSnake[prevSnake.length - 1] ?? part
    return {
      x: prev.x + (part.x - prev.x) * t,
      y: prev.y + (part.y - prev.y) * t,
    }
  })

  const inset = cell * 0.06
  for (let i = snake.length - 1; i >= 0; i--) {
    const part = snake[i]
    const p = pos[i]
    const isHead = i === 0
    const prev = prevSnake[i] ?? prevSnake[prevSnake.length - 1] ?? part
    const next = i > 0 ? snake[i - 1] : null
    const isCorner = Boolean(next && t < 1 && prev.x !== next.x && prev.y !== next.y)

    let targetX = p.x
    let targetY = p.y
    if (isCorner) {
      targetX = part.x
      targetY = part.y
    } else if (next) {
      // Sambungkan sedikit ke ruas di depannya supaya badan ular menyatu mulus
      targetX = p.x + Math.sign(pos[i - 1].x - p.x) * 0.16
      targetY = p.y + Math.sign(pos[i - 1].y - p.y) * 0.16
    }

    const x1 = Math.min(p.x, targetX)
    const y1 = Math.min(p.y, targetY)
    const x2 = Math.max(p.x, targetX)
    const y2 = Math.max(p.y, targetY)

    ctx.fillStyle = isHead ? skin.head_color : i % 2 === 1 ? skin.body_color : skin.body_color_alt
    roundRect(
      ctx,
      x1 * cell + inset,
      y1 * cell + inset,
      (x2 - x1 + 1) * cell - inset * 2,
      (y2 - y1 + 1) * cell - inset * 2,
      cell * (isHead ? 0.34 : 0.22),
    )
  }
  const head = pos[0]
  const eyeDirection = state.queue?.[0] ?? state.direction
  drawEyes(ctx, (head.x + 0.5) * cell, (head.y + 0.5) * cell, cell, eyeDirection, state.status === 'over')
}
