import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // Expose both the Vite (`VITE_`) and the Next.js (`NEXT_PUBLIC_`) Supabase
    // variable names to the browser bundle so either .env.local style works.
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Multi-Page Application (MPA) build.
      //
      // Four independent entry documents are compiled:
      //   1. index.html          - the root sign-in window / dashboard (src/Main.tsx)
      //   2. app1/index.html     - GPF Refundable advance withdrawal
      //   3. app2/index.html     - GPF Non-Refundable advance withdrawal
      //   4. app3/index.html     - GPF Final withdrawal & No-Demand
      //
      // Each sub-app reads the selected Upazila from localStorage, published by
      // the root dashboard via `src/lib/upazilaSession.ts`.
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          app1: path.resolve(__dirname, 'app1/index.html'),
          app2: path.resolve(__dirname, 'app2/index.html'),
          app3: path.resolve(__dirname, 'app3/index.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
