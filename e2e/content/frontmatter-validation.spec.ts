import {
  expect,
  expectHidden,
  expectVisible,
  type Page,
  test,
  waitForCondition,
} from '@prometheus/e2e-toolkit'
import { ContentEditPage } from '../pages/ContentEditPage'
import { openPreview, saveAndConfirm } from './preview-save'

const edit = async (page: Page): Promise<void> => {
  const ep = new ContentEditPage(page)
  await ep.navigate('blog', 'welcome-to-prometheus')
}

const errorBanner = (page: Page) =>
  page.locator('[data-testid="error-message"]')

test.describe('Frontmatter validation before save', () => {
  test('clearing the title blocks the save and surfaces an error', async ({
    page,
  }) => {
    await edit(page)
    await page.locator('#fm-title').fill('')

    /* Intercept the commit endpoint — it must not fire. */
    let commitFired = false
    page.on('response', r => {
      if (r.url().includes('/api/github/commit')) commitFired = true
    })

    await saveAndConfirm(page, await openPreview(page))
    await expectVisible(page, errorBanner(page))
    /* Toolkit waits for the request graph to idle, then assert. */
    await waitForCondition(page, async () => true)
    expect(commitFired).toBe(false)
  })

  /*
   * "clearing the description blocks the save" was retired with #187 —
   * description is no longer a required field for blog (or any other
   * collection). Listings derive a card preview from the body's first
   * paragraph; the article page renders the description as a lead block
   * only when an old entry still carries one. Title is now the sole
   * mandatory text field — covered by the test above.
   */

  test('valid frontmatter allows the save to complete', async ({ page }) => {
    await edit(page)
    /* Trivial dirty change so there's something to save. */
    const textarea = page.locator('[data-testid="editor-body"]')
    await textarea.fill(`${await textarea.inputValue()}\nvalid`)

    await saveAndConfirm(page, await openPreview(page))
    await expectHidden(page, errorBanner(page))
    /* Preview auto-exits on success. */
    await expectVisible(page, page.locator('[data-testid="preview-button"]'))
  })
})

test.describe('Per-type validation', () => {
  test('pages also gets validated — missing title blocks save', async ({
    page,
  }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('pages', 'manifest')
    await page.locator('#fm-title').fill('')

    let commitFired = false
    page.on('response', r => {
      if (r.url().includes('/api/github/commit')) commitFired = true
    })

    await saveAndConfirm(page, await openPreview(page))
    await expectVisible(page, errorBanner(page))
    await waitForCondition(page, async () => true)
    expect(commitFired).toBe(false)
  })
})
