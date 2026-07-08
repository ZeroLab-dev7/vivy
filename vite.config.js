import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'frontend'),
  base: '/',
  build: {
    outDir: resolve(__dirname, 'server/public'),
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html'),
        selector: resolve(__dirname, 'frontend/selector.html'),
        dashboard: resolve(__dirname, 'frontend/dashboard.html'),
        developer: resolve(__dirname, 'frontend/developer.html')
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
});
