import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Proxy untuk mengatasi CORS
        proxy: {
          '/api/netshort': {
            target: 'https://netshort.sansekai.my.id',
            changeOrigin: true,
            secure: false, // Ignore SSL certificate issues
            rewrite: (path) => path, // keep path as-is
            configure: (proxy) => {
              proxy.on('error', (err) => {
                console.log('Proxy error:', err.message);
              });
              proxy.on('proxyReq', (proxyReq, req) => {
                console.log('Proxying:', req.url);
              });
            }
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
