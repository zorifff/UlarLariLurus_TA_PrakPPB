import { Palette } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

function Skins() {
  return (
    <div className="page">
      <PageHeader title="Skin" subtitle="Buka skin baru dengan skor tinggi" />
      <EmptyState icon={Palette} title="Koleksi skin" message="Daftar skin ular akan tampil di sini." />
    </div>
  )
}

export default Skins
