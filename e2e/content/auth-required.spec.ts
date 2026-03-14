import { expect, test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authentication Required', () => {
  test('should show login message on blog page without auth', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await waitForNetworkIdle(page)

    await expect(page.getByText(/log in/i)).toBeVisible()
  })

  test('should show login message on positions page without auth', async ({
    page,
  }) => {
    await page.goto('/content/positions')
    await waitForNetworkIdle(page)

    await expect(page.getByText(/log in/i)).toBeVisible()
  })

  test('should show login message on pages page without auth', async ({
    page,
  }) => {
    await page.goto('/content/pages')
    await waitForNetworkIdle(page)

    await expect(page.getByText(/log in/i)).toBeVisible()
  })

  test('should show login button in header when not authenticated', async ({
    page,
  }) => {
    await page.goto('/')
    await waitForNetworkIdle(page)

    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('should not show content items without authentication', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await waitForNetworkIdle(page)

    await expect(
      page.locator('[data-testid="content-item"]')
    ).not.toBeVisible()
  })
})
