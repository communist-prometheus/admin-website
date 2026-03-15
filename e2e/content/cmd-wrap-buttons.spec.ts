import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'welcome-to-prometheus'

test.describe('Wrap commands via buttons', () => {
  test('bold wraps selected text with **', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    await ep.fillAndSelect('hello world', 6, 11)
    await ep.clickCmd('cmd-bold')
    await expect(ep.getEditorBody()).toHaveValue('hello **world**')
  })

  test('italic wraps selected text with *', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    await ep.fillAndSelect('hello world', 6, 11)
    await ep.clickCmd('cmd-italic')
    await expect(ep.getEditorBody()).toHaveValue('hello *world*')
  })

  test('code wraps selected text with `', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    await ep.fillAndSelect('hello world', 6, 11)
    await ep.clickCmd('cmd-code')
    await expect(ep.getEditorBody()).toHaveValue('hello `world`')
  })

  test('strikethrough wraps with ~~', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)
    await ep.fillAndSelect('hello world', 6, 11)
    await ep.clickCmd('cmd-strike')
    await expect(ep.getEditorBody()).toHaveValue('hello ~~world~~')
  })
})
