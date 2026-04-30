/** Per-handler trace context — populated by the dispatcher. */
export type TraceContext = {
  readonly traceId: string
  readonly spanId: string
}

let active: TraceContext | undefined

/**
 * Set the active trace context for the synchronous portion of
 * the current handler. Cleared with `setActiveContext(undefined)`.
 *
 * Caveat: the SW does not have AsyncLocalStorage, so contexts
 * across `await` boundaries can be lost when other messages
 * dispatch between yields. Logs emitted at synchronous handler
 * entry are reliable; later logs are best-effort.
 * @param ctx Context to install, or undefined to clear.
 * @returns void
 */
export const setActiveContext = (ctx: TraceContext | undefined): void => {
  active = ctx
}

/**
 * Read the active trace context.
 * @returns Active context, or undefined when none is set.
 */
export const activeContext = (): TraceContext | undefined => active
