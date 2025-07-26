import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy requests to /.netlify/functions to the Netlify Dev server
      '/.netlify/functions': {
        target: 'http://localhost:8888', // Default port for Netlify Dev
        changeOrigin: true,
      },
    },
  },
});