// GET /api/skins/{id} — detail satu skin.
import { getSql } from '../_lib/db.js'
import { handle, json, lastPathSegment, HttpError } from '../_lib/http.js'

export const GET = handle(async (request) => {
  const id = Number(lastPathSegment(request))
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, 'NOT_FOUND', 'Skin tidak ditemukan.')

  const sql = getSql()
  const [skin] = await sql`select * from skins where id = ${id}`
  if (!skin) throw new HttpError(404, 'NOT_FOUND', 'Skin tidak ditemukan.')
  return json(skin)
})
