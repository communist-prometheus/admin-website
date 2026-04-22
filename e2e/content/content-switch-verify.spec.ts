import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'
import { ContentPage } from '../pages/ContentPage'

test.describe('Content Switch Verification', () => {
  test('switching from blog to positions shows different items', async ({
    page,
  }) => {
    const cp = new ContentPage(page)
    await cp.navigate('blog')

    const blogTitles = await page
      .locator('[data-testid="content-item"]')
      .allTextContents()

    await page.click('a[href="/content/positions"]')
    await page.waitForURL('/content/positions')
    await cp.expectToBeVisible()

    const posTitles = await page
      .locator('[data-testid="content-item"]')
      .allTextContents()

    expect(blogTitles.length).toBeGreaterThan(0)
    expect(posTitles.length).toBeGreaterThan(0)
    expect(posTitles).not.toEqual(blogTitles)
  })

  test('switching from positions to pages shows different items', async ({
    page,
  }) => {
    const cp = new ContentPage(page)
    await cp.navigate('positions')

    const posTitles = await page
      .locator('[data-testid="content-item"]')
      .allTextContents()

    await page.click('a[href="/content/pages"]')
    await page.waitForURL('/content/pages')
    await cp.expectToBeVisible()

    const pageTitles = await page
      .locator('[data-testid="content-item"]')
      .allTextContents()

    expect(posTitles.length).toBeGreaterThan(0)
    expect(pageTitles.length).toBeGreaterThan(0)
    expect(pageTitles).not.toEqual(posTitles)
  })

  test('blog items contain expected blog title', async ({ page }) => {
    const cp = new ContentPage(page)
    await cp.navigate('blog')
    await cp.expectItemWithTitle('Welcome to Prometheus')
  })

  test('positions items contain expected position title', async ({
    page,
  }) => {
    const cp = new ContentPage(page)
    await cp.navigate('positions')
    await cp.expectItemWithTitle('Digital Sovereignty')
  })

  test('pages items contain expected page title', async ({ page }) => {
    const cp = new ContentPage(page)
    await cp.navigate('pages')
    await cp.expectItemWithTitle('Our Manifest')
  })

  test('round-trip: blog → positions → blog shows same blog content', async ({
    page,
  }) => {
    const cp = new ContentPage(page)
    await cp.navigate('blog')

    // Wait for at least one item — otherwise allTextContents() captures
    // the empty-skeleton list before reactive rendering settles.
    await page
      .locator('[data-testid="content-item"]')
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })
    const blogFirst = await page
      .locator('[data-testid="content-item"]')
      .allTextContents()

    await page.click('a[href="/content/positions"]')
    await page.waitForURL('/content/positions')
    await cp.expectToBeVisible()

    await page.click('a[href="/content/blog"]')
    await page.waitForURL('/content/blog')
    await cp.expectToBeVisible()
    await page
      .locator('[data-testid="content-item"]')
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })

    const blogSecond = await page
      .locator('[data-testid="content-item"]')
      .allTextContents()

    expect(blogSecond).toEqual(blogFirst)
  })

  test('edit page shows correct content after section switch', async ({
    page,
  }) => {
    const cp = new ContentPage(page)
    const ep = new ContentEditPage(page)

    await cp.navigate('blog')
    await cp.selectItem('Welcome to Prometheus')
    await page.waitForURL(/\/content\/blog\/edit\//)
    await ep.expectEditorVisible()

    const blogBody = await ep.getEditorBody().inputValue()
    expect(blogBody.length).toBeGreaterThan(0)

    await ep.navigate('positions', 'digital-sovereignty')

    const posBody = await ep.getEditorBody().inputValue()
    expect(posBody.length).toBeGreaterThan(0)
    expect(posBody).not.toEqual(blogBody)
  })
})
