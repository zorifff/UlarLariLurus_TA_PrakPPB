import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import OfflineIndicator from './components/OfflineIndicator.jsx'
import OnboardingModal from './components/OnboardingModal.jsx'
import PWABadge from './components/PWABadge.jsx'
import Home from './pages/Home.jsx'
import Play from './pages/Play.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import PlayerDetail from './pages/PlayerDetail.jsx'
import History from './pages/History.jsx'
import MatchDetail from './pages/MatchDetail.jsx'
import Skins from './pages/Skins.jsx'
import SkinDetail from './pages/SkinDetail.jsx'
import About from './pages/About.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminApp from './pages/admin/AdminApp.jsx'
import usePlayer from './hooks/usePlayer.js'
import useAccountGuard from './hooks/useAccountGuard.js'
import useSwipeNav from './hooks/useSwipeNav.js'
import { flushQueue } from './services/syncQueue.js'
import './App.css'

// Halaman yang tampil layar penuh tanpa bottom nav
const FULLSCREEN_PATHS = ['/play']

function App() {
  const { pathname } = useLocation()
  const { player } = usePlayer()
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/')
  const playerId = isAdminPath ? null : player?.id

  // Pastikan akun pemain masih ada di server (kalau dihapus admin → kembali ke onboarding)
  useAccountGuard(playerId, pathname)
  const { slideClass, onClickCapture } = useSwipeNav(isAdminPath || !player ? '' : pathname)

  // Kirim ulang skor yang tertunda: saat app dibuka dan setiap kali kembali online
  useEffect(() => {
    if (!playerId) return undefined
    const sync = () => flushQueue().catch(() => {})
    sync()
    window.addEventListener('online', sync)
    return () => window.removeEventListener('online', sync)
  }, [playerId])

  // Kembali ke atas setiap pindah halaman
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Halaman admin (/admin) punya alur login sendiri (kata sandi), tidak butuh username pemain
  if (isAdminPath) {
    return (
      <>
        <AdminApp />
        <PWABadge />
      </>
    )
  }

  if (!player) {
    return (
      <div className="app">
        <OfflineIndicator />
        <OnboardingModal />
        <PWABadge />
      </div>
    )
  }

  const showNav = !FULLSCREEN_PATHS.includes(pathname)

  return (
    <div className={`app ${showNav ? 'app--with-nav' : 'app--fullscreen'}`}>
      <OfflineIndicator />

      <main className={`app-main${slideClass ? ` ${slideClass}` : ''}`} onClickCapture={onClickCapture}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/leaderboard/:playerId" element={<PlayerDetail />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:matchId" element={<MatchDetail />} />
          <Route path="/skins" element={<Skins />} />
          <Route path="/skins/:skinId" element={<SkinDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {showNav && <BottomNav />}
      <PWABadge />
    </div>
  )
}

export default App
