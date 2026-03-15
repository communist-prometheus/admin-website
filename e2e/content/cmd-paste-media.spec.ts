import { expect, test } from '@playwright/test'
import { dispatchMediaPaste } from '../helpers/dispatch-paste'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'media-showcase'

test.describe('Paste media consistency', () => {
  test('paste image produces markdown img', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('')
    await dispatchMediaPaste(page, 'photo.png', 'image/png')
    await expect(ta).toHaveValue(
      /!\[photo\.png\]\(\.\/assets\/photo\.png\)/,
      { timeout: 10000 }
    )
  })

  test('paste video produces <video> tag', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('')
    await dispatchMediaPaste(page, 'clip.mp4', 'video/mp4')
    await expect(ta).toHaveValue(/<video controls>/, {
      timeout: 10000,
    })
  })

  test('paste audio produces <audio> tag', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('')
    await dispatchMediaPaste(page, 'song.mp3', 'audio/mpeg')
    await expect(ta).toHaveValue(/<audio controls>/, {
      timeout: 10000,
    })
  })
})
