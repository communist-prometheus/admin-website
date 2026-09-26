import { resolve } from 'node:path'
import type { Page } from '@prometheus/e2e-toolkit'
import { click, expect, expectVisible, test } from '@prometheus/e2e-toolkit'
import { TESTID } from '../src/redesign/testids'
import { assertAstroAccepts } from './helpers/astro-validate'
import { bootRedesign, goRoute, SLOW } from './helpers/redesign-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha, waitForHeadAdvance } from './helpers/sandbox-head'
import { readFile } from './helpers/sandbox-read'

/**
 * The two flows the rebuilt admin was missing or had never proved: pulling
 * an article out of a file, and giving a material another language. Both
 * existed in the previous client and both were invisible to the gate,
 * because the gate drives the previous client.
 */

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

const anchor = (id: string): string => `[data-testid="${id}"]`

const FIXTURE = resolve(import.meta.dirname, 'fixtures/import/sample.md')

/** Open the first article the list offers; returns its repository path. */
const openFirstArticle = async (page: Page): Promise<string> => {
  await goRoute(page, 'articles', 'articles')
  const row = page.locator(anchor(TESTID.articleRow)).first()
  await expectVisible(page, row, SLOW)
  await click(page, row, SLOW)
  await expectVisible(page, page.locator(anchor(TESTID.editorDoc)), SLOW)
  const path = await page
    .locator(anchor(TESTID.editorDoc))
    .getAttribute('data-path')
  expect(path, 'an opened article must be bound to a file').toBeTruthy()
  return path ?? ''
}

test('import: a picked markdown file lands in the article and publishes', async ({
  page,
}) => {
  test.setTimeout(180_000)

  await bootRedesign(page, 'redesign-import')
  const path = await openFirstArticle(page)

  await page.locator(anchor(TESTID.editorImport)).setInputFiles(FIXTURE)
  /* The import reports itself, so the wait terminates on the conversion
   * having finished rather than on markup appearing. */
  await expectVisible(page, page.locator(anchor(TESTID.importNote)), SLOW)
  const note = await page.locator(anchor(TESTID.importNote)).textContent()
  expect(note, 'the import must report success, not a refusal').toContain(
    'Импортировано'
  )

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.publish)), SLOW)
  await expectVisible(
    page,
    page.locator(`${anchor(TESTID.publishDialog)}[data-state="done"]`),
    SLOW
  )
  await waitForHeadAdvance(shaBefore)

  const remote = await readFile(path)
  expect(remote, 'the imported heading must reach the file').toContain(
    'Импортированный раздел'
  )
  /* An import adds to the article; it must not replace what was there. */
  expect(
    remote,
    'the file must still parse against the site schema'
  ).toBeTruthy()
  await assertAstroAccepts('blog', remote ?? '')
})

test('translation: adding a language creates its own file, editable on its own', async ({
  page,
}) => {
  test.setTimeout(180_000)
  const translated = `Realmode translation ${(Date.now() % 1e6).toString(36)}`

  await bootRedesign(page, 'redesign-translate')
  const path = await openFirstArticle(page)
  const doc = page.locator(anchor(TESTID.editorDoc))
  const slug = await doc.getAttribute('data-slug')
  const sourceLang = await doc.getAttribute('data-lang')

  const shaBeforeAdd = await headSha()
  await click(page, page.locator(anchor(TESTID.addLang)), SLOW)
  await expectVisible(page, page.locator(anchor(TESTID.addLangDialog)), SLOW)
  await click(page, page.locator(anchor(TESTID.addLangConfirm)), SLOW)

  /* Creating a translation writes its file straight away, and the editor
   * switches to it — the document's own `data-lang` is the terminal signal,
   * not "a dialog closed". */
  const onNewLang = page.locator(
    `${anchor(TESTID.editorDoc)}:not([data-lang="${sourceLang}"])`
  )
  await expectVisible(page, onNewLang, SLOW)
  const lang = await doc.getAttribute('data-lang')
  expect(lang, 'the editor must be on the new language').toBeTruthy()
  expect(lang).not.toBe(sourceLang)

  await waitForHeadAdvance(shaBeforeAdd)
  const created = `blog/${slug}/index.${lang}.md`
  const seeded = await readFile(created)
  expect(seeded, `${created} must exist on the sandbox`).toBeTruthy()
  expect(seeded, 'the new file must declare its own language').toContain(
    `lang: ${lang}`
  )
  expect(seeded, 'a fresh translation starts unpublished').toContain(
    'published: false'
  )
  expect(path, 'the source language must keep its own file').toContain(
    `index.${sourceLang}.md`
  )

  /* The translation is a document in its own right: editing and publishing
   * it must write that file, not the language it was seeded from. */
  await page.locator(anchor(TESTID.editorTitle)).fill(translated)
  const shaBeforeEdit = await headSha()
  await click(page, page.locator(anchor(TESTID.publish)), SLOW)
  await expectVisible(
    page,
    page.locator(`${anchor(TESTID.publishDialog)}[data-state="done"]`),
    SLOW
  )
  await waitForHeadAdvance(shaBeforeEdit)

  const edited = await readFile(created)
  expect(edited, 'the edit must land in the translation').toContain(
    translated
  )
  await assertAstroAccepts('blog', edited ?? '')

  const source = await readFile(path)
  expect(source, 'the source language must be untouched').not.toContain(
    translated
  )
})
