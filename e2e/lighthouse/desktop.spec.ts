import { test } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'

test('should achieve 100 score on desktop', async ({ page }) => {
  await page.goto('/')

  await playAudit({
    page,
    port: 9222,
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
