import { createTicket } from '../api/ticket-actions'
import type { TicketAttachment } from '../templates/attachment-types'
import { buildBody } from '../templates/build-body'
import type { TicketTemplate } from '../templates/types'
import { validateTemplate } from '../templates/validate'

interface SubmitDeps {
  readonly token: string
  readonly title: string
  readonly template: TicketTemplate
  readonly labels: readonly string[]
  readonly attachments: readonly TicketAttachment[]
}

/** Result of a submit attempt — discriminated for the caller. */
export type SubmitResult =
  | { readonly kind: 'ok'; readonly issueNumber: number }
  | { readonly kind: 'invalid'; readonly missing: readonly string[] }
  | { readonly kind: 'error'; readonly message: string }

/**
 * Validate, render the body, and POST the ticket.
 *
 * Pulled out of the form so the form stays declarative — and so
 * we can unit-test the validate→build→post pipeline without DOM.
 *
 * @param deps - Submit inputs
 * @returns Tagged result
 */
export const submitTicket = async (
  deps: SubmitDeps
): Promise<SubmitResult> => {
  const missing = validateTemplate(deps.template)
  return missing.length > 0 ? { kind: 'invalid', missing } : doSubmit(deps)
}

const doSubmit = async (deps: SubmitDeps): Promise<SubmitResult> => {
  try {
    const body = buildBody(deps.template, deps.attachments)
    const ticket = await createTicket({
      token: deps.token,
      title: deps.title,
      body,
      labels: deps.labels,
    })
    return { kind: 'ok', issueNumber: ticket.number }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { kind: 'error', message }
  }
}
