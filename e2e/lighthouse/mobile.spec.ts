import { test } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'

test('should achieve 100 score on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await playAudit({
    page,
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
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
        },
      },
    },
  })
})
