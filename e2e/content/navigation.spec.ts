import { expect, test } from '@prometheus/e2e-toolkit'
import { ContentPage } from '../pages/ContentPage'

test.describe('Content Navigation', () => {
  test('should navigate to blog content', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('blog')
    await expect(page).toHaveURL('/content/blog')
    await contentPage.expectToBeVisible()
  })

  test('should navigate to positions content', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('positions')
    await expect(page).toHaveURL('/content/positions')
    await contentPage.expectToBeVisible()
  })

  test('should navigate to pages content', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('pages')
    await expect(page).toHaveURL('/content/pages')
    await contentPage.expectToBeVisible()
  })

  test('should display content navigation links', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('blog')
    await contentPage.expectToBeVisible()
  })

  test('should switch between content types using navigation', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)

    await contentPage.navigate('blog')
    await expect(page).toHaveURL('/content/blog')

    await contentPage.navigate('positions')
    await expect(page).toHaveURL('/content/positions')

    await contentPage.navigate('pages')
    await expect(page).toHaveURL('/content/pages')
  })
})
