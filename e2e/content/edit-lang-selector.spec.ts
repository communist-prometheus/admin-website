import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'media-showcase'

test.describe('Edit Page Language Selector', () => {
  test('should show all 4 language buttons', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    const selector = page.locator('[data-testid="language-selector"]')
    await expect(selector).toBeVisible({ timeout: 10000 })

    const buttons = selector.locator('button')
    await expect(buttons).toHaveCount(4)
  })

  test('current language should be active', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    const enBtn = ep.getLanguageButton('en')
    await expect(enBtn).toHaveClass(/active/, { timeout: 10000 })
  })

  test('available langs should have exists class', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    const enBtn = ep.getLanguageButton('en')
    await expect(enBtn).toHaveClass(/exists/, { timeout: 10000 })
  })

  test('clicking another language should switch editor content', async ({
    page,
  }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    const ta = ep.getEditorBody()
    const beforeContent = await ta.inputValue()

    // Check if ru version exists (has exists class)
    const ruBtn = ep.getLanguageButton('ru')
    const hasRu = await ruBtn.evaluate(el => el.classList.contains('exists'))

    await ruBtn.click()

    if (hasRu) {
      // Content should have changed
      await expect(ta).not.toHaveValue(beforeContent, { timeout: 10000 })
    } else {
      // Editor should be empty for new translation
      await expect(ta).toHaveValue('', { timeout: 10000 })
    }
  })
})
