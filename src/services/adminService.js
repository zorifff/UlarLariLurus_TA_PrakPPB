import api from '../config/api.js'
import { clearAdminSession, getAdminSession, setAdminSession } from './storage.js'

// Semua endpoint admin butuh header Authorization: Bearer <token>.
const withAuth = () => ({ headers: { Authorization: `Bearer ${getAdminSession()?.token ?? ''}` } })

/** Sesi habis / token tidak valid (401) → keluar otomatis, halaman login muncul lagi. */
function guard(request) {
  return request.catch((err) => {
    if (err.status === 401) clearAdminSession()
    throw err
  })
}

/** POST /admin — login dengan kata sandi admin, simpan token di sessionStorage. */
export async function adminLogin(password) {
  const session = await api.post('/admin', { password })
  setAdminSession(session)
  return session
}

export const adminLogout = () => clearAdminSession()

/** GET /admin — { summary, players, skins, generated_at } */
export const getAdminOverview = () => guard(api.get('/admin', withAuth()))

/** GET /admin/players/:id — { player, stats, foods, matches } */
export const getAdminPlayer = (id) => guard(api.get(`/admin/players/${id}`, withAuth()))

/** DELETE /admin/players/:id — hapus akun + semua progresnya. { deleted, id, username, deleted_matches } */
export const deleteAdminPlayer = (id) => guard(api.delete(`/admin/players/${id}`, withAuth()))
