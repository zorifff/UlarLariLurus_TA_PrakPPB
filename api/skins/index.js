// GET /api/skins — katalog skin ular.
import { getSql } from '../_lib/db.js'
import { handle, json } from '../_lib/http.js'

export const GET = handle(async () => {
  const sql = getSql()
  const rows = await sql`select * from skins order by sort_order, id`
  return json(rows)
})
