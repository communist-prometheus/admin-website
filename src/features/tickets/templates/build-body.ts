import type { TicketAttachment } from './attachment-types'
import { SECTION_LABELS } from './labels'
import type { BugTemplate, TicketTemplate, UserStoryTemplate } from './types'

const section = (label: string, body: string): string =>
  `## ${label}\n\n${body.trim() || '_(empty)_'}`

const bugSections = (t: BugTemplate): readonly string[] => [
  section(SECTION_LABELS.reproductionSteps, t.reproductionSteps),
  section(SECTION_LABELS.actualBehavior, t.actualBehavior),
  section(SECTION_LABELS.expectedBehavior, t.expectedBehavior),
  section(SECTION_LABELS.description, t.description),
]

const userStorySections = (t: UserStoryTemplate): readonly string[] => [
  section(SECTION_LABELS.iAs, t.iAs),
  section(SECTION_LABELS.wantTo, t.wantTo),
  section(SECTION_LABELS.soThat, t.soThat),
  section(SECTION_LABELS.description, t.description),
]

/*
 * Plain links for every kind, images included: the tickets repo is
 * private, so GitHub's camo proxy cannot inline raw content anyway —
 * a working member-only blob link beats a permanently broken embed.
 */
const attachmentLine = (a: TicketAttachment): string =>
  `[${a.name}](${a.url})`

const attachmentsBlock = (
  attachments: readonly TicketAttachment[]
): string => {
  const lines = attachments.map(attachmentLine).join('\n')
  return section(SECTION_LABELS.attachments, lines)
}

/**
 * Build a markdown issue body from a structured template + attachments.
 *
 * Layout uses `## Section` headings — that's what every GitHub issue
 * template does, and it round-trips cleanly through {@link parseBody}.
 *
 * @param t - Validated template (no required fields blank)
 * @param attachments - Files already uploaded; rendered as media links
 * @returns Markdown body ready to POST as the issue body
 */
export const buildBody = (
  t: TicketTemplate,
  attachments: readonly TicketAttachment[] = []
): string => {
  const main = t.kind === 'bug' ? bugSections(t) : userStorySections(t)
  const all =
    attachments.length === 0 ? main : [...main, attachmentsBlock(attachments)]
  return all.join('\n\n')
}
