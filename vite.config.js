import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/dartstatic_brela/',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        404: './public/404.html'
      }
    }
  }
})
