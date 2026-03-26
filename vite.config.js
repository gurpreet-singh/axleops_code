import { defineConfig } from 'vite';

export default defineConfig({
  // The project root is the directory containing index.html
  root: '.',

  // Public directory for static assets that should be served as-is
  // The page HTML fragments live here so fetch() works in both dev and build
  publicDir: 'public',

  build: {
    // Output directory for production build
    outDir: 'dist',
    // Clean the output directory before building
    emptyOutDir: true,
  },

  server: {
    // Dev server port
    port: 5173,
    // Open browser on start
    open: true,
  },
});
