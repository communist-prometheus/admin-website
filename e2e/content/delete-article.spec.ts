import {
  click,
  expectCount,
  expectHidden,
  expectMinCount,
  expectVisible,
  test,
  visit,
} from '@prometheus/e2e-toolkit'

/*
 * Pages are fixed-structure (hide-delete=true). Use /content/blog
 * so delete buttons are actually rendered.
 */
const setupBlog = async (
  page: Parameters<Parameters<typeof test>[1]>[0]['page']
) => {
  await visit(page, '/content/blog')
  const item = page.locator('[data-testid="content-item"]').first()
  await expectVisible(page, item)
  return item
}

test.describe('Delete Article', () => {
  test('should show delete button on hover', async ({ page }) => {
    const item = await setupBlog(page)
    await item.hover()
    await expectVisible(page, item.locator('[data-testid="delete-item-btn"]'))
  })

  test('should show delete confirmation dialog', async ({ page }) => {
    const item = await setupBlog(page)
    await item.hover()
    await click(page, item.locator('[data-testid="delete-item-btn"]'))

    await expectVisible(page, page.locator('[data-testid="delete-dialog"]'))
    await expectVisible(page, page.locator('[data-testid="delete-all-btn"]'))
    await expectVisible(page, page.locator('[data-testid="delete-lang-btn"]'))
    await expectVisible(
      page,
      page.locator('[data-testid="delete-cancel-btn"]')
    )
  })

  test('should close dialog on cancel', async ({ page }) => {
    const item = await setupBlog(page)
    await item.hover()
    await click(page, item.locator('[data-testid="delete-item-btn"]'))

    const dialog = page.locator('[data-testid="delete-dialog"]')
    await expectVisible(page, dialog)
    await click(page, page.locator('[data-testid="delete-cancel-btn"]'))
    await expectHidden(page, dialog)
  })

  test('delete all should remove item from list', async ({ page }) => {
    await visit(page, '/content/blog')
    const items = page.locator('[data-testid="content-item"]')
    await expectMinCount(page, items, 1)
    const initialCount = await items.count()

    const item = items.first()
    await item.hover()
    await click(page, item.locator('[data-testid="delete-item-btn"]'))
    await click(page, page.locator('[data-testid="delete-all-btn"]'))

    await expectCount(page, items, initialCount - 1)
  })
})
