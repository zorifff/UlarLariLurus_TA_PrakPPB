import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * Judul halaman. `backTo` (path) menampilkan tombol kembali;
 * `action` untuk tombol di kanan (mis. refresh / pengaturan).
 */
function PageHeader({ title, subtitle, backTo, action }) {
  const navigate = useNavigate()

  function handleBack() {
    // Kembali ke halaman sebelumnya kalau ada riwayat di app ini, kalau tidak ke backTo
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate(backTo, { replace: true })
  }

  return (
    <header className="page-header">
      {backTo && (
        <button type="button" className="icon-button" onClick={handleBack} aria-label="Kembali">
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
      )}
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  )
}

export default PageHeader
