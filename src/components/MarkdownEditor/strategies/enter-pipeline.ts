import type { LineContext } from '../line-context'
import { emptyListExit } from './empty-list-exit'
import { indentPreservation } from './indent-preservation'
import { listContinuation } from './list-continuation'

/** Strategy that handles a key action on a line context. */
export type KeyStrategy = (
  ctx: LineContext,
  el: HTMLTextAreaElement
) => boolean

const ENTER_STRATEGIES: readonly KeyStrategy[] = [
  emptyListExit,
  listContinuation,
  indentPreservation,
]

/**
 * Run Enter key strategies in order until one handles.
 * @param ctx - Parsed line context
 * @param el - Textarea element
 * @returns true if any strategy handled the event
 */
export const runEnterStrategies = (
  ctx: LineContext,
  el: HTMLTextAreaElement
): boolean => ENTER_STRATEGIES.some(s => s(ctx, el))
