import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  server: { port: 3100, open: true },
  build: { outDir: 'dist' },
});
