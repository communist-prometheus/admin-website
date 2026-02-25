import { test } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'

const MOBILE_VIEWPORT = { width: 390, height: 844 }

const LIGHTHOUSE_CONFIG = {
  thresholds: {
    performance: 100,
    accessibility: 100,
    'best-practices': 100,
    seo: 100,
  },
  port: 9222,
  config: {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'mobile' as const,
      screenEmulation: {
        mobile: true,
        width: 390,
        height: 844,
        deviceScaleFactor: 3,
      },
    },
  },
}

test('should achieve 100 score on mobile', async ({ page }) => {
  await page.setViewportSize(MOBILE_VIEWPORT)
  await page.goto('/')
  await playAudit({ page, ...LIGHTHOUSE_CONFIG })
})
