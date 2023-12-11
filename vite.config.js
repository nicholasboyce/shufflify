// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        playlists: resolve(__dirname, 'playlists/index.html'),
      },
    },
    target: 'esnext'
  },
})