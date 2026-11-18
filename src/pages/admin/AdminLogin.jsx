import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react'
import { adminLogin } from '../../services/adminService.js'

/** Login admin: hanya kata sandi (admin cuma satu, yaitu developer). Tampilan mengikuti onboarding. */
function AdminLogin() {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState({ loading: false, error: null })

  async function handleSubmit(event) {
    event.preventDefault()
    if (!password || status.loading) return
    setStatus({ loading: true, error: null })
    try {
      await adminLogin(password)
      // Sesi tersimpan → AdminApp otomatis menampilkan dashboard
    } catch (err) {
      const message =
        err.status === 401
          ? 'Kata sandi salah.'
          : err.code === 'ADMIN_NOT_CONFIGURED'
            ? 'ADMIN_PASSWORD belum diisi di environment server.'
            : err.message
      setStatus({ loading: false, error: message })
    }
  }

  return (
    <div className="onboarding" aria-labelledby="admin-login-title">
      <div className="onboarding__card">
        <img className="onboarding__logo" src="/favicon.svg" alt="" width="88" height="88" />
        <h1 id="admin-login-title" className="onboarding__title">Masuk Admin</h1>
        <p className="onboarding__text">Masukkan kata sandi admin untuk mengelola akun pemain</p>

        <form className="onboarding__form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Kata sandi</span>
            <div className="field__row">
              <input
                className="field__input"
                type={visible ? 'text' : 'password'}
                autoComplete="current-password"
                autoCapitalize="off"
                spellCheck="false"
                maxLength={200}
                placeholder="Kata sandi admin"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (status.error) setStatus({ loading: false, error: null })
                }}
                aria-invalid={Boolean(status.error)}
                autoFocus
              />
              <button
                type="button"
                className="icon-button admin-eye"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
              </button>
            </div>
          </label>

          {status.error && (
            <p className="form-error" role="alert">
              {status.error}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={!password || status.loading}>
            {status.loading ? 'Memeriksa…' : 'Masuk'}
            {!status.loading && <LogIn size={20} aria-hidden="true" />}
          </button>
          <Link to="/" className="btn btn--block">
            <ArrowLeft size={18} aria-hidden="true" />
            Kembali ke game
          </Link>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
