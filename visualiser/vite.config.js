import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/algo-ds-library/',   // ← add this line (must match your repo name exactly)
})