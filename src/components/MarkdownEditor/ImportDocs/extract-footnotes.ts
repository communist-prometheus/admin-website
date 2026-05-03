import { Option } from 'effect'

/** One footnote parsed out of mammoth HTML. */
export interface Footnote {
  readonly id: number
  readonly html: string
}

/** Result of stripping the footnote scaffolding from mammoth HTML. */
export interface FootnoteExtract {
  readonly html: string
  readonly footnotes: readonly Footnote[]
}

const SUP_REF =
  /<sup>\s*<a[^>]*href="#(?:footnote|endnote)-(\d+)"[^>]*>[^<]*<\/a>\s*<\/sup>/g

const FOOTNOTE_ITEM =
  /<li\s+id="(?:footnote|endnote)-(\d+)"[^>]*>([\s\S]*?)<\/li>/g

const BACKLINK =
  /<a\s+href="#(?:footnote|endnote)-ref-\d+"[^>]*>[\s\S]*?<\/a>/g

const TRAILING_OL = /<hr[^>]*>\s*<ol>[\s\S]*?<\/ol>\s*$/i

/*
 * Placeholder injected before markdown conversion. The previous
 * shape used underscores (`@@FOOTNOTE_REF_N@@`); turndown escapes
 * `_` as `\_` to neuter markdown italic interpretation, which
 * silently broke the strip regex — the placeholder leaked into
 * saved files (the editor had to manually rewrite them as
 * `[N](#footnote-ref-N)` markers). Pure alphanumerics survive
 * turndown verbatim.
 */
const placeholder = (id: number): string => `XXFOOTNOTEREFXX${id}XX`

/** Regex matching the alphanumeric placeholder shape. */
export const PLACEHOLDER_RE = /XXFOOTNOTEREFXX(\d+)XX/g

/**
 * Backwards-compat regex matching the legacy underscore placeholder
 * shape, raw or turndown-escaped (`@@FOOTNOTE_REF_N@@` /
 * `@@FOOTNOTE\_REF\_N@@`). On re-save of an article imported by the
 * previous version, the orphan placeholders get cleaned up.
 */
export const LEGACY_PLACEHOLDER_RE = /@@FOOTNOTE\\?_REF\\?_(\d+)@@/g

const stripBacklink = (html: string): string =>
  html.replace(BACKLINK, '').trim()

const parseItems = (block: string): readonly Footnote[] => {
  const out: Footnote[] = []
  for (const m of block.matchAll(FOOTNOTE_ITEM)) {
    const id = Number(m[1])
    const inner = stripBacklink(m[2] ?? '')
    out.push({ id, html: inner })
  }
  return out
}

const findTrailing = (html: string): Option.Option<string> =>
  Option.fromNullable(html.match(TRAILING_OL)?.[0])

/**
 * Pull mammoth's footnote/endnote scaffolding out of the HTML and
 * return it separately. References `<sup><a href="#endnote-N">…` in
 * the body are replaced with neutral placeholders that callers swap
 * for GFM `[^N]` markers after markdown conversion. The trailing
 * `<hr><ol>…</ol>` block of footnote bodies is removed from the HTML
 * and returned as a sorted array of `{id, html}` entries.
 *
 * @param html mammoth-emitted HTML
 * @returns cleaned HTML + footnotes ready for GFM assembly
 */
export const extractFootnotes = (html: string): FootnoteExtract => {
  const withMarks = html.replace(SUP_REF, (_, id) => placeholder(Number(id)))
  const trailing = findTrailing(withMarks)
  const footnotes = Option.match(trailing, {
    onNone: () => [] as readonly Footnote[],
    onSome: parseItems,
  })
  const clean = Option.match(trailing, {
    onNone: () => withMarks,
    onSome: t => withMarks.replace(t, ''),
  })
  return {
    html: clean,
    footnotes: [...footnotes].sort((a, b) => a.id - b.id),
  }
}

/**
 * Public placeholder function for callers that need to swap the
 * reference marker for real `[^N]` text after markdown conversion.
 *
 * @param id footnote id
 * @returns the placeholder string used by extractFootnotes
 */
export const footnotePlaceholder = (id: number): string => placeholder(id)
