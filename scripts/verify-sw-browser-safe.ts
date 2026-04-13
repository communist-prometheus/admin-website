import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const SW_PATH = resolve('dist/client/sw.js')

/**
 * Post-build guard against the isomorphic-git CJS regression.
 *
 * Vite 8 resolves `isomorphic-git` to its CJS entry unless aliased,
 * and that file calls `require('crypto').createHash` which does not
 * exist in a Service Worker. The first git operation throws a
 * TypeError, the SW flips to state='error', every `/api/github/*`
 * request returns 503 "SW not ready", and the admin UI silently
 * gives up. This script greps the compiled `dist/client/sw.js` for
 * those exact tokens and fails the build if any appears.
 *
 * The mock-vs-prod build distinction is NOT checked here — after
 * minification both builds contain the same markers; they differ
 * only in how `__MOCK_MODE__` evaluates at runtime. That regression
 * is guarded structurally by deploy.yml rebuilding the production
 * bundle after playwright runs, and by the e2e-integration workflow
 * that drives a real commit flow through a real browser.
 */

const FORBIDDEN = [
  {
    token: 'createHash',
    why: 'isomorphic-git CJS build — check vite/sw-aliases.ts',
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
  // `build:e2e` produces an intentional mock bundle to run playwright
  // against. Skip the guard in that path — deploy.yml rebuilds after
  // e2e and that rebuild is the one we actually verify.
  if (process.env.MOCK_OAUTH === 'true') {
    console.log('SKIP sw.js verify (MOCK_OAUTH set — mock build)')
    return
  }

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
