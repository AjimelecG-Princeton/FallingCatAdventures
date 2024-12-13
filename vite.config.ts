import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/FallingCatAdventures/',
  
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': '/src'
    }
  },

  server: {
    port: 3000,
    host: true,
    open: true
  },

  build: {
    sourcemap: true,
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  }
});