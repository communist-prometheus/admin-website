import { expect, test } from '@prometheus/e2e-toolkit'
import { waitForContentReady } from '../helpers/content-ready'
import { openPreview, saveAndConfirm } from './preview-save'

const openFirstArticle = async (page: import('@playwright/test').Page) => {
  await page.goto('/content/blog')
  await waitForContentReady(page)
  await page.locator('h3').first().click()
  await page.waitForURL(/\/edit\//)
  await waitForContentReady(page)
}

test.describe('Save Button States', () => {
  test('shows Save text initially', async ({ page }) => {
    await openFirstArticle(page)
    const btn = await openPreview(page)
    await expect(btn).toContainText('Save')
    await expect(btn).toBeEnabled()
  })

  test('preview closes after save completes', async ({ page }) => {
    await openFirstArticle(page)
    await saveAndConfirm(page, await openPreview(page))
    await expect(page.locator('[data-testid="preview-button"]')).toBeVisible({
      timeout: 30000,
    })
  })
})

test.describe('Save Network Requests', () => {
  test('stage request succeeds', async ({ page }) => {
    await openFirstArticle(page)
    const p = page.waitForResponse(r =>
      r.url().includes('/api/github/file/stage')
    )
    await saveAndConfirm(page, await openPreview(page))
    expect((await p).status()).toBe(200)
  })

  test('commit response has success and sha', async ({ page }) => {
    await openFirstArticle(page)
    const p = page.waitForResponse(r =>
      r.url().includes('/api/github/commit')
    )
    await saveAndConfirm(page, await openPreview(page))
    const body = await (await p).json()
    expect(body).toHaveProperty('success')
    expect(body).toHaveProperty('sha')
  })
})

test.describe('Deploy Bar After Save', () => {
  test('deploy bar appears after save', async ({ page }) => {
    await openFirstArticle(page)
    await saveAndConfirm(page, await openPreview(page))
    await expect(page.locator('[data-testid="preview-button"]')).toBeVisible({
      timeout: 30000,
    })
    await expect(page.locator('.deploy-bar')).toBeVisible({
      timeout: 15000,
    })
  })
})
