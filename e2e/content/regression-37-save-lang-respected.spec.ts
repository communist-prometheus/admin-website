import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

/**
 * Regression for issue #37.
 *
 * Editing pages/manifest with the Russian language tab selected and
 * saving via the publish-confirm dialog must stage the result to
 * `index.ru.md`, not `index.en.md`. Production behaviour overwrites
 * the English file regardless of which language tab the editor was on
 * at save time.
 *
 * Note: pages are in NESTED_TYPES → the save runs through
 * `transactionalSave` (stage + commit), not the direct PUT path. So
 * we listen for the stage endpoint to inspect the path being written.
 */
test.describe('Issue #37 — save honours the currently selected language', () => {
  test('switching to ru, editing, saving stages index.ru.md', async ({
    page,
  }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('pages', 'manifest')

    const ruBtn = ep.getLanguageButton('ru')
    await expect(ruBtn).toHaveClass(/exists/, { timeout: 10000 })
    await ruBtn.click()

    const editor = ep.getEditorBody()
    // Wait for the editor to load the ru draft (non-empty ru content).
    await expect(editor).not.toHaveValue('', { timeout: 10000 })
    await expect(editor).toHaveValue(/Наш манифест|Наши/u, {
      timeout: 10000,
    })
    await editor.fill(
      `${await editor.inputValue()}\n\n<!-- regression-37 ru save -->`
    )

    const stagePromise = page.waitForResponse(
      r =>
        r.url().includes('/api/github/file/stage') &&
        r.request().method() === 'PUT',
      { timeout: 15000 }
    )

    await page.locator('[data-testid="preview-button"]').click()
    await page.locator('[data-testid="save-button"]').click()
    // pages are autoPublic — confirm dialog appears.
    await expect(
      page.locator('[data-testid="publish-confirm-btn"]')
    ).toBeVisible({ timeout: 5000 })
    await page.locator('[data-testid="publish-confirm-btn"]').click()

    const response = await stagePromise
    const req = response.request()
    const body = JSON.parse(req.postData() ?? '{}') as { path?: string }
    expect(body.path).toBeDefined()
    expect(body.path).toMatch(/index\.ru\.md$/)
    expect(body.path).not.toMatch(/index\.en\.md$/)
  })
})
