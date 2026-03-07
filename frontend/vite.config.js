import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/PuppFit/',
  server: {
    proxy: {
      // 将 /api 请求代理到真实后端
      '/api': {
        target: 'http://122.51.12.83:8000',
        changeOrigin: true,
      }
    }
  }
})
