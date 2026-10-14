import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Class, race, feat and background data is read straight from a Tabletop Forge
// checkout at build time. It is never copied into this repo. Point TTF_SRC at
// its frontend/src folder if it is not next to this project.
const TTF_SRC = process.env.TTF_SRC || path.resolve(__dirname, '../../dnd-vtt/frontend/src');

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: { alias: { '@ttf': TTF_SRC } },
  server: { fs: { allow: [TTF_SRC, path.resolve(__dirname, '..')] } },
  build: { outDir: '../sheet-dist', emptyOutDir: true, chunkSizeWarningLimit: 4000 },
});
