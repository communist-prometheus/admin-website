import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { buildConfig } from './vite/build'
import { createPlugins } from './vite/plugins'

export default defineConfig({
  plugins: createPlugins(),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: buildConfig,
})
