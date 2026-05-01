import { expect, test } from '@prometheus/e2e-toolkit'
import { ContentEditPage } from '../pages/ContentEditPage'
import { openPreview } from './preview-save'

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

    const saveBtn = await openPreview(page)
    await expect(saveBtn).toBeVisible()
    await expect(saveBtn).toBeEnabled()
  })
})
