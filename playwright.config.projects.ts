import { devices } from '@playwright/test'
import { LIGHTHOUSE_TEST_PATTERN } from './playwright.config.constants'

export const projects = [
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
    },
    testIgnore: [LIGHTHOUSE_TEST_PATTERN],
  },
  {
    name: 'firefox',
    use: {
      ...devices['Desktop Firefox'],
    },
    testIgnore: [LIGHTHOUSE_TEST_PATTERN],
  },
  {
    name: 'webkit',
    use: {
      ...devices['Desktop Safari'],
    },
    testIgnore: [LIGHTHOUSE_TEST_PATTERN],
  },
  {
    name: 'lighthouse',
    testMatch: [LIGHTHOUSE_TEST_PATTERN],
    use: {
      ...devices['Desktop Chrome'],
      launchOptions: {
        args: ['--remote-debugging-port=9222'],
      },
    },
  },
]
