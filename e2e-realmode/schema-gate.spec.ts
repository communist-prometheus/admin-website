import { expect, expectVisible, test, visit } from '@prometheus/e2e-toolkit'
import { bootRealmode, SLOW } from './helpers/realmode-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha } from './helpers/sandbox-head'

const SAMPLE_FRONTMATTER = `---
title: Schema gate probe
description: should never reach the repo
category: general
lang: __INJECT__
publishDate: 2026-01-01
published: true
---

probe body
`

interface StageResult {
  readonly status: number
  readonly body: string
}

const stageDirect = async (
  filePath: string,
  content: string,
  page: import('@prometheus/e2e-toolkit').Page
): Promise<StageResult> =>
  page.evaluate(
    async ([p, c]) => {
      const res = await fetch('/api/github/file/stage', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path: p, content: c }),
      })
      return { status: res.status, body: await res.text() }
    },
    [filePath, content] as const
  )

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

/* The 2026-05-09 prod incident: a `lang` astro's enum rejected
 * sneaked through the SW into the content repo and took 6 hours of
 * deploys red. These tests prove the stage gate now rejects the
 * exact two paths that landed unbuildable bytes on `develop`:
 * filename-lang outside supportedLangs, and frontmatter-lang at
 * odds with the filename. */

test('schema gate: filename lang outside supportedLangs is rejected', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await bootRealmode(page, 'schema-gate-fn')
  /* Wait for the SW to finish its clone — without that the stage
   * fetch races init and we could get an "SW not ready" 503
   * instead of the gate's 400. */
  await visit(page, '/content/blog', SLOW)
  await expectVisible(
    page,
    page.locator('article.content-item').first(),
    SLOW
  )

  const before = await headSha()
  const body = SAMPLE_FRONTMATTER.replace('__INJECT__', 'zz')
  const res = await stageDirect('blog/probe/index.zz.md', body, page)
  expect(res.status, 'gate must respond 4xx').toBeGreaterThanOrEqual(400)
  expect(res.body).toMatch(/not in supported set/)

  const after = await headSha()
  expect(after, 'no commit must land on sandbox').toBe(before)
})

test('schema gate: frontmatter lang must match filename lang', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await bootRealmode(page, 'schema-gate-fm')
  await visit(page, '/content/blog', SLOW)
  await expectVisible(
    page,
    page.locator('article.content-item').first(),
    SLOW
  )

  const before = await headSha()
  const body = SAMPLE_FRONTMATTER.replace('__INJECT__', 'ru')
  const res = await stageDirect('blog/probe/index.en.md', body, page)
  expect(res.status).toBeGreaterThanOrEqual(400)
  expect(res.body).toMatch(/must match filename lang/)

  const after = await headSha()
  expect(after).toBe(before)
})
