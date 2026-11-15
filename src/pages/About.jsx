import { Info } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

function About() {
  return (
    <div className="page">
      <PageHeader title="Tentang" subtitle="Ularlarilurus" />
      <EmptyState icon={Info} title="Tentang aplikasi" message="Cara main, panduan makanan, dan profil pembuat akan tampil di sini." />
    </div>
  )
}

export default About
