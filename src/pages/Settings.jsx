import { Settings as SettingsIcon } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

function Settings() {
  return (
    <div className="page">
      <PageHeader title="Pengaturan" backTo="/" />
      <EmptyState icon={SettingsIcon} title="Pengaturan" message="Ganti username, suara, getar, dan kecepatan awal akan tersedia di sini." />
    </div>
  )
}

export default Settings
