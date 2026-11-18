import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { RefreshCw, LogOut, Search, Users, Trash2, Palette, SearchX } from 'lucide-react'
import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import ErrorState from '../../components/ErrorState.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import SnakePreview from '../../components/SnakePreview.jsx'
import useFetch from '../../hooks/useFetch.js'
import usePolling from '../../hooks/usePolling.js'
import { adminLogout, deleteAdminPlayer, getAdminOverview } from '../../services/adminService.js'
import { formatDateTime, formatNumber } from '../../utils/format.js'
import DeleteAccountDialog from './DeleteAccountDialog.jsx'

const REFRESH_MS = 15_000 // data dashboard diperbarui otomatis setiap 15 detik

const SORTS = {
  rank: { label: 'Peringkat', compare: null }, // urutan bawaan dari server
  newest: { label: 'Terbaru', compare: (a, b) => new Date(b.created_at) - new Date(a.created_at) },
  active: {
    label: 'Teraktif',
    compare: (a, b) => b.total_games - a.total_games || new Date(b.last_played_at ?? 0) - new Date(a.last_played_at ?? 0),
  },
}

const timeFormat = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

function AdminDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useFetch(getAdminOverview, [])
  usePolling(reload, REFRESH_MS)

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('rank')
  const [target, setTarget] = useState(null) // akun yang akan dihapus
  const [deleting, setDeleting] = useState({ loading: false, error: null })
  const [notice, setNotice] = useState(() => location.state?.deleted ?? null)

  // Pesan sukses dari halaman detail (setelah hapus) cukup tampil sekali
  useEffect(() => {
    if (location.state?.deleted) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const players = useMemo(() => {
    const list = data?.players ?? []
    const q = query.trim().toLowerCase()
    const filtered = q ? list.filter((p) => p.username.toLowerCase().includes(q)) : list
    const { compare } = SORTS[sort]
    return compare ? [...filtered].sort(compare) : filtered
  }, [data, query, sort])

  const closeDialog = useCallback(() => {
    setTarget(null)
    setDeleting({ loading: false, error: null })
  }, [])

  async function confirmDelete() {
    if (!target) return
    setDeleting({ loading: true, error: null })
    try {
      const res = await deleteAdminPlayer(target.id)
      closeDialog()
      setNotice({ username: res.username, deleted_matches: res.deleted_matches })
      reload()
    } catch (err) {
      if (err.status === 404) {
        // Sudah terhapus (mis. dari tab lain): tutup saja dan segarkan daftar
        closeDialog()
        reload()
        return
      }
      setDeleting({ loading: false, error: err.message })
    }
  }

  const actions = (
    <>
      <button type="button" className="icon-button" onClick={reload} disabled={loading} aria-label="Muat ulang data">
        <RefreshCw className={loading ? 'spin' : ''} size={20} aria-hidden="true" />
      </button>
      <button type="button" className="icon-button" onClick={adminLogout} aria-label="Keluar dari admin">
        <LogOut size={20} aria-hidden="true" />
      </button>
    </>
  )

  const subtitle = data ? `Diperbarui ${timeFormat.format(new Date(data.generated_at))}` : 'Kelola akun pemain'

  let content
  if (!data && loading) {
    content = <LoadingState message="Memuat data admin…" />
  } else if (!data && error) {
    content = <ErrorState error={error} onRetry={reload} />
  } else if (data) {
    const { summary, skins } = data
    const maxSkinUse = Math.max(1, ...skins.map((s) => s.players))

    content = (
      <>
        {error && <p className="inline-note">Gagal memperbarui. Menampilkan data terakhir.</p>}
        {notice && (
          <p className="form-success" role="status">
            Akun <strong>{notice.username}</strong> berhasil dihapus beserta {formatNumber(notice.deleted_matches)}{' '}
            riwayat permainan.
          </p>
        )}

        <dl className="stat-grid">
          <div className="stat-tile">
            <dt>Total akun</dt>
            <dd>{formatNumber(summary.total_players)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Masuk peringkat</dt>
            <dd>{formatNumber(summary.ranked_players)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Total main</dt>
            <dd>{formatNumber(summary.total_matches)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Skor tertinggi</dt>
            <dd>{formatNumber(summary.top_score)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Main (24 jam)</dt>
            <dd>{formatNumber(summary.matches_24h)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Akun baru (24 jam)</dt>
            <dd>{formatNumber(summary.new_players_24h)}</dd>
          </div>
        </dl>

        <h2 className="section-title">
          <Palette size={18} aria-hidden="true" /> Pemakaian skin
        </h2>
        <ul className="card admin-skins">
          {skins.map((skin) => (
            <li key={skin.id} className="admin-skins__row">
              <SnakePreview skin={skin} segments={3} cell={10} />
              <div className="admin-skins__main">
                <div className="admin-skins__head">
                  <span className="admin-skins__name">{skin.name}</span>
                  <span className="admin-skins__count">{formatNumber(skin.players)} akun</span>
                </div>
                <div className="progress progress--thin">
                  <span style={{ width: `${(skin.players / maxSkinUse) * 100}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="section-title">
          <Users size={18} aria-hidden="true" /> Akun pemain ({formatNumber(summary.total_players)})
        </h2>

        <div className="admin-tools">
          <label className="admin-search">
            <Search className="admin-search__icon" size={18} aria-hidden="true" />
            <input
              className="field__input"
              type="search"
              placeholder="Cari username…"
              autoCapitalize="off"
              spellCheck="false"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cari username"
            />
          </label>
          <div className="segmented" role="radiogroup" aria-label="Urutkan akun">
            {Object.entries(SORTS).map(([value, { label }]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={sort === value}
                className={`segmented__option${sort === value ? ' is-active' : ''}`}
                onClick={() => setSort(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {!data.players.length ? (
          <EmptyState icon={Users} title="Belum ada akun" message="Belum ada pemain yang membuat username." />
        ) : !players.length ? (
          <EmptyState icon={SearchX} title="Tidak ditemukan" message={`Tidak ada username yang cocok dengan “${query.trim()}”.`} />
        ) : (
          <ol className="list">
            {players.map((p) => (
              <li key={p.id} className="list-row admin-row">
                <Link to={`/admin/players/${p.id}`} className="admin-row__link">
                  <span className={`rank-badge rank-badge--${p.rank && p.rank <= 3 ? p.rank : 'n'}`}>{p.rank ?? '–'}</span>
                  <div className="list-row__main">
                    <span className="list-row__title">{p.username}</span>
                    <span className="list-row__meta">
                      <SnakePreview skin={p} segments={3} cell={9} />
                      {p.skin_name} · {formatNumber(p.total_games)} kali main
                    </span>
                    <span className="admin-row__sub">
                      {p.last_played_at ? `Terakhir main ${formatDateTime(p.last_played_at)}` : `Belum pernah main · daftar ${formatDateTime(p.created_at)}`}
                    </span>
                  </div>
                  <span className="lb-row__score">{formatNumber(p.best_score)}</span>
                </Link>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  onClick={() => setTarget(p)}
                  aria-label={`Hapus akun ${p.username}`}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Admin" subtitle={subtitle} action={actions} />
      {content}
      {target && (
        <DeleteAccountDialog
          player={target}
          loading={deleting.loading}
          error={deleting.error}
          onCancel={closeDialog}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

export default AdminDashboard
