import { resolveByStrategy } from '@/sw/conflicts/parse-markers'

/** Three-way split of a file containing conflict markers. */
export type ThreeWaySplit = {
  readonly ours: string
  readonly theirs: string
  readonly merged: string
}

/**
 * Split a file with conflict markers into the three views the
 * visual merge editor needs: the "ours" content, the "theirs"
 * content, and a starting point for the merged pane (initialised
 * from "ours" so the user only edits where they disagree).
 * @param content Raw file content with conflict markers.
 * @returns ours / theirs / merged seed strings.
 */
export const parseThreeWays = (content: string): ThreeWaySplit => ({
  ours: resolveByStrategy(content, 'mine'),
  theirs: resolveByStrategy(content, 'theirs'),
  merged: resolveByStrategy(content, 'mine'),
})
