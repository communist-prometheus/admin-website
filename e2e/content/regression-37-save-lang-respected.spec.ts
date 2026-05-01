import {
  click,
  expect,
  expectClass,
  expectVisible,
  test,
} from '@prometheus/e2e-toolkit'
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
    await expectClass(page, ruBtn, /exists/)
    await click(page, ruBtn)

    const editor = ep.getEditorBody()
    /* Wait for the editor to load the ru draft (non-empty content). */
    await expect(editor).not.toHaveValue('')
    await expect(editor).toHaveValue(/Наш манифест|Наши/u)
    await editor.fill(
      `${await editor.inputValue()}\n\n<!-- regression-37 ru save -->`
    )

    const stagePromise = page.waitForResponse(
      r =>
        r.url().includes('/api/github/file/stage') &&
        r.request().method() === 'PUT',
      { timeout: 15000 }
    )

    await click(page, page.locator('[data-testid="preview-button"]'))
    await click(page, page.locator('[data-testid="save-button"]'))
    /* pages are autoPublic — confirm dialog appears. */
    await expectVisible(
      page,
      page.locator('[data-testid="publish-confirm-btn"]')
    )
    await click(page, page.locator('[data-testid="publish-confirm-btn"]'))

    const response = await stagePromise
    const body = JSON.parse(response.request().postData() ?? '{}') as {
      path?: string
    }
    expect(body.path).toBeDefined()
    expect(body.path).toMatch(/index\.ru\.md$/)
    expect(body.path).not.toMatch(/index\.en\.md$/)
  })
})
