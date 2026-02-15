import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Keep base relative for GitHub Pages
  build: {
    outDir: 'dist', // Revert to default
  }
})
