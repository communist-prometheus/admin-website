import { expect, test } from '@prometheus/e2e-toolkit'
import { waitForSWControl } from '../helpers/visit-settled'

/*
 * Home ('/') runs the 5s deploy-status poll, so the request graph
 * here never reliably goes idle. The toolkit's action/assert helpers
 * (visit/pressKey/click/expectVisible) all gate on that idle window
 * and chain up under CI contention into a 30s timeout — a different
 * spec each run. The overlay is pure client state (a global keydown
 * toggles a reactive flag, no network), so raw Playwright primitives
 * are the correct tool: they retry on the DOM predicate without
 * requiring network quiescence. Same rationale as offline-gate.spec.
 *
 * The gate stays event-driven: raw goto + waitForSWControl (the SW
 * lifecycle predicate) + a stable anchor, none of which need idle.
 */
test.describe('trace overlay (5.4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await waitForSWControl(page)
    await expect(
      page.locator('[data-testid="notification-indicator"]')
    ).toBeVisible()
  })

  test('Ctrl+Shift+T toggles the overlay', async ({ page }) => {
    const overlay = page.locator('[data-testid="trace-overlay"]')
    await expect(overlay).toBeHidden()
    await page.keyboard.press('Control+Shift+T')
    await expect(overlay).toBeVisible()
    await page.keyboard.press('Control+Shift+T')
    await expect(overlay).toBeHidden()
  })

  test('close button hides the overlay', async ({ page }) => {
    const overlay = page.locator('[data-testid="trace-overlay"]')
    await page.keyboard.press('Control+Shift+T')
    await expect(overlay).toBeVisible()
    await page.locator('[data-testid="trace-overlay-close"]').click()
    await expect(overlay).toBeHidden()
  })

  test('shows empty state when no spans recorded', async ({ page }) => {
    await page.keyboard.press('Control+Shift+T')
    await expect(
      page.locator('[data-testid="trace-overlay-empty"]')
    ).toBeVisible()
  })
})
