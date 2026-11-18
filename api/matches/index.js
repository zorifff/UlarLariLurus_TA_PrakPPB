// GET  /api/matches?player_id={id}&limit=10 — daftar match pemain (terbaru dulu).
// POST /api/matches — simpan hasil main + rincian makanan (satu transaksi, idempoten).
import { getSql } from '../_lib/db.js'
import { handle, json, readJson, HttpError } from '../_lib/http.js'
import { requireUuid, requireInt, readLimit } from '../_lib/validate.js'

export const GET = handle(async (request) => {
  const url = new URL(request.url)
  const playerId = requireUuid(url.searchParams.get('player_id') ?? '', 'player_id')
  const limit = readLimit(url, 50)

  const sql = getSql()
  const rows = await sql`
    select m.*, s.name as skin_name, s.head_color, s.body_color, s.body_color_alt
      from matches m
      join skins s on s.id = m.skin_id
     where m.player_id = ${playerId}
     order by m.played_at desc
     limit ${limit}
  `
  return json(rows)
})

function parseMatch(body) {
  if (!body || typeof body !== 'object') throw new HttpError(400, 'INVALID_BODY', 'Body harus objek match.')

  const match = {
    id: requireUuid(body.id, 'id'),
    player_id: requireUuid(body.player_id, 'player_id'),
    skin_id: requireInt(body.skin_id, 'skin_id', { min: 1 }),
    score: requireInt(body.score, 'score', { min: 0, max: 1_000_000 }),
    snake_length: requireInt(body.snake_length, 'snake_length', { min: 1, max: 2500 }),
    food_eaten: requireInt(body.food_eaten ?? 0, 'food_eaten', { min: 0, max: 2500 }),
    duration_seconds: requireInt(body.duration_seconds ?? 0, 'duration_seconds', { min: 0, max: 86_400 }),
    grid_size: requireInt(body.grid_size ?? 15, 'grid_size', { min: 5, max: 50 }),
    death_cause: body.death_cause,
    played_at: body.played_at ? new Date(body.played_at) : new Date(),
  }
  if (!['wall', 'self'].includes(match.death_cause)) {
    throw new HttpError(400, 'INVALID_FIELD', "death_cause harus 'wall' atau 'self'.")
  }
  if (Number.isNaN(match.played_at.getTime()) || match.played_at.getTime() > Date.now() + 5 * 60_000) {
    throw new HttpError(400, 'INVALID_FIELD', 'played_at tidak valid.')
  }

  const foods = body.foods ?? []
  if (!Array.isArray(foods) || foods.length > 20) {
    throw new HttpError(400, 'INVALID_FIELD', 'foods harus array (maks. 20 jenis).')
  }
  const foodRows = foods
    .map((f) => ({
      food_id: typeof f?.food_id === 'string' ? f.food_id : '',
      quantity: requireInt(f?.quantity, 'foods.quantity', { min: 1, max: 2500 }),
    }))
    .filter((f) => f.food_id)

  return { match, foodRows }
}

export const POST = handle(async (request) => {
  const { match, foodRows } = parseMatch(await readJson(request))
  const m = match
  const sql = getSql()

  // Akun bisa saja sudah dihapus admin: balas 404 khusus supaya client meminta username baru.
  const [owner] = await sql`select id from players where id = ${m.player_id}`
  if (!owner) throw new HttpError(404, 'PLAYER_NOT_FOUND', 'Akun pemain tidak ditemukan (mungkin sudah dihapus).')

  // Transaksi: insert match (abaikan kalau id sudah ada) + rincian makanan, lalu baca hasil.
  // Trigger trg_matches_after_insert mengupdate statistik pemain secara otomatis.
  const [inserted, , playerRows] = await sql.transaction([
    sql`
      insert into matches (id, player_id, skin_id, score, snake_length, food_eaten,
                           duration_seconds, death_cause, grid_size, played_at)
      values (${m.id}, ${m.player_id}, ${m.skin_id}, ${m.score}, ${m.snake_length}, ${m.food_eaten},
              ${m.duration_seconds}, ${m.death_cause}, ${m.grid_size}, ${m.played_at.toISOString()})
      on conflict (id) do nothing
      returning id
    `,
    sql`
      insert into match_foods (match_id, food_id, quantity)
      select ${m.id}, f.food_id, f.quantity
        from jsonb_to_recordset(${JSON.stringify(foodRows)}::jsonb) as f(food_id text, quantity int)
      on conflict (match_id, food_id) do nothing
    `,
    sql`select best_score, total_games, total_food, best_score_at,
               (select l.rank from leaderboard l where l.id = p.id) as rank
          from players p where p.id = ${m.player_id}`,
  ])

  const created = inserted.length > 0
  return json({ id: m.id, created, player: playerRows[0] ?? null }, created ? 201 : 200)
})
