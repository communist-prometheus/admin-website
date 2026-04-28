/*
 * Some `pages` slugs are pure containers for landing-page labels —
 * the public site reads their frontmatter (title, heroTitle, heading,
 * etc.) but never renders the body. Showing a markdown body editor
 * for them is misleading and pollutes the committed file with content
 * that is never used.
 *
 * Mirrors the templates in public-website/src/pages/[lang]/*.astro:
 *   - home: BaseLayout + Hero + NewsSection + PositionsWidget, no body.
 *   - blog-listing: posts grid, no body.
 *   - positions-listing: positions grid, no body.
 *   - manifest, about: do render body and stay editable.
 */
const BODYLESS_PAGE_SLUGS: ReadonlySet<string> = new Set([
  'home',
  'blog-listing',
  'positions-listing',
])

/**
 * Whether the markdown body editor should render for this pages slug.
 * Always true for non-pages content types — only pages have the
 * frontmatter-only landing slugs.
 *
 * @param contentType - Content type of the entry being edited
 * @param slug - Slug of the entry
 * @returns true when a body editor is meaningful for this entry
 */
export const hasBodyEditor = (
  contentType: string,
  slug: string | undefined
): boolean =>
  contentType !== 'pages' || slug === undefined
    ? true
    : !BODYLESS_PAGE_SLUGS.has(slug)
