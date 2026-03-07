import type { Page } from '@playwright/test'
import { AUTH_ENDPOINTS, BUTTON_NAMES, ROUTES, SELECTORS } from './constants'

export const loginViaMockOAuth = async (page: Page): Promise<void> => {
  await page.goto(AUTH_ENDPOINTS.github)
  await page.waitForURL(ROUTES.home)
}

export const getUserButton = (page: Page) =>
  page.getByRole('button', { name: BUTTON_NAMES.testUser })

export const getLoginButton = (page: Page) =>
  page.getByRole('button', { name: BUTTON_NAMES.login })

export const getLogoutButton = (page: Page) =>
  page.getByRole('button', { name: BUTTON_NAMES.logout })

export const getDifferentAccountButton = (page: Page) =>
  page.getByRole('button', { name: BUTTON_NAMES.differentAccount })

export const getUserAvatar = (page: Page) =>
  page.locator(SELECTORS.testUserAvatar)

export const login = async (page: Page): Promise<void> => {
  await loginViaMockOAuth(page)
}

export const logout = async (page: Page): Promise<void> => {
  await getUserButton(page).click()
  await page.locator('.dropdown').waitFor({ state: 'visible', timeout: 5000 })
  await getLogoutButton(page).click()
}
