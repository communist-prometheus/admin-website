/* eslint-disable */
/**
 * Upload the Russian + Italian docx corpus from
 * `C:\Users\igor_\Downloads\Uploading` into the
 * public-website-content repo. Reuses the same parsing modules
 * the admin's "Import from docs" feature uses, so the result
 * matches what the user would see clicking through the UI.
 *
 * Usage:
 *   bun scripts/upload/upload-content.ts [--dry]
 */

import {
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { dirname, join } from 'node:path'
import mammoth from 'mammoth'
import { extractFootnotes } from '../../src/components/MarkdownEditor/ImportDocs/extract-footnotes'
import { htmlToMarkdown } from '../../src/components/MarkdownEditor/ImportDocs/html-to-markdown'
import { normaliseImportHtml } from '../../src/components/MarkdownEditor/ImportDocs/normalise-html'
import {
  type ArticleSpec,
  CATEGORIES,
  SOURCE_DIRS,
  SPECS,
} from './article-spec'
import { renderFrontmatter, stripFootnoteRefs } from './build-frontmatter'
import { extractMeta } from './extract-meta'

const SOURCE_ROOT = String.raw`C:\Users\igor_\Downloads\Uploading`
const TARGET_ROOT = String.raw`C:\Projects\Prometheus\public-website\src\content`
const PUB_DATE = '2026-04-30'

const STYLE_MAP = [
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='Subtitle'] => h2:fresh",
  "p[style-name='Heading 1'] => h1:fresh",
  "p[style-name='Heading 2'] => h2:fresh",
  "p[style-name='Heading 3'] => h3:fresh",
  "p[style-name='Heading 4'] => h4:fresh",
]

type Lang = 'ru' | 'it'
const LANGS: ReadonlyArray<Lang> = ['ru', 'it']

const dryRun = process.argv.includes('--dry')

const log = (...args: unknown[]): void => {
  console.log('[upload]', ...args)
}

const docxToHtml = async (path: string): Promise<string> => {
  const buffer = await readFile(path)
  const result = await mammoth.convertToHtml(
    { buffer },
    { styleMap: STYLE_MAP }
  )
  return result.value
}

type Conversion = {
  readonly title: string
  readonly description: string
  readonly markdown: string
}

const convertOne = async (path: string): Promise<Conversion> => {
  const rawHtml = await docxToHtml(path)
  const { html: deFootnoted } = extractFootnotes(rawHtml)
  const meta = extractMeta(deFootnoted)
  // Stitch the title back as a real <h1> so promoteVisualHeadings
  // demotes any subsequent visual-bold paragraphs to <h2>+ instead
  // of treating them as further document titles.
  const stitchedBody = `<h1>${stripFootnoteRefs(meta.title)}</h1>${meta.bodyHtml}`
  const cleanBody = normaliseImportHtml(stitchedBody)
  const markdownBody = htmlToMarkdown(cleanBody)
  return {
    title: stripFootnoteRefs(meta.title),
    description: stripFootnoteRefs(meta.description),
    markdown: `${markdownBody.trim()}\n`,
  }
}

const categoryLabel = (key: string, lang: Lang): string => {
  const cat = CATEGORIES.find(c => c.key === key)
  return cat?.translations[lang] ?? key
}

const targetPath = (spec: ArticleSpec, lang: Lang): string => {
  const dir = spec.kind === 'page' ? 'pages' : 'blog'
  return join(TARGET_ROOT, dir, spec.slug, `index.${lang}.md`)
}

const buildBlogFrontmatter = (
  spec: ArticleSpec,
  lang: Lang,
  conv: Conversion
): string =>
  renderFrontmatter({
    title: conv.title,
    description: conv.description,
    category: spec.category ? categoryLabel(spec.category, lang) : undefined,
    pubDate: PUB_DATE,
    published: true,
    lang,
  })

const buildPageFrontmatter = (
  _spec: ArticleSpec,
  lang: Lang,
  conv: Conversion
): string =>
  renderFrontmatter({
    title: conv.title,
    description: conv.description,
    lang,
  })

const writeFileSafe = async (path: string, body: string): Promise<void> => {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, body, 'utf8')
}

const processArticle = async (spec: ArticleSpec): Promise<void> => {
  log(`-- ${spec.kind} ${spec.slug}`)
  for (const lang of LANGS) {
    const filename = lang === 'ru' ? spec.ru : spec.it
    const dir = SOURCE_DIRS[lang]
    const src = join(SOURCE_ROOT, dir, filename)
    const conv = await convertOne(src)
    const fm =
      spec.kind === 'page'
        ? buildPageFrontmatter(spec, lang, conv)
        : buildBlogFrontmatter(spec, lang, conv)
    const out = targetPath(spec, lang)
    log(`   ${lang}: ${conv.title.slice(0, 60)} -> ${out}`)
    if (!dryRun) await writeFileSafe(out, fm + conv.markdown)
  }
}

const upsertLabels = async (): Promise<void> => {
  const path = join(TARGET_ROOT, 'settings', 'labels.json')
  const existing = JSON.parse(await readFile(path, 'utf8'))
  const map = new Map<string, unknown>(
    existing.map((c: { key: string }) => [c.key, c])
  )
  for (const cat of CATEGORIES) {
    map.set(cat.key, cat)
  }
  const merged = [...map.values()]
  log(`labels.json: ${existing.length} → ${merged.length} entries`)
  if (!dryRun)
    await writeFile(path, `${JSON.stringify(merged, null, 2)}\n`, 'utf8')
}

const TEST_NAME_RE =
  /^(test|testing|prod-?test|prodverify|oauth-?test|demo|artiche|456)/i

const isObviouslyTest = (name: string): boolean =>
  TEST_NAME_RE.test(name) || /^test-\d+$/.test(name)

const cleanTestDirs = async (): Promise<void> => {
  // Wipe newspaper entirely (all current entries are test fixtures).
  // For positions, only delete obviously-named test entries — keep
  // real production positions (digital-sovereignty, knowledge-access).
  const wipeAll = [join(TARGET_ROOT, 'newspaper')]
  for (const dir of wipeAll) {
    const entries = await readdir(dir).catch(() => [])
    for (const name of entries) {
      const full = join(dir, name)
      const info = await stat(full).catch(() => undefined)
      if (info?.isDirectory() === true) {
        log(`rm ${full}`)
        if (!dryRun) await rm(full, { recursive: true, force: true })
      }
    }
  }
  const positionsDir = join(TARGET_ROOT, 'positions')
  const positions = await readdir(positionsDir).catch(() => [])
  for (const name of positions) {
    if (!isObviouslyTest(name)) continue
    const full = join(positionsDir, name)
    log(`rm ${full}`)
    if (!dryRun) await rm(full, { recursive: true, force: true })
  }
}

const main = async (): Promise<void> => {
  log(`mode=${dryRun ? 'DRY' : 'WRITE'}`)
  await cleanTestDirs()
  await upsertLabels()
  for (const spec of SPECS) await processArticle(spec)
  log('done')
}

await main()
