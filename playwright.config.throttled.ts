import { devices } from '@playwright/test'

/**
 * Throttled critical-path suite — mid-tier Android emulation
 * (Pixel 7 viewport) with Slow 3G + 4× CPU applied per-test via the
 * `applyThrottling` helper in `e2e/throttled/throttle.ts`. Kept as a
 * separate project so the slow runs do not gate every PR; opt-in via
 * `playwright test --project=throttled-critical` or schedule on CI
 * nightly.
 *
 * Per-test timeout is bumped to 90 s — a 4× CPU + Slow 3G page boot
 * can legitimately spend 20–30 s before the editor mounts.
 */
export const throttledCritical = {
  name: 'throttled-critical',
  use: { ...devices['Pixel 7'] },
  testMatch: '**/throttled/**',
  timeout: 90_000,
}
