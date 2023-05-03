import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import inject from "@rollup/plugin-inject";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/plaiscript/",
  plugins: [
    react(),
  ],
  define: { global: 'window' },
})
