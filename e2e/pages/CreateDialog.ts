import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { click } from '@prometheus/e2e-toolkit'

interface CreateFormData {
  readonly slug: string
  readonly lang: 'en' | 'ru' | 'it' | 'es'
  readonly title: string
  readonly description?: string
  readonly category?: string
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
    // The current CreateContentDialog takes `lang` from props — there is no
    // in-dialog language selector. Legacy tests still call this helper, so
    // we swallow the failure to avoid breaking them.
    const radio = this.page.locator(`#lang-${lang}`)
    if (await radio.count()) {
      await radio.check()
    }
  }

  async fillTitle(title: string): Promise<void> {
    await this.page.locator('#title').fill(title)
  }

  async fillDescription(description: string): Promise<void> {
    await this.page.locator('#description').fill(description)
  }

  async selectCategory(category: string): Promise<void> {
    // #category is a <select>, not a text input.
    await this.page.locator('#category').selectOption(category)
  }

  async fillForm(data: CreateFormData): Promise<void> {
    await this.fillSlug(data.slug)
    await this.selectLanguage(data.lang)
    await this.fillTitle(data.title)

    if (data.description) {
      await this.fillDescription(data.description)
    }

    if (data.category) {
      await this.selectCategory(data.category)
    }
  }

  async clickSubmit(): Promise<void> {
    await click(this.page, this.page.getByRole('button', { name: /create/i }))
  }

  async clickCancel(): Promise<void> {
    await click(this.page, this.page.getByRole('button', { name: /cancel/i }))
  }

  async expectFieldToBeVisible(fieldId: string): Promise<void> {
    await expect(this.page.locator(`#${fieldId}`)).toBeVisible()
  }

  async expectFieldToBeHidden(fieldId: string): Promise<void> {
    await expect(this.page.locator(`#${fieldId}`)).not.toBeVisible()
  }
}
