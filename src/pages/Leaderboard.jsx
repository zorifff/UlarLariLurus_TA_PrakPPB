import { Link } from 'react-router-dom'
import { Trophy, RefreshCw, ChevronRight, Play } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import SnakePreview from '../components/SnakePreview.jsx'
import usePlayer from '../hooks/usePlayer.js'
import useFetch from '../hooks/useFetch.js'
import { getLeaderboard } from '../services/leaderboardService.js'
import { formatNumber } from '../utils/format.js'

function Leaderboard() {
  const { player } = usePlayer()
  const { data, loading, error, reload } = useFetch(() => getLeaderboard(50), [])
  const me = data?.find((row) => row.id === player.id)

  const refreshButton = (
    <button type="button" className="icon-button" onClick={reload} disabled={loading} aria-label="Muat ulang peringkat">
      <RefreshCw className={loading ? 'spin' : ''} size={20} aria-hidden="true" />
    </button>
  )

  let content
  if (!data && loading) {
    content = <LoadingState message="Memuat peringkat…" />
  } else if (!data && error) {
    content = <ErrorState error={error} onRetry={reload} />
  } else if (!data?.length) {
    content = (
      <EmptyState icon={Trophy} title="Belum ada peringkat" message="Belum ada yang mencetak skor. Jadilah yang pertama!">
        <Link to="/play" className="btn btn--primary">
          <Play size={18} fill="currentColor" aria-hidden="true" />
          Main sekarang
        </Link>
      </EmptyState>
    )
  } else {
    content = (
      <>
        {error && <p className="inline-note">Gagal memperbarui. Menampilkan data terakhir.</p>}
        <div className="card my-rank">
          {me ? (
            <>
              Peringkat kamu <strong>#{me.rank}</strong> dengan <strong>{formatNumber(me.best_score)}</strong> poin
            </>
          ) : (
            <>Kamu belum masuk {data.length} besar. Ayo main!</>
          )}
        </div>
        <ol className="list">
          {data.map((row) => {
            const mine = row.id === player.id
            return (
              <li key={row.id}>
                <Link to={`/leaderboard/${row.id}`} className={`list-row lb-row${mine ? ' is-me' : ''}`}>
                  <span className={`rank-badge rank-badge--${row.rank <= 3 ? row.rank : 'n'}`}>{row.rank}</span>
                  <div className="list-row__main">
                    <span className="list-row__title">
                      {row.username}
                      {mine && <span className="tag">Kamu</span>}
                    </span>
                    <span className="list-row__meta">
                      <SnakePreview skin={row} segments={3} cell={9} />
                      {row.total_games} kali main
                    </span>
                  </div>
                  <span className="lb-row__score">{formatNumber(row.best_score)}</span>
                  <ChevronRight className="list-row__chevron" size={20} aria-hidden="true" />
                </Link>
              </li>
            )
          })}
        </ol>
      </>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Peringkat" subtitle="Skor tertinggi semua pemain" action={refreshButton} />
      {content}
    </div>
  )
}

export default Leaderboard
