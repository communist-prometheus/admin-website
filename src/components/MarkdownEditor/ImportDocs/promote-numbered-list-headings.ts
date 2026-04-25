const PATTERN = /<ol>\s*<li>\s*<strong>([^<]+)<\/strong>\s*<\/li>\s*<\/ol>/g

/**
 * Promote single-item bold-only ordered-list blocks to `<h2>` with
 * a sequential number prefix. Word "List Paragraph" sections often
 * arrive from mammoth as `<ol><li><strong>Title</strong></li></ol>`
 * with no `start` attribute and no continuation between items, so
 * turndown otherwise emits `1. Title` for each section regardless
 * of its real position.
 *
 * The counter runs across the whole document — first match becomes
 * `<h2>1. Title</h2>`, second `<h2>2. Title</h2>`, etc. Multi-item
 * lists, lists with non-bold items, or lists with extra content
 * inside the `<li>` are left untouched.
 *
 * @param html mammoth-emitted HTML
 * @returns HTML with single-item bold-only ordered lists replaced
 *   by sequentially numbered `<h2>` elements
 */
export const promoteNumberedListHeadings = (html: string): string => {
  let n = 0
  return html.replace(PATTERN, (_, inner: string) => {
    n += 1
    return `<h2>${n}. ${inner.trim()}</h2>`
  })
}
