// Koneksi ke Neon Postgres lewat driver HTTP serverless.
// DATABASE_URL hanya ada di server (Vercel env / .env lokal), tidak pernah dikirim ke browser.
import { neon } from '@neondatabase/serverless'
import { HttpError } from './http.js'

let sql

/**
 * Tagged template SQL yang aman dari SQL injection:
 *   const rows = await getSql()`select * from skins where id = ${id}`
 * Untuk beberapa query sekaligus dalam satu transaksi: getSql().transaction([...])
 */
export function getSql() {
  if (!sql) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new HttpError(500, 'DB_NOT_CONFIGURED', 'DATABASE_URL belum diisi di environment server.')
    }
    sql = neon(url)
  }
  return sql
}
