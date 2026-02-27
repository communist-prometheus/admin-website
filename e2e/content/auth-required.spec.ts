import { expect, test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'

test.describe('Authentication Required', () => {
  test('should redirect to home when accessing blog without auth', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await waitForNetworkIdle(page)

    // Should not show content editor without auth
    await expect(
      page.locator('[data-testid="markdown-editor"]')
    ).not.toBeVisible()
  })

  test('should redirect to home when accessing positions without auth', async ({
    page,
  }) => {
    await page.goto('/content/positions')
    await waitForNetworkIdle(page)

    await expect(
      page.locator('[data-testid="markdown-editor"]')
    ).not.toBeVisible()
  })

  test('should redirect to home when accessing pages without auth', async ({
    page,
  }) => {
    await page.goto('/content/pages')
    await waitForNetworkIdle(page)

    await expect(
      page.locator('[data-testid="markdown-editor"]')
    ).not.toBeVisible()
  })

  test('should not show create button without auth', async ({ page }) => {
    await page.goto('/content/blog')
    await waitForNetworkIdle(page)

    await expect(page.getByRole('button', { name: /new/i })).not.toBeVisible()
  })

  test('should show login message on content pages without auth', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await waitForNetworkIdle(page)

    await expect(page.locator('text=/login/i')).toBeVisible()
  })

  test('should show login button in header when not authenticated', async ({
    page,
  }) => {
    await page.goto('/')
    await waitForNetworkIdle(page)

    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('should not load content from API without authentication', async ({
    page,
  }) => {
    const responses: string[] = []

    page.on('response', response => {
      if (response.url().includes('/api/github/content')) {
        responses.push(response.url())
      }
    })

    await page.goto('/content/blog')
    await waitForNetworkIdle(page)

    // With mock auth disabled and no real auth, should not make API calls
    expect(responses.length).toBe(0)
  })
})
