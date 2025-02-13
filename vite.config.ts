import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '/ucedd-dashboard/',
  build: {
    outDir: 'ucedd-dashboard',
    rollupOptions: {
      input: 'index.html'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: [
          'color-functions',
          'global-builtin',
          'import',
          'mixed-decls'
        ]
      }
    }
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  preview: {
    port: 8000
  },
  server: {
    port: 8000
  }
});
