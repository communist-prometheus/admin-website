import { expect, test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'

test.describe('Content Creation', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page)
    await page.goto('/')
    await waitForNetworkIdle(page)
    await authPage.mockLogin()
  })

  test('should show create button on blog page', async ({ page }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('button', { name: /new/i })).toBeVisible()
  })

  test('should show create button on positions page', async ({ page }) => {
    await page.goto('/content/positions')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('button', { name: /new/i })).toBeVisible()
  })

  test('should show create button on pages page', async ({ page }) => {
    await page.goto('/content/pages')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('button', { name: /new/i })).toBeVisible()
  })

  test('should open create dialog when clicking new button', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')

    await page.click('button:has-text("New")')

    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('should show correct fields for blog content creation', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("New")')

    await expect(page.getByLabel(/slug/i)).toBeVisible()
    await expect(page.getByLabel(/title/i)).toBeVisible()
    await expect(page.getByLabel(/description/i)).toBeVisible()
    await expect(page.getByLabel(/category/i)).toBeVisible()
    await expect(page.getByLabel(/language/i)).toBeVisible()
  })

  test('should show correct fields for positions content creation', async ({
    page,
  }) => {
    await page.goto('/content/positions')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("New")')

    await expect(page.getByLabel(/slug/i)).toBeVisible()
    await expect(page.getByLabel(/title/i)).toBeVisible()
    await expect(page.getByLabel(/description/i)).toBeVisible()
    await expect(page.getByLabel(/order/i)).toBeVisible()
    await expect(page.getByLabel(/language/i)).toBeVisible()
  })

  test('should show correct fields for pages content creation', async ({
    page,
  }) => {
    await page.goto('/content/pages')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("New")')

    await expect(page.getByLabel(/slug/i)).toBeVisible()
    await expect(page.getByLabel(/title/i)).toBeVisible()
    await expect(page.getByLabel(/language/i)).toBeVisible()
  })

  test('should validate required fields in create dialog', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("New")')

    await page.click('button:has-text("Create")')

    await expect(page.locator('text=/required/i')).toBeVisible()
  })

  test('should create new content when form is submitted', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("New")')

    const createPromise = page.waitForResponse(
      resp =>
        resp.url().includes('/api/github/content') &&
        resp.request().method() === 'POST'
    )

    await page.fill('input[name="slug"]', 'test-post')
    await page.fill('input[name="title"]', 'Test Post')
    await page.fill('textarea[name="description"]', 'Test description')
    await page.fill('input[name="category"]', 'Test')
    await page.selectOption('select[name="lang"]', 'en')

    await page.click('button:has-text("Create")')

    const response = await createPromise
    expect(response.status()).toBe(200)
  })

  test('should close dialog after successful creation', async ({ page }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("New")')

    await page.fill('input[name="slug"]', 'test-post-2')
    await page.fill('input[name="title"]', 'Test Post 2')
    await page.fill('textarea[name="description"]', 'Description')
    await page.fill('input[name="category"]', 'Test')
    await page.selectOption('select[name="lang"]', 'en')

    await page.click('button:has-text("Create")')
    await page.waitForTimeout(2000)

    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should show new item in list after creation', async ({ page }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')

    const initialCount = await page
      .locator('[data-testid="content-item"]')
      .count()

    await page.click('button:has-text("New")')
    await page.fill('input[name="slug"]', 'new-test-post')
    await page.fill('input[name="title"]', 'New Test Post')
    await page.fill('textarea[name="description"]', 'Description')
    await page.fill('input[name="category"]', 'Test')
    await page.selectOption('select[name="lang"]', 'en')
    await page.click('button:has-text("Create")')

    await page.waitForTimeout(2000)
    await page.reload()
    await page.waitForLoadState('networkidle')

    const newCount = await page
      .locator('[data-testid="content-item"]')
      .count()
    expect(newCount).toBeGreaterThan(initialCount)
  })
})
