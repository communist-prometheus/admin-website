import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'media-showcase'

test.describe('Media picker insertion', () => {
  test('inserts image markdown via picker', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('')

    const picker = page.locator('[data-testid="media-picker"]')
    await picker.locator('button').first().click()

    const items = page.locator('[data-testid="media-item"]')
    await expect(items.first()).toBeVisible({ timeout: 10000 })

    const firstName = await items.first().locator('.name').textContent()
    await items.first().click()

    await expect(ta).not.toHaveValue('')
    if (firstName) {
      const val = await ta.inputValue()
      expect(val).toContain(firstName)
    }
  })
})
