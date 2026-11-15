import './PWABadge.css'
import { useRegisterSW } from 'virtual:pwa-register/react'

function PWABadge() {
  // cek pembaruan service worker setiap 1 jam
  const period = 60 * 60 * 1000

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      } else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          const sw = e.target
          if (sw.state === 'activated') registerPeriodicSync(period, swUrl, r)
        })
      }
    },
  })

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="PWABadge" role="alert" aria-labelledby="toast-message">
      {(offlineReady || needRefresh) && (
        <div className="PWABadge-toast">
          <div className="PWABadge-message">
            {offlineReady ? (
              <span id="toast-message">Aplikasi siap dimainkan offline.</span>
            ) : (
              <span id="toast-message">Versi baru tersedia. Muat ulang untuk memperbarui.</span>
            )}
          </div>
          <div className="PWABadge-buttons">
            {needRefresh && (
              <button className="PWABadge-toast-button" onClick={() => updateServiceWorker(true)}>
                Muat ulang
              </button>
            )}
            <button className="PWABadge-toast-button" onClick={() => close()}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PWABadge

/**
 * Cek berkala apakah ada service worker baru.
 */
function registerPeriodicSync(period, swUrl, r) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine) return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        cache: 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200) await r.update()
  }, period)
}
