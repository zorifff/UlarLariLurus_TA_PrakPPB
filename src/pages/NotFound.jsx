import { Link } from 'react-router-dom'
import { MapPinOff } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

function NotFound() {
  return (
    <div className="page">
      <PageHeader title="Halaman tidak ditemukan" />
      <EmptyState icon={MapPinOff} title="Ularnya nyasar" message="Halaman yang kamu cari tidak ada.">
        <Link to="/" className="btn btn--primary">Ke beranda</Link>
      </EmptyState>
    </div>
  )
}

export default NotFound
