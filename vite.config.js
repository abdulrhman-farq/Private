import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the PWA works from any sub-path (e.g. GitHub Pages / static host).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
