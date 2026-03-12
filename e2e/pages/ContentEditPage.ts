import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Page object for the content edit page
 * at /content/:type/edit/:slug
 */
export class ContentEditPage {
  constructor(private readonly page: Page) {}

  async navigate(
    type: 'blog' | 'pages' | 'positions',
    slug: string
  ): Promise<void> {
    await this.page.goto(`/content/${type}/edit/${slug}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(this.getEditorBody()).toBeVisible({ timeout: 20000 })
    await expect(this.getEditorBody()).not.toHaveValue('', {
      timeout: 20000,
    })
  }

  async selectLanguage(lang: 'en' | 'ru' | 'it' | 'es'): Promise<void> {
    const langNames: Record<string, string> = {
      en: 'English',
      ru: 'Русский',
      it: 'Italiano',
      es: 'Español',
    }
    const button = this.page.getByRole('button', {
      name: langNames[lang] ?? lang,
    })
    await button.click()
  }

  getEditorBody(): Locator {
    return this.page.locator('[data-testid="editor-body"]')
  }

  async togglePreview(): Promise<void> {
    await this.page.locator('[data-testid="preview-toggle"]').click()
  }

  async expectPreviewVisible(): Promise<void> {
    await expect(
      this.page.locator('[data-testid="markdown-preview"]')
    ).toBeVisible({ timeout: 5000 })
  }

  async expectEditorVisible(): Promise<void> {
    await expect(
      this.page.locator('[data-testid="editor-body"]')
    ).toBeVisible({ timeout: 5000 })
  }

  async expectTitle(slug: string): Promise<void> {
    await expect(this.page.locator('[data-testid="edit-title"]')).toHaveText(
      slug,
      { timeout: 5000 }
    )
  }

  async clickBack(): Promise<void> {
    await this.page.locator('[data-testid="back-button"]').click()
  }

  getLanguageButton(lang: string): Locator {
    return this.page.locator(
      `[data-testid="language-selector"] [data-lang="${lang}"]`
    )
  }
}
