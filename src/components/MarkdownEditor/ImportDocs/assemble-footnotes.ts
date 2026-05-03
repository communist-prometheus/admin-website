import type { Footnote } from './extract-footnotes'
import {
  footnotePlaceholder,
  LEGACY_PLACEHOLDER_RE,
  PLACEHOLDER_RE,
} from './extract-footnotes'

const swapMarkers = (body: string, footnotes: readonly Footnote[]): string =>
  footnotes.reduce(
    (acc, f) => acc.split(footnotePlaceholder(f.id)).join(`[^${f.id}]`),
    body
  )

/*
 * Strip both the current alphanumeric placeholder and the legacy
 * underscore one (raw or turndown-escaped). Legacy is here so a
 * resave of an article imported by the previous version cleans up
 * the orphans the editor would otherwise see in the file.
 */
const stripPlaceholders = (body: string): string =>
  body.replace(PLACEHOLDER_RE, '').replace(LEGACY_PLACEHOLDER_RE, '')

const renderDef = (id: number, markdown: string): string =>
  `[^${id}]: ${markdown.trim().replace(/\n+/g, ' ')}`

const footnoteSection = (
  footnotes: readonly Footnote[],
  toMd: (html: string) => string
): string => footnotes.map(f => renderDef(f.id, toMd(f.html))).join('\n')

/**
 * Build the final markdown by swapping each `@@FOOTNOTE_REF_N@@`
 * placeholder with `[^N]` and appending `[^N]: body` definitions
 * at the end. Unresolved placeholders (ref with no matching body)
 * are silently stripped so broken input never bleeds into the
 * editor.
 *
 * @param body markdown produced from the cleaned HTML
 * @param footnotes extracted footnote payloads
 * @param toMd convert an HTML fragment to markdown (for bodies)
 * @returns final markdown ready to insert into the editor
 */
export const assembleWithFootnotes = (
  body: string,
  footnotes: readonly Footnote[],
  toMd: (html: string) => string
): string => {
  const swapped = stripPlaceholders(swapMarkers(body, footnotes))
  const suffix = footnoteSection(footnotes, toMd)
  return suffix === '' ? swapped : `${swapped.trimEnd()}\n\n${suffix}`
}
