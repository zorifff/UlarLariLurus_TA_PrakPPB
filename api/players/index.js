// GET  /api/players?username={name} — cek username sudah dipakai atau belum.
// POST /api/players  body { id, username } — daftarkan pemain baru.
import { getSql } from '../_lib/db.js'
import { handle, json, readJson, HttpError } from '../_lib/http.js'
import { requireUuid, requireUsername } from '../_lib/validate.js'

export const GET = handle(async (request) => {
  const username = requireUsername(new URL(request.url).searchParams.get('username') ?? '')
  const sql = getSql()
  const rows = await sql`select id from players where lower(username) = lower(${username}) limit 1`
  return json({ username, available: rows.length === 0 })
})

export const POST = handle(async (request) => {
  const body = await readJson(request)
  const id = requireUuid(body?.id, 'id')
  const username = requireUsername(body?.username)
  const sql = getSql()

  let rows
  try {
    rows = await sql`
      insert into players (id, username)
      values (${id}, ${username})
      on conflict (id) do nothing
      returning *
    `
  } catch (err) {
    if (err?.code === '23505') throw new HttpError(409, 'USERNAME_TAKEN', 'Username sudah dipakai pemain lain.')
    throw err
  }

  if (rows.length) return json(rows[0], 201)

  // id sudah terdaftar: aman untuk kirim ulang kalau username-nya sama
  const [existing] = await sql`select * from players where id = ${id}`
  if (existing && existing.username.toLowerCase() === username.toLowerCase()) return json(existing, 200)
  throw new HttpError(409, 'ID_TAKEN', 'ID pemain sudah dipakai.')
})
