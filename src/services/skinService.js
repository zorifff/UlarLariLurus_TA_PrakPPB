import api from '../config/api.js'
import { findFallbackSkin } from '../game/constants.js'

/** GET /skins */
export const getSkins = () => api.get('/skins')

/** GET /skins/:id */
export const getSkin = (id) => api.get(`/skins/${id}`)

/** Skin untuk game: dari API, kalau gagal pakai data lokal supaya tetap bisa main offline. */
export async function getGameSkin(id) {
  try {
    return await getSkin(id ?? 1)
  } catch {
    return findFallbackSkin(id)
  }
}
