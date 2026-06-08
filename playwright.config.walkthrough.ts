import process from 'node:process'
import { defineConfig } from '@playwright/test'

process.env.MOCK_OAUTH = 'true'

/**
 * Dedicated config for the comms walkthrough recording. Single
 * Chromium project, full-HD viewport, video forced on.
 */
export default defineConfig({
  testDir: './e2e/comms-walkthrough',
  timeout: 5 * 60 * 1000,
  expect: { timeout: 10_000 },
  retries: 0,
  workers: 1,
  reporter: [['list']],
  outputDir: 'test-results/walkthrough',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    locale: 'ru-RU',
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080 },
    },
    launchOptions: { slowMo: 350 },
    actionTimeout: 10_000,
  },
  projects: [{ name: 'walkthrough' }],
  webServer: {
    command:
      'bun scripts/kill-port.ts 5173 && bun run build:e2e && bun run preview:test',
    env: { VITE_MOCK_AUTH: 'true' },
    port: 5173,
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
