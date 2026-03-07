import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { login } from '../auth/helpers'
import { waitForNetworkIdle } from '../helpers/network'

export class AuthPage {
  constructor(private readonly page: Page) {}

  async clickUserMenu(): Promise<void> {
    await this.page.getByRole('button', { name: /test user/i }).click()
    await waitForNetworkIdle(this.page, { idleTime: 200 })
  }

  async clickLogout(): Promise<void> {
    await this.page
      .locator('.dropdown')
      .waitFor({ state: 'visible', timeout: 5000 })
    await this.page.getByRole('button', { name: /logout/i }).click()
  }

  async expectLoginButtonVisible(): Promise<void> {
    await expect(
      this.page.getByRole('button', { name: /login/i })
    ).toBeVisible()
  }

  async expectUserMenuVisible(): Promise<void> {
    await expect(
      this.page.getByRole('button', { name: /test user/i })
    ).toBeVisible({ timeout: 10000 })
  }

  async expectDropdownVisible(): Promise<void> {
    await expect(this.page.locator('.dropdown')).toBeVisible()
  }

  /**
   * Mock authentication via server-side mock OAuth
   */
  async mockLogin(): Promise<void> {
    await login(this.page)
  }

  /**
   * Clear authentication by logging out
   */
  async clearAuth(): Promise<void> {
    await this.page.goto('/api/auth/logout')
    await this.page.goto('/')
    await waitForNetworkIdle(this.page)
  }
}
