import { SECTION_LABELS } from './labels'
import type { TicketSection } from './types'

const ALL_LABELS = Object.values(SECTION_LABELS)

const escapeRe = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const headingRe = new RegExp(
  `^##\\s+(${ALL_LABELS.map(escapeRe).join('|')})\\s*$`,
  'gmi'
)

interface RawHit {
  readonly label: string
  readonly start: number
  readonly contentStart: number
}

const findHits = (body: string): readonly RawHit[] =>
  [...body.matchAll(headingRe)].map(m => ({
    label: m[1] ?? '',
    start: m.index ?? 0,
    contentStart: (m.index ?? 0) + m[0].length,
  }))

const cleanText = (raw: string): string => (raw === '_(empty)_' ? '' : raw)

const sliceAt = (
  body: string,
  hit: RawHit,
  next: RawHit | undefined
): TicketSection => ({
  label: hit.label,
  text: cleanText(
    body
      .slice(hit.contentStart, next === undefined ? body.length : next.start)
      .trim()
  ),
})

/**
 * Parse a structured ticket body back into labelled sections.
 *
 * Uses the same labels {@link SECTION_LABELS} the builder produces —
 * unknown headings or stray prose are dropped so legacy free-form
 * bodies render as a single unlabelled block via the caller.
 *
 * @param body - Raw issue body markdown
 * @returns Sections in the order they appear in the body
 */
export const parseBody = (body: string): readonly TicketSection[] => {
  const hits = findHits(body)
  return hits.map((hit, i) => sliceAt(body, hit, hits[i + 1]))
}
