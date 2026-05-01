import { expectVisible, test } from '@prometheus/e2e-toolkit'
import { ContentEditPage } from '../pages/ContentEditPage'

test.describe('Markdown Editor', () => {
  test('should display editor with textarea when navigating to edit page', async ({
    page,
  }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    await expectVisible(page, editPage.getEditorBody())
  })

  test('should display preview button', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    await expectVisible(page, editPage.getEditorBody())
    await expectVisible(page, page.locator('[data-testid="preview-button"]'))
  })
})
