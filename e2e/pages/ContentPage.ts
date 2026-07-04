import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { click, visit, waitForCondition } from '@prometheus/e2e-toolkit'
import { waitForContentReady } from '../helpers/content-ready'

type ContentType = 'blog' | 'pages' | 'positions'

/*
 * Toolkit-backed page object: visit/click already settle on the
 * request graph (50 ms quiet window), so the previous fixed
 * waitForTimeout(100/500) sleeps and 300–1000 ms idle windows are
 * gone — they were pure wall-clock tax on every spec using this
 * page object.
 *
 * Section data arrives over the SW MessageChannel, which the
 * request graph cannot see — after a section change the list keeps
 * the PREVIOUS section's items until the SW answers. The honest,
 * event-shaped readiness signal is therefore the items themselves:
 * each carries data-path, and the list belongs to a section once
 * its first item's path lives under that section's directory.
 */
export class ContentPage {
  constructor(private readonly page: Page) {}

  private async waitForSection(contentType: ContentType): Promise<void> {
    const first = this.page.locator('[data-testid="content-item"]').first()
    const empty = this.page.getByText(/no content items found/i)
    await waitForCondition(this.page, async () => {
      const path = await first.getAttribute('data-path').catch(() => null)
      const matches = path?.startsWith(`${contentType}/`)
      return matches || (await empty.isVisible().catch(() => false))
    })
  }

  async navigate(contentType: ContentType): Promise<void> {
    await visit(this.page, `/content/${contentType}`)
    await waitForContentReady(this.page)
    await this.page.waitForSelector('[data-testid="content-list"]', {
      state: 'visible',
      timeout: 20000,
    })
    await this.waitForSection(contentType)
  }

  /**
   * In-app section switch via the nav link. Waits until the list
   * actually shows the target section's items — not just the URL.
   * @param contentType - Target content section
   */
  async switchSection(contentType: ContentType): Promise<void> {
    /*
     * Content links live under the "Content" dropdown on the desktop
     * nav. Open the group first so the link is mounted, then click.
     */
    await click(this.page, this.page.getByTestId('nav-group-content'))
    await click(
      this.page,
      this.page.locator(`a[href="/content/${contentType}"]`).first()
    )
    await this.page.waitForURL(`/content/${contentType}`)
    await this.waitForSection(contentType)
  }

  async clickCreateButton(): Promise<void> {
    await click(this.page, this.page.getByRole('button', { name: /new/i }))
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
    await click(this.page, item)
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
    await click(this.page, button)
  }
}
