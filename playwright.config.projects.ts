import process from 'node:process'
import { devices } from '@playwright/test'
import { LIGHTHOUSE_TEST_PATTERN } from './playwright.config.constants'
import { lighthouseProjects } from './playwright.config.lighthouse'

const allBrowsers = process.env.BROWSERS === 'all'

const ignore = [LIGHTHOUSE_TEST_PATTERN]

/**
 * Build a browser project config.
 * @param name - Browser name
 * @param device - Device descriptor key
 * @returns Playwright project config
 */
const browser = (name: string, device: string) => ({
  name,
  use: { ...devices[device] },
  testIgnore: ignore,
})

/** Browser projects: Chromium-only locally, all on CI */
const browserProjects = [
  browser('chromium', 'Desktop Chrome'),
  ...(allBrowsers
    ? [
        browser('firefox', 'Desktop Firefox'),
        browser('webkit', 'Desktop Safari'),
      ]
    : []),
]

export const projects = [...browserProjects, ...lighthouseProjects]
