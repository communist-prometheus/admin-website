import { expect, test } from '@playwright/test'
import { waitForContentReady } from '../helpers/content-ready'

const openFirstArticle = async (page: import('@playwright/test').Page) => {
  await page.goto('/content/blog')
  await waitForContentReady(page)
  await page.locator('h3').first().click()
  await page.waitForURL(/\/edit\//)
  await waitForContentReady(page)
}

test.describe('Save Button States', () => {
  test('shows Save text initially', async ({ page }) => {
    await openFirstArticle(page)
    const btn = page.getByTestId('save-button')
    await expect(btn).toContainText('Save')
    await expect(btn).toBeEnabled()
  })

  test('disabled + spinner during save', async ({ page }) => {
    await openFirstArticle(page)
    const btn = page.getByTestId('save-button')
    await btn.click()
    await expect(btn).toHaveClass(/saving/, { timeout: 5000 })
    await expect(btn).toBeDisabled()
  })

  test('shows checkmark after save completes', async ({ page }) => {
    await openFirstArticle(page)
    const btn = page.getByTestId('save-button')
    await btn.click()
    await expect(btn).toContainText('Saved', { timeout: 30000 })
    await expect(btn).toHaveClass(/done/)
  })

  test('reverts to Save after 2 seconds', async ({ page }) => {
    await openFirstArticle(page)
    const btn = page.getByTestId('save-button')
    await btn.click()
    await expect(btn).toContainText('Saved', { timeout: 30000 })
    await expect(btn).toContainText('Save', { timeout: 5000 })
    await expect(btn).toBeEnabled()
  })
})

test.describe('Save Network Requests', () => {
  test('stage request succeeds', async ({ page }) => {
    await openFirstArticle(page)
    const p = page.waitForResponse(r =>
      r.url().includes('/api/github/file/stage')
    )
    await page.getByTestId('save-button').click()
    expect((await p).status()).toBe(200)
  })

  test('commit response has success and sha', async ({ page }) => {
    await openFirstArticle(page)
    const p = page.waitForResponse(r =>
      r.url().includes('/api/github/commit')
    )
    await page.getByTestId('save-button').click()
    const body = await (await p).json()
    expect(body).toHaveProperty('success')
    expect(body).toHaveProperty('sha')
  })
})

test.describe('Deploy Bar After Save', () => {
  test('deploy bar appears after save', async ({ page }) => {
    await openFirstArticle(page)
    await page.getByTestId('save-button').click()
    await expect(page.getByTestId('save-button')).toContainText('Saved', {
      timeout: 30000,
    })
    await expect(page.locator('.deploy-bar')).toBeVisible({
      timeout: 15000,
    })
  })
})

// NOTE(deploy-history-rewrite): these tests assert the old DeployStatusBar /
// deploy-item-as-link UI that was replaced by the GitHub-Actions-polled
// DeployItem (<article>). They need a full rewrite once the new deploy
// history stabilizes. Skipping until then so CI isn't red on unrelated work.
test.describe
  .skip('Home Deploy List', () => {
    test('heading visible', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('Recent Deployments')).toBeVisible({
        timeout: 15000,
      })
    })

    test('shows deploy cards', async ({ page }) => {
      await page.goto('/')
      const items = page.locator('.deploy-item')
      await expect(items.first()).toBeVisible({ timeout: 15000 })
      expect(await items.count()).toBeGreaterThan(0)
    })

    test('cards have status badge', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('.badge').first()).toBeVisible({
        timeout: 15000,
      })
    })

    test('cards have commit message', async ({ page }) => {
      await page.goto('/')
      const msg = page.locator('.msg').first()
      await expect(msg).toBeVisible({ timeout: 15000 })
      expect((await msg.textContent())?.length).toBeGreaterThan(0)
    })

    test('cards have SHA', async ({ page }) => {
      await page.goto('/')
      const sha = page.locator('.sha').first()
      await expect(sha).toBeVisible({ timeout: 15000 })
      expect((await sha.textContent())?.length).toBeGreaterThanOrEqual(7)
    })

    test('real cards are clickable links', async ({ page }) => {
      await page.goto('/')
      const link = page.locator('a.deploy-item').first()
      await expect(link).toBeVisible({ timeout: 15000 })
      await expect(link).toHaveAttribute('href', /\/deploy\//)
    })

    test('pending card is article, not link', async ({ page }) => {
      await openFirstArticle(page)
      await page.getByTestId('save-button').click()
      await expect(page.getByTestId('save-button')).toContainText('Saved', {
        timeout: 30000,
      })
      await page.goto('/')
      const pending = page.locator('.pending-card')
      if ((await pending.count()) > 0) {
        expect(await pending.evaluate(el => el.tagName)).toBe('ARTICLE')
      }
    })

    test('pending card shows DEPLOYING badge', async ({ page }) => {
      await openFirstArticle(page)
      await page.getByTestId('save-button').click()
      await expect(page.getByTestId('save-button')).toContainText('Saved', {
        timeout: 30000,
      })
      await page.goto('/')
      const pending = page.locator('.pending-card')
      if ((await pending.count()) > 0) {
        await expect(pending.locator('.badge')).toContainText('deploying', {
          ignoreCase: true,
        })
      }
    })
  })

