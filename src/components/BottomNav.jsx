import { NavLink } from 'react-router-dom'
import { Gamepad2, Trophy, History, Palette, Info } from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Main', icon: Gamepad2, end: true },
  { to: '/leaderboard', label: 'Peringkat', icon: Trophy },
  { to: '/history', label: 'Riwayat', icon: History },
  { to: '/skins', label: 'Skin', icon: Palette },
  { to: '/about', label: 'Tentang', icon: Info },
]

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}
        >
          <Icon className="bottom-nav__icon" size={22} strokeWidth={2.2} aria-hidden="true" />
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
