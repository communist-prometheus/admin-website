import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const SW_PATH = resolve('dist/client/sw.js')

// isomorphic-git's CJS build (node_modules/isomorphic-git/index.cjs) uses
// `require('crypto').createHash` which throws TypeError in a browser
// Service Worker. Vite 8 resolves the root package via exports.default,
// which currently points at the CJS build, so without the explicit alias
// in vite.sw.config.ts the SW bundle silently ships the broken path. A
// bundle containing `createHash` (or `require('crypto')`) means the
// alias regressed and SW will fail on first git operation.
const FORBIDDEN: readonly { readonly token: string; readonly why: string }[] =
  [
    {
      token: 'createHash',
      why: 'isomorphic-git CJS build — use ESM alias in vite.sw.config.ts',
    },
    {
      token: 'require("crypto")',
      why: 'node crypto — not available in Service Worker',
    },
    {
      token: "require('crypto')",
      why: 'node crypto — not available in Service Worker',
    },
  ] as const

const main = (): void => {
  const src = readFileSync(SW_PATH, 'utf8')
  const hits = FORBIDDEN.filter(({ token }) => src.includes(token))
  if (hits.length === 0) {
    console.log(`OK sw.js is browser-safe (${src.length} bytes)`)
    return
  }
  for (const { token, why } of hits) {
    console.error(`FAIL sw.js contains "${token}" — ${why}`)
  }
  process.exit(1)
}

main()
