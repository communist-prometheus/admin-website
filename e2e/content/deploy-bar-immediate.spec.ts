import { expect, test } from '@prometheus/e2e-toolkit'
import { waitForContentReady } from '../helpers/content-ready'
import { openPreview, saveAndConfirm } from './preview-save'

const openFirstArticle = async (
  page: import('@playwright/test').Page
): Promise<void> => {
  await page.goto('/content/blog')
  await waitForContentReady(page)
  await page.locator('h3').first().click()
  await page.waitForURL(/\/edit\//)
  await waitForContentReady(page)
}

/**
 * Reported flow: "I save the newspaper, the 'something is deploying'
 * badge does not appear in the UI until I refresh the page". Existing
 * suite (`save-deploy-flow.spec.ts > Deploy Bar After Save`) only
 * asserts the bar shows up within 15 s — that timeout is wide enough
 * to hide the actual bug, which is that the optimistic pending entry
 * is being eaten by an older workflow_run that shares the commit
 * message (`updated <title> in newspaper` is byte-identical on every
 * re-edit of the same issue).
 *
 * This suite pins the *optimistic* contract:
 *
 * 1. The `.deploy-bar` appears IMMEDIATELY after Save (within 1.5 s,
 *    well before any GitHub polling round-trip could complete) — the
 *    `setPendingDeploy()` write must produce a visible bar in the
 *    same animation frame.
 *
 * 2. The bar STAYS visible through the first polling tick: a stubbed
 *    `workflow_runs` endpoint returns ONE historical run whose
 *    `head_commit.message` matches the freshly-queued pending. Before
 *    the fix (timestamp-floor in `isPendingMatched`) the merged list
 *    drops the pending the instant the old run lands and the bar
 *    disappears — visible to the user as a single flash.
 */
test.describe('Deploy bar — optimistic + survives stale runs', () => {
  test('bar appears within 1.5 s of clicking Save', async ({ page }) => {
    await openFirstArticle(page)
    const btn = await openPreview(page)
    await saveAndConfirm(page, btn)
    /*
     * 1500 ms is comfortably less than a real GitHub API
     * round-trip — if the bar needs to wait for the poll, this
     * fails. The bar must mount from `pendingDeploy.value` writing
     * synchronously inside the save handler, before commit even
     * resolves.
     */
    await expect(page.locator('.deploy-bar')).toBeVisible({ timeout: 1500 })
  })

  test('bar stays visible when an older run shares the commit message', async ({
    page,
  }) => {
    /*
     * Stub the workflow_runs poll BEFORE the navigation so the SW
     * never sees the real GH API. One stale run, days old, with the
     * exact commit message the editor would emit. Pre-fix this run
     * matched the pending placeholder on the first merge tick and
     * the bar flickered out.
     */
    const SAME_MESSAGE = 'updated Test Article 61 in blog'
    await page.route(
      '**/api.github.com/repos/communist-prometheus/public-website/actions/workflows/**',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            workflow_runs: [
              {
                id: 9_000_002,
                name: 'Deploy to Cloudflare Workers',
                status: 'completed',
                conclusion: 'success',
                head_branch: 'master',
                head_sha: 'b'.repeat(40),
                created_at: '2026-04-13T08:00:00Z',
                updated_at: '2026-04-13T08:05:00Z',
                head_commit: {
                  message: `content: ${SAME_MESSAGE}`,
                  author: { name: 'bot', email: 'bot@example.com' },
                },
              },
            ],
          }),
        })
      }
    )
    await page.route(
      '**/api.github.com/repos/communist-prometheus/public-website/actions/runs/**',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ jobs: [] }),
        })
      }
    )

    await openFirstArticle(page)
    const btn = await openPreview(page)
    await saveAndConfirm(page, btn)
    /* Optimistic appearance. */
    await expect(page.locator('.deploy-bar')).toBeVisible({ timeout: 1500 })
    /*
     * Survive the polling tick that delivers the stale run —
     * event-driven: wait for the actual workflow_runs requests the
     * poller fires (the routed stub above answers them), not a
     * fixed 5 s sleep. Two ticks guarantee the merge that
     * previously ate the pending entry has happened.
     */
    const tick = () =>
      page.waitForRequest(/api\.github\.com\/.*\/workflows\//)
    await tick()
    await tick()
    await expect(page.locator('.deploy-bar')).toBeVisible()
  })
})
