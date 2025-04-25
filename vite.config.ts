import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'import.meta.env.DEV': JSON.stringify(mode === 'development'),
      'process.env': {
        // Only expose VITE_ prefixed variables
        ...Object.keys(env).reduce((acc, key) => {
          if (key.startsWith('VITE_')) {
            acc[key] = env[key];
          }
          return acc;
        }, {}),
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@components': path.resolve(__dirname, './src/components'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      cors: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true, // Enable for debugging, set to false for production
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react',
              'react-dom',
              'react-router-dom',
              'leaflet',
              'react-leaflet',
            ],
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      target: 'es2020', // Conservative for compatibility
      minify: 'esbuild',
      cssMinify: true,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'leaflet',
        'react-leaflet',
      ],
    },
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        css: {
          additionalData: `@import "leaflet/dist/leaflet.css";`,
        },
      },
    },
  };
});