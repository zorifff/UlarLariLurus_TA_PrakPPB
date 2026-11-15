import { useParams } from 'react-router-dom'
import { ScrollText } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

function MatchDetail() {
  const { matchId } = useParams()

  return (
    <div className="page">
      <PageHeader title="Detail Match" backTo="/history" />
      <EmptyState icon={ScrollText} title="Rincian match" message="Skor, durasi, penyebab mati, dan rincian makanan akan tampil di sini.">
        <span className="param-chip">{matchId}</span>
      </EmptyState>
    </div>
  )
}

export default MatchDetail
