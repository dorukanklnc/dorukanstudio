import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Set BASE_PATH when deploying under a sub-path, e.g. BASE_PATH=/portfolio/ npm run build
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  // The three.js engine is its own lazy chunk (~185 KB gzip), loaded only on /experience-lab.
  build: { chunkSizeWarningLimit: 800 },
})
