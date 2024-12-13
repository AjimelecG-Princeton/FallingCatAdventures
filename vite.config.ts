import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Use environment variable for base URL if available, fallback to repository name
  base: process.env.VITE_BASE_URL || '/FallingCatAdventures/',
  
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
    // Ensure proper handling of assets
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      }
    }
  }
});