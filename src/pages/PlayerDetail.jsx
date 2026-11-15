import { useParams } from 'react-router-dom'
import { User } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

function PlayerDetail() {
  const { playerId } = useParams()

  return (
    <div className="page">
      <PageHeader title="Detail Pemain" backTo="/leaderboard" />
      <EmptyState icon={User} title="Statistik pemain" message="Statistik dan 10 match terakhir akan tampil di sini.">
        <span className="param-chip">{playerId}</span>
      </EmptyState>
    </div>
  )
}

export default PlayerDetail
