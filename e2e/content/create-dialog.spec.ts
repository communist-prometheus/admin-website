import { expect, test } from '@playwright/test'
import { ContentPage } from '../pages/ContentPage'
import { CreateDialog } from '../pages/CreateDialog'

test.describe('Create Content Dialog', () => {
  test.beforeEach(async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('blog')
  })

  test('should open create dialog when clicking create button', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    const createDialog = new CreateDialog(page)

    await contentPage.clickCreateButton()
    await createDialog.expectToBeVisible()
  })

  test('should close dialog when clicking cancel', async ({ page }) => {
    const contentPage = new ContentPage(page)
    const createDialog = new CreateDialog(page)

    await contentPage.clickCreateButton()
    await createDialog.expectToBeVisible()
    await createDialog.clickCancel()
    await createDialog.expectToBeHidden()
  })

  test('should display all required fields for blog content', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    const createDialog = new CreateDialog(page)

    await contentPage.clickCreateButton()
    await createDialog.expectToBeVisible()
    await createDialog.expectFieldToBeVisible('slug')
    await createDialog.expectFieldToBeVisible('title')
    await createDialog.expectFieldToBeVisible('description')
    await createDialog.expectFieldToBeVisible('category')
  })

  test('should display only basic fields for positions content', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    const createDialog = new CreateDialog(page)

    await contentPage.navigate('positions')
    await contentPage.clickCreateButton()
    await createDialog.expectFieldToBeVisible('slug')
    await createDialog.expectFieldToBeVisible('title')
    await createDialog.expectFieldToBeVisible('description')
    // positions no longer have an Order field — pubDate is auto-set on save
    await createDialog.expectFieldToBeHidden('order')
  })

  test('pages content is fixed-structure: no create flow', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('pages')
    // Pages are a closed set — no Create button, no dialog, no fields.
    await expect(page.getByRole('button', { name: /new/i })).toBeHidden()
    await expect(page.locator('.create-dialog')).toBeHidden()
  })

  test('should keep dialog open when clicking create without data', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    const createDialog = new CreateDialog(page)

    await contentPage.clickCreateButton()
    await createDialog.expectToBeVisible()
    await createDialog.clickSubmit()
    await createDialog.expectToBeVisible()
  })
})
