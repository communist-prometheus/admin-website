import { expect, test } from '@playwright/test'
import { waitForContentReady } from '../helpers/content-ready'

test.describe('Content Creation', () => {
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

  test('should NOT show create button on pages page (fixed structure)', async ({
    page,
  }) => {
    await page.goto('/content/pages')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    // pages are a fixed set (home, blog-listing, positions-listing, manifest)
    // → create is intentionally disabled for fixed-structure content types.
    await expect(page.getByRole('button', { name: /new/i })).toBeHidden()
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
    // Order field was removed when positions migrated to pubDate sorting.
    await expect(page.locator('#order')).toBeHidden()
  })

  test('pages content is fixed-structure and cannot be created', async ({
    page,
  }) => {
    await page.goto('/content/pages')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    // No New button → no dialog to open. This replaces the old broken
    // "show correct fields for pages content creation" test.
    await expect(page.getByRole('button', { name: /new/i })).toBeHidden()
    await expect(page.locator('.create-dialog')).toBeHidden()
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

  // Create dialog no longer calls any API — it stores a draft in
  // sessionStorage and navigates to the edit page.

  test('should create new content when form is submitted', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)
    await page.click('button:has-text("New")')
    await expect(page.locator('.create-dialog')).toBeVisible()

    await page.fill('#slug', 'test-post')
    await page.fill('#title', 'Test Post')
    await page.fill('#description', 'Test description')
    // #category is a <select>, populated from the labels store. Use selectOption.
    await page
      .locator('#category')
      .selectOption({ index: 1 })
      .catch(() => page.locator('#category').selectOption('technology'))

    await page.click('button:has-text("Create")')

    await expect(page.locator('.create-dialog')).not.toBeVisible({
      timeout: 10000,
    })
  })

  test('should close dialog after successful creation', async ({ page }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)
    await page.click('button:has-text("New")')

    await page.fill('#slug', 'test-post-2')
    await page.fill('#title', 'Test Post 2')
    await page.fill('#description', 'Description')
    await page
      .locator('#category')
      .selectOption({ index: 1 })
      .catch(() => page.locator('#category').selectOption('technology'))

    await page.click('button:has-text("Create")')
    await expect(page.locator('.create-dialog')).not.toBeVisible({
      timeout: 10000,
    })
  })
})
