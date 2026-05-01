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

test.describe('Settings - Languages', () => {
  test('should show Settings link in header navigation', async ({ page }) => {
    await visit(page, '/')
    const settingsLink = page.locator('.app-nav a[href="/settings"]')
    await expectText(page, settingsLink, 'Settings')
  })

  test('should navigate to settings page', async ({ page }) => {
    await visit(page, '/settings')
    await expectText(page, page.locator('h1'), 'Settings')
    /*
     * Settings has two sections (Languages + Labels). Assert the
     * first h2 rather than pinning all h2 text.
     */
    await expectText(page, page.locator('h2').first(), 'Languages')
  })

  test('should show languages editor with table', async ({ page }) => {
    await visit(page, '/settings')
    await expectVisible(
      page,
      page.locator('[data-testid="languages-editor"]')
    )
    await expectVisible(page, page.locator('[data-testid="languages-table"]'))
  })

  test('should display language rows from settings', async ({ page }) => {
    await visit(page, '/settings')
    const rows = page.locator('[data-testid="language-row"]')
    await expectMinCount(page, rows, 1)

    const firstCode = rows.first().locator('[data-testid="language-code"]')
    await expectValue(page, firstCode, 'en')
  })

  test('should add a new language row', async ({ page }) => {
    await visit(page, '/settings')
    const rows = page.locator('[data-testid="language-row"]')
    await expectMinCount(page, rows, 1)

    const initialCount = await rows.count()
    await click(page, page.locator('[data-testid="add-language"]'))
    await expectCount(page, rows, initialCount + 1)
  })

  test('should remove a language row', async ({ page }) => {
    await visit(page, '/settings')
    const rows = page.locator('[data-testid="language-row"]')
    await expectMinCount(page, rows, 1)

    const initialCount = await rows.count()
    await click(page, page.locator('[data-testid="remove-language"]').last())
    await expectCount(page, rows, initialCount - 1)
  })

  test('should show save button', async ({ page }) => {
    await visit(page, '/settings')
    await expectVisible(
      page,
      page.locator('[data-testid="languages-editor"]')
    )

    const saveBtn = page.locator('[data-testid="save-languages"]')
    await expectText(page, saveBtn, 'Save')
  })

  test('should save languages and persist after reload', async ({ page }) => {
    await visit(page, '/settings')
    const rows = page.locator('[data-testid="language-row"]')
    await expectMinCount(page, rows, 1)

    const initialCount = await rows.count()

    await click(page, page.locator('[data-testid="add-language"]'))
    const newRow = rows.last()
    await fill(page, newRow.locator('[data-testid="language-code"]'), 'de')
    await fill(
      page,
      newRow.locator('[data-testid="language-label"]'),
      'Deutsch'
    )

    await click(page, page.locator('[data-testid="save-languages"]'))
    /*
     * Save button text reverts from "Saving..." to "Save" once the
     * commit lands; that's what we wait on to know the persistence
     * round-trip is done.
     */
    await expectText(
      page,
      page.locator('[data-testid="save-languages"]'),
      'Save'
    )

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expectCount(page, rows, initialCount + 1)
    const lastCode = rows.last().locator('[data-testid="language-code"]')
    await expectValue(page, lastCode, 'de')

    await click(page, page.locator('[data-testid="remove-language"]').last())
    await click(page, page.locator('[data-testid="save-languages"]'))
    await expectText(
      page,
      page.locator('[data-testid="save-languages"]'),
      'Save'
    )
  })

  test('should remove a language, save, and verify removal persists', async ({
    page,
  }) => {
    await visit(page, '/settings')
    const rows = page.locator('[data-testid="language-row"]')
    await expectMinCount(page, rows, 1)

    const initialCount = await rows.count()

    await click(page, page.locator('[data-testid="remove-language"]').last())
    await click(page, page.locator('[data-testid="save-languages"]'))
    await expectText(
      page,
      page.locator('[data-testid="save-languages"]'),
      'Save'
    )

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expectCount(page, rows, initialCount - 1)

    await click(page, page.locator('[data-testid="add-language"]'))
    const newRow = rows.last()
    await fill(page, newRow.locator('[data-testid="language-code"]'), 'es')
    await fill(
      page,
      newRow.locator('[data-testid="language-label"]'),
      'Español'
    )
    await click(page, page.locator('[data-testid="save-languages"]'))
    await expectText(
      page,
      page.locator('[data-testid="save-languages"]'),
      'Save'
    )
  })
})
