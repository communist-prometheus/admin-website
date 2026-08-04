import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Test contour for the redesigned admin UI (`src/redesign`). The main
 * `vitest.config.ts` excludes `src/redesign/**` because those modules import the
 * vendored `@communist-prometheus/cp-components` build and register Lit custom
 * elements, which the app's jsdom setup does not alias. This config mirrors the
 * `vite.redesign.config.ts` aliases and runs the redesign specs under happy-dom
 * (a DOM that Lit's `LitElement` boots cleanly in), so component behaviour and
 * pure engine helpers are covered end-to-end.
 */
const cp = resolve(__dirname, 'vendor/cp-components/dist')

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@communist-prometheus\/cp-components$/, replacement: `${cp}/index.js` },
      { find: /^@communist-prometheus\/cp-components\/(.*)$/, replacement: `${cp}/$1` },
      { find: /^@\/(.*)$/, replacement: `${resolve(__dirname, 'src')}/$1` },
    ],
  },
  test: {
    environment: 'jsdom',
    include: ['src/redesign/**/*.test.ts'],
    setupFiles: ['src/redesign/test-setup.ts'],
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
