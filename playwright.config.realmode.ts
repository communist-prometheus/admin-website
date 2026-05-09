import process from 'node:process'
import { defineConfig } from '@playwright/test'

import 'dotenv/config'

/**
 * Real-mode Playwright config.
 *
 * Boots the production build of admin-website (no MOCK_OAUTH, no
 * VITE_MOCK_AUTH) and runs every spec under `e2e-realmode/` against a
 * real GitHub sandbox repo (`SANDBOX_REPO`, default
 * `communist-prometheus/admin-e2e-sandbox`). The Service Worker
 * actually clones, stages, and pushes — so a save regression here is
 * the same defect a user would see in production.
 *
 * Required environment:
 *   GITHUB_E2E_KEY  PAT with `repo` scope on the sandbox owner
 *
 * Recommended local invocation:
 *   bun run sandbox:setup            # one-time bootstrap
 *   bun run sandbox:reset            # before each suite run
 *   bun run test:e2e:realmode
 *
 * The webServer command rebuilds with sandbox repo coordinates baked in
 * and serves via vite preview (which now mounts the Hono /api/* app
 * thanks to tokenProxyPlugin's preview hook).
 */

const PAT = process.env['GITHUB_E2E_KEY']
if (!PAT) {
  throw new Error(
    'GITHUB_E2E_KEY missing. Real-mode E2E needs a PAT with repo scope.'
  )
}

const SANDBOX_OWNER = process.env['SANDBOX_OWNER'] ?? 'communist-prometheus'
const SANDBOX_REPO = process.env['SANDBOX_REPO'] ?? 'admin-e2e-sandbox'
const SANDBOX_BRANCH = process.env['SANDBOX_BRANCH'] ?? 'main'

export default defineConfig({
  testDir: './e2e-realmode',
  globalSetup: './e2e-realmode/global-setup.ts',
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/fixtures/**'],
  /* SW init + clone takes a while on first run; tests are not flaky,
   * they just do real network work. */
  timeout: 300_000,
  expect: { timeout: 15_000 },
  retries: 0,
  /* Real GH push must serialize — concurrent commits to `main` race
   * each other through the SW push queue. */
  workers: 1,
  reporter: process.env['CI'] ? 'list' : 'html',
  use: {
    baseURL: process.env['REALMODE_BASE_URL'] ?? 'http://localhost:5173',
    headless: true,
    actionTimeout: 0,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'realmode-chromium', use: { browserName: 'chromium' } }],
  webServer: process.env['REALMODE_BASE_URL']
    ? undefined
    : {
        command:
          'bun scripts/kill-port.ts 5173 && bun run build:realmode && bun run preview:test',
        env: {
          VITE_GITHUB_OWNER: SANDBOX_OWNER,
          VITE_GITHUB_REPO: SANDBOX_REPO,
          VITE_GITHUB_BRANCH: SANDBOX_BRANCH,
          VITE_MOCK_AUTH: 'false',
        },
        port: 5173,
        reuseExistingServer: !process.env['CI'],
        timeout: 300_000,
      },
})
