import process from 'node:process'
import { defineConfig } from '@playwright/test'

import 'dotenv/config'

/**
 * Prod-only Playwright config.
 *
 * Runs the opt-in `e2e-prod/*.pw.ts` suite that commits to the real
 * content repository. Invoke with:
 *
 *   GITHUB_E2E_KEY=<pat> bun run test:e2e:prod
 *
 * Keeps the default `bun run test:e2e` suite free of env-gated
 * skipped tests.
 */
export default defineConfig({
  testDir: './e2e-prod',
  testMatch: '**/*.pw.ts',
  timeout: 300_000,
  expect: { timeout: 10_000 },
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    headless: true,
    actionTimeout: 0,
    trace: 'retain-on-failure',
    baseURL: process.env.PROBE_BASE_URL ?? 'http://127.0.0.1:5173',
  },
  projects: [{ name: 'prod-chromium', use: { browserName: 'chromium' } }],
})
