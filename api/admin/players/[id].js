// GET    /api/admin/players/{id} — detail lengkap satu akun (statistik, makanan, 20 match terakhir).
// DELETE /api/admin/players/{id} — hapus akun beserta semua progresnya (match & rincian makanan ikut terhapus
//                                  lewat foreign key `on delete cascade`).
// Keduanya wajib header Authorization: Bearer <token admin>.
import { getSql } from '../../_lib/db.js'
import { handle, lastPathSegment, HttpError } from '../../_lib/http.js'
import { isUuid } from '../../_lib/validate.js'
import { adminJson, requireAdmin } from '../../_lib/admin.js'

const notFound = () => new HttpError(404, 'NOT_FOUND', 'Akun pemain tidak ditemukan (mungkin sudah dihapus).')

export const GET = handle(async (request) => {
  requireAdmin(request)
  const id = lastPathSegment(request)
  if (!isUuid(id)) throw notFound()

  const sql = getSql()
  const [playerRows, statRows, foods, matches] = await sql.transaction([
    sql`
      select p.*, row_to_json(s) as skin,
             (select l.rank from leaderboard l where l.id = p.id) as rank,
             (select count(*) from leaderboard)::int as ranked_players
        from players p
        join skins s on s.id = p.skin_id
       where p.id = ${id}
    `,
    sql`
      select count(*)::int                                          as total_matches,
             coalesce(sum(duration_seconds), 0)::int                as total_duration_seconds,
             coalesce(round(avg(score)), 0)::int                    as avg_score,
             coalesce(max(snake_length), 0)::int                    as longest_snake,
             count(*) filter (where death_cause = 'wall')::int      as deaths_wall,
             count(*) filter (where death_cause = 'self')::int      as deaths_self,
             min(played_at)                                         as first_played_at,
             max(played_at)                                         as last_played_at
        from matches
       where player_id = ${id}
    `,
    sql`
      select f.id, f.name, f.color, f.points, coalesce(sum(mf.quantity), 0)::int as quantity
        from foods f
        left join match_foods mf on mf.food_id = f.id
             and mf.match_id in (select m.id from matches m where m.player_id = ${id})
       group by f.id
       order by f.sort_order, f.id
    `,
    sql`
      select m.*, s.name as skin_name, s.head_color, s.body_color, s.body_color_alt
        from matches m
        join skins s on s.id = m.skin_id
       where m.player_id = ${id}
       order by m.played_at desc
       limit 20
    `,
  ])

  const player = playerRows[0]
  if (!player) throw notFound()
  return adminJson({ player, stats: statRows[0], foods, matches })
})

export const DELETE = handle(async (request) => {
  requireAdmin(request)
  const id = lastPathSegment(request)
  if (!isUuid(id)) throw notFound()

  const sql = getSql()
  const [countRows, deletedRows] = await sql.transaction([
    sql`select count(*)::int as matches from matches where player_id = ${id}`,
    sql`delete from players where id = ${id} returning id, username`,
  ])

  const deleted = deletedRows[0]
  if (!deleted) throw notFound()
  return adminJson({ deleted: true, id: deleted.id, username: deleted.username, deleted_matches: countRows[0].matches })
})
