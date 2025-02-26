import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// 加載 .env 文件
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // 將環境變數注入到前端代碼中
    'process.env.FINNHUB_API_KEY': JSON.stringify(process.env.VITE_FINNHUB_API_KEY),
    global: {},
  },
});