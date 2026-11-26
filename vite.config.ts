import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/web/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/argo-512.png'],
      manifest: {
        name: 'ARGO',
        short_name: 'ARGO',
        description: 'ARGO — многопользовательская AI-RPG с живым игровым миром',
        lang: 'ru',
        start_url: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0a0c10',
        theme_color: '#0a0c10',
        icons: [
          { src: '/icons/argo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/argo-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Game state must always come from the server: only the app shell and static assets are cached.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { host: '0.0.0.0', port: 3000, allowedHosts: true },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
})
