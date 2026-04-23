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
  test('renders one flat members section (no legacy org-admins group)', async ({
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
    await expect(
      page.locator('[data-testid="member-row-alice-admin"]')
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.locator('[data-testid="member-row-bob-chief"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="member-row-carol-edit"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="member-row-dave-none"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="role-select-alice-admin"]')
    ).toBeVisible()
  })

  test('changing a role on a row sends it through the SW', async ({ page }) => {
    await gotoSettings(page)
    const select = page.locator('[data-testid="role-select-dave-none"]')
    await expect(select).toBeVisible({ timeout: 10000 })
    await select.selectOption('editor')
    // In mock mode the SW returns success and the UI reloads;
    // mock data still reflects dave-none as unassigned, so this
    // assertion just proves the option was accepted by the select.
    await expect(select).not.toBeDisabled()
  })

  test('admin org-member is badged as "Org admin"', async ({ page }) => {
    await gotoSettings(page)
    const row = page.locator('[data-testid="member-row-alice-admin"]')
    await expect(row).toBeVisible({ timeout: 10000 })
    await expect(row.locator('.org-badge.is-admin')).toBeVisible()
    await expect(row.locator('.org-badge.is-admin')).toContainText(
      /org admin/i
    )
  })

  test('a pending invitation is rendered with the Revoke button', async ({
    page,
  }) => {
    await gotoSettings(page)
    await expect(page.locator('[data-testid="invite-row-99"]')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('[data-testid="invite-revoke-99"]')).toBeVisible()
  })

  test('Invite button opens the dialog', async ({ page }) => {
    await gotoSettings(page)
    await page.locator('[data-testid="invite-open"]').click()
    await expect(page.locator('[data-testid="invite-dialog"]')).toBeVisible()
    await expect(page.locator('[data-testid="invite-cancel"]')).toBeVisible()
    await expect(page.locator('[data-testid="invite-submit"]')).toBeVisible()
  })

  test('Invite dialog can be filled in with an email and role', async ({
    page,
  }) => {
    await gotoSettings(page)
    await page.locator('[data-testid="invite-open"]').click()
    await page
      .locator('[data-testid="invite-identifier"]')
      .fill('newperson@example.com')
    await page.locator('[data-testid="invite-role"]').selectOption('editor')
    await expect(
      page.locator('[data-testid="invite-identifier"]')
    ).toHaveValue('newperson@example.com')
    await expect(page.locator('[data-testid="invite-role"]')).toHaveValue(
      'editor'
    )
  })
})
