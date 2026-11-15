import { History as HistoryIcon } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

function History() {
  return (
    <div className="page">
      <PageHeader title="Riwayat" subtitle="Permainan kamu sebelumnya" />
      <EmptyState icon={HistoryIcon} title="Belum ada riwayat" message="Main dulu, nanti hasilnya muncul di sini." />
    </div>
  )
}

export default History
