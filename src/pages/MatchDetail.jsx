import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import SnakePreview from '../components/SnakePreview.jsx'
import FoodIcon from '../components/FoodIcon.jsx'
import useFetch from '../hooks/useFetch.js'
import { getMatch } from '../services/matchService.js'
import { deathCauseLabel, formatDateTime, formatDuration, formatNumber } from '../utils/format.js'

function MatchDetail() {
  const { matchId } = useParams()
  const { data: match, loading, error, reload } = useFetch(() => getMatch(matchId), [matchId])

  let content
  if (!match && loading) {
    content = <LoadingState message="Memuat detail match…" />
  } else if (!match && error) {
    content = (
      <ErrorState
        title={error.status === 404 ? 'Match tidak ditemukan' : 'Gagal memuat data'}
        error={error}
        onRetry={error.status === 404 ? undefined : reload}
      />
    )
  } else if (match) {
    const foodTotal = match.foods.reduce((sum, f) => sum + f.points * f.quantity, 0)
    content = (
      <>
        <section className="card match-hero">
          <p className="match-hero__score">
            {formatNumber(match.score)}
            <span>poin</span>
          </p>
          <p className="match-hero__meta">
            oleh <Link to={`/leaderboard/${match.player_id}`}>{match.username}</Link> · {formatDateTime(match.played_at)}
          </p>
          <SnakePreview skin={match.skin} segments={Math.min(match.snake_length, 9)} cell={20} />
        </section>

        <dl className="stat-grid">
          <div className="stat-tile">
            <dt>Panjang ular</dt>
            <dd>{match.snake_length}</dd>
          </div>
          <div className="stat-tile">
            <dt>Makanan</dt>
            <dd>{match.food_eaten}</dd>
          </div>
          <div className="stat-tile">
            <dt>Durasi</dt>
            <dd>{formatDuration(match.duration_seconds)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Arena</dt>
            <dd>
              {match.grid_size}×{match.grid_size}
            </dd>
          </div>
          <div className="stat-tile">
            <dt>Penyebab mati</dt>
            <dd className="stat-tile__small">{deathCauseLabel(match.death_cause)}</dd>
          </div>
          <div className="stat-tile">
            <dt>Skin</dt>
            <dd className="stat-tile__small">{match.skin?.name}</dd>
          </div>
        </dl>

        <h2 className="section-title">Rincian makanan</h2>
        {match.foods.length ? (
          <ul className="card food-breakdown">
            {match.foods.map((food) => (
              <li key={food.food_id} className="food-breakdown__row">
                <FoodIcon id={food.food_id} color={food.color} size={30} />
                <span className="food-breakdown__name">
                  {food.name}
                  <small>
                    {food.quantity} × {food.points} poin
                  </small>
                </span>
                <span className="food-breakdown__value">+{formatNumber(food.points * food.quantity)}</span>
              </li>
            ))}
            <li className="food-breakdown__row food-breakdown__total">
              <span className="food-breakdown__name">Total</span>
              <span className="food-breakdown__value">{formatNumber(foodTotal)}</span>
            </li>
          </ul>
        ) : (
          <p className="inline-note">Tidak ada makanan yang dimakan di permainan ini.</p>
        )}
      </>
    )
  }

  return (
    <div className="page">
      <PageHeader title="Detail Match" backTo="/history" />
      {content}
    </div>
  )
}

export default MatchDetail
