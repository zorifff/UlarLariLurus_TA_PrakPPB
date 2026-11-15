// GET /api/foods — daftar jenis makanan (data master).
import { getSql } from './_lib/db.js'
import { handle, json } from './_lib/http.js'

export const GET = handle(async () => {
  const sql = getSql()
  const rows = await sql`
    select id, name, description, points, color,
           spawn_chance::float8 as spawn_chance,
           lifetime_ticks, is_bonus, sort_order
      from foods
     order by sort_order, id
  `
  return json(rows)
})
