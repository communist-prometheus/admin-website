import { expect, test } from '@prometheus/e2e-toolkit'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'welcome-to-prometheus'

test.describe('Preview after insertion', () => {
  test('bold renders <strong> in preview', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    await ep.fillAndSelect('hello world', 6, 11)
    await ep.clickCmd('cmd-bold')
    await expect(ep.getEditorBody()).toHaveValue('hello **world**')

    await ep.togglePreview()
    await ep.expectPreviewVisible()
    const preview = ep.getPreviewContent()
    await expect(preview.locator('strong')).toHaveText('world')
  })

  test('H2 renders <h2> in preview', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('heading text')
    await page.getByTitle('Heading 2').click()
    await expect(ta).toHaveValue('## heading text')

    await ep.togglePreview()
    await ep.expectPreviewVisible()
    const preview = ep.getPreviewContent()
    await expect(preview.locator('h2')).toHaveText('heading text')
  })
})
