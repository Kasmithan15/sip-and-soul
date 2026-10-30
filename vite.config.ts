import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative asset paths, so the built site works from any folder or hosting address.
  base: './',
  // Own port so it never clashes with other local Vite projects on the default 5173.
  server: { host: '127.0.0.1', port: 5180, strictPort: true },
})
