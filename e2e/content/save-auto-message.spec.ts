import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'media-showcase'

test.describe('Auto Commit Message', () => {
  test('should not show commit message input', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await expect(page.locator('[data-testid="commit-message"]')).toHaveCount(
      0
    )
  })

  test('save button should be visible and enabled', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    const saveBtn = page.locator('[data-testid="save-button"]')
    await expect(saveBtn).toBeVisible()
    await expect(saveBtn).toBeEnabled()
  })
})
