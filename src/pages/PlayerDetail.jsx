import { useParams } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import SnakePreview from '../components/SnakePreview.jsx'
import MatchListItem from '../components/MatchListItem.jsx'
import usePlayer from '../hooks/usePlayer.js'
import useFetch from '../hooks/useFetch.js'
import { getPlayer } from '../services/playerService.js'
import { getMatchesByPlayer } from '../services/matchService.js'
import { formatDate, formatNumber } from '../utils/format.js'

async function loadPlayer(id) {
  const [player, matches] = await Promise.all([getPlayer(id), getMatchesByPlayer(id, 10)])
  return { player, matches }
}

function PlayerDetail() {
  const { playerId } = useParams()
  const { player: me } = usePlayer()
  const { data, loading, error, reload } = useFetch(() => loadPlayer(playerId), [playerId])

  let content
  if (!data && loading) {
    content = <LoadingState message="Memuat data pemain…" />
  } else if (!data && error) {
    content = (
      <ErrorState
        title={error.status === 404 ? 'Pemain tidak ditemukan' : 'Gagal memuat data'}
        error={error}
        onRetry={error.status === 404 ? undefined : reload}
      />
    )
  } else if (data) {
    const { player, matches } = data
    const isMe = player.id === me.id
    content = (
      <>
        <section className="card profile-card">
          <SnakePreview skin={player.skin} segments={4} cell={22} />
          <div className="profile-card__text">
            <h2 className="profile-card__name">
              {player.username}
              {isMe && <span className="tag">Kamu</span>}
            </h2>
            <p className="profile-card__meta">
              {player.rank ? `Peringkat #${player.rank}` : 'Belum masuk peringkat'} · skin {player.skin?.name}
            </p>
            <p className="profile-card__meta">Bergabung {formatDate(player.created_at)}</p>
          </div>
        </section>

        <dl className="stat-grid">
          <div className="stat-tile">
            <dt>Skor terbaik</dt>
            <dd>{formatNumber(player.best_score)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Total main</dt>
            <dd>{formatNumber(player.total_games)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Total makanan</dt>
            <dd>{formatNumber(player.total_food)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Rekor dicapai</dt>
            <dd className="stat-tile__small">{player.best_score_at ? formatDate(player.best_score_at) : '–'}</dd>
          </div>
        </dl>

        <h2 className="section-title">10 match terakhir</h2>
        {matches.length ? (
          <ul className="list">
            {matches.map((match) => (
              <MatchListItem key={match.id} match={match} />
            ))}
          </ul>
        ) : (
          <EmptyState icon={Gamepad2} title="Belum pernah main" message="Pemain ini belum punya riwayat permainan." />
        )}
      </>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Detail Pemain" backTo="/leaderboard" />
      {content}
    </div>
  )
}

export default PlayerDetail
