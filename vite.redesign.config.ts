import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { tokenProxyPlugin } from './vite/token-proxy'

/**
 * Build/dev config for the redesigned admin UI (served at `/redesign.html`).
 * The shared component library is vendored under `vendor/cp-components` (built
 * dist) and aliased here, so the redesign builds without a package registry or
 * workspace. Includes the `/api/*` proxy so the SW git layer can clone/push
 * through `/api/cors` locally. The production build emits into `dist/client`
 * alongside the current app so a single deploy serves both.
 */
const cp = resolve(__dirname, 'vendor/cp-components/dist')

export default defineConfig({
  plugins: [tokenProxyPlugin()],
  resolve: {
    alias: [
      {
        find: /^@communist-prometheus\/cp-components$/,
        replacement: `${cp}/index.js`,
      },
      {
        find: /^@communist-prometheus\/cp-components\/(.*)$/,
        replacement: `${cp}/$1`,
      },
      { find: /^@\/(.*)$/, replacement: `${resolve(__dirname, 'src')}/$1` },
    ],
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'redesign.html'),
      output: {
        entryFileNames: 'redesign/[name]-[hash].js',
        assetFileNames: 'redesign/[name]-[hash][extname]',
      },
    },
  },
  optimizeDeps: {
    entries: ['redesign.html'],
    include: ['lit', 'lit/decorators.js', 'lit/directives/unsafe-svg.js'],
  },
  server: { port: 5200 },
})
