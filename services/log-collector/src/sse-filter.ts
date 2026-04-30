import { canSeeTrace, type RbacContext } from './rbac-policy'
import type { SpanFilter } from './sse-bus'

/** Match every span when no traceId filter is set. */
export const traceIdFilter = (traceId: string | undefined): SpanFilter =>
  traceId === undefined ? () => true : span => span.traceId === traceId

/**
 * Build a filter that admits a span iff the connected user is
 * allowed to see it. Reuses the same RBAC policy as the detail
 * endpoint: admins pass everything; non-admins must own the
 * span's `org` attribute. Spans with no `org` attribute are
 * admin-only.
 */
export const rbacFilter = (ctx: RbacContext): SpanFilter => {
  const orgsOf = (org: string | undefined): ReadonlySet<string> =>
    new Set(org === undefined ? [] : [org])
  return span => canSeeTrace(ctx, orgsOf(span.attributes['org']))
}

/** Compose two predicates with AND. */
export const composeFilters =
  (a: SpanFilter, b: SpanFilter): SpanFilter =>
  span =>
    a(span) && b(span)
