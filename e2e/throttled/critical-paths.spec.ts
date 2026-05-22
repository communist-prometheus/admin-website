import { expect, test } from '@prometheus/e2e-toolkit'
import { openPreview, saveAndConfirm } from '../content/preview-save'
import { waitForContentReady } from '../helpers/content-ready'
import { applyThrottling } from './throttle'

/**
 * Critical-subset suite — these scenarios run under Slow 3G + 4× CPU
 * throttling (see `./throttle.ts`). The point is to lock the
 * end-to-end contract for users on bad cellular tethers and 4-year-old
 * Android devices — where reactivity glitches that look fast on a dev
 * laptop become 5-second dropouts and "is anything happening?" doubt.
 *
 * Pick rule for what belongs here: scenarios where the user makes a
 * change and expects an *immediate* UI signal that the system received
 * the change. Anything purely offline-local (typing, scrolling) is
 * better tested at unit / interaction layer; anything that goes
 * through service worker + GitHub + polling belongs here.
 *
 * Generous timeouts vs. unthrottled mirror tests: an animation frame
 * that lands in <50 ms on a fast laptop can need 400-600 ms when the
 * CPU is 4× slower AND the SW bridge is in flight AND a poll tick is
 * scheduled. The contracts are still tight enough that a regression
 * (e.g. the "old run eats new pending" bug) fails them.
 */
const openFirstArticle = async (
  page: import('@playwright/test').Page
): Promise<void> => {
  await page.goto('/content/blog')
  await waitForContentReady(page)
  await page.locator('h3').first().click()
  await page.waitForURL(/\/edit\//)
  await waitForContentReady(page)
}

test.describe('Critical paths under Slow 3G + 4× CPU', () => {
  test.beforeEach(async ({ page }) => {
    await applyThrottling(page)
  })

  /*
   * The headline regression: users on slow mobile didn't see the
   * deploy bar after Save and concluded the save silently failed,
   * then mashed F5 — which on the next mount re-ran polling and
   * (eventually) showed the bar from a fresh run. With throttling on
   * we *must* see the optimistic bar from the local pending write,
   * not from a real workflow run.
   */
  test('deploy bar appears within 5 s of Save (no refresh needed)', async ({
    page,
  }) => {
    await openFirstArticle(page)
    const btn = await openPreview(page)
    await saveAndConfirm(page, btn)
    await expect(page.locator('.deploy-bar')).toBeVisible({ timeout: 5000 })
  })

  /*
   * "Pick the first article, see it open in the editor" is the
   * single most-walked path in this app. If it can't complete in
   * 30 s on slow mobile, the rest of the admin is unreachable.
   */
  test('content list → editor opens within 30 s', async ({ page }) => {
    await page.goto('/content/blog')
    await waitForContentReady(page)
    const firstCard = page.locator('h3').first()
    await expect(firstCard).toBeVisible({ timeout: 30_000 })
    await firstCard.click()
    await page.waitForURL(/\/edit\//, { timeout: 30_000 })
    await waitForContentReady(page)
    await expect(page.locator('[data-testid="markdown-editor"]')).toBeVisible(
      {
        timeout: 30_000,
      }
    )
  })
})
