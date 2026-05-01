import {
  click,
  expectHidden,
  expectVisible,
  test,
  visit,
} from '@prometheus/e2e-toolkit'
import { waitForContentReady } from '../helpers/content-ready'

test.describe('GitHub Content - Create', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, '/content/blog')
    await waitForContentReady(page)
  })

  test('should open create dialog', async ({ page }) => {
    await click(page, page.getByRole('button', { name: /new/i }).first())
    await expectVisible(page, page.locator('.create-dialog'))
  })

  test('should show required fields in create dialog', async ({ page }) => {
    await click(page, page.getByRole('button', { name: /new/i }).first())
    await expectVisible(page, page.locator('.create-dialog'))
    await expectVisible(page, page.getByLabel(/slug/i))
    await expectVisible(page, page.getByLabel(/title/i))
  })

  test('should show blog-specific fields for blog content', async ({
    page,
  }) => {
    await click(page, page.getByRole('button', { name: /new/i }).first())
    await expectVisible(page, page.getByLabel(/description/i))
    await expectVisible(page, page.getByLabel(/category/i))
  })

  test('should show position-specific fields for positions', async ({
    page,
  }) => {
    await visit(page, '/content/positions')
    await waitForContentReady(page)
    await click(page, page.getByRole('button', { name: /new/i }).first())
    await expectVisible(page, page.getByLabel(/description/i))
    /* Positions no longer expose an Order field (migrated to pubDate). */
    await expectHidden(page, page.locator('#order'))
  })

  test('should keep dialog open when submitting empty form', async ({
    page,
  }) => {
    await click(page, page.getByRole('button', { name: /new/i }).first())
    await expectVisible(page, page.locator('.create-dialog'))
    await click(page, page.getByRole('button', { name: /^create$/i }))
    await expectVisible(page, page.locator('.create-dialog'))
  })

  test('should close dialog after cancel', async ({ page }) => {
    await click(page, page.getByRole('button', { name: /new/i }).first())
    await expectVisible(page, page.locator('.create-dialog'))
    await click(page, page.getByRole('button', { name: /cancel/i }))
    await expectHidden(page, page.locator('.create-dialog'))
  })
})
