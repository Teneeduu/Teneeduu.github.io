import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 用相对路径，放到任意子目录(如 /game/)都能正常加载资源
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
