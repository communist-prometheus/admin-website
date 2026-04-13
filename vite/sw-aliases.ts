import { resolve } from 'node:path'

/**
 * Build the Vite resolve.alias list for the Service Worker bundle.
 *
 * The `isomorphic-git` override is critical: its package.json exports
 * only `{ default: './index.cjs' }`, which Vite 8 resolves regardless
 * of browser/import conditions. That CJS build calls
 * `require('crypto').createHash`, unavailable in a Service Worker, so
 * every git operation throws `TypeError: createHash is not a function`.
 * An exact-match regex alias redirects the bare `isomorphic-git`
 * specifier at the ESM entry, which is browser-safe.
 * @param rootDir - Absolute path to the repo root (import.meta __dirname)
 * @returns Vite alias entries
 */
export const swAliases = (rootDir: string) => [
  { find: '@', replacement: resolve(rootDir, 'src') },
  {
    find: /^isomorphic-git$/,
    replacement: resolve(rootDir, 'node_modules/isomorphic-git/index.js'),
  },
]
