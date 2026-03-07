import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'

interface CreateFormData {
  readonly slug: string
  readonly lang: 'en' | 'ru' | 'it' | 'es'
  readonly title: string
  readonly description?: string
  readonly category?: string
  readonly order?: number
}

export class CreateDialog {
  constructor(private readonly page: Page) {}

  async expectToBeVisible(): Promise<void> {
    await expect(this.page.locator('.create-dialog')).toBeVisible({
      timeout: 10000,
    })
  }

  async expectToBeHidden(): Promise<void> {
    await expect(this.page.locator('.create-dialog')).not.toBeVisible()
  }

  async fillSlug(slug: string): Promise<void> {
    await this.page.locator('#slug').fill(slug)
  }

  async selectLanguage(lang: 'en' | 'ru' | 'it' | 'es'): Promise<void> {
    await this.page.locator(`#lang-${lang}`).check()
  }

  async fillTitle(title: string): Promise<void> {
    await this.page.locator('#title').fill(title)
  }

  async fillDescription(description: string): Promise<void> {
    await this.page.locator('#description').fill(description)
  }

  async fillCategory(category: string): Promise<void> {
    await this.page.locator('#category').fill(category)
  }

  async fillOrder(order: number): Promise<void> {
    await this.page.locator('#order').fill(String(order))
  }

  async fillForm(data: CreateFormData): Promise<void> {
    await this.fillSlug(data.slug)
    await this.selectLanguage(data.lang)
    await this.fillTitle(data.title)

    if (data.description) {
      await this.fillDescription(data.description)
    }

    if (data.category) {
      await this.fillCategory(data.category)
    }

    if (data.order !== undefined) {
      await this.fillOrder(data.order)
    }
  }

  async clickSubmit(): Promise<void> {
    await this.page.getByRole('button', { name: /create/i }).click()
    await waitForNetworkIdle(this.page)
  }

  async clickCancel(): Promise<void> {
    await this.page.getByRole('button', { name: /cancel/i }).click()
    await waitForNetworkIdle(this.page, { idleTime: 300 })
  }

  async expectFieldToBeVisible(fieldId: string): Promise<void> {
    await expect(this.page.locator(`#${fieldId}`)).toBeVisible()
  }

  async expectFieldToBeHidden(fieldId: string): Promise<void> {
    await expect(this.page.locator(`#${fieldId}`)).not.toBeVisible()
  }
}
