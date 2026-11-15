import { Link } from 'react-router-dom'
import { ChevronRight, Clock, BrickWall, Undo2 } from 'lucide-react'
import SnakePreview from './SnakePreview.jsx'
import { formatDateTime, formatDuration, formatNumber } from '../utils/format.js'

/** Satu baris match (dipakai di Riwayat dan Detail Pemain). */
function MatchListItem({ match }) {
  const wall = match.death_cause === 'wall'
  return (
    <li>
      <Link to={`/history/${match.id}`} className="list-row">
        <div className="match-score">
          <span className="match-score__value">{formatNumber(match.score)}</span>
          <span className="match-score__label">poin</span>
        </div>
        <div className="list-row__main">
          <span className="list-row__title">{formatDateTime(match.played_at)}</span>
          <span className="list-row__meta">
            <span className="chip">
              <Clock size={13} aria-hidden="true" />
              {formatDuration(match.duration_seconds)}
            </span>
            <span className="chip">
              {wall ? <BrickWall size={13} aria-hidden="true" /> : <Undo2 size={13} aria-hidden="true" />}
              {wall ? 'Tembok' : 'Badan sendiri'}
            </span>
            <SnakePreview skin={match} segments={3} cell={9} />
          </span>
        </div>
        <ChevronRight className="list-row__chevron" size={20} aria-hidden="true" />
      </Link>
    </li>
  )
}

export default MatchListItem
