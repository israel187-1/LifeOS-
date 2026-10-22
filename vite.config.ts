import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the build works from any folder or static host (GitHub Pages, Netlify, a zip).
export default defineConfig({
  base: './',
  plugins: [react()],
  worker: { format: 'es' },
})
