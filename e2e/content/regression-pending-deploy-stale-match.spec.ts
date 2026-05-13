import { expect, expectVisible, test, visit } from '@prometheus/e2e-toolkit'

/**
 * Regression — newspaper home build appears immediately after a save
 * even when a historical run shares the commit message.
 *
 * Reported flow: "Upload a PDF for one language of a newspaper, click
 * save, navigate to home — the new build does not appear until you
 * refresh ~10 times."
 *
 * Root cause: `isPendingMatched` used pure substring matching on the
 * commit message. The newspaper edit always emits
 * `updated <title> in newspaper`, so an old completed run from a
 * previous edit (same title) instantly matched the freshly-queued
 * pending and dropped it. The user had no signal until GitHub's API
 * eventually surfaced the real new run.
 *
 * Fix: also require the real run's `created_at` to be at-or-after the
 * pending's `createdAt` (with a 60s clock-skew slack). This test
 * pins the contract end-to-end: an old run with the same message
 * must NOT eat the optimistic pending entry on /.
 */
test.describe('Pending deploy survives stale runs with the same message', () => {
  test('home shows the optimistic pending entry even when an old run shares the commit message', async ({
    page,
  }) => {
    const SAME_MESSAGE =
      'updated Il giornale «Prometeo Comunista» #1 — Maggio 2026 in newspaper'

    /* Intercept the GitHub workflow_runs poll and return a single
     * historical run from a month ago whose commit message is
     * identical to the pending we're about to set. Pre-fix this is
     * exactly the wire shape that killed the optimistic entry. */
    await page.route(
      '**/api.github.com/repos/communist-prometheus/public-website/actions/workflows/**',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            workflow_runs: [
              {
                id: 9_000_001,
                name: 'Deploy to Cloudflare Workers',
                status: 'completed',
                conclusion: 'success',
                head_branch: 'master',
                head_sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
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

    /* The jobs endpoint is hit only when an entry expands; stub
     * to an empty list so a transient call doesn't 404 noisily. */
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

    /* Seed the pending entry the way the save flow would, but with
     * `createdAt = now` so it's clearly newer than the historical
     * stub above. */
    await visit(page, '/')
    await page.evaluate(message => {
      globalThis.sessionStorage.setItem(
        'pending_deploy',
        JSON.stringify({
          id: `pending-${Date.now()}`,
          message,
          createdAt: new Date().toISOString(),
        })
      )
    }, SAME_MESSAGE)
    await page.reload({ waitUntil: 'domcontentloaded' })

    /* Both entries must be visible on the deploy list — the
     * historical run AND the new optimistic pending. Pre-fix only
     * the historical one appeared because the pending was matched
     * and dropped on the very first render of the merged list. */
    await expectVisible(
      page,
      page.locator('section.deploy-list .deploy-item').first()
    )
    const items = page.locator('section.deploy-list .deploy-item')
    await expect(items).toHaveCount(2)

    /* Optimistic pending always renders at the top of the list
     * (most recent first) and carries the synthetic `pending-`
     * head_sha sentinel. */
    const top = items.first()
    await expect(top).toContainText(SAME_MESSAGE)
  })
})
