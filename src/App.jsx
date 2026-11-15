import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import OfflineIndicator from './components/OfflineIndicator.jsx'
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
import './App.css'

// Halaman yang tampil layar penuh tanpa bottom nav
const FULLSCREEN_PATHS = ['/play']

function App() {
  const { pathname } = useLocation()
  const showNav = !FULLSCREEN_PATHS.includes(pathname)

  return (
    <div className={`app ${showNav ? 'app--with-nav' : ''}`}>
      <OfflineIndicator />

      <main className="app-main">
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
