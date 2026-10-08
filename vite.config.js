import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // La demo se publica en https://<usuario>.github.io/FarmaIA/
  base: mode === 'demo' ? '/FarmaIA/' : '/',
}))
