import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'welcome-to-prometheus'

test.describe('Special block commands', () => {
  test('code block inserts triple backtick', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('code here')
    await page.getByTitle('Code block').click()
    await expect(ta).toHaveValue(/^```\n/)
  })

  test('horizontal rule inserts ---', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('above')
    await page.getByTitle('Horizontal rule').click()
    await expect(ta).toHaveValue(/^---\n/)
  })
})
