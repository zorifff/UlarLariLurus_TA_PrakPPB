// GET   /api/players/{id} — detail pemain + skin + peringkat.
// PATCH /api/players/{id} body { username?, skin_id? } — hanya dua kolom ini yang boleh diubah client.
import { getSql } from '../_lib/db.js'
import { handle, json, readJson, lastPathSegment, HttpError } from '../_lib/http.js'
import { isUuid, requireUsername, requireInt } from '../_lib/validate.js'

const notFound = () => new HttpError(404, 'NOT_FOUND', 'Pemain tidak ditemukan.')

async function findPlayer(sql, id) {
  const [player] = await sql`
    select p.*,
           row_to_json(s) as skin,
           (select l.rank from leaderboard l where l.id = p.id) as rank
      from players p
      join skins s on s.id = p.skin_id
     where p.id = ${id}
  `
  return player
}

export const GET = handle(async (request) => {
  const id = lastPathSegment(request)
  if (!isUuid(id)) throw notFound()

  const player = await findPlayer(getSql(), id)
  if (!player) throw notFound()
  return json(player)
})

export const PATCH = handle(async (request) => {
  const id = lastPathSegment(request)
  if (!isUuid(id)) throw notFound()

  const body = await readJson(request)
  const allowed = ['username', 'skin_id']
  const extra = Object.keys(body ?? {}).filter((key) => !allowed.includes(key))
  if (extra.length) {
    throw new HttpError(400, 'FIELD_NOT_ALLOWED', `Kolom tidak boleh diubah: ${extra.join(', ')}.`)
  }
  const username = body.username === undefined ? null : requireUsername(body.username)
  const skinId = body.skin_id === undefined ? null : requireInt(body.skin_id, 'skin_id', { min: 1 })
  if (username === null && skinId === null) {
    throw new HttpError(400, 'NOTHING_TO_UPDATE', 'Kirim username atau skin_id.')
  }

  const sql = getSql()
  const [current] = await sql`select id, best_score from players where id = ${id}`
  if (!current) throw notFound()

  if (skinId !== null) {
    const [skin] = await sql`select id, unlock_score from skins where id = ${skinId}`
    if (!skin) throw new HttpError(400, 'INVALID_SKIN', 'Skin tidak ditemukan.')
    if (skin.unlock_score > current.best_score) {
      throw new HttpError(403, 'SKIN_LOCKED', `Skin ini terbuka di skor ${skin.unlock_score}.`)
    }
  }

  try {
    await sql`
      update players
         set username = coalesce(${username}, username),
             skin_id  = coalesce(${skinId}::int, skin_id)
       where id = ${id}
    `
  } catch (err) {
    if (err?.code === '23505') throw new HttpError(409, 'USERNAME_TAKEN', 'Username sudah dipakai pemain lain.')
    throw err
  }

  return json(await findPlayer(sql, id))
})
