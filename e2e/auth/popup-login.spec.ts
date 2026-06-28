import {
  expect,
  expectMinCount,
  expectVisible,
  test,
  visit,
} from '@prometheus/e2e-toolkit'
import { waitForContentReady } from '../helpers/content-ready'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login Flow', () => {
  test('should load content after login without full reload', async ({
    page,
  }) => {
    await visit(page, '/')
    await expectVisible(page, page.getByRole('button', { name: /login/i }))

    await page.evaluate(() => localStorage.setItem('gh_token', 'mock-token'))
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expectVisible(
      page,
      page.getByRole('button', { name: /test user/i })
    )

    // The first authenticated load registers the SW; its one-time
    // claim fires controllerchange and the app reloads the page
    // (sw-update-lifecycle), which aborts an in-flight goto
    // (net::ERR_ABORTED) or tears the page mid-navigation. Gating on
    // the SW lifecycle can't avoid it — `controller` flips at the very
    // controllerchange that triggers the reload. Retry the navigation
    // until it sticks: the SW claims exactly once, so this converges
    // the instant the reload settles. Event-driven (Playwright polls),
    // no fixed sleep.
    await expect(async () => {
      await page.goto('/content/blog', { waitUntil: 'domcontentloaded' })
    }).toPass()
    await waitForContentReady(page)

    const items = page.locator('[data-testid="content-item"]')
    await expectMinCount(page, items, 1)
  })

  test('should initialize SW with token after login', async ({ page }) => {
    await visit(page, '/')

    await page.evaluate(() => localStorage.setItem('gh_token', 'mock-token'))
    await page.reload({ waitUntil: 'domcontentloaded' })

    await expectVisible(
      page,
      page.getByRole('button', { name: /test user/i })
    )

    const swReady = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready
      return !!reg.active
    })
    expect(swReady).toBe(true)
  })
})
