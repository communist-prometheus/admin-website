import { expect, test } from '@prometheus/e2e-toolkit'
import { acceptAltDialog } from '../helpers/auto-alt-dialog'
import { dispatchDrop } from '../helpers/dispatch-drop'
import { dispatchMediaPaste } from '../helpers/dispatch-paste'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'media-showcase'

test.describe('Paste vs Drop consistency', () => {
  test('paste and drop produce same image tag', async ({ page }) => {
    acceptAltDialog(page, 'consistency')
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()

    await ta.focus()
    await ta.fill('')
    await dispatchMediaPaste(page, 'pic.png', 'image/png')
    const pastedVal = await ta.inputValue()

    await ta.focus()
    await ta.fill('')
    await dispatchDrop(page, 'pic.png', 'image/png')
    const droppedVal = await ta.inputValue()

    expect(pastedVal.trim()).toBe(droppedVal.trim())
  })

  test('paste and drop produce same video tag', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()

    await ta.focus()
    await ta.fill('')
    await dispatchMediaPaste(page, 'vid.mp4', 'video/mp4')
    const pastedVal = await ta.inputValue()

    await ta.focus()
    await ta.fill('')
    await dispatchDrop(page, 'vid.mp4', 'video/mp4')
    const droppedVal = await ta.inputValue()

    expect(pastedVal.trim()).toBe(droppedVal.trim())
  })
})