// NOTE(deploy-history-rewrite): see note above. Deploy Detail Page tests
// depend on the old clickable-card pattern and a linked-from-home behavior
// that no longer exists.
test.describe
  .skip('Deploy Detail Page', () => {
    test('navigates on card click', async ({ page }) => {
      await page.goto('/')
      const link = page.locator('a.deploy-item').first()
      await expect(link).toBeVisible({ timeout: 15000 })
      await link.click()
      await page.waitForURL(/\/deploy\//)
    })

    test('shows commit title as h1', async ({ page }) => {
      await page.goto('/')
      const link = page.locator('a.deploy-item').first()
      await expect(link).toBeVisible({ timeout: 15000 })
      await link.click()
      await page.waitForURL(/\/deploy\//)
      await expect(page.locator('h1')).toBeVisible()
    })

    test('shows commit SHA', async ({ page }) => {
      await page.goto('/')
      await page.locator('a.deploy-item').first().click()
      await page.waitForURL(/\/deploy\//)
      await expect(page.getByText('Commit:')).toBeVisible({
        timeout: 15000,
      })
    })

    test('shows started and finished', async ({ page }) => {
      await page.goto('/')
      await page.locator('a.deploy-item').first().click()
      await page.waitForURL(/\/deploy\//)
      await expect(page.getByText('Started:')).toBeVisible({
        timeout: 15000,
      })
      await expect(page.getByText('Finished:')).toBeVisible()
    })

    test('shows changed files section', async ({ page }) => {
      await page.goto('/')
      await page.locator('a.deploy-item').first().click()
      await page.waitForURL(/\/deploy\//)
      await expect(page.getByText(/Changed Files/)).toBeVisible({
        timeout: 15000,
      })
    })

    test('file items expand on click', async ({ page }) => {
      await page.goto('/')
      await page.locator('a.deploy-item').first().click()
      await page.waitForURL(/\/deploy\//)
      const file = page.locator('.file-item').first()
      if ((await file.count()) > 0) {
        await file.click()
        const patch = page.locator('.patch')
        if ((await patch.count()) > 0)
          await expect(patch.first()).toBeVisible()
      }
    })

    test('shows progress bar', async ({ page }) => {
      await page.goto('/')
      await page.locator('a.deploy-item').first().click()
      await page.waitForURL(/\/deploy\//)
      await expect(page.locator('.track')).toBeVisible({
        timeout: 15000,
      })
    })

    test('shows status label', async ({ page }) => {
      await page.goto('/')
      await page.locator('a.deploy-item').first().click()
      await page.waitForURL(/\/deploy\//)
      await expect(page.locator('.lbl').first()).toBeVisible({
        timeout: 15000,
      })
    })

    test('CF build link if available', async ({ page }) => {
      await page.goto('/')
      await page.locator('a.deploy-item').first().click()
      await page.waitForURL(/\/deploy\//)
      const cf = page.getByText('View in Cloudflare')
      if ((await cf.count()) > 0)
        await expect(cf).toHaveAttribute('href', /cloudflare/)
    })

    test('failure deploy shows failure label', async ({ page }) => {
      await page.goto('/')
      const fail = page.locator('.badge').filter({ hasText: 'failure' })
      if ((await fail.count()) > 0) {
        await fail.first().click()
        await page.waitForURL(/\/deploy\//)
        await expect(page.locator('.lbl').first()).toContainText(/failure/i)
      }
    })
  })
