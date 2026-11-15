import PageHeader from '../components/PageHeader.jsx'

const GRID_SIZE = 15

function Play() {
  return (
    <div className="page">
      <PageHeader title="Main" backTo="/" />

      {/* Canvas game, HUD, dan d-pad dibuat di langkah 2 */}
      <div className="arena-placeholder" aria-label="Arena (segera hadir)">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <p className="state-box__message" style={{ margin: '0 auto', textAlign: 'center' }}>
        Arena game sedang disiapkan.
      </p>
    </div>
  )
}

export default Play
