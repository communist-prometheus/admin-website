import 'dotenv/config'
import { spawn } from 'node:child_process'

/**
 * Runs the redesigned admin preview against real GitHub, injecting the local
 * `GITHUB_E2E_KEY` as `VITE_DEV_TOKEN` (so the engine boots with a real token,
 * no OAuth). Mirrors `scripts/dev-token.ts` but targets the redesign Vite config.
 * The token is passed to the child process only — never printed.
 */
const token = process.env.GITHUB_E2E_KEY
if (!token) {
  console.error(
    'Set GITHUB_E2E_KEY in .env to run the redesign preview with real data.'
  )
  process.exit(1)
}

spawn(
  'bunx',
  ['vite', '--config', 'vite.redesign.config.ts', '--port', '5225'],
  {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      VITE_DEV_TOKEN: token,
      // Route the SW git layer through the local /api/cors proxy (token-proxy
      // plugin) instead of the flaky public isomorphic-git demo proxy.
      VITE_CORS_PROXY: 'http://localhost:5225/api/cors',
    },
  }
)
