import { expect, expectVisible, test, visit } from '@prometheus/e2e-toolkit'
import { waitForContentReady } from '../helpers/content-ready'
import { ContentEditPage } from '../pages/ContentEditPage'

test.describe('Content Loading', () => {
  test('should load correct item counts per section', async ({ page }) => {
    const expected: Record<string, number> = {
      blog: 5,
      pages: 1,
      positions: 2,
    }

    for (const section of ['blog', 'pages', 'positions']) {
      await visit(page, `/content/${section}`)
      await waitForContentReady(page)

      const items = page.locator('[data-testid="content-item"]')
      await expectVisible(page, items.first())
      expect(await items.count()).toBe(expected[section])
    }
  })

  test('should display correct titles per language', async ({ page }) => {
    await visit(page, '/content/blog')
    await waitForContentReady(page)

    await page.getByRole('button', { name: 'English' }).click()
    const items = page.locator('[data-testid="content-item"]')
    await expectVisible(page, items.first())

    const enTitles = (await items.allTextContents()).join(' ')
    expect(enTitles).toContain('Welcome to Prometheus')
    expect(enTitles).toContain('Why Choose Astro Framework')
    expect(enTitles).toContain('Rich Media in Blog Posts')
    expect(enTitles).toContain('Modern Web Development')
    expect(enTitles).toContain('Open Source Collaboration')

    for (const lang of ['Русский', 'Italiano', 'Español']) {
      await page.getByRole('button', { name: lang }).click()
      await expectVisible(page, items.first())
      expect(await items.count()).toBe(5)
    }
  })

  test('should load article body on navigation', async ({ page }) => {
    const entries = [
      { title: 'Welcome to Prometheus', slug: 'welcome-to-prometheus' },
      { title: 'Why Choose Astro Framework', slug: 'astro-framework' },
      { title: 'Rich Media in Blog Posts', slug: 'media-showcase' },
    ]

    for (const entry of entries) {
      const editPage = new ContentEditPage(page)
      await editPage.navigate('blog', entry.slug)

      const content = await editPage.getEditorBody().inputValue()
      expect(content).toContain(entry.title)
    }
  })
})
