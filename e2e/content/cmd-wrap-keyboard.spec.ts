import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'welcome-to-prometheus'

test.describe('Wrap commands via keyboard', () => {
  test('Ctrl+B applies bold', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    await ep.fillAndSelect('hello world', 6, 11)
    await page.keyboard.press('Control+b')
    await expect(ep.getEditorBody()).toHaveValue('hello **world**')
  })

  test('Ctrl+I applies italic', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    await ep.fillAndSelect('hello world', 6, 11)
    await page.keyboard.press('Control+i')
    await expect(ep.getEditorBody()).toHaveValue('hello *world*')
  })

  test('Ctrl+E applies code', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    await ep.fillAndSelect('hello world', 6, 11)
    await page.keyboard.press('Control+e')
    await expect(ep.getEditorBody()).toHaveValue('hello `world`')
  })
})
