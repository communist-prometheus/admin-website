import { expect, test } from '@prometheus/e2e-toolkit'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'welcome-to-prometheus'

test.describe('Block commands via buttons', () => {
  test('H2 inserts ## prefix', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('heading text')
    await page.getByTitle('Heading 2').click()
    await expect(ta).toHaveValue('## heading text')
  })

  test('H3 inserts ### prefix', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('heading text')
    await page.getByTitle('Heading 3').click()
    await expect(ta).toHaveValue('### heading text')
  })

  test('bullet inserts - prefix', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('list item')
    await page.getByTitle('Bullet list').click()
    await expect(ta).toHaveValue('- list item')
  })

  test('ordered inserts 1. prefix', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('list item')
    await page.getByTitle('Ordered list').click()
    await expect(ta).toHaveValue('1. list item')
  })

  test('blockquote inserts > prefix', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('quote text')
    await page.getByTitle('Blockquote').click()
    await expect(ta).toHaveValue('> quote text')
  })
})
