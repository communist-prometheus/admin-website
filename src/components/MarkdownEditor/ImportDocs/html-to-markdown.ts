import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { assembleWithFootnotes } from './assemble-footnotes'
import { extractFootnotes } from './extract-footnotes'

const build = (): TurndownService => {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  })
  td.use(gfm)
  return td
}

const holder: { instance: TurndownService | undefined } = {
  instance: undefined,
}

const service = (): TurndownService => {
  holder.instance = holder.instance ?? build()
  return holder.instance
}

const toMarkdown = (html: string): string => service().turndown(html)

/**
 * Convert HTML to GitHub-flavored Markdown. Strips mammoth's
 * footnote scaffolding first and re-assembles it as GFM footnote
 * syntax (`[^N]` + `[^N]: body`) at the bottom of the output.
 *
 * @param html source HTML
 * @returns Markdown output with real footnotes
 */
export const htmlToMarkdown = (html: string): string => {
  const { html: clean, footnotes } = extractFootnotes(html)
  const body = toMarkdown(clean)
  return assembleWithFootnotes(body, footnotes, toMarkdown)
}
