import { Match, Option } from 'effect'
import { type PromoteCtx, splitBlocks, stepCtx } from './promote-walk'

const TITLE_MAX_LEN = 160
const TERMINATOR = /[.!…]$/
const BOLD_ONLY = /^<p><strong>([^<]+)<\/strong><\/p>$/

const isTitleShape = (text: string): boolean =>
  Match.value(text).pipe(
    Match.when(
      t => t.length > 0 && t.length <= TITLE_MAX_LEN && !TERMINATOR.test(t),
      () => true
    ),
    Match.orElse(() => false)
  )

const toHeading = (level: number, text: string): string =>
  `<h${level}>${text}</h${level}>`

const promoteParagraph = (
  block: string,
  ctx: PromoteCtx
): Option.Option<string> =>
  Option.fromNullable(block.match(BOLD_ONLY)).pipe(
    Option.map(m => (m[1] ?? '').trim()),
    Option.filter(isTitleShape),
    Option.map(t => toHeading(ctx.firstLevelDone ? 2 : 1, t))
  )

const replaceBlock = (block: string, ctx: PromoteCtx): string =>
  Option.match(promoteParagraph(block, ctx), {
    onNone: () => block,
    onSome: next => next,
  })

/**
 * Walk mammoth HTML and promote `<p><strong>…</strong></p>` paragraphs
 * whose inner text looks like a section title to real `<h1>` / `<h2>`.
 * First promoted becomes `<h1>` unless the document already has one,
 * otherwise `<h2>`. Running bold, long phrases, and sentences ending
 * in terminal punctuation are left untouched.
 *
 * @param html mammoth HTML output
 * @returns HTML with visual titles upgraded to real headings
 */
export const promoteVisualHeadings = (html: string): string => {
  const ctx0: PromoteCtx = { firstLevelDone: /<h1[\s>]/i.test(html) }
  let ctx = ctx0
  return splitBlocks(html)
    .map(b => {
      const out = replaceBlock(b, ctx)
      ctx = stepCtx(ctx, promoteParagraph(b, ctx))
      return out
    })
    .join('')
}
