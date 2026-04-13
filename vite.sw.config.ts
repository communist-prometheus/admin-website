import { resolve } from 'node:path'
import process from 'node:process'
import type { OutputBundle } from 'rolldown'
import { defineConfig } from 'vite'
import { swAliases } from './vite/sw-aliases'
import { replaceSWVersion } from './vite/sw-version-replace'

/**
 * When MOCK_OAUTH is set, the SW build tree-shakes
 * isomorphic-git + buffer (~200KB) via dead code elimination.
 */
const isMockMode = !!process.env.MOCK_OAUTH

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
  resolve: { alias: swAliases(__dirname) },
  define: {
    __MOCK_MODE__: JSON.stringify(isMockMode),
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: false,
    modulePreload: false,
    rolldownOptions: {
      input: { sw: resolve(__dirname, 'src/sw/main.ts') },
      output: {
        format: 'iife',
        entryFileNames: 'sw.js',
        inlineDynamicImports: true,
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
