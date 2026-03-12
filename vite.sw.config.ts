import { resolve } from 'node:path'
import type { OutputBundle } from 'rolldown'
import { defineConfig } from 'vite'
import { replaceSWVersion } from './vite/sw-version-replace'

/**
 * CJS libs (text-encoding polyfill) check `window` or `global`
 * to find the global object. Neither exists in SW context.
 * Prepend a polyfill to the bundle so `global` maps to `globalThis`.
 */
const SW_BANNER = 'if(typeof global==="undefined")self.global=self;\n'

/**
 * Inject the global polyfill banner at the start of sw.js.
 * @param bundle - Rolldown output bundle
 */
const prependBanner = (bundle: OutputBundle): void => {
  for (const chunk of Object.values(bundle)) {
    if (chunk.type === 'chunk' && chunk.fileName === 'sw.js') {
      chunk.code = SW_BANNER + chunk.code
    }
  }
}

/**
 * Separate Vite config for building the Service Worker.
 * Built independently to avoid sharing chunks with the main
 * app (browser-only code like Vue would crash in SW context).
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: false,
    rolldownOptions: {
      input: { sw: resolve(__dirname, 'src/sw/main.ts') },
      output: {
        format: 'es',
        entryFileNames: 'sw.js',
        chunkFileNames: 'assets/sw-[name]-[hash].js',
      },
    },
  },
  plugins: [
    {
      name: 'sw-build',
      generateBundle(_options, bundle) {
        prependBanner(bundle)
        replaceSWVersion(bundle)
      },
    },
  ],
})
