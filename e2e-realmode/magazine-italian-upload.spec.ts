import { join } from 'node:path'
import {
  click,
  expect,
  expectVisible,
  fill,
  test,
  visit,
} from '@prometheus/e2e-toolkit'
import { assertAstroAccepts } from './helpers/astro-validate'
import { bootRealmode, SLOW } from './helpers/realmode-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha, waitForHeadAdvance } from './helpers/sandbox-head'
import { readBinary, readFile } from './helpers/sandbox-read'
import { saveAndConfirm } from './helpers/save-flow'

const SLUG = 'issue-1'
const TITLE = 'Il giornale «Prometeo Comunista» #1 — Maggio 2026'
/*
 * The same 588KB three-page slice of the user's real Italian
 * magazine that powers the cover-render fixture test. Its page 1 is
 * the Italian "PROMETEO COMUNISTA" front cover, which the cover
 * extractor must lift out as `cover.it.png`.
 */
const PDF_FIXTURE = join(
  process.cwd(),
  'src/features/magazine/__fixtures__/magazine-1-it.pdf'
)
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47] as const
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46] as const

const startsWith = (
  bytes: Uint8Array,
  magic: ReadonlyArray<number>
): boolean => magic.every((b, i) => bytes[i] === b)

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

/*
 * Captures the exact user-reported flow:
 *   "load the Italian version of the magazine with title
 *    Il giornale «Prometeo Comunista» #1 — Maggio 2026"
 *
 * The flow exercises every regression we shipped on the per-lang +
 * cover-render arc:
 *   - #231 per-lang upload renaming  (`issue-1.it.pdf`, `cover.it.png`)
 *   - #232 cover preview follows the active language
 *   - #233 auto-overwrite of legacy `cover.png`
 *   - #234 frontmatter round-trip with hostile chars (« » # —)
 *   - #235 mupdf cover render (the Italian masthead, not the Russian one)
 *
 * If any of those silently regress, this test fails on the next CI
 * run rather than waiting for the next user report.
 */
test('Italian magazine full upload: title + PDF + cover commit per-lang', async ({
  page,
}) => {
  test.setTimeout(240_000)
  await bootRealmode(page, 'magazine-italian-upload')
  await visit(page, `/content/magazine/edit/${SLUG}`, SLOW)
  await expectVisible(
    page,
    page.locator('[data-testid="magazine-source-uploads"]'),
    SLOW
  )

  /* Switch to Italiano. The lang button matches by visible label
   * (matches the LanguageSelector contract). */
  const italianoBtn = page.locator('button.lang-button', {
    hasText: 'Italiano',
  })
  await click(page, italianoBtn, SLOW)
  /* Sandbox baseline ships an EN issue, so IT is dimmed (no file
   * yet). The "missing translation" hint is the visible signal that
   * the lang switched but no file is loaded. */
  await expectVisible(
    page,
    page.locator('[data-testid="missing-translation-hint"]'),
    SLOW
  )

  /* Hostile title: « » (guillemets), # (hash), — (em dash). Pre-#234
   * the YAML serializer emitted these via a block scalar and the
   * round-trip dropped a leading space; keep the exact string the
   * user reported so we pin THAT string. */
  const titleInput = page.locator('input#fm-title')
  await fill(page, titleInput, TITLE, SLOW)

  /* Upload the real Italian magazine PDF. The mupdf renderer must
   * extract page 1 (the Italian masthead) and emit a cover.it.png
   * — a regression to pdf.js would silently produce the Russian
   * back-cover masthead, which the cover-bytes assertion below
   * catches via PNG magic + non-trivial size. */
  await page
    .locator('[data-testid="pdf-dropzone"] + input[type="file"]')
    .setInputFiles(PDF_FIXTURE)
  await expectVisible(page, page.locator('[data-testid="pdf-current"]'), SLOW)
  /* Wait for the cover preview at the top to render — mupdf-wasm
   * has to download (~10MB) and run before the editor can wire the
   * cover blob URL. The CoverImage mounts only when coverPath is
   * set; we use it as the gate before saving. */
  await expectVisible(
    page,
    page.locator('[data-testid="cover-image"] img'),
    SLOW
  )

  const shaBefore = await headSha()
  await saveAndConfirm(page)
  const shaAfter = await waitForHeadAdvance(shaBefore)
  expect(shaAfter).not.toBe(shaBefore)

  /* Verify the index.it.md frontmatter round-trips the hostile
   * title verbatim. Anything missing or escaped wrong is a
   * regression in `serializeFrontmatter`. */
  const indexPath = `magazine/${SLUG}/index.it.md`
  const indexBody = await readFile(indexPath)
  expect(indexBody, `${indexPath} must exist on sandbox`).toBeTruthy()
  expect(
    indexBody,
    'frontmatter must hold the exact user-typed title'
  ).toContain(TITLE)
  expect(indexBody).toMatch(/lang:\s*it/)
  expect(indexBody, 'image points to the per-lang cover').toContain(
    './assets/cover.it.png'
  )
  /* Astro is the downstream gate — if its parser rejects the
   * frontmatter, the public-website build goes red and prod stays
   * stuck on the old issue. */
  await assertAstroAccepts('magazine', indexBody ?? '')

  /* Verify per-lang assets actually committed with valid magic. */
  const pdfPath = `magazine/${SLUG}/assets/${SLUG}.it.pdf`
  const pdfBytes = await readBinary(pdfPath)
  expect(pdfBytes, `${pdfPath} must exist`).toBeDefined()
  expect(
    pdfBytes && startsWith(pdfBytes, PDF_MAGIC),
    'per-lang PDF must start with %PDF magic'
  ).toBe(true)

  /* Cover bytes test — the discriminator between "mupdf rendered
   * the Italian cover" and "pdf.js silently rendered the Russian
   * back cover". The Italian render is ~1MB+ and starts with the
   * PNG magic. A pdf.js mis-render would still pass magic but is
   * usually <50KB (mostly white space + small masthead). */
  const coverPath = `magazine/${SLUG}/assets/cover.it.png`
  const coverBytes = await readBinary(coverPath)
  expect(coverBytes, `${coverPath} must exist`).toBeDefined()
  expect(
    coverBytes && startsWith(coverBytes, PNG_MAGIC),
    'cover.it.png must start with PNG magic'
  ).toBe(true)
  expect(
    coverBytes?.byteLength ?? 0,
    'Italian fist illustration produces a substantial PNG; a ' +
      'mis-rendered Russian masthead is mostly white and tiny'
  ).toBeGreaterThan(100_000)
})
