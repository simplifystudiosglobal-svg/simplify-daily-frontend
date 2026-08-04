import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// In local dev, proxy API calls to the backend repo running separately (default
// http://localhost:3001) so the frontend can use relative /api paths without needing
// VITE_API_BASE_URL set. In production, set VITE_API_BASE_URL to the deployed backend's
// URL instead — see src/lib/api.ts.
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': process.env.VITE_BACKEND_DEV_URL || 'http://localhost:3001',
        '/rss.xml': process.env.VITE_BACKEND_DEV_URL || 'http://localhost:3001',
      },
    },
  };
});
