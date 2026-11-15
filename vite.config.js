import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import apiPlugin from './scripts/vite-plugin-api.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Menjalankan endpoint folder /api saat dev & preview (di Vercel: Vercel Functions)
    apiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,

      pwaAssets: {
        disabled: true,
      },

      manifest: {
        name: 'Ularlarilurus',
        short_name: 'Ularlarilurus',
        description: 'Game ular klasik: makan buah, jangan tabrak tembok atau badan sendiri, rebut puncak peringkat.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#173404',
        background_color: '#173404',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // GET ke API sendiri (leaderboard, skin, makanan, dst.)
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/api/'),
            method: 'GET',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    }),
  ],
})
