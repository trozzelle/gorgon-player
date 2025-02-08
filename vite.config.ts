import { defineConfig } from 'vite'
/// <reference types="vitest" />

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'GorgonPlayer',
      fileName: 'gorgon-player',
      formats: ['es'],
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
})
