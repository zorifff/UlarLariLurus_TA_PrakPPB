// Logika game murni (tanpa DOM). Setiap fungsi menerima state lama dan mengembalikan state baru.
import {
  GRID_SIZE,
  INITIAL_LENGTH,
  SPEEDS,
  TICK_STEP,
  MIN_TICK,
  DIRECTIONS,
  OPPOSITE,
  MAX_QUEUED_TURNS,
  FALLBACK_FOODS,
} from './constants.js'

const samePos = (a, b) => a && b && a.x === b.x && a.y === b.y

/** Petak kosong acak (bukan badan ular / makanan lain), atau null kalau arena penuh. */
function randomFreeCell(gridSize, occupied, rng) {
  const taken = new Set(occupied.filter(Boolean).map((p) => p.y * gridSize + p.x))
  const free = []
  for (let i = 0; i < gridSize * gridSize; i++) if (!taken.has(i)) free.push(i)
  if (!free.length) return null
  const index = free[Math.floor(rng() * free.length)]
  return { x: index % gridSize, y: Math.floor(index / gridSize) }
}

/** Kocok satu makanan bonus berdasarkan spawn_chance (kumulatif). */
function rollBonus(bonusFoods, rng) {
  let r = rng()
  for (const food of bonusFoods) {
    if (r < food.spawn_chance) return food
    r -= food.spawn_chance
  }
  return null
}

/**
 * Buat game baru (status 'ready'; mulai dengan `start`).
 * @param {{ gridSize?: number, foods?: object[], speed?: 'santai'|'normal'|'cepat', rng?: () => number }} options
 */
export function createGame({ gridSize = GRID_SIZE, foods = FALLBACK_FOODS, speed = 'normal', rng = Math.random } = {}) {
  const mainFood = foods.find((f) => f.id === 'apple') ?? foods.find((f) => !f.is_bonus) ?? FALLBACK_FOODS[0]
  const bonusFoods = foods.filter((f) => f.is_bonus && f.spawn_chance > 0)

  // Kiri tengah, kepala di depan (indeks 0), menghadap kanan
  const row = Math.floor(gridSize / 2)
  const snake = Array.from({ length: INITIAL_LENGTH }, (_, i) => ({ x: INITIAL_LENGTH - i, y: row }))

  // Apel pertama tidak muncul di baris yang sama tepat di depan kepala (biar tidak terlalu gampang)
  let food = null
  for (let tries = 0; tries < 20; tries++) {
    food = randomFreeCell(gridSize, snake, rng)
    if (food && food.y !== row) break
  }

  return {
    gridSize,
    snake,
    direction: 'right',
    queue: [],
    mainFood,
    bonusFoods,
    food: food && { ...food, foodId: mainFood.id },
    bonus: null, // { x, y, foodId, ticksLeft, lifetime }
    score: 0,
    foodEaten: 0,
    eaten: {}, // { [foodId]: quantity }
    tickMs: SPEEDS[speed] ?? SPEEDS.normal,
    tickCount: 0,
    status: 'ready', // ready | running | paused | over
    deathCause: null, // wall | self
    events: [], // event tick terakhir: 'eat' | 'bonus' | 'die'
  }
}

export const start = (state) => (state.status === 'ready' ? { ...state, status: 'running' } : state)
export const pause = (state) => (state.status === 'running' ? { ...state, status: 'paused' } : state)
export const resume = (state) => (state.status === 'paused' ? { ...state, status: 'running' } : state)

/**
 * Antrekan belokan. Belokan 180° atau arah yang sama diabaikan; maksimal 2 belokan per tick.
 */
export function turn(state, direction) {
  if (!DIRECTIONS[direction] || state.status === 'over') return state
  const last = state.queue.length ? state.queue[state.queue.length - 1] : state.direction
  if (direction === last || direction === OPPOSITE[last] || state.queue.length >= MAX_QUEUED_TURNS) {
    return state
  }
  return { ...state, queue: [...state.queue, direction] }
}

function eatFood(state, food) {
  return {
    score: state.score + food.points,
    foodEaten: state.foodEaten + 1,
    eaten: { ...state.eaten, [food.id]: (state.eaten[food.id] ?? 0) + 1 },
    tickMs: Math.max(MIN_TICK, state.tickMs - TICK_STEP),
  }
}

/** Maju satu langkah. */
export function tick(state, rng = Math.random) {
  if (state.status !== 'running') return state

  let { queue, direction } = state
  if (queue.length) {
    direction = queue[0]
    queue = queue.slice(1)
  }

  const { gridSize, snake } = state
  const delta = DIRECTIONS[direction]
  const head = { x: snake[0].x + delta.x, y: snake[0].y + delta.y }
  const base = { ...state, direction, queue, tickCount: state.tickCount + 1, events: [] }

  // Tembok
  if (head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize) {
    return { ...base, status: 'over', deathCause: 'wall', events: ['die'] }
  }

  const eatsMain = samePos(head, state.food)
  const eatsBonus = samePos(head, state.bonus)
  const grows = eatsMain || eatsBonus

  // Badan sendiri (ekor ikut bergeser kalau tidak sedang tumbuh)
  const body = grows ? snake : snake.slice(0, -1)
  if (body.some((part) => samePos(part, head))) {
    return { ...base, status: 'over', deathCause: 'self', events: ['die'] }
  }

  let next = { ...base, snake: [head, ...body] }

  // Umur bonus berkurang; hilang kalau habis
  if (next.bonus && !eatsBonus) {
    const ticksLeft = next.bonus.ticksLeft - 1
    next.bonus = ticksLeft > 0 ? { ...next.bonus, ticksLeft } : null
  }

  if (eatsBonus) {
    const food = state.bonusFoods.find((f) => f.id === state.bonus.foodId)
    next = { ...next, ...eatFood(next, food), bonus: null, events: ['bonus'] }
  }

  if (eatsMain) {
    next = { ...next, ...eatFood(next, state.mainFood), events: ['eat'] }
    const cell = randomFreeCell(gridSize, [...next.snake, next.bonus], rng)
    next.food = cell && { ...cell, foodId: state.mainFood.id }
  }

  // Setelah makan: kocok satu bonus kalau belum ada bonus di arena
  if (grows && !next.bonus && state.bonusFoods.length) {
    const bonusFood = rollBonus(state.bonusFoods, rng)
    if (bonusFood) {
      const cell = randomFreeCell(gridSize, [...next.snake, next.food], rng)
      if (cell) {
        const lifetime = bonusFood.lifetime_ticks ?? Infinity
        next.bonus = { ...cell, foodId: bonusFood.id, ticksLeft: lifetime, lifetime }
      }
    }
  }

  return next
}
