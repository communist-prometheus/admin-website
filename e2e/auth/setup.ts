import type { FullConfig } from '@playwright/test'
import { chromium } from '@playwright/test'

const STORAGE_PATH = 'e2e/.auth/state.json'

/**
 * Global setup: log in once and save storageState.
 * @param config - Playwright full config
 */
const globalSetup = async (config: FullConfig): Promise<void> => {
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(`${baseURL}/api/auth/github`)
  await page.waitForURL(`${baseURL}/`)
  await page.context().storageState({ path: STORAGE_PATH })
  await browser.close()
}

export default globalSetup
