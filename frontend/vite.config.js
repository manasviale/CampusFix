import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'https://campus-fix-pied-sigma.vercel.app',
      '/uploads': 'https://campus-fix-pied-sigma.vercel.app'
    }
  }
});
