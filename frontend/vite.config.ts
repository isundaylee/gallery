import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// During development the React dev server proxies API and image-data
// requests to the Django backend (default http://localhost:8000), so the
// browser sees a single same-origin app and no CORS config is needed.
const DJANGO = process.env.DJANGO_URL ?? 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': DJANGO,
    },
  },
})
