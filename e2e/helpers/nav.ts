import type { Page } from '@playwright/test'

const GROUP_BY_PATH: Record<string, string> = {
  '/content/blog': 'content',
  '/content/positions': 'content',
  '/content/pages': 'content',
  '/content/common': 'content',
  '/content/newspaper': 'content',
  '/content/archive': 'content',
  '/labels': 'community',
  '/tickets': 'community',
  '/comms': 'distribution',
  '/features': 'distribution',
  '/settings': 'admin',
}

const groupFor = (path: string): string | undefined =>
  Object.entries(GROUP_BY_PATH).find(([prefix]) =>
    path.startsWith(prefix)
  )?.[1]

/**
 * Open the desktop nav dropdown containing `path` and click the link.
 * Handles the group-per-menu structure introduced when the top nav
 * was collapsed — a plain `page.click('a[href="…"]')` inside `app-nav`
 * misses because the link is only mounted once its group is open.
 *
 * @param page The Playwright Page.
 * @param path Target route path (matches a link's `href` prefix).
 */
export const clickAppNavLink = async (
  page: Page,
  path: string
): Promise<void> => {
  const group = groupFor(path)
  const nav = page.getByTestId('app-nav')
  await (group
    ? nav.getByTestId(`nav-group-${group}`).click()
    : Promise.resolve())
  await nav.locator(`a[href="${path}"]`).click()
}
