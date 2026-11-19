import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createFamilySyncBackendPlugin } from './server/familyApiMiddleware';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), createFamilySyncBackendPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react'],
          three: ['three'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    open: false,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
