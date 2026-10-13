import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // During development every /api call is forwarded to the Spring Boot backend.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
