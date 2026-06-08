import process from 'node:process'
import { devices } from '@playwright/test'
import {
  LIGHTHOUSE_TEST_PATTERN,
  MOBILE_TEST_PATTERN,
  THROTTLED_TEST_PATTERN,
  WALKTHROUGH_TEST_PATTERN,
} from './playwright.config.constants'
import { lighthouseProjects } from './playwright.config.lighthouse'
import { throttledCritical } from './playwright.config.throttled'

const allBrowsers = process.env.BROWSERS === 'all'

const desktopIgnore = [
  LIGHTHOUSE_TEST_PATTERN,
  MOBILE_TEST_PATTERN,
  THROTTLED_TEST_PATTERN,
  WALKTHROUGH_TEST_PATTERN,
]

/**
 * Build a desktop browser project config.
 * @param name - Browser name
 * @param device - Device descriptor key
 * @returns Playwright project config
 */
const browser = (name: string, device: string) => ({
  name,
  use: { ...devices[device] },
  testIgnore: desktopIgnore,
})

/** Desktop browser projects: Chromium-only locally, all on CI */
const browserProjects = [
  browser('chromium', 'Desktop Chrome'),
  ...(allBrowsers
    ? [
        browser('firefox', 'Desktop Firefox'),
        browser('webkit', 'Desktop Safari'),
      ]
    : []),
]

/** Mobile Chromium runs all tests except lighthouse and mobile-specific */
const mobileGeneral = {
  name: 'mobile-chromium',
  use: { ...devices['iPhone 12 Pro'] },
  testIgnore: desktopIgnore,
}

/** Mobile-specific tests only (e2e/mobile/) */
const mobileSpecific = {
  name: 'mobile-specific',
  use: { ...devices['iPhone 12 Pro'] },
  testMatch: '**/mobile/**',
}

export const projects = [
  ...browserProjects,
  mobileGeneral,
  mobileSpecific,
  throttledCritical,
  ...lighthouseProjects,
]
