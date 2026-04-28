/*
 * Decide where a markdown body editor is meaningful, by mirroring
 * exactly what public-website actually renders. Anywhere the
 * template only consumes frontmatter (`entry.data.*`) and never
 * calls `entry.render()` / `<Content />`, showing a body editor in
 * admin would let editors type text into a void.
 *
 * Public-website rendering map (verified in
 * public-website/src/pages/[lang]/*.astro):
 *   - blog/<slug>: body rendered  -> editor SHOWN
 *   - positions/<slug>: body rendered -> editor SHOWN
 *   - pages/manifest, pages/about: body rendered -> editor SHOWN
 *   - pages/home, pages/blog-listing, pages/positions-listing:
 *     frontmatter only -> editor HIDDEN
 *   - newspaper/<slug>: only a list page exists; the detail "page"
 *     is the PDF download. Body never rendered -> editor HIDDEN
 *   - common/<slug> (menu, labels, ...): translation tables read
 *     via `entry.data.*` only -> editor HIDDEN
 */
const ALWAYS_BODYLESS: ReadonlySet<string> = new Set(['common', 'newspaper'])

const BODYLESS_PAGE_SLUGS: ReadonlySet<string> = new Set([
  'home',
  'blog-listing',
  'positions-listing',
])

/**
 * Whether the markdown body editor should render for this entry.
 * @param contentType - Content type of the entry being edited
 * @param slug - Slug of the entry
 * @returns true when a body editor is meaningful for this entry
 */
export const hasBodyEditor = (
  contentType: string,
  slug: string | undefined
): boolean =>
  ALWAYS_BODYLESS.has(contentType)
    ? false
    : contentType !== 'pages' || slug === undefined
      ? true
      : !BODYLESS_PAGE_SLUGS.has(slug)
