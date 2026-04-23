import { Match, Option } from 'effect'

/** Context carried across the block walk. */
export interface PromoteCtx {
  readonly firstLevelDone: boolean
}

/**
 * Split mammoth HTML into top-level block strings. Each block starts
 * with `<p>`, `<h1..6>`, `<ol>`, `<ul>`, or `<hr>`. Tags inside a
 * block (e.g. `<strong>` within `<p>`) stay attached to their parent.
 *
 * @param html mammoth-emitted HTML
 * @returns array of block strings, preserving original order
 */
export const splitBlocks = (html: string): readonly string[] =>
  html.split(/(?=<p[\s>]|<h[1-6][\s>]|<ol[\s>]|<ul[\s>]|<hr[\s>])/i)

/**
 * Fold a block-walk step into the running context, advancing
 * `firstLevelDone` when a promotion has just occurred.
 *
 * @param acc previous context
 * @param promoted whether the block was just upgraded to a heading
 * @returns next context
 */
export const stepCtx = (
  acc: PromoteCtx,
  promoted: Option.Option<unknown>
): PromoteCtx =>
  Match.value(promoted).pipe(
    Match.when(Option.isSome, () => ({ firstLevelDone: true })),
    Match.orElse(() => acc)
  )
