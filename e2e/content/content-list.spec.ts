import { test } from '@playwright/test'
import { ContentPage } from '../pages/ContentPage'

test.describe('Content List', () => {
  test.beforeEach(async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('blog')
  })

  test('should display content list', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })

  test('should display create new button', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })

  test('should show empty state when no content', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('pages')
  })

  test('should display content items with metadata', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })

  test('should select content item on click', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })
})
