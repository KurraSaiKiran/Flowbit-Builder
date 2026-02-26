import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), // Tailwind v4 via Vite plugin
    react(),
  ],
  resolve: {
    alias: {
      // Maps @/ → src/ for shadcn-style imports like @/components/ui/button
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
