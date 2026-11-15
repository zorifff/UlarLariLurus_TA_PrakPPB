import { Link } from 'react-router-dom'
import { Play, Settings } from 'lucide-react'

function Home() {
  return (
    <div className="page home">
      <div className="home__top">
        <Link to="/settings" className="icon-button" aria-label="Pengaturan">
          <Settings size={22} aria-hidden="true" />
        </Link>
      </div>

      <section className="home__hero">
        <img className="home__logo" src="/favicon.svg" alt="" width="112" height="112" />
        <h1 className="home__title">Ularlarilurus</h1>
        <p className="home__tagline">Makan buahnya, jangan tabrak apa-apa.</p>
        <Link to="/play" className="btn btn--primary btn--large">
          <Play size={24} fill="currentColor" aria-hidden="true" />
          Main
        </Link>
      </section>

      {/* Data pemain (username, skor terbaik, skin aktif) diisi di langkah 3–5 */}
      <section className="home__stats">
        <div className="card stat">
          <span className="stat__label">Skor terbaik</span>
          <span className="stat__value">0</span>
        </div>
        <div className="card stat">
          <span className="stat__label">Skin aktif</span>
          <span className="stat__value">Oranye Klasik</span>
        </div>
      </section>
    </div>
  )
}

export default Home
