import 'dotenv/config'
import { execSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { buildConfig } from './vite/build'
import { createPlugins } from './vite/plugins'
import { tokenProxyPlugin } from './vite/token-proxy'

const gitHash = execSync('git rev-parse --short HEAD').toString().trim()

export default defineConfig({
  plugins: [...createPlugins(), tokenProxyPlugin()],
  define: {
    __MOCK_MODE__: JSON.stringify(false),
    __COMMIT_HASH__: JSON.stringify(gitHash),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: buildConfig,
})
