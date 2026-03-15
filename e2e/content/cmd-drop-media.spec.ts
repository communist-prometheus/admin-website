import { expect, test } from '@playwright/test'
import { dispatchDrop } from '../helpers/dispatch-drop'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'media-showcase'

test.describe('Drop media insertion', () => {
  test('drop image produces markdown img', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('')
    await dispatchDrop(page, 'photo.png', 'image/png')
    await expect(ta).toHaveValue(
      /!\[photo\.png\]\(\.\/assets\/photo\.png\)/,
      { timeout: 10000 }
    )
  })

  test('drop video produces <video> tag', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('')
    await dispatchDrop(page, 'clip.mp4', 'video/mp4')
    await expect(ta).toHaveValue(/<video controls>/, {
      timeout: 10000,
    })
  })

  test('drop audio produces <audio> tag', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.fill('')
    await dispatchDrop(page, 'song.mp3', 'audio/mpeg')
    await expect(ta).toHaveValue(/<audio controls>/, {
      timeout: 10000,
    })
  })
})
