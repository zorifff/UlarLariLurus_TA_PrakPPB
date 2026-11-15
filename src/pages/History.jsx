import { useState } from 'react'
import { Link } from 'react-router-dom'
import { History as HistoryIcon, RefreshCw, CloudUpload, Play } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import MatchListItem from '../components/MatchListItem.jsx'
import usePlayer from '../hooks/usePlayer.js'
import useFetch from '../hooks/useFetch.js'
import usePendingMatches from '../hooks/usePendingMatches.js'
import useOnlineStatus from '../hooks/useOnlineStatus.js'
import { getMatchesByPlayer } from '../services/matchService.js'
import { flushQueue } from '../services/syncQueue.js'

function History() {
  const { player } = usePlayer()
  const online = useOnlineStatus()
  const pending = usePendingMatches()
  const [sending, setSending] = useState(false)
  const { data, loading, error, reload } = useFetch(() => getMatchesByPlayer(player.id, 50), [player.id])

  async function sendNow() {
    setSending(true)
    await flushQueue().catch(() => {})
    setSending(false)
    reload()
  }

  const refreshButton = (
    <button type="button" className="icon-button" onClick={reload} disabled={loading} aria-label="Muat ulang riwayat">
      <RefreshCw className={loading ? 'spin' : ''} size={20} aria-hidden="true" />
    </button>
  )

  let content
  if (!data && loading) {
    content = <LoadingState message="Memuat riwayat…" />
  } else if (!data && error) {
    content = <ErrorState error={error} onRetry={reload} />
  } else if (!data?.length) {
    content = (
      <EmptyState icon={HistoryIcon} title="Belum ada riwayat" message="Main dulu, nanti hasilnya muncul di sini.">
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
        <p className="list-caption">{data.length} permainan terakhir</p>
        <ul className="list">
          {data.map((match) => (
            <MatchListItem key={match.id} match={match} />
          ))}
        </ul>
      </>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Riwayat" subtitle="Permainan kamu sebelumnya" action={refreshButton} />

      {pending.length > 0 && (
        <div className="banner banner--warn">
          <CloudUpload size={20} aria-hidden="true" />
          <span>{pending.length} permainan belum terkirim ke server.</span>
          <button type="button" className="btn btn--small" onClick={sendNow} disabled={!online || sending}>
            {sending ? 'Mengirim…' : 'Kirim'}
          </button>
        </div>
      )}

      {content}
    </div>
  )
}

export default History
