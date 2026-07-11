import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = process.env.BACKEND_PROXY_TARGET || process.env.VITE_BACKEND_PROXY_TARGET || 'http://127.0.0.1:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.FRONTEND_PORT || 5173),
    strictPort: false,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false
      }
    }
  }
});
