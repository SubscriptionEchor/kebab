import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  base: '/',
  preview: {
    host: true,
    port: 5173,
    strictPort: false
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    watch: {
      usePolling: true
    },
    hmr: {
      overlay: true
    }
  },
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      },
      refresh: true
    }),
    nodePolyfills()
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      },
      refresh: true
    }
  },
  assetsInclude: ['**/*.json'],
  define: {
    'process.env': {
      REACT_APP_QR_CODE_URL: JSON.stringify('https://pledgr.app/download'),
      REACT_APP_APP_STORE_URL: JSON.stringify('https://apps.apple.com/app/pledgr/id123456789'),
      REACT_APP_PLAY_STORE_URL: JSON.stringify('https://play.google.com/store/apps/details?id=com.pledgr.app')
    }
  }
})
