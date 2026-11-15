import api from '../config/api.js'

/** GET /leaderboard — terurut dari skor tertinggi (sudah diurutkan oleh view database) */
export const getLeaderboard = (limit = 50) => api.get('/leaderboard', { params: { limit } })
