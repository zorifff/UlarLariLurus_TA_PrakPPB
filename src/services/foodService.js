import api from '../config/api.js'
import { FALLBACK_FOODS } from '../game/constants.js'

let cachedFoods = null

/** GET /foods */
export const getFoods = () => api.get('/foods')

/**
 * Daftar makanan untuk game & panduan: cache di memori selama sesi,
 * fallback ke konstanta lokal kalau API (dan cache service worker) tidak tersedia.
 */
export async function getGameFoods() {
  if (cachedFoods) return cachedFoods
  try {
    const foods = await getFoods()
    if (Array.isArray(foods) && foods.some((f) => !f.is_bonus)) {
      cachedFoods = foods
      return foods
    }
  } catch {
    // pakai fallback
  }
  return FALLBACK_FOODS
}
