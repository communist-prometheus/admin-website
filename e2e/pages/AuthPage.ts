import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { login } from '../auth/helpers'
import { waitForNetworkIdle } from '../helpers/network'

/**
 * Page object for auth-related test interactions.
 */
export class AuthPage {
  constructor(private readonly page: Page) {}

  /**
   * Click the user menu button.
   */
  async clickUserMenu(): Promise<void> {
    await this.page.getByRole('button', { name: /test user/i }).click()
    await waitForNetworkIdle(this.page, { idleTime: 200 })
  }

  /**
   * Click the logout button in the dropdown.
   */
  async clickLogout(): Promise<void> {
    await this.page
      .locator('.dropdown')
      .waitFor({ state: 'visible', timeout: 5000 })
    await this.page.getByRole('button', { name: /logout/i }).click()
  }

  /**
   * Assert login button is visible.
   */
  async expectLoginButtonVisible(): Promise<void> {
    await expect(
      this.page.getByRole('button', { name: /login/i })
    ).toBeVisible()
  }

  /**
   * Assert user menu button is visible.
   */
  async expectUserMenuVisible(): Promise<void> {
    await expect(
      this.page.getByRole('button', { name: /test user/i })
    ).toBeVisible({ timeout: 10000 })
  }

  /**
   * Assert dropdown menu is visible.
   */
  async expectDropdownVisible(): Promise<void> {
    await expect(this.page.locator('.dropdown')).toBeVisible()
  }

  /**
   * Mock authentication via localStorage.
   */
  async mockLogin(): Promise<void> {
    await login(this.page)
  }

  /**
   * Clear authentication by removing token and reloading.
   */
  async clearAuth(): Promise<void> {
    await this.page.evaluate(() => localStorage.removeItem('gh_token'))
    await this.page.reload()
    await waitForNetworkIdle(this.page)
  }
}
