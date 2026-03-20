import type { FullConfig } from '@playwright/test'
import { chromium } from '@playwright/test'

const STORAGE_PATH = 'e2e/.auth/state.json'

/**
 * Global setup: set mock token in localStorage and save state.
 * With VITE_MOCK_AUTH=true, the app returns mock user
 * automatically when a token exists in localStorage.
 * @param config - Playwright full config
 */
const globalSetup = async (config: FullConfig): Promise<void> => {
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(`${baseURL}/`)
  await page.evaluate(() => localStorage.setItem('gh_token', 'mock-token'))
  await page.reload()
  await page.waitForLoadState('networkidle')
  await page.context().storageState({ path: STORAGE_PATH })
  await browser.close()
}

export default globalSetup
