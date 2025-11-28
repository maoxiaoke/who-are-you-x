import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build the content script and copy public/ (manifest.json) to dist/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        content: 'src/content-script/main.tsx'
      },
      output: {
        entryFileNames: assetInfo => {
          if (assetInfo.name === 'content') return 'content-script.js';
          return '[name].js';
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (name.endsWith('.css')) return 'content-style.css';
          return '[name][extname]';
        }
      }
    }
  },
  publicDir: 'public'
});
