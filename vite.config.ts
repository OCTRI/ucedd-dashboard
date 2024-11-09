import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/ucedd-dashboard/',
  build: {
    outDir: 'ucedd-dashboard'
  },
  plugins: [vue()],
  preview: {
    port: 8000,
  },
  server: {
    port: 8000
  }
})
