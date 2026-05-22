import {
  click,
  expectCount,
  expectMinCount,
  expectText,
  expectValue,
  expectVisible,
  fill,
  test,
  visit,
} from '@prometheus/e2e-toolkit'

test.describe('Settings - Links', () => {
  test('should show links editor with rows from settings', async ({
    page,
  }) => {
    await visit(page, '/settings')
    await expectVisible(page, page.locator('[data-testid="links-editor"]'))
    const rows = page.locator('[data-testid="link-row"]')
    await expectMinCount(page, rows, 1)
  })

  test('should display link fields from settings', async ({ page }) => {
    await visit(page, '/settings')
    const rows = page.locator('[data-testid="link-row"]')
    await expectMinCount(page, rows, 1)
    const firstUrl = rows.first().locator('[data-testid="link-url"]')
    await expectValue(page, firstUrl, 'https://www.leftcom.org')
  })

  test('should add a new link row', async ({ page }) => {
    await visit(page, '/settings')
    const rows = page.locator('[data-testid="link-row"]')
    await expectMinCount(page, rows, 1)
    const initialCount = await rows.count()
    await click(page, page.locator('[data-testid="link-add"]'))
    await expectCount(page, rows, initialCount + 1)
  })

  test('should remove a link row', async ({ page }) => {
    await visit(page, '/settings')
    const rows = page.locator('[data-testid="link-row"]')
    await expectMinCount(page, rows, 1)
    const initialCount = await rows.count()
    await click(page, page.locator('[data-testid="link-remove"]').last())
    await expectCount(page, rows, initialCount - 1)
  })

  test('should add a link, save, and persist after reload', async ({
    page,
  }) => {
    await visit(page, '/settings')
    const rows = page.locator('[data-testid="link-row"]')
    await expectMinCount(page, rows, 1)
    const initialCount = await rows.count()

    await click(page, page.locator('[data-testid="link-add"]'))
    const newRow = rows.last()
    await fill(
      page,
      newRow.locator('[data-testid="link-url"]'),
      'https://example.org'
    )
    await fill(
      page,
      newRow.locator('[data-testid="link-name"]'),
      'Example Org'
    )

    await click(page, page.locator('[data-testid="links-save"]'))
    /*
     * Save button text reverts from "Saving…" to "Save links" once the
     * commit lands — that's the persistence round-trip completing.
     */
    await expectText(
      page,
      page.locator('[data-testid="links-save"]'),
      'Save links'
    )

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expectCount(page, rows, initialCount + 1)
    const lastUrl = rows.last().locator('[data-testid="link-url"]')
    await expectValue(page, lastUrl, 'https://example.org')

    await click(page, page.locator('[data-testid="link-remove"]').last())
    await click(page, page.locator('[data-testid="links-save"]'))
    await expectText(
      page,
      page.locator('[data-testid="links-save"]'),
      'Save links'
    )
  })
})
