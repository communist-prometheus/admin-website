import { test } from '@playwright/test'
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

  test('should display order field for positions content', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    const createDialog = new CreateDialog(page)

    await contentPage.navigate('positions')
    await contentPage.clickCreateButton()
    await createDialog.expectFieldToBeVisible('order')
  })

  test('should not display category field for pages content', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    const createDialog = new CreateDialog(page)

    await contentPage.navigate('pages')
    await contentPage.clickCreateButton()
    await createDialog.expectFieldToBeHidden('category')
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
