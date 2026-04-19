import process from 'node:process'
import { defineConfig } from '@playwright/test'
import { projects } from './playwright.config.projects'

import 'dotenv/config'

process.env.MOCK_OAUTH = 'true'

const STORAGE_STATE = 'e2e/.auth/state.json'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/auth/setup.ts',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Run tests headless by default */
    headless: true,

    /* Pre-authenticated state from global setup */
    storageState: STORAGE_STATE,
  },

  /* Configure projects for major browsers */
  projects,

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: {
    /**
     * Kill stale server, then build and start fresh.
     * Prevents reuseExistingServer from using a stale instance.
     */
    command:
      'bun scripts/kill-port.ts 5173 && bun run build:e2e && bun run preview:test',
    env: { VITE_MOCK_AUTH: 'true' },
    port: 5173,
    reuseExistingServer: true,
  },
})
