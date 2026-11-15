import { AlertTriangle, RotateCw } from 'lucide-react'

function ErrorState({ title = 'Gagal memuat data', error, message, onRetry }) {
  return (
    <div className="state-box state-box--error" role="alert">
      <AlertTriangle className="state-box__icon" size={40} strokeWidth={1.8} aria-hidden="true" />
      <p className="state-box__title">{title}</p>
      <p className="state-box__message">{message ?? error?.message ?? 'Terjadi kesalahan.'}</p>
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          <RotateCw size={18} aria-hidden="true" />
          Coba lagi
        </button>
      )}
    </div>
  )
}

export default ErrorState
