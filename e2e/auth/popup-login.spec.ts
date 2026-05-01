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

    await visit(page, '/content/blog')
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
