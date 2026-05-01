import { test } from '@prometheus/e2e-toolkit'
import { playAudit } from 'playwright-lighthouse'

test('should achieve 100 on desktop with auth', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('gh_token', 'mock-token'))
  await page.reload()
  await page.waitForLoadState('networkidle')

  await playAudit({
    page,
    port: 9224,
    thresholds: {
      performance: 100,
      accessibility: 100,
      'best-practices': 100,
      seo: 100,
    },
    config: {
      extends: 'lighthouse:default',
      settings: {
        formFactor: 'desktop',
        screenEmulation: { disabled: true },
        throttling: {
          cpuSlowdownMultiplier: 1,
          rttMs: 40,
          throughputKbps: 10240,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
      },
    },
  })
})
