import type { Ref } from 'vue'

/** Role chosen in the invite dialog before sending the request. */
export type InviteRole = 'admin' | 'chief-editor' | 'editor'

/** Resolved invite payload emitted to the parent for submission. */
export interface InvitePayload {
  readonly email?: string
  readonly login?: string
  readonly role: InviteRole
}

interface State {
  readonly identifier: Ref<string>
  readonly role: Ref<InviteRole>
  readonly localError: Ref<string | undefined>
}

const reset = (s: State): void => {
  s.identifier.value = ''
  s.role.value = 'editor'
  s.localError.value = undefined
}

const submitFor = (v: string, role: InviteRole): InvitePayload =>
  v.includes('@') ? { email: v, role } : { login: v, role }

type Emit = (event: 'submit' | 'cancel', payload?: InvitePayload) => void

const trySubmit = (s: State, emit: Emit): void => {
  const v = s.identifier.value.trim()
  const tooShort = v === ''
  s.localError.value = tooShort ? 'Enter a GitHub login or email' : undefined
  void (tooShort || emit('submit', submitFor(v, s.role.value)))
}

const applyGuessAndSubmit = (s: State, guess: string, emit: Emit): void => {
  s.identifier.value = guess
  s.localError.value = undefined
  emit('submit', { login: guess, role: s.role.value })
}

const tryAsUsername = (s: State, guess: string, emit: Emit): void => {
  void (guess === '' || applyGuessAndSubmit(s, guess, emit))
}

/**
 * Build the trio of dialog handlers (submit / try-as-username /
 * cancel) closed over the dialog's reactive state and an emit
 * callback. Extracted so the .vue script section stays under the
 * 50-line per-file budget.
 *
 * @param state Reactive identifier/role/localError refs.
 * @param emit Callback to forward the resolved invite payload or
 *   a cancel signal to the parent.
 * @returns Handlers ready to bind to the dialog buttons.
 */
export const inviteHandlers = (state: State, emit: Emit) => ({
  onSubmit: (): void => trySubmit(state, emit),
  onTryAsUsername: (guess: string): void => tryAsUsername(state, guess, emit),
  onCancel: (): void => {
    reset(state)
    emit('cancel')
  },
})
