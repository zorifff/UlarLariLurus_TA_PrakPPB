import { useParams } from 'react-router-dom'
import { Palette } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

function SkinDetail() {
  const { skinId } = useParams()

  return (
    <div className="page">
      <PageHeader title="Detail Skin" backTo="/skins" />
      <EmptyState icon={Palette} title="Preview skin" message="Preview ular, deskripsi, dan syarat buka akan tampil di sini.">
        <span className="param-chip">skin #{skinId}</span>
      </EmptyState>
    </div>
  )
}

export default SkinDetail
