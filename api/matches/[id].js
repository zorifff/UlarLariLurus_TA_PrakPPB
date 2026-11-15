// GET /api/matches/{id} — detail match + skin + pemain + rincian makanan.
import { getSql } from '../_lib/db.js'
import { handle, json, lastPathSegment, HttpError } from '../_lib/http.js'
import { isUuid } from '../_lib/validate.js'

export const GET = handle(async (request) => {
  const id = lastPathSegment(request)
  if (!isUuid(id)) throw new HttpError(404, 'NOT_FOUND', 'Match tidak ditemukan.')

  const sql = getSql()
  const [match] = await sql`
    select m.*,
           p.username,
           row_to_json(s) as skin,
           coalesce((
             select json_agg(json_build_object(
                      'food_id', f.id, 'name', f.name, 'points', f.points,
                      'color', f.color, 'is_bonus', f.is_bonus, 'quantity', mf.quantity)
                    order by f.sort_order)
               from match_foods mf
               join foods f on f.id = mf.food_id
              where mf.match_id = m.id
           ), '[]'::json) as foods
      from matches m
      join skins s on s.id = m.skin_id
      join players p on p.id = m.player_id
     where m.id = ${id}
  `
  if (!match) throw new HttpError(404, 'NOT_FOUND', 'Match tidak ditemukan.')
  return json(match)
})
