import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'

export class AuthPage {
  constructor(private readonly page: Page) {}

  async clickUserMenu(): Promise<void> {
    await this.page.getByRole('button', { name: /test user/i }).click()
    await waitForNetworkIdle(this.page, { idleTime: 200 })
  }

  async clickLogout(): Promise<void> {
    await this.page.getByRole('button', { name: /logout/i }).click()
    await waitForNetworkIdle(this.page)
  }

  async expectLoginButtonVisible(): Promise<void> {
    await expect(
      this.page.getByRole('button', { name: /login/i })
    ).toBeVisible()
  }

  async expectUserMenuVisible(): Promise<void> {
    await expect(
      this.page.getByRole('button', { name: /test user/i })
    ).toBeVisible()
  }

  async expectDropdownVisible(): Promise<void> {
    await expect(this.page.locator('.user-dropdown')).toBeVisible()
  }

  /**
   * Mock authentication by setting localStorage
   * This simulates successful OAuth without popup
   */
  async mockLogin(): Promise<void> {
    await this.page.evaluate(() => {
      globalThis.localStorage.setItem(
        'auth',
        JSON.stringify({
          user: {
            id: '12345',
            name: 'Test User',
            email: 'test@example.com',
            avatar_url: 'https://github.com/ghost.png',
          },
        })
      )
    })
    await this.page.reload()
    await waitForNetworkIdle(this.page)
  }

  /**
   * Clear authentication
   */
  async clearAuth(): Promise<void> {
    await this.page.evaluate(() => {
      globalThis.localStorage.removeItem('auth')
    })
    await this.page.reload()
    await waitForNetworkIdle(this.page)
  }
}
