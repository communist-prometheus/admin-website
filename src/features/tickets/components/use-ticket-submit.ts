import { Match } from 'effect'
import type { Ref } from 'vue'
import { attachActionHistory } from './attach-history'
import { submitTicket } from './submit-ticket'
import type { useCreateForm } from './use-create-form'

interface SubmitDeps {
  readonly token: string
  readonly form: ReturnType<typeof useCreateForm>
  readonly missing: Ref<readonly string[]>
  readonly emitCreated: () => void
  readonly emitError: (msg: string) => void
}

const dispatch = (
  result: Awaited<ReturnType<typeof submitTicket>>,
  deps: SubmitDeps
): void =>
  Match.value(result).pipe(
    Match.discriminator('kind')('invalid', r => {
      deps.missing.value = r.missing
    }),
    Match.discriminator('kind')('error', r => deps.emitError(r.message)),
    Match.discriminator('kind')('ok', () => {
      deps.form.reset()
      deps.missing.value = []
      deps.emitCreated()
    }),
    Match.exhaustive
  )

/**
 * Run the full submit pipeline: attach the action-history JSON,
 * compose the attachment list, post the ticket, and dispatch the
 * outcome to the callbacks supplied by the host component.
 *
 * @param deps - Token, form state, missing-fields ref, callbacks
 */
export const runTicketSubmit = async (deps: SubmitDeps): Promise<void> => {
  const history = await attachActionHistory(deps.token, deps.emitError)
  const all =
    history === undefined
      ? deps.form.attachments.value
      : [...deps.form.attachments.value, history]
  const result = await submitTicket({
    token: deps.token,
    title: deps.form.titleTrimmed.value,
    template: deps.form.template.value,
    labels: deps.form.labels.value,
    attachments: all,
  })
  dispatch(result, deps)
}
