import { test } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'

test('should achieve 100 score on desktop', async ({ page }) => {
  await page.goto('/')

  await playAudit({
    page,
    port: 9222,
    thresholds: {
      performance: 97,
      accessibility: 100,
      'best-practices': 100,
      seo: 100,
    },
  })
})
