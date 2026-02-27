import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { waitForContentLoad, waitForNetworkIdle } from '../helpers/network'

export class ContentPage {
  constructor(private readonly page: Page) {}

  async navigate(contentType: 'blog' | 'pages' | 'positions'): Promise<void> {
    await this.page.goto(`/content/${contentType}`)
    await waitForContentLoad(this.page, contentType)
    await waitForNetworkIdle(this.page)
  }

  async clickCreateButton(): Promise<void> {
    await this.page.getByRole('button', { name: /create new/i }).click()
    await waitForNetworkIdle(this.page, { idleTime: 300 })
  }

  async expectToBeVisible(): Promise<void> {
    await expect(this.page.locator('.content-view')).toBeVisible()
  }

  async expectItemCount(count: number): Promise<void> {
    await expect(this.page.locator('.content-item')).toHaveCount(count)
  }

  async expectItemWithTitle(title: string): Promise<void> {
    await expect(
      this.page.locator('.content-item').filter({ hasText: title })
    ).toBeVisible()
  }

  async selectItem(title: string): Promise<void> {
    await this.page
      .locator('.content-item')
      .filter({ hasText: title })
      .click()
    await waitForNetworkIdle(this.page, { idleTime: 300 })
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.page.getByText(/no content items found/i)).toBeVisible()
  }

  async selectLanguage(lang: 'en' | 'ru' | 'it' | 'es'): Promise<void> {
    await this.page.click(`button[data-lang="${lang}"]`)
    await waitForNetworkIdle(this.page, { idleTime: 300 })
  }
}
