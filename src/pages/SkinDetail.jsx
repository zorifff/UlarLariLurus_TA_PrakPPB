import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Lock, Sparkles } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import SnakePreview from '../components/SnakePreview.jsx'
import usePlayer from '../hooks/usePlayer.js'
import useFetch from '../hooks/useFetch.js'
import useUnlockScore from '../hooks/useUnlockScore.js'
import { getSkin } from '../services/skinService.js'
import { updatePlayer as patchPlayer } from '../services/playerService.js'
import { formatNumber } from '../utils/format.js'

function SkinDetail() {
  const { skinId } = useParams()
  const { player, updatePlayer } = usePlayer()
  const { best, profile } = useUnlockScore()
  const { data: skin, loading, error, reload } = useFetch(() => getSkin(skinId), [skinId])
  const [action, setAction] = useState({ loading: false, error: null, done: false })

  async function applySkin() {
    setAction({ loading: true, error: null, done: false })
    try {
      const updated = await patchPlayer(player.id, { skin_id: skin.id })
      updatePlayer({ skinId: updated.skin_id })
      setAction({ loading: false, error: null, done: true })
      profile.reload()
    } catch (err) {
      setAction({ loading: false, error: err.message, done: false })
    }
  }

  let content
  if (!skin && loading) {
    content = <LoadingState message="Memuat skin…" />
  } else if (!skin && error) {
    content = (
      <ErrorState
        title={error.status === 404 ? 'Skin tidak ditemukan' : 'Gagal memuat data'}
        error={error}
        onRetry={error.status === 404 ? undefined : reload}
      />
    )
  } else if (skin) {
    const unlocked = best >= skin.unlock_score
    const active = player.skinId === skin.id
    const progress = skin.unlock_score > 0 ? Math.min(1, best / skin.unlock_score) : 1

    let button
    if (active) {
      button = (
        <button type="button" className="btn btn--block" disabled>
          <Check size={20} aria-hidden="true" /> Sedang dipakai
        </button>
      )
    } else if (!unlocked) {
      button = (
        <button type="button" className="btn btn--block" disabled>
          <Lock size={18} aria-hidden="true" /> Butuh {formatNumber(skin.unlock_score - best)} poin lagi
        </button>
      )
    } else {
      button = (
        <button type="button" className="btn btn--primary btn--block" onClick={applySkin} disabled={action.loading}>
          <Sparkles size={20} aria-hidden="true" />
          {action.loading ? 'Menyimpan…' : 'Pakai skin ini'}
        </button>
      )
    }

    content = (
      <>
        <section className={`skin-hero${unlocked ? '' : ' is-locked'}`}>
          <SnakePreview skin={skin} variant="board" cell={36} locked={!unlocked} label={`Pratinjau skin ${skin.name}`} />
        </section>

        <section className="card skin-info">
          <div className="skin-info__head">
            <h2 className="skin-info__name">{skin.name}</h2>
            {active && <span className="tag">Dipakai</span>}
          </div>
          <p className="skin-info__desc">{skin.description}</p>
          <div className="swatches" aria-label="Warna skin">
            <span className="swatch" style={{ background: skin.head_color }} title="Kepala" />
            <span className="swatch" style={{ background: skin.body_color }} title="Badan" />
            <span className="swatch" style={{ background: skin.body_color_alt }} title="Belang" />
          </div>
        </section>

        <section className="card unlock">
          <div className="unlock__row">
            <span>{skin.unlock_score > 0 ? `Terbuka di skor ${formatNumber(skin.unlock_score)}` : 'Skin bawaan, selalu terbuka'}</span>
            <strong>{unlocked ? 'Terbuka' : `${formatNumber(best)} / ${formatNumber(skin.unlock_score)}`}</strong>
          </div>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <span style={{ width: `${progress * 100}%` }} />
          </div>
        </section>

        {action.error && (
          <p className="form-error" role="alert">
            {action.error}
          </p>
        )}
        {action.done && <p className="form-success">Skin dipakai! Coba di permainan berikutnya.</p>}
        {button}
      </>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Detail Skin" backTo="/skins" />
      {content}
    </div>
  )
}

export default SkinDetail
