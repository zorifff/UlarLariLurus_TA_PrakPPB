// GET /api/leaderboard?limit=50 — peringkat global dari view `leaderboard`.
import { getSql } from './_lib/db.js'
import { handle, json } from './_lib/http.js'
import { readLimit } from './_lib/validate.js'

export const GET = handle(async (request) => {
  const limit = readLimit(new URL(request.url), 50)
  const sql = getSql()
  const rows = await sql`select * from leaderboard limit ${limit}`
  return json(rows)
})
