import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'
import { ContentPage } from '../pages/ContentPage'
import { CreateDialog } from '../pages/CreateDialog'

const TEST_SLUG = `e2e-test-${Date.now()}`
const TEST_TITLE = 'E2E Integration Test Position'
const TEST_DESCRIPTION = 'Created by integration test'
// Positions live at positions/<slug>/index.<lang>.md in the content repo.
const positionPath = (slug: string) => `positions/${slug}/index.en.md`

const githubApi = (
  path: string,
  options?: RequestInit
): Promise<Response> => {
  const token = process.env.GITHUB_E2E_KEY ?? ''
  const owner = process.env.GITHUB_OWNER ?? 'communist-prometheus'
  const repo = process.env.GITHUB_REPO ?? 'public-website-content'
  return fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    }
  )
}

const deleteTestFile = async (slug: string): Promise<void> => {
  const branch = process.env.GITHUB_BRANCH ?? 'master'
  const path = positionPath(slug)

  const res = await githubApi(`${path}?ref=${branch}`)
  if (!res.ok) return

  const data: { sha: string } = await res.json()
  await githubApi(path, {
    method: 'DELETE',
    body: JSON.stringify({
      message: `test: cleanup ${slug}`,
      sha: data.sha,
      branch,
    }),
  })
}

test.describe('Integration - Create Content via GitHub', () => {
  test.setTimeout(60000)

  test.afterAll(async () => {
    // Real-git cleanup runs only when a token is available. In the
    // default mock-mode suite the file was never pushed, so the
    // DELETE would 404 — gracefully no-op inside deleteTestFile.
    if (process.env.GITHUB_E2E_KEY) await deleteTestFile(TEST_SLUG)
  })

  test('should create a real file in the GitHub repository', async ({
    page,
  }) => {
    await login(page)

    const contentPage = new ContentPage(page)
    await contentPage.navigate('positions')

    await contentPage.clickCreateButton()

    const dialog = new CreateDialog(page)
    await dialog.expectToBeVisible()

    await dialog.fillForm({
      slug: TEST_SLUG,
      lang: 'en',
      title: TEST_TITLE,
      description: TEST_DESCRIPTION,
    })

    const responsePromise = page.waitForResponse(
      res =>
        res.url().includes('/api/github/file') &&
        res.request().method() === 'POST',
      { timeout: 30000 }
    )

    await page.locator('[data-testid="create-submit"]').click()

    const response = await responsePromise
    expect(response.status()).toBe(200)
  })
})
