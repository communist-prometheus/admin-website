import type { SpanRecord } from './otlp-types'

/** Bindings the RBAC layer reads off the worker env. */
export type RbacBindings = {
  readonly RBAC_ADMINS?: string
}

const splitList = (raw: string | undefined): ReadonlySet<string> =>
  new Set(
    (raw ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
  )

/** Active RBAC context for a single request. */
export type RbacContext = {
  readonly user: string
  readonly admins: ReadonlySet<string>
}

/**
 * Build an RBAC context from the worker env + the JWT subject.
 * Admins come from the comma-separated `RBAC_ADMINS` binding;
 * everyone else is a regular user.
 * @param bindings Worker bindings.
 * @param user GitHub login from the JWT `sub` claim.
 * @returns RBAC context.
 */
export const buildRbac = (
  bindings: RbacBindings,
  user: string
): RbacContext => ({ user, admins: splitList(bindings.RBAC_ADMINS) })

/**
 * Collect the unique `org` attribute values from a span list.
 * @param spans Spans associated with a single trace.
 * @returns Frozen set of orgs the spans claim.
 */
export const orgsFromSpans = (
  spans: ReadonlyArray<SpanRecord>
): ReadonlySet<string> =>
  new Set(
    spans
      .map(s => s.attributes['org'])
      .filter((o): o is string => typeof o === 'string' && o.length > 0)
  )

/**
 * Decide whether `ctx.user` may read a trace whose spans claim
 * the given orgs. Admins always pass. Non-admins must own at
 * least one of the trace's orgs (i.e. `ctx.user` ∈ orgs). When
 * the trace carries no org attribute, only admins may see it.
 * @param ctx RBAC context.
 * @param orgs Orgs claimed by the trace.
 * @returns True when the user is allowed.
 */
export const canSeeTrace = (
  ctx: RbacContext,
  orgs: ReadonlySet<string>
): boolean =>
  ctx.admins.has(ctx.user) || (orgs.size > 0 && orgs.has(ctx.user))
