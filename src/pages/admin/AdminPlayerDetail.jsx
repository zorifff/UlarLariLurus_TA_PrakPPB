import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RefreshCw, Gamepad2, Trash2, ShieldAlert } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ErrorState from '../../components/ErrorState.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import SnakePreview from '../../components/SnakePreview.jsx'
import FoodIcon from '../../components/FoodIcon.jsx'
import MatchListItem from '../../components/MatchListItem.jsx'
import useFetch from '../../hooks/useFetch.js'
import usePolling from '../../hooks/usePolling.js'
import { deleteAdminPlayer, getAdminPlayer } from '../../services/adminService.js'
import { formatDate, formatDateTime, formatNumber } from '../../utils/format.js'
import DeleteAccountDialog from './DeleteAccountDialog.jsx'

const REFRESH_MS = 15_000

/** 3725 -> "1 j 2 m", 125 -> "2 m 5 d" */
function formatPlaytime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds ?? 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h) return `${h} j ${m} m`
  return `${m} m ${s % 60} d`
}

function AdminPlayerDetail() {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useFetch(() => getAdminPlayer(playerId), [playerId])
  usePolling(reload, REFRESH_MS)

  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState({ loading: false, error: null })

  async function confirmDelete() {
    setDeleting({ loading: true, error: null })
    try {
      const res = await deleteAdminPlayer(playerId)
      navigate('/admin', { replace: true, state: { deleted: { username: res.username, deleted_matches: res.deleted_matches } } })
    } catch (err) {
      if (err.status === 404) {
        navigate('/admin', { replace: true })
        return
      }
      setDeleting({ loading: false, error: err.message })
    }
  }

  const refreshButton = (
    <button type="button" className="icon-button" onClick={reload} disabled={loading} aria-label="Muat ulang data">
      <RefreshCw className={loading ? 'spin' : ''} size={20} aria-hidden="true" />
    </button>
  )

  let content
  if (!data && loading) {
    content = <LoadingState message="Memuat data akun…" />
  } else if (!data && error) {
    content = (
      <ErrorState
        title={error.status === 404 ? 'Akun tidak ditemukan' : 'Gagal memuat data'}
        error={error}
        onRetry={error.status === 404 ? undefined : reload}
      />
    )
  } else if (data) {
    const { player, stats, foods, matches } = data
    const foodTotal = foods.reduce((sum, f) => sum + f.points * f.quantity, 0)

    content = (
      <>
        {error && (
          <p className="inline-note">
            {error.status === 404 ? 'Akun ini sudah dihapus.' : 'Gagal memperbarui. Menampilkan data terakhir.'}
          </p>
        )}

        <section className="card profile-card">
          <SnakePreview skin={player.skin} segments={4} cell={22} />
          <div className="profile-card__text">
            <h2 className="profile-card__name">{player.username}</h2>
            <p className="profile-card__meta">
              {player.rank ? `Peringkat #${player.rank} dari ${formatNumber(player.ranked_players)}` : 'Belum masuk peringkat'}
              {' · '}skin {player.skin?.name}
            </p>
            <p className="profile-card__meta">Bergabung {formatDateTime(player.created_at)}</p>
          </div>
        </section>

        <dl className="stat-grid">
          <div className="stat-tile">
            <dt>Skor terbaik</dt>
            <dd>{formatNumber(player.best_score)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Peringkat</dt>
            <dd>{player.rank ? `#${player.rank}` : '–'}</dd>
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
            <dt>Rata-rata skor</dt>
            <dd>{formatNumber(stats.avg_score)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Ular terpanjang</dt>
            <dd>{formatNumber(stats.longest_snake)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Total waktu main</dt>
            <dd className="stat-tile__small">{formatPlaytime(stats.total_duration_seconds)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Mati (tembok / badan)</dt>
            <dd className="stat-tile__small">
              {formatNumber(stats.deaths_wall)} / {formatNumber(stats.deaths_self)}
            </dd>
          </div>
          <div className="stat-tile">
            <dt>Rekor dicapai</dt>
            <dd className="stat-tile__small">{player.best_score_at ? formatDate(player.best_score_at) : '–'}</dd>
          </div>
          <div className="stat-tile">
            <dt>Terakhir main</dt>
            <dd className="stat-tile__small">{stats.last_played_at ? formatDate(stats.last_played_at) : '–'}</dd>
          </div>
        </dl>

        <h2 className="section-title">Makanan dimakan</h2>
        <ul className="card food-breakdown">
          {foods.map((food) => (
            <li key={food.id} className="food-breakdown__row">
              <FoodIcon id={food.id} color={food.color} size={30} />
              <span className="food-breakdown__name">
                {food.name}
                <small>
                  {formatNumber(food.quantity)} × {food.points} poin
                </small>
              </span>
              <span className="food-breakdown__value">{formatNumber(food.points * food.quantity)}</span>
            </li>
          ))}
          <li className="food-breakdown__row food-breakdown__total">
            <span className="food-breakdown__name">Total poin dari makanan</span>
            <span className="food-breakdown__value">{formatNumber(foodTotal)}</span>
          </li>
        </ul>

        <h2 className="section-title">{matches.length ? `${matches.length} match terakhir` : 'Riwayat main'}</h2>
        {matches.length ? (
          <ul className="list">
            {matches.map((match) => (
              <MatchListItem key={match.id} match={match} linkable={false} />
            ))}
          </ul>
        ) : (
          <EmptyState icon={Gamepad2} title="Belum pernah main" message="Akun ini belum punya riwayat permainan." />
        )}

        <h2 className="section-title admin-danger-title">
          <ShieldAlert size={18} aria-hidden="true" /> Zona berbahaya
        </h2>
        <section className="card admin-danger">
          <p>
            Menghapus akun akan menghilangkan semua progresnya (skor, riwayat, skin, peringkat). Pemain harus membuat
            username baru saat membuka game lagi.
          </p>
          <p className="settings-meta">
            ID akun: <code>{player.id}</code>
          </p>
          <button type="button" className="btn btn--block admin-dialog__delete" onClick={() => setConfirming(true)}>
            <Trash2 size={18} aria-hidden="true" />
            Hapus akun ini
          </button>
        </section>

        {confirming && (
          <DeleteAccountDialog
            player={player}
            loading={deleting.loading}
            error={deleting.error}
            onCancel={() => {
              setConfirming(false)
              setDeleting({ loading: false, error: null })
            }}
            onConfirm={confirmDelete}
          />
        )}
      </>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Detail Akun" backTo="/admin" action={refreshButton} />
      {content}
    </div>
  )
}

export default AdminPlayerDetail
