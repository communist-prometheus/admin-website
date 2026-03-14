import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Page object for asset management UI on blog edit pages.
 */
export class AssetManagerPage {
  constructor(private readonly page: Page) {}

  /** Navigate to a blog post edit page and wait for editor */
  async navigateToBlog(slug: string): Promise<void> {
    await this.page.goto(`/content/blog/edit/${slug}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(this.getEditorBody()).toBeVisible({
      timeout: 20000,
    })
    await expect(this.getEditorBody()).not.toHaveValue('', {
      timeout: 20000,
    })
  }

  getEditorBody(): Locator {
    return this.page.locator('[data-testid="editor-body"]')
  }

  getCoverImage(): Locator {
    return this.page.locator('[data-testid="cover-image"]')
  }

  getCoverOverlay(): Locator {
    return this.page.locator('[data-testid="cover-overlay"]')
  }

  getCoverDeleteBtn(): Locator {
    return this.page.locator('[data-testid="cover-delete-btn"]')
  }

  getCoverUploadBtn(): Locator {
    return this.page.locator('[data-testid="cover-upload-btn"]')
  }

  getAssetPanel(): Locator {
    return this.page.locator('[data-testid="asset-panel"]')
  }

  getAssetThumbnails(): Locator {
    return this.page.locator('[data-testid="asset-thumbnail"]')
  }

  /** Get a specific asset thumbnail by file name */
  getThumbByName(name: string): Locator {
    return this.page.locator(
      `[data-testid="asset-thumbnail"][data-name="${name}"]`
    )
  }

  getUploadAssetBtn(): Locator {
    return this.page.locator('[data-testid="asset-upload-btn"]')
  }

  getSetCoverBtns(): Locator {
    return this.page.locator('[data-testid="asset-set-cover-btn"]')
  }

  getDeleteAssetBtns(): Locator {
    return this.page.locator('[data-testid="asset-delete-btn"]')
  }

  /** Wait for cover image section to be visible */
  async expectCoverVisible(): Promise<void> {
    await expect(this.getCoverImage()).toBeVisible({
      timeout: 15000,
    })
  }

  /** Wait for asset panel to be visible */
  async expectPanelVisible(): Promise<void> {
    await expect(this.getAssetPanel()).toBeVisible({
      timeout: 15000,
    })
  }

  /** Get asset count in the panel */
  async getAssetCount(): Promise<number> {
    return this.getAssetThumbnails().count()
  }

  /** Hover over cover to reveal overlay buttons */
  async hoverCover(): Promise<void> {
    await this.getCoverImage().hover()
  }
}
