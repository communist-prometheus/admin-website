import type { Page } from '@playwright/test'
import { waitForSWControl } from '../helpers/visit-settled'
import { BUTTON_NAMES, SELECTORS } from './constants'

/**
 * Login by setting mock token in localStorage and reloading.
 * @param page - Playwright page
 */
export const loginViaMockOAuth = async (page: Page): Promise<void> => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('gh_token', 'mock-token'))
  await page.reload()
  await waitForSWControl(page)
}

/**
 * Get the user menu button locator.
 * @param page - Playwright page
 */
export const getUserButton = (page: Page) =>
  page.getByRole('button', { name: BUTTON_NAMES.testUser })

/**
 * Get the login button locator.
 * @param page - Playwright page
 */
export const getLoginButton = (page: Page) =>
  page.getByRole('button', { name: BUTTON_NAMES.login })

/**
 * Get the logout button locator.
 * @param page - Playwright page
 */
export const getLogoutButton = (page: Page) =>
  page.getByRole('button', { name: BUTTON_NAMES.logout })

/**
 * Get the different account button locator.
 * @param page - Playwright page
 */
export const getDifferentAccountButton = (page: Page) =>
  page.getByRole('button', {
    name: BUTTON_NAMES.differentAccount,
  })

/**
 * Get the user avatar locator.
 * @param page - Playwright page
 */
export const getUserAvatar = (page: Page) =>
  page.locator(SELECTORS.testUserAvatar)

/**
 * Perform login via localStorage mock.
 * @param page - Playwright page
 */
export const login = async (page: Page): Promise<void> => {
  await loginViaMockOAuth(page)
}

/**
 * Perform logout via UI button click.
 * @param page - Playwright page
 */
export const logout = async (page: Page): Promise<void> => {
  await getUserButton(page).click()
  await page.locator('.dropdown').waitFor({ state: 'visible', timeout: 5000 })
  await getLogoutButton(page).click()
}
