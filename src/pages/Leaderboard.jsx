import { Trophy } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

function Leaderboard() {
  return (
    <div className="page">
      <PageHeader title="Peringkat" subtitle="Skor tertinggi semua pemain" />
      <EmptyState icon={Trophy} title="Belum ada peringkat" message="Daftar peringkat global akan tampil di sini." />
    </div>
  )
}

export default Leaderboard
