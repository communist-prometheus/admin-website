import { expect, test } from '@playwright/test'
import { waitForContentReady } from '../helpers/content-ready'

test.describe('Save & Deploy Flow', () => {
  test('save button shows spinner then checkmark', async ({ page }) => {
    await page.goto('/content/blog')
    await waitForContentReady(page)

    const firstArticle = page.locator('h3').first()
    await firstArticle.click()
    await page.waitForURL(/\/edit\//)
    await waitForContentReady(page)

    const saveBtn = page.getByTestId('save-button')
    await expect(saveBtn).toContainText('Save')

    await saveBtn.click()

    await expect(saveBtn).toHaveClass(/saving/)
    await expect(saveBtn).toContainText('')

    await expect(saveBtn).toContainText('Saved', { timeout: 30000 })
    await expect(saveBtn).toHaveClass(/done/)

    await expect(saveBtn).toContainText('Save', { timeout: 5000 })
  })

  test('save commit response has expected shape', async ({ page }) => {
    await page.goto('/content/blog')
    await waitForContentReady(page)

    const firstArticle = page.locator('h3').first()
    await firstArticle.click()
    await page.waitForURL(/\/edit\//)
    await waitForContentReady(page)

    const saveBtn = page.getByTestId('save-button')
    const commitPromise = page.waitForResponse(
      r => r.url().includes('/api/github/commit')
    )
    await saveBtn.click()
    const commitResponse = await commitPromise
    const body = await commitResponse.json()
    expect(body).toHaveProperty('success')
    expect(body).toHaveProperty('sha')
  })

  test('deploy tracking starts after save', async ({ page }) => {
    await page.goto('/content/blog')
    await waitForContentReady(page)

    const firstArticle = page.locator('h3').first()
    await firstArticle.click()
    await page.waitForURL(/\/edit\//)
    await waitForContentReady(page)

    const saveBtn = page.getByTestId('save-button')
    await saveBtn.click()
    await expect(saveBtn).toContainText('Saved', { timeout: 30000 })

    await page.waitForResponse(r => r.url().includes('check-runs'))
  })

  test('home page shows pending deploy after save', async ({ page }) => {
    await page.goto('/content/blog')
    await waitForContentReady(page)

    const firstArticle = page.locator('h3').first()
    await firstArticle.click()
    await page.waitForURL(/\/edit\//)
    await waitForContentReady(page)

    const saveBtn = page.getByTestId('save-button')
    await saveBtn.click()
    await expect(saveBtn).toContainText('Saved', { timeout: 30000 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const deployList = page.locator('.deploy-item')
    await expect(deployList.first()).toBeVisible({ timeout: 15000 })

    const firstBadge = page.locator('.badge').first()
    await expect(firstBadge).toBeVisible()
  })
})

test.describe('Deploy Detail Page', () => {
  test('navigates to deploy detail on click', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const deployItem = page.locator('.deploy-item').first()
    await expect(deployItem).toBeVisible({ timeout: 15000 })
    await deployItem.click()

    await page.waitForURL(/\/deploy\//)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('deploy detail shows commit info', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const deployItem = page.locator('.deploy-item').first()
    await expect(deployItem).toBeVisible({ timeout: 15000 })
    await deployItem.click()
    await page.waitForURL(/\/deploy\//)

    await expect(page.getByText('Commit:')).toBeVisible()
    await expect(page.getByText('Started:')).toBeVisible()
  })

  test('deploy detail shows file changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const deployItem = page.locator('.deploy-item').first()
    await expect(deployItem).toBeVisible({ timeout: 15000 })
    await deployItem.click()
    await page.waitForURL(/\/deploy\//)

    await expect(page.getByText(/Changed Files/)).toBeVisible({
      timeout: 15000,
    })
  })

  test('failed deploy shows error info', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const failBadge = page.locator('.badge').filter({ hasText: 'failure' })
    if ((await failBadge.count()) > 0) {
      await failBadge.first().click()
      await page.waitForURL(/\/deploy\//)
      await expect(page.locator('.lbl').first()).toContainText(/failure/i)
    }
  })
})

test.describe('Home Page Deploy List', () => {
  test('shows recent deployments', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Recent Deployments')).toBeVisible()
    const items = page.locator('.deploy-item')
    await expect(items.first()).toBeVisible({ timeout: 15000 })
    expect(await items.count()).toBeGreaterThan(0)
  })

  test('each deploy has status badge', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const items = page.locator('.deploy-item')
    await expect(items.first()).toBeVisible({ timeout: 15000 })

    const badges = page.locator('.badge')
    expect(await badges.count()).toBeGreaterThan(0)
  })

  test('deploy shows commit message and SHA', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const item = page.locator('.deploy-item').first()
    await expect(item).toBeVisible({ timeout: 15000 })

    await expect(item.locator('.msg')).toBeVisible()
    await expect(item.locator('.sha')).toBeVisible()
  })
})
