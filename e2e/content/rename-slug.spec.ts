import {
  click,
  expect,
  expectCount,
  expectHidden,
  expectValue,
  expectVisible,
  test,
  waitForCondition,
} from '@prometheus/e2e-toolkit'
import { AssetManagerPage } from '../pages/AssetManagerPage'
import { ContentEditPage } from '../pages/ContentEditPage'
import { openPreview, saveAndConfirm } from './preview-save'

const SLUG = 'media-showcase'

test.describe('Rename Slug', () => {
  test('should show slug input on click and validate', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await click(page, page.locator('[data-testid="edit-title"]'))
    const input = page.locator('[data-testid="slug-input"]')
    await expectVisible(page, input)

    /*
     * Sanitization strips non-[a-z0-9-]; "!!!" reduces to "" so the
     * validator fires its empty-slug error.
     */
    await input.clear()
    await input.type('!!!', { delay: 30 })
    await input.press('Enter')
    await expectVisible(page, page.locator('[data-testid="slug-error"]'))
  })

  test('lowercases uppercase keystrokes on the fly', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await click(page, page.locator('[data-testid="edit-title"]'))
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('FooBar', { delay: 30 })
    await expectValue(page, input, 'foobar')
  })

  test('strips non-Latin keystrokes', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await click(page, page.locator('[data-testid="edit-title"]'))
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('пост-test', { delay: 30 })
    await expectValue(page, input, '-test')
  })

  test('should reject slug exceeding max length', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await click(page, page.locator('[data-testid="edit-title"]'))
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('a'.repeat(21), { delay: 10 })
    await input.press('Enter')
    await expectVisible(page, page.locator('[data-testid="slug-error"]'))
  })

  test('should cancel edit on Escape', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await click(page, page.locator('[data-testid="edit-title"]'))
    const input = page.locator('[data-testid="slug-input"]')
    await expectVisible(page, input)

    await input.press('Escape')
    await expectHidden(page, input)
    await expectVisible(page, page.locator('[data-testid="edit-title"]'))
  })

  test('valid rename should redirect to new URL', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await click(page, page.locator('[data-testid="edit-title"]'))
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('showcase-renamed', { delay: 30 })
    await input.press('Enter')

    await waitForCondition(page, async () =>
      /showcase-renamed/.test(page.url())
    )
  })

  test('rename preserves assets and content', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog(SLUG)
    await am.expectPanelVisible()
    const assetCount = await am.getAssetCount()

    const ep = new ContentEditPage(page)
    const bodyBefore = await ep.getEditorBody().inputValue()

    await click(page, page.locator('[data-testid="edit-title"]'))
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('renamed-showcase', { delay: 30 })
    await input.press('Enter')
    await waitForCondition(page, async () =>
      /renamed-showcase/.test(page.url())
    )

    /* Wait for page to fully load after location.replace. */
    await expectVisible(page, ep.getEditorBody())
    await expect(ep.getEditorBody()).not.toHaveValue('')

    const bodyAfter = await ep.getEditorBody().inputValue()
    expect(bodyAfter).toBe(bodyBefore)

    await expectCount(page, am.getAssetThumbnails(), assetCount)
  })

  test('rename + save does not create duplicate articles', async ({
    page,
  }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await click(page, page.locator('[data-testid="edit-title"]'))
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('showcase-save', { delay: 30 })
    await input.press('Enter')
    await waitForCondition(page, async () => /showcase-save/.test(page.url()))

    await expectVisible(page, ep.getEditorBody())
    await expect(ep.getEditorBody()).not.toHaveValue('')

    await saveAndConfirm(page, await openPreview(page))

    await click(page, page.locator('[data-testid="back-button"]'))
    await expectVisible(page, page.locator('[data-testid="content-list"]'))

    const items = page.locator('[data-testid="content-item"]')
    const count = await items.count()
    let richMediaCount = 0
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).innerText()
      if (text.includes('Rich Media')) richMediaCount++
    }
    expect(richMediaCount).toBe(1)
  })
})
