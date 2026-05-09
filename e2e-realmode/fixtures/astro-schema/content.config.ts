/**
 * Mirror of `public-website/src/content.config.ts` — kept in sync via
 * `astro-schema-drift.spec.ts`. The realmode suite parses every
 * file admin commits through these zod schemas so a regression like
 * the 2026-05-09 `lang: uk` incident (admin schema accepted bytes
 * astro rejected → 6 hours of red deploys) can never repeat without
 * a test going red on the PR that introduces it.
 *
 * Differences vs upstream:
 *  - `astro:content` resolves at build time; this mirror imports
 *    plain `zod` so it can run in node + browser tests.
 *  - `image()` is stubbed: admin commits `image: ./assets/<file>`
 *    as a plain string. The astro asset pipeline turns that into
 *    an ImageMetadata at build time. For schema-validation purposes
 *    a string is what we see in the committed YAML.
 *
 * Do NOT diverge from upstream beyond those two adapter changes.
 * Drift is detected automatically by the contract test.
 */
import { z } from 'zod'

const langEnum = (allowed: ReadonlySet<string>) =>
  z.string().refine(v => allowed.has(v))

const imageStub = () => z.string().optional()

const blogSchema = (allowed: ReadonlySet<string>) =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string(),
    pubDate: z.union([z.string(), z.date()]).optional(),
    published: z.boolean().optional(),
    publishDate: z.union([z.string(), z.date()]).optional(),
    image: imageStub(),
    lang: langEnum(allowed),
    newspaper: z.string().optional(),
  })

const pagesSchema = (allowed: ReadonlySet<string>) =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    lang: langEnum(allowed),
    heroTitle: z.string().optional(),
    subtitle: z.string().optional(),
    latestNews: z.string().optional(),
    viewAllPosts: z.string().optional(),
    heading: z.string().optional(),
    allCategory: z.string().optional(),
  })

const positionsSchema = (allowed: ReadonlySet<string>) =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.union([z.string(), z.date()]).optional(),
    published: z.boolean().optional(),
    publishDate: z.union([z.string(), z.date()]).optional(),
    lang: langEnum(allowed),
  })

const commonSchema = (allowed: ReadonlySet<string>) =>
  z.object({
    title: z.string(),
    lang: langEnum(allowed),
    home: z.string().optional(),
    about: z.string().optional(),
    blog: z.string().optional(),
    positions: z.string().optional(),
    manifest: z.string().optional(),
    newspaper: z.string().optional(),
    menu: z.string().optional(),
    copyright: z.string().optional(),
    readMore: z.string().optional(),
    downloadPdf: z.string().optional(),
    downloadFb2: z.string().optional(),
    viewAll: z.string().optional(),
    backToList: z.string().optional(),
    tableOfContents: z.string().optional(),
  })

const newspaperSchema = (allowed: ReadonlySet<string>) =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.union([z.string(), z.date()]).optional(),
    published: z.boolean().optional(),
    publishDate: z.union([z.string(), z.date()]).optional(),
    image: imageStub(),
    lang: langEnum(allowed),
    articles: z.array(z.string()).optional(),
  })

/**
 * Per-content-type schema accessor. Lifts the per-call
 * `supportedLanguages` set into the otherwise-static schema so
 * tests can swap the lang allowlist without rebuilding the module.
 * @param allowed - Set of language codes valid for this run
 * @returns Object mapping content type → zod schema
 */
export const astroSchemas = (allowed: ReadonlySet<string>) => ({
  blog: blogSchema(allowed),
  pages: pagesSchema(allowed),
  positions: positionsSchema(allowed),
  common: commonSchema(allowed),
  newspaper: newspaperSchema(allowed),
})
