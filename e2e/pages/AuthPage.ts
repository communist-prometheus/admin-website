import {
  expectVisible,
  type Page,
  waitForCondition,
} from '@prometheus/e2e-toolkit'
import { login } from '../auth/helpers'

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
    await waitForCondition(this.page, async () => true)
  }

  /**
   * Click the logout button in the dropdown.
   */
  async clickLogout(): Promise<void> {
    await expectVisible(this.page, this.page.locator('.dropdown'))
    await this.page.getByRole('button', { name: /logout/i }).click()
  }

  /**
   * Assert login button is visible.
   */
  async expectLoginButtonVisible(): Promise<void> {
    await expectVisible(
      this.page,
      this.page.getByRole('button', { name: /login/i })
    )
  }

  /**
   * Assert user menu button is visible.
   */
  async expectUserMenuVisible(): Promise<void> {
    await expectVisible(
      this.page,
      this.page.getByRole('button', { name: /test user/i })
    )
  }

  /**
   * Assert dropdown menu is visible.
   */
  async expectDropdownVisible(): Promise<void> {
    await expectVisible(this.page, this.page.locator('.dropdown'))
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
    await this.page.reload({ waitUntil: 'domcontentloaded' })
    await waitForCondition(this.page, async () => true)
  }
}
