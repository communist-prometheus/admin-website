import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

test.describe('Markdown Editor', () => {
  test('should display editor with textarea when navigating to edit page', async ({
    page,
  }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const textarea = editPage.getEditorBody()
    await textarea.waitFor({ state: 'visible', timeout: 10000 })
    await expect(textarea).toBeVisible()
  })

  test('should display commit message input and save button', async ({
    page,
  }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const textarea = editPage.getEditorBody()
    await textarea.waitFor({ state: 'visible', timeout: 10000 })

    await expect(
      page.locator('input[placeholder="Commit message"]')
    ).toBeVisible()
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible()
  })
})
