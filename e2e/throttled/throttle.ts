import type { Page } from '@playwright/test'

/**
 * Network conditions roughly matching Lighthouse "Slow 3G" — what the
 * admin would feel on a cellular tether in a basement or an underseat
 * Wi-Fi on a long-haul flight. 50 kBps each way, 400 ms latency.
 */
const SLOW_3G = {
  offline: false,
  downloadThroughput: (400 * 1024) / 8,
  uploadThroughput: (400 * 1024) / 8,
  latency: 400,
} as const

/**
 * CPU slowdown factor. 4× mirrors Lighthouse's mid-tier mobile profile:
 * a 4-year-old Android phone on a bad day. Stronger than what most
 * dev machines feel and stronger than CI runners, which is the
 * point — the budget must survive there too.
 */
const CPU_SLOWDOWN = 4 as const

/**
 * Apply Slow 3G network + 4× CPU throttling to a Playwright page via
 * Chrome DevTools Protocol. Idempotent per page (CDP sessions are
 * cheap; later calls overwrite earlier conditions).
 *
 * Use in a `test.beforeEach` so the throttling is active for the
 * page navigation itself, not just the post-load interactions —
 * users on bad networks experience the boot, not just the click.
 *
 * @param page - The Playwright page to throttle.
 */
export const applyThrottling = async (page: Page): Promise<void> => {
  const client = await page.context().newCDPSession(page)
  await client.send('Network.enable')
  await client.send('Network.emulateNetworkConditions', SLOW_3G)
  await client.send('Emulation.setCPUThrottlingRate', { rate: CPU_SLOWDOWN })
}
