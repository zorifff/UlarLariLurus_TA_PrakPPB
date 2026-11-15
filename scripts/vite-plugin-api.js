// Plugin Vite: menjalankan endpoint di folder /api saat `npm run dev` dan `npm run preview`,
// meniru Vercel Functions (routing berbasis file, handler Web standard `export const GET = ...`).
// Di Vercel plugin ini tidak dipakai: Vercel menjalankan folder /api sendiri.
import { readdirSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'

const API_PREFIX = '/api'

/** Daftar route dari isi folder api/ (abaikan file/folder berawalan "_" atau "."). */
function collectRoutes(apiDir) {
  const routes = []
  if (!existsSync(apiDir)) return routes

  const walk = (dir, segments) => {
    for (const name of readdirSync(dir)) {
      if (name.startsWith('_') || name.startsWith('.')) continue
      const full = path.join(dir, name)
      if (statSync(full).isDirectory()) {
        walk(full, [...segments, name])
      } else if (/\.m?js$/.test(name)) {
        const base = name.replace(/\.m?js$/, '')
        routes.push({ file: full, segments: base === 'index' ? segments : [...segments, base] })
      }
    }
  }
  walk(apiDir, [])

  // Route statis didahulukan daripada route dinamis ([id])
  const dynamicCount = (r) => r.segments.filter((s) => s.startsWith('[')).length
  return routes.sort((a, b) => dynamicCount(a) - dynamicCount(b))
}

function matches(route, parts) {
  return (
    route.segments.length === parts.length &&
    route.segments.every((seg, i) => (seg.startsWith('[') && seg.endsWith(']')) || seg === parts[i])
  )
}

function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(data))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return chunks.length ? Buffer.concat(chunks) : undefined
}

function createMiddleware({ root, loadModule, logger }) {
  const apiDir = path.join(root, 'api')

  return async (req, res, next) => {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)
    if (url.pathname !== API_PREFIX && !url.pathname.startsWith(`${API_PREFIX}/`)) return next()

    try {
      const parts = url.pathname.slice(API_PREFIX.length).split('/').filter(Boolean)
      const route = collectRoutes(apiDir).find((r) => matches(r, parts))
      if (!route) {
        return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Endpoint tidak ditemukan.' } })
      }

      const mod = await loadModule(route.file)
      const handler = mod[req.method] ?? (req.method === 'HEAD' ? mod.GET : undefined)
      if (typeof handler !== 'function') {
        return sendJson(res, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} tidak didukung.` } })
      }

      const headers = new Headers()
      for (const [key, value] of Object.entries(req.headers)) {
        if (key.startsWith(':') || value === undefined) continue
        headers.set(key, Array.isArray(value) ? value.join(', ') : value)
      }
      const hasBody = !['GET', 'HEAD'].includes(req.method)
      const request = new Request(url, {
        method: req.method,
        headers,
        body: hasBody ? await readBody(req) : undefined,
      })

      const response = await handler(request)
      res.statusCode = response.status
      response.headers.forEach((value, key) => res.setHeader(key, value))
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch (err) {
      logger.error(`[api] ${req.method} ${url.pathname} gagal: ${err?.stack ?? err}`)
      sendJson(res, 500, { error: { code: 'SERVER_ERROR', message: 'Terjadi kesalahan di server.' } })
    }
  }
}

export default function apiPlugin() {
  return {
    name: 'ularlarilurus-api',

    // Muat variabel non-VITE_ (mis. DATABASE_URL) dari .env ke process.env khusus server.
    // Variabel tanpa awalan VITE_ tidak pernah masuk ke bundle browser.
    configResolved(config) {
      const env = loadEnv(config.mode, config.envDir || config.root, '')
      for (const [key, value] of Object.entries(env)) {
        if (!key.startsWith('VITE_') && process.env[key] === undefined) process.env[key] = value
      }
    },

    configureServer(server) {
      server.middlewares.use(
        createMiddleware({
          root: server.config.root,
          loadModule: (file) => server.ssrLoadModule(file),
          logger: server.config.logger,
        }),
      )
    },

    configurePreviewServer(server) {
      server.middlewares.use(
        createMiddleware({
          root: server.config.root,
          loadModule: (file) => import(pathToFileURL(file).href),
          logger: server.config.logger,
        }),
      )
    },
  }
}
