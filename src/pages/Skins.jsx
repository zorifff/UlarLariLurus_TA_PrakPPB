import { Link } from 'react-router-dom'
import { Lock, Check, Palette } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import SnakePreview from '../components/SnakePreview.jsx'
import usePlayer from '../hooks/usePlayer.js'
import useFetch from '../hooks/useFetch.js'
import useUnlockScore from '../hooks/useUnlockScore.js'
import { getSkins } from '../services/skinService.js'
import { formatNumber } from '../utils/format.js'

function Skins() {
  const { player } = usePlayer()
  const { best } = useUnlockScore()
  const { data, loading, error, reload } = useFetch(getSkins, [])

  let content
  if (!data && loading) {
    content = <LoadingState message="Memuat skin…" />
  } else if (!data && error) {
    content = <ErrorState error={error} onRetry={reload} />
  } else if (!data?.length) {
    content = <EmptyState icon={Palette} title="Belum ada skin" message="Katalog skin masih kosong." />
  } else {
    const unlockedCount = data.filter((s) => best >= s.unlock_score).length
    content = (
      <>
        <p className="list-caption">
          {unlockedCount} dari {data.length} skin terbuka
        </p>
        <ul className="skin-grid">
          {data.map((skin) => {
            const unlocked = best >= skin.unlock_score
            const active = player.skinId === skin.id
            return (
              <li key={skin.id}>
                <Link
                  to={`/skins/${skin.id}`}
                  className={`skin-card${active ? ' is-active' : ''}${unlocked ? '' : ' is-locked'}`}
                >
                  <div className="skin-card__preview">
                    <SnakePreview skin={skin} segments={4} cell={22} locked={!unlocked} />
                  </div>
                  <span className="skin-card__name">{skin.name}</span>
                  {active ? (
                    <span className="skin-card__status is-active">
                      <Check size={14} aria-hidden="true" /> Dipakai
                    </span>
                  ) : unlocked ? (
                    <span className="skin-card__status">Terbuka</span>
                  ) : (
                    <span className="skin-card__status is-locked">
                      <Lock size={13} aria-hidden="true" /> Skor {formatNumber(skin.unlock_score)}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Skin" subtitle={`Skor terbaikmu: ${formatNumber(best)}`} />
      {content}
    </div>
  )
}

export default Skins
