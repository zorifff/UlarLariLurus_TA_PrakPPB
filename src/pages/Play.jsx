import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Pause,
  Play as PlayIcon,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Trophy,
  CloudOff,
  Check,
  AlertTriangle,
  Sparkles,
  House,
} from 'lucide-react'
import GameCanvas from '../components/GameCanvas.jsx'
import { createGame, start, pause, resume, turn, tick } from '../game/engine.js'
import { GRID_SIZE, SPEED_LABELS } from '../game/constants.js'
import { keyToDirection } from '../game/input.js'
import { playSound, unlockAudio, vibrate } from '../game/sound.js'
import { getGameFoods } from '../services/foodService.js'
import { getGameSkin } from '../services/skinService.js'
import { submitMatch } from '../services/matchService.js'
import { enqueueMatch } from '../services/syncQueue.js'
import { getLocalBest, updateLocalBest } from '../services/storage.js'
import usePlayer from '../hooks/usePlayer.js'
import useSettings from '../hooks/useSettings.js'
import { uuid } from '../utils/uuid.js'
import { deathCauseLabel, formatDuration, formatNumber } from '../utils/format.js'
import './Play.css'

function Play() {
  const navigate = useNavigate()
  const { player } = usePlayer()
  const { settings } = useSettings()

  const [assets, setAssets] = useState(null) // { foods, skin }
  const [hud, setHud] = useState({ score: 0, status: 'loading' })
  const [best, setBest] = useState(() => getLocalBest())
  const [result, setResult] = useState(null)
  const [submit, setSubmit] = useState({ state: 'idle' })

  const gameRef = useRef(null)
  const clockRef = useRef({ last: null, acc: 0, elapsed: 0 })
  const matchIdRef = useRef(null)
  const latest = useRef({ settings, player, assets })
  useEffect(() => {
    latest.current = { settings, player, assets }
  })

  // ---------- Aset: makanan + skin (dengan fallback offline) ----------
  const skinId = player?.skinId
  useEffect(() => {
    let active = true
    Promise.all([getGameFoods(), getGameSkin(skinId)]).then(([foods, skin]) => {
      if (active) setAssets({ foods, skin })
    })
    return () => {
      active = false
    }
  }, [skinId])

  const foodsById = useMemo(() => Object.fromEntries((assets?.foods ?? []).map((f) => [f.id, f])), [assets])

  const syncHud = useCallback(() => {
    const g = gameRef.current
    if (!g) return
    setHud((h) => (h.score === g.score && h.status === g.status ? h : { score: g.score, status: g.status }))
  }, [])

  const newGame = useCallback(() => {
    const { assets: a, settings: s } = latest.current
    if (!a) return
    gameRef.current = createGame({ gridSize: GRID_SIZE, foods: a.foods, speed: s.speed })
    clockRef.current = { last: null, acc: 0, elapsed: 0 }
    matchIdRef.current = uuid()
    setResult(null)
    setSubmit({ state: 'idle' })
    setBest(getLocalBest())
    syncHud()
  }, [syncHud])

  // Game pertama dibuat setelah aset siap
  const assetsReady = Boolean(assets)
  useEffect(() => {
    if (assetsReady && !gameRef.current) newGame()
  }, [assetsReady, newGame])

  // ---------- Game over: tampilkan hasil + kirim otomatis ----------
  const finishGame = useCallback((g) => {
    const { player: p, assets: a } = latest.current
    const durationSeconds = Math.round(clockRef.current.elapsed / 1000)
    const previousBest = getLocalBest()
    updateLocalBest(g.score)
    setBest(Math.max(previousBest, g.score))
    setResult({
      score: g.score,
      length: g.snake.length,
      foodEaten: g.foodEaten,
      durationSeconds,
      deathCause: g.deathCause,
      isNewBest: g.score > 0 && g.score > previousBest,
    })
    if (!p) return

    const payload = {
      id: matchIdRef.current,
      player_id: p.id,
      skin_id: a?.skin?.id ?? 1,
      score: g.score,
      snake_length: g.snake.length,
      food_eaten: g.foodEaten,
      duration_seconds: durationSeconds,
      death_cause: g.deathCause,
      grid_size: g.gridSize,
      played_at: new Date().toISOString(),
      foods: Object.entries(g.eaten).map(([food_id, quantity]) => ({ food_id, quantity })),
    }

    setSubmit({ state: 'sending' })
    submitMatch(payload)
      .then((res) => setSubmit({ state: 'sent', rank: res.player?.rank ?? null, matchId: payload.id }))
      .catch((err) => {
        if (err.isRetryable) {
          enqueueMatch(payload)
          setSubmit({ state: 'queued' })
        } else {
          setSubmit({ state: 'failed', message: err.message })
        }
      })
  }, [])

  const playEffects = useCallback((events) => {
    const { sound, vibrate: canVibrate } = latest.current.settings
    for (const event of events) {
      if (sound) playSound(event)
      if (event === 'die' && canVibrate) vibrate([90, 50, 140])
    }
  }, [])

  // ---------- Loop: dipanggil GameCanvas setiap frame ----------
  const onFrame = useCallback(
    (now) => {
      const clock = clockRef.current
      const last = clock.last
      clock.last = now
      let g = gameRef.current
      if (!g || g.status !== 'running' || last === null) return

      const dt = Math.min(now - last, 250) // hindari lompatan besar setelah tab kembali aktif
      clock.elapsed += dt
      clock.acc += dt

      let changed = false
      while (clock.acc >= g.tickMs && g.status === 'running') {
        clock.acc -= g.tickMs
        g = tick(g)
        if (g.events.length) {
          playEffects(g.events)
          changed = true
        }
      }
      gameRef.current = g
      if (changed) {
        syncHud()
        if (g.status === 'over') finishGame(g)
      }
    },
    [finishGame, playEffects, syncHud],
  )

  // ---------- Kontrol ----------
  const control = useCallback(
    (action, direction) => {
      let g = gameRef.current
      if (!g) return
      const startGame = (state) => {
        unlockAudio()
        if (latest.current.settings.sound) playSound('start')
        clockRef.current.acc = 0
        return start(state)
      }

      if (action === 'steer') {
        if (g.status === 'over') return
        if (g.status === 'ready') g = startGame(g)
        else if (g.status === 'paused') g = resume(g)
        g = turn(g, direction)
      } else if (action === 'start') {
        g = startGame(g)
      } else if (action === 'pause') {
        g = pause(g)
      } else if (action === 'resume') {
        g = resume(g)
      } else if (action === 'toggle') {
        if (g.status === 'running') g = pause(g)
        else if (g.status === 'paused') g = resume(g)
        else if (g.status === 'ready') g = startGame(g)
      }
      gameRef.current = g
      syncHud()
    },
    [syncHud],
  )

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      const direction = keyToDirection(e.key)
      if (direction) {
        e.preventDefault()
        control('steer', direction)
        return
      }
      const onControl = e.target instanceof HTMLElement && e.target.closest('button, a, input')
      if ((e.key === ' ' || e.key === 'Enter') && !onControl) {
        e.preventDefault()
        if (gameRef.current?.status === 'over') newGame()
        else control('toggle')
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        control('pause')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [control, newGame])

  // Jeda otomatis saat tab/app tersembunyi
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) control('pause')
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [control])

  const { status } = hud
  const steer = (direction) => control('steer', direction)

  return (
    <div className="play">
      <header className="play-hud">
        <button type="button" className="icon-button" onClick={() => navigate('/')} aria-label="Keluar ke beranda">
          <X size={22} aria-hidden="true" />
        </button>
        <div className="hud-stat">
          <span className="hud-stat__label">Skor</span>
          <span className="hud-stat__value">{formatNumber(hud.score)}</span>
        </div>
        <div className="hud-stat">
          <span className="hud-stat__label">Terbaik</span>
          <span className="hud-stat__value">{formatNumber(Math.max(best, hud.score))}</span>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={() => control('toggle')}
          disabled={status !== 'running' && status !== 'paused'}
          aria-label={status === 'running' ? 'Jeda' : 'Lanjut'}
        >
          {status === 'running' ? <Pause size={22} aria-hidden="true" /> : <PlayIcon size={22} aria-hidden="true" />}
        </button>
      </header>

      <div className="play-stage">
        <div className="play-board">
          <GameCanvas
            gameRef={gameRef}
            skin={assets?.skin}
            foodsById={foodsById}
            onFrame={onFrame}
            onDirection={steer}
          />

          {status === 'loading' && (
            <div className="board-overlay">
              <span className="spinner" aria-hidden="true" />
              <p>Menyiapkan arena…</p>
            </div>
          )}

          {status === 'ready' && (
            <div className="board-overlay">
              <p className="board-overlay__title">Siap?</p>
              <p className="board-overlay__text">
                Geser layar atau tekan tombol arah untuk berbelok.
                <br />
                Kecepatan: {SPEED_LABELS[settings.speed] ?? 'Normal'}
              </p>
              <button type="button" className="btn btn--primary btn--large" onClick={() => control('start')} autoFocus>
                <PlayIcon size={22} fill="currentColor" aria-hidden="true" />
                Mulai
              </button>
            </div>
          )}

          {status === 'paused' && (
            <div className="board-overlay">
              <p className="board-overlay__title">Jeda</p>
              <button type="button" className="btn btn--primary btn--large" onClick={() => control('resume')} autoFocus>
                <PlayIcon size={22} fill="currentColor" aria-hidden="true" />
                Lanjut
              </button>
              <button type="button" className="btn" onClick={newGame}>
                <RotateCw size={18} aria-hidden="true" />
                Ulang dari awal
              </button>
            </div>
          )}
        </div>

        <Dpad onSteer={steer} />
      </div>

      {status === 'over' && result && (
        <GameOver result={result} submit={submit} onRestart={newGame} />
      )}
    </div>
  )
}

