import { Link } from 'react-router-dom'
import { Play, Settings, CloudUpload, Download, ChevronRight } from 'lucide-react'
import SnakePreview from '../components/SnakePreview.jsx'
import usePlayer from '../hooks/usePlayer.js'
import useMyProfile from '../hooks/useMyProfile.js'
import usePendingMatches from '../hooks/usePendingMatches.js'
import useStoredValue from '../hooks/useStoredValue.js'
import useInstallPrompt from '../hooks/useInstallPrompt.js'
import { KEYS } from '../services/storage.js'
import { findFallbackSkin } from '../game/constants.js'
import { formatNumber } from '../utils/format.js'

function Home() {
  const { player } = usePlayer()
  const profile = useMyProfile()
  const localBest = useStoredValue(KEYS.localBest, 0)
  const pending = usePendingMatches()
  const { install } = useInstallPrompt()

  const remote = profile.data
  const best = Math.max(remote?.best_score ?? 0, Number(localBest) || 0)
  const skin = remote?.skin ?? findFallbackSkin(player.skinId)
  const rank = remote?.rank

  return (
    <div className="page home">
      <div className="home__top">
        <p className="home__greeting">
          Halo, <strong>{player.username}</strong>!
        </p>
        <Link to="/settings" className="icon-button" aria-label="Pengaturan">
          <Settings size={22} aria-hidden="true" />
        </Link>
      </div>

      <section className="home__hero">
        <img className="home__logo" src="/favicon.svg" alt="" width="112" height="112" />
        <h1 className="home__title">Ularlarilurus</h1>
        <Link to="/play" className="btn btn--primary btn--large home__play">
          <Play size={26} fill="currentColor" aria-hidden="true" />
          Main
        </Link>
      </section>

      {pending.length > 0 && (
        <Link to="/history" className="banner banner--warn">
          <CloudUpload size={20} aria-hidden="true" />
          <span>{pending.length} skor menunggu dikirim. Akan terkirim otomatis saat online.</span>
        </Link>
      )}

      <section className="home__stats">
        <div className="card stat">
          <span className="stat__label">Skor terbaik</span>
          <span className="stat__value">{formatNumber(best)}</span>
        </div>
        <Link to="/leaderboard" className="card stat">
          <span className="stat__label">Peringkat</span>
          <span className="stat__value">{rank ? `#${rank}` : '–'}</span>
        </Link>
        <Link to={`/skins/${skin.id}`} className="card stat home__skin">
          <div>
            <span className="stat__label">Skin aktif</span>
            <span className="stat__value stat__value--small">{skin.name}</span>
          </div>
          <SnakePreview skin={skin} segments={5} cell={14} />
          <ChevronRight className="list-row__chevron" size={20} aria-hidden="true" />
        </Link>
      </section>

      {install && (
        <button type="button" className="btn btn--block" onClick={install}>
          <Download size={18} aria-hidden="true" />
          Pasang aplikasi di perangkat ini
        </button>
      )}
    </div>
  )
}

export default Home
