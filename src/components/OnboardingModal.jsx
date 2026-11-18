import { useState } from 'react'
import { ArrowRight, UserX } from 'lucide-react'
import { registerPlayer } from '../services/playerService.js'
import { KEYS, remove, setLocalPlayer } from '../services/storage.js'
import useStoredValue from '../hooks/useStoredValue.js'
import { uuid } from '../utils/uuid.js'

export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,16}$/

/** Layar onboarding: muncul kalau belum ada pemain di perangkat ini (atau akunnya dihapus admin). */
function OnboardingModal() {
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState({ loading: false, error: null })
  const removed = useStoredValue(KEYS.accountRemoved, null)

  const trimmed = username.trim()
  const valid = USERNAME_PATTERN.test(trimmed)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!valid || status.loading) return
    setStatus({ loading: true, error: null })

    const id = uuid()
    try {
      const player = await registerPlayer(id, trimmed)
      remove(KEYS.accountRemoved)
      setLocalPlayer({ id: player.id, username: player.username, skinId: player.skin_id })
    } catch (err) {
      const message =
        err.status === 409
          ? 'Username sudah dipakai pemain lain. Coba nama lain.'
          : err.isNetwork
            ? 'Tidak bisa terhubung ke server. Daftar pertama kali butuh internet.'
            : err.message
      setStatus({ loading: false, error: message })
    }
  }

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding__card">
        <img className="onboarding__logo" src="/favicon.svg" alt="" width="88" height="88" />
        <h1 id="onboarding-title" className="onboarding__title">Selamat datang di Ularlarilurus!</h1>
        <p className="onboarding__text">
          Buat nama untuk ditampilkan di papan peringkat
        </p>

        {removed && (
          <p className="banner banner--warn onboarding__notice" role="status">
            <UserX size={20} aria-hidden="true" />
            <span>
              Akun {removed.username ? <strong>{removed.username}</strong> : 'kamu'} telah dihapus oleh admin
              beserta semua progresnya. Buat username baru untuk main lagi.
            </span>
          </p>
        )}

        <form className="onboarding__form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Username</span>
            <input
              className="field__input"
              type="text"
              inputMode="text"
              autoComplete="nickname"
              autoCapitalize="off"
              spellCheck="false"
              maxLength={16}
              placeholder="mis. ular_ngebut"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, '_'))}
              aria-invalid={Boolean(trimmed) && !valid}
              autoFocus
            />
            <span className={`field__hint${trimmed && !valid ? ' is-error' : ''}`}>
              3–16 karakter: huruf, angka, atau garis bawah (_).
            </span>
          </label>

          {status.error && (
            <p className="form-error" role="alert">
              {status.error}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={!valid || status.loading}>
            {status.loading ? 'Mendaftarkan…' : 'Mulai main'}
            {!status.loading && <ArrowRight size={20} aria-hidden="true" />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default OnboardingModal
