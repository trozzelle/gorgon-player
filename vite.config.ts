import { defineConfig } from 'vite'
/// <reference types="vitest" />

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'GorgonPlayer',
      fileName: (format) => `gorgon-player.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // external: ['lit'],
      output: {
        globals: {
          lit: 'Lit',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
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
