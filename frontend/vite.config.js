import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic' // This allows JSX without React import
  })],
  server: {
    port: 3000
  },
  define: {
    global: 'globalThis',
  }
})