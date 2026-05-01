import { expect, test } from '@prometheus/e2e-toolkit'
import { acceptAltDialog } from '../helpers/auto-alt-dialog'
import { dispatchMediaPaste } from '../helpers/dispatch-paste'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'welcome-to-prometheus'

test.describe('Undo (Ctrl+Z)', () => {
  test('undo reverts bold wrap', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    await ep.fillAndSelect('hello world', 6, 11)
    await ep.clickCmd('cmd-bold')
    await expect(ep.getEditorBody()).toHaveValue('hello **world**')
    await page.keyboard.press('Control+z')
    await expect(ep.getEditorBody()).toHaveValue('hello world')
  })

  test('undo reverts block prefix', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('some text')
    await page.getByTitle('Heading 2').click()
    await expect(ta).toHaveValue('## some text')
    await page.keyboard.press('Control+z')
    await expect(ta).toHaveValue('some text')
  })

  test('undo reverts paste insertion', async ({ page }) => {
    acceptAltDialog(page, 'a test')
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', 'media-showcase')
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('before')

    await dispatchMediaPaste(page, 'test.png', 'image/png')
    await expect(ta).toHaveValue(/!\[a test\]/, {
      timeout: 10000,
    })

    await page.keyboard.press('Control+z')
    await expect(ta).toHaveValue('before')
  })
})
