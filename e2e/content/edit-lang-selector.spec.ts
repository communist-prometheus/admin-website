import {
  expect,
  expectClass,
  expectCount,
  expectValue,
  expectVisible,
  test,
} from '@prometheus/e2e-toolkit'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'media-showcase'

test.describe('Edit Page Language Selector', () => {
  test('should show all 4 language buttons', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    const selector = page.locator('[data-testid="language-selector"]')
    await expectVisible(page, selector)
    await expectCount(page, selector.locator('button'), 4)
  })

  test('current language should be active', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    await expectClass(page, ep.getLanguageButton('en'), /active/)
  })

  test('available langs should have exists class', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    await expectClass(page, ep.getLanguageButton('en'), /exists/)
  })

  test('clicking another language should switch editor content', async ({
    page,
  }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    const ta = ep.getEditorBody()
    const beforeContent = await ta.inputValue()

    const ruBtn = ep.getLanguageButton('ru')
    const hasRu = await ruBtn.evaluate(el => el.classList.contains('exists'))

    await ruBtn.click()

    if (hasRu) {
      /* ru variant exists — editor body should swap. */
      await expect(ta).not.toHaveValue(beforeContent)
    } else {
      /* No ru variant yet — editor blanks for the new translation. */
      await expectValue(page, ta, '')
    }
  })
})
