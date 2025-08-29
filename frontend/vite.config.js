import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Ensure JSX in .js and .ts files is transformed
      include: '**/*.{jsx,tsx,js,ts}',
      jsxRuntime: 'automatic',
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  }
})
