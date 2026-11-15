// GET /api/health — cek API hidup dan database terhubung + sudah berisi seed.
import { getSql } from './_lib/db.js'
import { handle, json } from './_lib/http.js'

export const GET = handle(async () => {
  const sql = getSql()
  const [row] = await sql`
    select now() as server_time,
           (select count(*)::int from skins) as skins,
           (select count(*)::int from foods) as foods
  `
  return json({ ok: true, database: 'neon', ...row })
})
