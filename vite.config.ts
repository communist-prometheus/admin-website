import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { buildConfig } from './vite/build'
import { createPlugins } from './vite/plugins'

export default defineConfig({
  plugins: createPlugins(),
  define: {
    __MOCK_MODE__: JSON.stringify(false),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: buildConfig,
})
