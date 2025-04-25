import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.DEV': JSON.stringify(mode === 'development'),
      // Expose env variables
      'process.env': env
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      host: true, // Listen on all addresses
      cors: true,
      proxy: {
        // Add your API proxies here if needed
        // '/api': {
        //   target: 'your-api-url',
        //   changeOrigin: true,
        //   secure: false,
        // }
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: command === 'serve',
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
            // Add more chunks as needed
          },
          // Ensure clean chunk names
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      // Optimize build
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      cssCodeSplit: true,
      assetsInlineLimit: 4096, // 4kb
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
      // Add preprocessor options if needed
      // preprocessorOptions: {
      //   scss: {
      //     additionalData: `@import "@/styles/variables.scss";`
      //   }
      // }
    }
  }
})