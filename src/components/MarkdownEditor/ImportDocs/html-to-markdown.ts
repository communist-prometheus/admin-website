import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

let cached: TurndownService | undefined

const build = (): TurndownService => {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  })
  td.use(gfm)
  return td
}

/**
 * Convert HTML to GitHub-flavored Markdown.
 *
 * @param html source HTML
 * @returns Markdown output
 */
export const htmlToMarkdown = (html: string): string => {
  if (cached === undefined) cached = build()
  return cached.turndown(html)
}
