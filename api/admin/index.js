// POST /api/admin  body { password }  — login admin, balas { token, expires_at }.
// GET  /api/admin  (Authorization: Bearer <token>) — ringkasan + daftar semua akun pemain (data terbaru).
import { getSql } from '../_lib/db.js'
import { handle, readJson, HttpError } from '../_lib/http.js'
import { adminJson, checkPassword, createToken, requireAdmin } from '../_lib/admin.js'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const POST = handle(async (request) => {
  const body = await readJson(request)
  if (!checkPassword(body?.password)) {
    await wait(700) // perlambat tebak-tebakan kata sandi
    throw new HttpError(401, 'WRONG_PASSWORD', 'Kata sandi salah.')
  }
  return adminJson(createToken())
})

export const GET = handle(async (request) => {
  requireAdmin(request)
  const sql = getSql()

  const [summaryRows, players, skins] = await sql.transaction([
    sql`
      select (select count(*) from players)::int                                              as total_players,
             (select count(*) from players where best_score > 0)::int                         as ranked_players,
             (select count(*) from players where created_at >= now() - interval '24 hours')::int as new_players_24h,
             (select count(*) from matches)::int                                              as total_matches,
             (select count(*) from matches where played_at >= now() - interval '24 hours')::int as matches_24h,
             (select coalesce(sum(food_eaten), 0) from matches)::int                          as total_food,
             (select coalesce(max(best_score), 0) from players)::int                          as top_score
    `,
    sql`
      select p.id, p.username, p.skin_id, p.best_score, p.total_games, p.total_food,
             p.best_score_at, p.created_at,
             s.name as skin_name, s.head_color, s.body_color, s.body_color_alt,
             l.rank,
             m.last_played_at,
             coalesce(m.total_duration, 0)::int as total_duration_seconds
        from players p
        join skins s on s.id = p.skin_id
        left join leaderboard l on l.id = p.id
        left join lateral (
          select max(played_at) as last_played_at, sum(duration_seconds) as total_duration
            from matches
           where player_id = p.id
        ) m on true
       order by l.rank asc nulls last, p.best_score_at asc nulls last, p.created_at desc
    `,
    sql`
      select s.id, s.name, s.head_color, s.body_color, s.body_color_alt, s.unlock_score,
             count(p.id)::int as players
        from skins s
        left join players p on p.skin_id = s.id
       group by s.id
       order by s.sort_order, s.id
    `,
  ])

  return adminJson({
    summary: summaryRows[0],
    players,
    skins,
    generated_at: new Date().toISOString(),
  })
})
