import { expect, test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authentication Required', () => {
  test('should redirect blog to home without auth', async ({ page }) => {
    await page.goto('/content/blog')
    await waitForNetworkIdle(page)

    await expect(page).toHaveURL('/')
  })

  test('should redirect positions to home without auth', async ({ page }) => {
    await page.goto('/content/positions')
    await waitForNetworkIdle(page)

    await expect(page).toHaveURL('/')
  })

  test('should redirect pages to home without auth', async ({ page }) => {
    await page.goto('/content/pages')
    await waitForNetworkIdle(page)

    await expect(page).toHaveURL('/')
  })

  test('should show login button in header when not authenticated', async ({
    page,
  }) => {
    await page.goto('/')
    await waitForNetworkIdle(page)

    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
  })

  test('should not show content nav links without auth', async ({ page }) => {
    await page.goto('/')
    await waitForNetworkIdle(page)

    await expect(page.getByRole('link', { name: /blog/i })).not.toBeVisible()
    await expect(
      page.getByRole('link', { name: /positions/i })
    ).not.toBeVisible()
    await expect(page.getByRole('link', { name: /pages/i })).not.toBeVisible()
  })
})
