/**
 * Heuristics for pulling title, description, and body out of the
 * mammoth-generated HTML for the Prometheus content corpus. The
 * upstream Word documents follow a consistent shape:
 *
 *   1. Optional short bold-italic "section" prefix
 *   2. The title — a single short whole-bold paragraph
 *   3. Optional long bold-italic lead paragraph (the description)
 *   4. Body content (regular paragraphs, headings, lists, etc.)
 *
 * The functions here are pure and Node-friendly so they can be
 * exercised by the upload script and from unit tests.
 */

const PARAGRAPH_RE = /<(?:p|h[1-3])\b[^>]*>[\s\S]*?<\/(?:p|h[1-3])>/g
const HEADING_OPEN_RE = /^<h[1-3]\b/i
const TITLE_MAX_LEN = 200
const DESCRIPTION_MIN_LEN = 80
const DESCRIPTION_MAX_LEN = 300
const DESCRIPTION_FALLBACK_LEN = 220
const TERMINATOR = /[.!…]\s*$/

const stripTags = (html: string): string =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

const innerHtml = (block: string): string =>
  block.replace(/^<(?:p|h[1-3])\b[^>]*>/, '').replace(/<\/(?:p|h[1-3])>$/, '')

const isHeading = (block: string): boolean => HEADING_OPEN_RE.test(block)

const isWholeBold = (block: string): boolean => {
  const inner = innerHtml(block).trim()
  return /^<strong>[\s\S]*<\/strong>$/.test(inner)
}

/**
 * Word often inserts non-italic punctuation or quoted phrases
 * inside a long italic-bold lead paragraph, breaking the strict
 * `<strong><em>...</em></strong>` shape. Treat any paragraph
 * that is whole-bold AND opens with `<em>` (or is wrapped in
 * `<em><strong>...</strong></em>`) as visually italic too.
 */
const isWholeBoldItalic = (block: string): boolean => {
  const inner = innerHtml(block).trim()
  return (
    /^<strong>\s*<em>[\s\S]*<\/strong>$/.test(inner) ||
    /^<em>\s*<strong>[\s\S]*<\/em>$/.test(inner)
  )
}

/** Split flattened mammoth HTML into top-level `<p>` blocks. */
export const splitParagraphs = (html: string): ReadonlyArray<string> =>
  html.match(PARAGRAPH_RE) ?? []

/** True when the block looks like a document title — short and prominent. */
export const looksLikeTitle = (block: string): boolean => {
  const text = stripTags(block)
  const fits =
    text.length > 0 && text.length <= TITLE_MAX_LEN && !TERMINATOR.test(text)
  return (
    fits &&
    (isHeading(block) || (isWholeBold(block) && !isWholeBoldItalic(block)))
  )
}

/** True when the paragraph reads as a long bold-italic lead. */
export const looksLikeLead = (block: string): boolean =>
  isWholeBoldItalic(block) && stripTags(block).length >= DESCRIPTION_MIN_LEN

const truncate = (text: string, max: number): string =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`

const findTitleIndex = (blocks: ReadonlyArray<string>): number =>
  blocks.findIndex(looksLikeTitle)

const isShortBoldItalicPrefix = (block: string): boolean =>
  isWholeBoldItalic(block) && stripTags(block).length < DESCRIPTION_MIN_LEN

const walkForLead = (
  blocks: ReadonlyArray<string>,
  start: number,
  step: -1 | 1
): number => {
  let i = start + step
  while (i >= 0 && i < blocks.length) {
    const block = blocks[i] ?? ''
    if (looksLikeLead(block)) return i
    if (!isShortBoldItalicPrefix(block)) return -1
    i += step
  }
  return -1
}

/**
 * Locate a long bold-italic lead paragraph adjacent to the title,
 * skipping short bold-italic prefixes (e.g. section labels).
 * Tries forward first, then backward — many Prometheus documents
 * put the lead BEFORE the title.
 */
const findLeadIndex = (
  blocks: ReadonlyArray<string>,
  titleIdx: number
): number => {
  const after = walkForLead(blocks, titleIdx, 1)
  return after !== -1 ? after : walkForLead(blocks, titleIdx, -1)
}

const fallbackDescriptionFrom = (
  blocks: ReadonlyArray<string>,
  titleIdx: number
): string => {
  const lead = blocks
    .slice(titleIdx + 1)
    .find(b => !isWholeBold(b) && stripTags(b).length >= 30)
  return lead === undefined
    ? ''
    : truncate(stripTags(lead), DESCRIPTION_FALLBACK_LEN)
}

/** Result of meta extraction — body is the HTML with title (and lead) removed. */
export type ExtractedMeta = {
  readonly title: string
  readonly description: string
  readonly bodyHtml: string
}

const removeBlocks = (html: string, blocks: ReadonlyArray<string>): string =>
  blocks.reduce((acc, b) => acc.replace(b, ''), html)

/**
 * Extract title, description, and body from mammoth HTML.
 * @param html Mammoth-generated HTML for one document.
 * @returns Extracted title / description / cleaned body HTML.
 */
export const extractMeta = (html: string): ExtractedMeta => {
  const blocks = splitParagraphs(html)
  const titleIdx = findTitleIndex(blocks)
  const titleBlock = titleIdx === -1 ? '' : (blocks[titleIdx] ?? '')
  const title = stripTags(titleBlock)
  const leadIdx = titleIdx === -1 ? -1 : findLeadIndex(blocks, titleIdx)
  const leadBlock = leadIdx === -1 ? '' : (blocks[leadIdx] ?? '')
  const description = truncate(
    leadIdx === -1
      ? fallbackDescriptionFrom(blocks, titleIdx)
      : stripTags(leadBlock),
    DESCRIPTION_MAX_LEN
  )
  const bodyHtml = removeBlocks(
    html,
    [titleBlock, leadBlock].filter(b => b !== '')
  )
  return { title, description, bodyHtml }
}
