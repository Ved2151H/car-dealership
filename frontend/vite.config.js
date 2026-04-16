import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // Listen on 0.0.0.0 — allows access from other devices on the network
    port: 5173,
    proxy: {
      // All /api/* requests are forwarded to the Express backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Uploaded images are served from the Express static folder
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
