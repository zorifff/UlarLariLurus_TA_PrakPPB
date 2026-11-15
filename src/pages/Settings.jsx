import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volume2, Vibrate, Gauge, Trash2, Download, UserRound, Save } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import { USERNAME_PATTERN } from '../components/OnboardingModal.jsx'
import usePlayer from '../hooks/usePlayer.js'
import useSettings from '../hooks/useSettings.js'
import usePendingMatches from '../hooks/usePendingMatches.js'
import useInstallPrompt from '../hooks/useInstallPrompt.js'
import { updatePlayer as patchPlayer } from '../services/playerService.js'
import { clearAll } from '../services/storage.js'
import { SPEED_LABELS } from '../game/constants.js'

const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator

function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`toggle${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="toggle__thumb" />
    </button>
  )
}

function UsernameForm({ player, onSaved }) {
  const [value, setValue] = useState(player.username)
  const [status, setStatus] = useState({ loading: false, error: null, done: false })
  const trimmed = value.trim()
  const valid = USERNAME_PATTERN.test(trimmed)
  const changed = trimmed !== player.username

  async function handleSubmit(event) {
    event.preventDefault()
    if (!valid || !changed) return
    setStatus({ loading: true, error: null, done: false })
    try {
      const updated = await patchPlayer(player.id, { username: trimmed })
      onSaved(updated.username)
      setStatus({ loading: false, error: null, done: true })
    } catch (err) {
      setStatus({
        loading: false,
        error: err.status === 409 ? 'Username sudah dipakai pemain lain.' : err.message,
        done: false,
      })
    }
  }

  return (
    <form className="username-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label">Username</span>
        <div className="field__row">
          <input
            className="field__input"
            type="text"
            maxLength={16}
            autoCapitalize="off"
            spellCheck="false"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.replace(/\s/g, '_'))
              setStatus({ loading: false, error: null, done: false })
            }}
            aria-invalid={!valid}
          />
          <button type="submit" className="btn btn--primary" disabled={!valid || !changed || status.loading}>
            <Save size={18} aria-hidden="true" />
            {status.loading ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
        <span className={`field__hint${!valid ? ' is-error' : ''}`}>3–16 karakter: huruf, angka, atau garis bawah (_).</span>
      </label>
      {status.error && (
        <p className="form-error" role="alert">
          {status.error}
        </p>
      )}
      {status.done && <p className="form-success">Username diperbarui.</p>}
    </form>
  )
}

function Settings() {
  const navigate = useNavigate()
  const { player, updatePlayer } = usePlayer()
  const { settings, updateSettings } = useSettings()
  const pending = usePendingMatches()
  const { install } = useInstallPrompt()

  function handleReset() {
    const warning = pending.length
      ? `\n\n${pending.length} skor yang belum terkirim juga akan hilang.`
      : ''
    const ok = window.confirm(
      `Hapus semua data lokal di perangkat ini?\n\nKamu akan diminta membuat username baru. ` +
        `Skor yang sudah tersimpan di server tetap ada di peringkat.${warning}`,
    )
    if (!ok) return
    clearAll()
    navigate('/', { replace: true })
  }

  return (
    <div className="page">
      <PageHeader title="Pengaturan" backTo="/" />

      <h2 className="section-title">
        <UserRound size={18} aria-hidden="true" /> Profil
      </h2>
      <section className="card">
        <UsernameForm key={player.username} player={player} onSaved={(username) => updatePlayer({ username })} />
      </section>

      <h2 className="section-title">Permainan</h2>
      <section className="card settings-list">
        <div className="setting-row">
          <Volume2 size={22} aria-hidden="true" />
          <div className="setting-row__text">
            <span className="setting-row__label">Suara</span>
            <span className="setting-row__hint">Efek suara saat makan dan kalah</span>
          </div>
          <Toggle label="Suara" checked={settings.sound} onChange={(sound) => updateSettings({ sound })} />
        </div>
        <div className="setting-row">
          <Vibrate size={22} aria-hidden="true" />
          <div className="setting-row__text">
            <span className="setting-row__label">Getar</span>
            <span className="setting-row__hint">
              {canVibrate ? 'HP bergetar saat ular mati' : 'Tidak didukung di perangkat/browser ini'}
            </span>
          </div>
          <Toggle
            label="Getar"
            checked={settings.vibrate && canVibrate}
            disabled={!canVibrate}
            onChange={(vibrate) => updateSettings({ vibrate })}
          />
        </div>
        <div className="setting-row setting-row--stack">
          <div className="setting-row__head">
            <Gauge size={22} aria-hidden="true" />
            <div className="setting-row__text">
              <span className="setting-row__label">Kecepatan awal</span>
              <span className="setting-row__hint">Berlaku di permainan berikutnya</span>
            </div>
          </div>
          <div className="segmented" role="radiogroup" aria-label="Kecepatan awal">
            {Object.entries(SPEED_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={settings.speed === value}
                className={`segmented__option${settings.speed === value ? ' is-active' : ''}`}
                onClick={() => updateSettings({ speed: value })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <h2 className="section-title">Aplikasi</h2>
      <section className="card settings-list">
        {install && (
          <button type="button" className="btn btn--block" onClick={install}>
            <Download size={18} aria-hidden="true" />
            Pasang aplikasi di perangkat ini
          </button>
        )}
        <button type="button" className="btn btn--danger btn--block" onClick={handleReset}>
          <Trash2 size={18} aria-hidden="true" />
          Reset data lokal
        </button>
        <p className="settings-meta">
          ID pemain: <code>{player.id}</code>
          <br />
          Versi {__APP_VERSION__}
        </p>
      </section>
    </div>
  )
}

export default Settings
