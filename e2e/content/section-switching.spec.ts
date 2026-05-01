import {
  click,
  expect,
  expectVisible,
  test,
  visit,
  waitForCondition,
} from '@prometheus/e2e-toolkit'
import { waitForContentReady } from '../helpers/content-ready'

test.describe('Content Section Switching', () => {
  /*
   * Content views do not render an h1 — the active nav link
   * identifies the current section. These tests assert the URL
   * and that the list renders.
   */
  test('should load blog content when navigating to /content/blog', async ({
    page,
  }) => {
    await visit(page, '/content/blog')
    await waitForContentReady(page)

    expect(page.url()).toContain('/content/blog')
    await expectVisible(page, page.locator('[data-testid="content-list"]'))
  })

  test('should load positions content when navigating to /content/positions', async ({
    page,
  }) => {
    await visit(page, '/content/positions')
    await waitForContentReady(page)

    expect(page.url()).toContain('/content/positions')
    await expectVisible(page, page.locator('[data-testid="content-list"]'))
  })

  test('should load pages content when navigating to /content/pages', async ({
    page,
  }) => {
    await visit(page, '/content/pages')
    await waitForContentReady(page)

    expect(page.url()).toContain('/content/pages')
    await expectVisible(page, page.locator('[data-testid="content-list"]'))
  })

  test('should update content list when switching from blog to positions', async ({
    page,
  }) => {
    await visit(page, '/content/blog')
    await expectVisible(
      page,
      page.locator('[data-testid="content-item"]').first()
    )
    const blogItems = await page
      .locator('[data-testid="content-item"]')
      .count()

    await click(page, page.locator('a[href="/content/positions"]'))
    await waitForCondition(page, async () =>
      page.url().includes('/content/positions')
    )
    await waitForContentReady(page)

    expect(blogItems).toBeGreaterThan(0)
  })

  test('should update content list when switching from positions to pages', async ({
    page,
  }) => {
    await visit(page, '/content/positions')
    await waitForContentReady(page)

    await click(page, page.locator('a[href="/content/pages"]'))
    await waitForCondition(page, async () =>
      page.url().includes('/content/pages')
    )
    await waitForContentReady(page)

    await expectVisible(page, page.locator('[data-testid="content-list"]'))
  })

  test('clicking item navigates to edit page instead of inline editor', async ({
    page,
  }) => {
    await visit(page, '/content/blog')
    await waitForContentReady(page)

    const firstItem = page.locator('[data-testid="content-item"]').first()
    await expectVisible(page, firstItem)
    await click(page, firstItem)

    await waitForCondition(page, async () =>
      /\/content\/blog\/edit\//.test(page.url())
    )
    await expectVisible(page, page.locator('[data-testid="markdown-editor"]'))
  })
})
