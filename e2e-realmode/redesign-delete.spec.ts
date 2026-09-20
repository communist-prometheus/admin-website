import type { Page } from '@prometheus/e2e-toolkit'
import { click, expect, expectVisible, test } from '@prometheus/e2e-toolkit'
import { TESTID } from '../src/redesign/testids'
import { bootRedesign, goRoute, SLOW } from './helpers/redesign-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha, waitForHeadAdvance } from './helpers/sandbox-head'
import { listDir, readFile } from './helpers/sandbox-read'

/**
 * Deleting a material existed only in the client that is no longer served,
 * so retiring that client would have taken the capability away from editors
 * rather than removing dead code. Rebuilt here, and covered the same way the
 * old specs covered it: drop one translation, or drop the whole material.
 */

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

const anchor = (id: string): string => `[data-testid="${id}"]`

/** Open the first article the list offers; returns its slug. */
const openFirstArticle = async (page: Page): Promise<string> => {
  await goRoute(page, 'articles', 'articles')
  const row = page.locator(anchor(TESTID.articleRow)).first()
  await expectVisible(page, row, SLOW)
  const slug = await row.getAttribute('data-slug')
  await click(page, row, SLOW)
  await expectVisible(page, page.locator(anchor(TESTID.editorDoc)), SLOW)
  return slug ?? ''
}

/**
 * Give the open material a second language, so a translation can be dropped
 * without the test depending on the baseline happening to carry one.
 * @returns The language that was added.
 */
const addTranslation = async (page: Page): Promise<string> => {
  const doc = page.locator(anchor(TESTID.editorDoc))
  const from = await doc.getAttribute('data-lang')
  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.addLang)), SLOW)
  await expectVisible(page, page.locator(anchor(TESTID.addLangDialog)), SLOW)
  await click(page, page.locator(anchor(TESTID.addLangConfirm)), SLOW)
  await expectVisible(
    page,
    page.locator(`${anchor(TESTID.editorDoc)}:not([data-lang="${from}"])`),
    SLOW
  )
  await waitForHeadAdvance(shaBefore)
  return (await doc.getAttribute('data-lang')) ?? ''
}

test('delete: dropping one translation leaves the others standing', async ({
  page,
}) => {
  test.setTimeout(180_000)

  await bootRedesign(page, 'redesign-delete-lang')
  const slug = await openFirstArticle(page)
  const lang = await addTranslation(page)
  const before = await listDir(`blog/${slug}`)
  expect(
    before.filter(f => /index\.[a-z]{2}\.md$/.test(f.path)).length,
    'the material must carry two languages before one is dropped'
  ).toBe(2)

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.deleteMaterial)), SLOW)
  await expectVisible(page, page.locator(anchor(TESTID.deleteDialog)), SLOW)
  await click(page, page.locator(anchor(TESTID.deleteLangConfirm)), SLOW)
  await waitForHeadAdvance(shaBefore)

  expect(
    await readFile(`blog/${slug}/index.${lang}.md`),
    'the dropped translation must be gone'
  ).toBeUndefined()
  const after = await listDir(`blog/${slug}`)
  expect(after.length, 'only the one language file may disappear').toBe(
    before.length - 1
  )
})

test('delete: dropping the material removes every file it owned', async ({
  page,
}) => {
  test.setTimeout(180_000)

  await bootRedesign(page, 'redesign-delete-all')
  const slug = await openFirstArticle(page)
  await addTranslation(page)
  const before = await listDir(`blog/${slug}`)
  expect(
    before.length,
    'the material must have files to begin with'
  ).toBeGreaterThan(0)

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.deleteMaterial)), SLOW)
  await expectVisible(page, page.locator(anchor(TESTID.deleteDialog)), SLOW)
  await click(page, page.locator(anchor(TESTID.deleteAllConfirm)), SLOW)
  await waitForHeadAdvance(shaBefore)

  /* The editor must not keep showing a material that no longer exists. */
  await expectVisible(
    page,
    page.locator(`[data-testid="${TESTID.screen}"][data-route="articles"]`),
    SLOW
  )
  expect(
    (await listDir(`blog/${slug}`)).length,
    'nothing may be left behind under the deleted material'
  ).toBe(0)
})
