import { useEffect } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { formatNumber } from '../../utils/format.js'

/**
 * Konfirmasi hapus akun. Tampil sebagai kartu di tengah layar (gaya sama dengan layar game over).
 * `player` minimal punya { username, best_score, total_games }.
 */
function DeleteAccountDialog({ player, loading, error, onCancel, onConfirm }) {
  // Esc = batal (kecuali sedang menghapus)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loading, onCancel])

  return (
    <div
      className="admin-dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      aria-describedby="delete-desc"
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div className="admin-dialog__card">
        <span className="admin-dialog__icon">
          <AlertTriangle size={30} aria-hidden="true" />
        </span>
        <h2 id="delete-title" className="admin-dialog__title">
          Hapus akun <span>{player.username}</span>?
        </h2>
        <p id="delete-desc" className="admin-dialog__text">
          Semua progres akun ini akan hilang permanen: skor terbaik{' '}
          <strong>{formatNumber(player.best_score)}</strong>, <strong>{formatNumber(player.total_games)}</strong>{' '}
          riwayat permainan, skin, dan posisinya di peringkat. Pemain harus membuat username baru saat membuka game
          lagi.
        </p>
        <p className="admin-dialog__warn">Tindakan ini tidak bisa dibatalkan.</p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="admin-dialog__actions">
          <button type="button" className="btn btn--block" onClick={onCancel} disabled={loading} autoFocus>
            Batal
          </button>
          <button type="button" className="btn btn--danger-solid btn--block" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span className="spinner spinner--small" aria-hidden="true" />
            ) : (
              <Trash2 size={18} aria-hidden="true" />
            )}
            {loading ? 'Menghapus…' : 'Hapus akun'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteAccountDialog
