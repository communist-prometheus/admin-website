import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { waitForContentLoad, waitForNetworkIdle } from '../helpers/network'

export class ContentPage {
  constructor(private readonly page: Page) {}

  async navigate(contentType: 'blog' | 'pages' | 'positions'): Promise<void> {
    await this.page.goto(`/content/${contentType}`, { waitUntil: 'domcontentloaded' })
    await this.page.waitForSelector('[data-testid="content-list"]', { state: 'visible', timeout: 20000 })
    await waitForNetworkIdle(this.page, { idleTime: 1000 })
  }

  async clickCreateButton(): Promise<void> {
    await this.page.getByRole('button', { name: /create new/i }).click()
    await waitForNetworkIdle(this.page, { idleTime: 300 })
  }

  async expectToBeVisible(): Promise<void> {
    await expect(this.page.locator('.content-view')).toBeVisible({
      timeout: 15000,
    })
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.page.locator('.content-item')).toHaveCount(count, {
      timeout: 15000,
    })
  }

  async expectItemWithTitle(title: string): Promise<void> {
    await expect(
      this.page.locator('.content-item').filter({ hasText: title })
    ).toBeVisible({ timeout: 15000 })
  }

  async selectItem(title: string): Promise<void> {
    const item = this.page.locator('.content-item').filter({ hasText: title })
    await item.waitFor({ state: 'visible' })
    await item.click()
    await this.page.waitForTimeout(100)
    await waitForNetworkIdle(this.page, { idleTime: 500 })
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.page.getByText(/no content items found/i)).toBeVisible()
  }

  async selectLanguage(lang: 'en' | 'ru' | 'it' | 'es'): Promise<void> {
    const button = this.page.locator(`button[data-lang="${lang}"]`)
    await button.waitFor({ state: 'visible', timeout: 10000 })
    await button.click()
    await expect(button).toHaveClass(/active/, { timeout: 10000 })
    await this.page.waitForTimeout(300)
    await waitForNetworkIdle(this.page, { idleTime: 1000 })
  }
}
