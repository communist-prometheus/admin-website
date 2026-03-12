import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'
import { waitForContentReady } from '../helpers/content-ready'

test.describe('Content Creation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should show create button on blog page', async ({ page }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await expect(page.getByRole('button', { name: /new/i })).toBeVisible()
  })

  test('should show create button on positions page', async ({ page }) => {
    await page.goto('/content/positions')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await expect(page.getByRole('button', { name: /new/i })).toBeVisible()
  })

  test('should show create button on pages page', async ({ page }) => {
    await page.goto('/content/pages')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await expect(page.getByRole('button', { name: /new/i })).toBeVisible()
  })

  test('should open create dialog when clicking new button', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await page.click('button:has-text("New")')

    await expect(page.locator('.create-dialog')).toBeVisible()
  })

  test('should show correct fields for blog content creation', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)
    await page.click('button:has-text("New")')

    await expect(page.getByLabel(/slug/i)).toBeVisible()
    await expect(page.getByLabel(/title/i)).toBeVisible()
    await expect(page.getByLabel(/description/i)).toBeVisible()
    await expect(page.getByLabel(/category/i)).toBeVisible()
  })

  test('should show correct fields for positions content creation', async ({
    page,
  }) => {
    await page.goto('/content/positions')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)
    await page.click('button:has-text("New")')

    await expect(page.getByLabel(/slug/i)).toBeVisible()
    await expect(page.getByLabel(/title/i)).toBeVisible()
    await expect(page.getByLabel(/description/i)).toBeVisible()
    await expect(page.getByLabel(/order/i)).toBeVisible()
  })

  test('should show correct fields for pages content creation', async ({
    page,
  }) => {
    await page.goto('/content/pages')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)
    await page.click('button:has-text("New")')

    await expect(page.getByLabel(/slug/i)).toBeVisible()
    await expect(page.getByLabel(/title/i)).toBeVisible()
  })

  test('should keep dialog open when submitting empty form', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)
    await page.click('button:has-text("New")')

    await page.click('button:has-text("Create")')

    await expect(page.locator('.create-dialog')).toBeVisible()
  })

  test('should create new content when form is submitted', async ({
    page,
  }) => {
    await page.route('**/api/github/file', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)
    await page.click('button:has-text("New")')
    await expect(page.locator('.create-dialog')).toBeVisible()

    await page.fill('#slug', 'test-post')
    await page.fill('#title', 'Test Post')
    await page.fill('#description', 'Test description')
    await page.fill('#category', 'Test')

    await page.click('button:has-text("Create")')

    await expect(page.locator('.create-dialog')).not.toBeVisible({
      timeout: 10000,
    })
  })

  test('should close dialog after successful creation', async ({ page }) => {
    await page.route('**/api/github/file', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)
    await page.click('button:has-text("New")')

    await page.fill('#slug', 'test-post-2')
    await page.fill('#title', 'Test Post 2')
    await page.fill('#description', 'Description')
    await page.fill('#category', 'Test')

    await page.click('button:has-text("Create")')
    await expect(page.locator('.create-dialog')).not.toBeVisible({
      timeout: 10000,
    })
  })
})
