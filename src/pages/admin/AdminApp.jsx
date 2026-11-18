import { Navigate, Route, Routes } from 'react-router-dom'
import OfflineIndicator from '../../components/OfflineIndicator.jsx'
import useAdminSession from '../../hooks/useAdminSession.js'
import AdminLogin from './AdminLogin.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import AdminPlayerDetail from './AdminPlayerDetail.jsx'
import './Admin.css'

/**
 * Area admin (/admin). Terpisah dari area pemain: tidak butuh username, tanpa bottom nav.
 * Belum login → form kata sandi. Sudah login → dashboard & detail akun.
 */
function AdminApp() {
  const session = useAdminSession()

  return (
    <div className="app app--admin">
      <OfflineIndicator />
      <main className="app-main">
        {session ? (
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="players/:playerId" element={<AdminPlayerDetail />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        ) : (
          <AdminLogin />
        )}
      </main>
    </div>
  )
}

export default AdminApp
