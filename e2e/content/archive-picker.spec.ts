import { expect, test, visit } from '@prometheus/e2e-toolkit'

test.describe('Archive — section + reference picker', () => {
  test('archive list page shows seeded items', async ({ page }) => {
    await visit(page, '/content/archive')
    await expect(
      page.locator('[data-testid="content-item"]').first()
    ).toBeVisible({ timeout: 20000 })
  })

  test('blog edit form offers existing archive items', async ({ page }) => {
    await page.goto('/content/blog/edit/welcome-to-prometheus', {
      waitUntil: 'domcontentloaded',
    })
    const picker = page.locator('[data-testid="archive-picker"]')
    await expect(picker).toBeVisible({ timeout: 20000 })
    await expect(
      picker.locator('option', { hasText: 'Founding Documents' })
    ).toHaveCount(1, { timeout: 20000 })
  })

  test('selecting an archive sets the control value', async ({ page }) => {
    await page.goto('/content/blog/edit/welcome-to-prometheus', {
      waitUntil: 'domcontentloaded',
    })
    const picker = page.locator('[data-testid="archive-picker"]')
    await expect(picker).toBeVisible({ timeout: 20000 })
    await expect(
      picker.locator('option', { hasText: 'Founding Documents' })
    ).toHaveCount(1, { timeout: 20000 })
    await picker.selectOption({ label: 'Founding Documents' })
    await expect(picker).toHaveValue('founding-documents')
  })
})
