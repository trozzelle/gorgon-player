import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'GorgonPlayer',
            fileName: 'gorgon-player',
            formats: ['es']
        }
    },
    server: {
        watch: {
            usePolling: true
        }
    }
})