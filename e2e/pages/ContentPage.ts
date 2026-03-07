import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'

export class ContentPage {
  constructor(private readonly page: Page) {}

  async navigate(contentType: 'blog' | 'pages' | 'positions'): Promise<void> {
    await this.page.goto(`/content/${contentType}`, {
      waitUntil: 'domcontentloaded',
    })
    await this.page.waitForSelector('[data-testid="content-list"]', {
      state: 'visible',
      timeout: 20000,
    })
    await waitForNetworkIdle(this.page, { idleTime: 1000 })
  }

  async clickCreateButton(): Promise<void> {
    await this.page.getByRole('button', { name: /new/i }).click()
    await waitForNetworkIdle(this.page, { idleTime: 300 })
  }

  async expectToBeVisible(): Promise<void> {
    await expect(
      this.page.locator('[data-testid="content-list"]')
    ).toBeVisible({ timeout: 15000 })
  }

  async expectItemCount(minCount: number): Promise<void> {
    await expect(
      this.page.locator('[data-testid="content-item"]')
    ).toHaveCount(minCount, { timeout: 15000 })
  }

  async expectItemWithTitle(title: string): Promise<void> {
    await expect(
      this.page
        .locator('[data-testid="content-item"]')
        .filter({ hasText: title })
        .first()
    ).toBeVisible({ timeout: 15000 })
  }

  async selectItem(title: string): Promise<void> {
    const item = this.page
      .locator('[data-testid="content-item"]')
      .filter({ hasText: title })
    await item.waitFor({ state: 'visible' })
    await item.click()
    await this.page.waitForTimeout(100)
    await waitForNetworkIdle(this.page, { idleTime: 500 })
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.page.getByText(/no content items found/i)).toBeVisible()
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
    await button.waitFor({ state: 'visible', timeout: 10000 })
    await button.click()
    await this.page.waitForTimeout(500)
    await waitForNetworkIdle(this.page, { idleTime: 1000 })
  }
}
