import { test } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'

const MOBILE_VIEWPORT = { width: 390, height: 844 }

const LIGHTHOUSE_CONFIG = {
  thresholds: {
    performance: 90,
    accessibility: 100,
    'best-practices': 100,
    seo: 100,
  },
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

  await playAudit({
    page,
    port: 9223,
    ...LIGHTHOUSE_CONFIG,
  })
})
