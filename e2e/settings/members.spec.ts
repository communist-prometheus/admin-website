import { expect, test } from '@playwright/test'

const gotoSettings = async (
  page: import('@playwright/test').Page
): Promise<void> => {
  await page.goto('/settings')
  await expect(page.locator('[data-testid="members-section"]')).toBeVisible({
    timeout: 15000,
  })
}

test.describe('Members — unified org list with CRUD', () => {
  test('renders one flat members section (no separate org-admins group)', async ({
    page,
  }) => {
    await gotoSettings(page)
    await expect(
      page.locator('[data-testid="org-admins-group"]')
    ).toHaveCount(0)
    await expect(page.locator('[data-testid="members-section"]')).toBeVisible()
  })

  test('lists every org member with an app-role select', async ({ page }) => {
    await gotoSettings(page)
    // Mock fixture returns three members.
    await expect(
      page.locator('[data-testid="member-row-alice-admin"]')
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.locator('[data-testid="member-row-bob-editor"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="member-row-carol-reader"]')
    ).toBeVisible()
    // Each row exposes the role dropdown.
    await expect(
      page.locator('[data-testid="role-select-alice-admin"]')
    ).toBeVisible()
  })

  test('changing a role on a row persists through SW', async ({ page }) => {
    await gotoSettings(page)
    const select = page.locator('[data-testid="role-select-carol-reader"]')
    await expect(select).toBeVisible({ timeout: 10000 })
    await select.selectOption('editor')
    // After the save round-trip the select should hold the new value.
    await expect(select).toHaveValue('editor')
  })

  test('admin org-member is badged as "Org admin"', async ({ page }) => {
    await gotoSettings(page)
    const row = page.locator('[data-testid="member-row-alice-admin"]')
    await expect(row).toBeVisible({ timeout: 10000 })
    await expect(row.locator('.org-badge.is-admin')).toBeVisible()
    await expect(row.locator('.org-badge.is-admin')).toContainText(/org admin/i)
  })
})
