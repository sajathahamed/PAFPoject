<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

=======
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
>>>>>>> bd701d76c6f9bee465cf19d54b5d81dd77e597aa
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
<<<<<<< HEAD
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
=======
      // Proxy API requests to backend during development
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // Proxy OAuth2 endpoints
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/login/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
>>>>>>> bd701d76c6f9bee465cf19d54b5d81dd77e597aa