function Dpad({ onSteer }) {
  const buttons = [
    { dir: 'up', label: 'Atas', Icon: ChevronUp },
    { dir: 'left', label: 'Kiri', Icon: ChevronLeft },
    { dir: 'right', label: 'Kanan', Icon: ChevronRight },
    { dir: 'down', label: 'Bawah', Icon: ChevronDown },
  ]
  return (
    <div className="dpad" aria-label="Tombol arah">
      {buttons.map(({ dir, label, Icon }) => (
        <button
          key={dir}
          type="button"
          className={`dpad__btn dpad__btn--${dir}`}
          aria-label={label}
          onPointerDown={(e) => {
            e.preventDefault()
            onSteer(dir)
          }}
          onClick={(e) => {
            if (e.detail === 0) onSteer(dir) // aktivasi lewat keyboard
          }}
        >
          <Icon size={34} strokeWidth={2.6} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

function SubmitStatus({ submit }) {
  switch (submit.state) {
    case 'sending':
      return (
        <p className="submit-status">
          <span className="spinner spinner--small" aria-hidden="true" /> Menyimpan skor…
        </p>
      )
    case 'sent':
      return (
        <p className="submit-status is-ok">
          <Check size={16} aria-hidden="true" /> Skor tersimpan
          {submit.rank ? ` · peringkat #${submit.rank}` : ''}
          {submit.matchId && (
            <>
              {' · '}
              <Link to={`/history/${submit.matchId}`}>Detail Permainan</Link>
            </>
          )}
        </p>
      )
    case 'queued':
      return (
        <p className="submit-status is-warn">
          <CloudOff size={16} aria-hidden="true" /> Offline. Skor dikirim otomatis saat online.
        </p>
      )
    case 'failed':
      return (
        <p className="submit-status is-error">
          <AlertTriangle size={16} aria-hidden="true" /> Skor gagal disimpan: {submit.message}
        </p>
      )
    default:
      return null
  }
}

function GameOver({ result, submit, onRestart }) {
  return (
    <div className="gameover" role="dialog" aria-modal="true" aria-labelledby="gameover-title">
      <div className="gameover__card">
        <p className="gameover__cause">{deathCauseLabel(result.deathCause)}</p>
        <h2 id="gameover-title" className="gameover__title">Game over</h2>
        {result.isNewBest && (
          <span className="badge badge--gold">
            <Sparkles size={14} aria-hidden="true" /> Rekor baru!
          </span>
        )}
        <p className="gameover__score">
          {formatNumber(result.score)}
          <span>poin</span>
        </p>
        <dl className="stat-grid stat-grid--3">
          <div className="stat-tile">
            <dt>Panjang</dt>
            <dd>{result.length}</dd>
          </div>
          <div className="stat-tile">
            <dt>Makanan</dt>
            <dd>{result.foodEaten}</dd>
          </div>
          <div className="stat-tile">
            <dt>Durasi</dt>
            <dd>{formatDuration(result.durationSeconds)}</dd>
          </div>
        </dl>
        <SubmitStatus submit={submit} />
        <div className="gameover__actions">
          <button type="button" className="btn btn--primary btn--block" onClick={onRestart} autoFocus>
            <RotateCw size={20} aria-hidden="true" />
            Main lagi
          </button>
          <div className="gameover__row">
            <Link to="/leaderboard" className="btn btn--block">
              <Trophy size={18} aria-hidden="true" />
              Peringkat
            </Link>
            <Link to="/" className="btn btn--block">
              <House size={18} aria-hidden="true" />
              Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Play
