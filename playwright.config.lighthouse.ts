import { devices } from '@playwright/test'

/**
 * Build a lighthouse project config.
 * @param name - Project name suffix (desktop/mobile)
 * @param port - Remote debugging port
 * @returns Playwright project config
 */
const lh = (name: string, port: number) => ({
  name: `lighthouse-${name}`,
  testMatch: [`**/lighthouse/${name}.spec.ts`],
  use: {
    ...devices['Desktop Chrome'],
    launchOptions: { args: [`--remote-debugging-port=${port}`] },
  },
})

/** Lighthouse projects: desktop, mobile, desktop-auth */
export const lighthouseProjects = [
  lh('desktop', 9222),
  lh('mobile', 9223),
  lh('desktop-auth', 9224),
]
