import type { Ref } from 'vue'
import { createInvite, revokeInvite } from './org-invite-api'
import { setOrgRole } from './org-role-api'
import type { InviteRequest } from './roles-api-types'

interface Bag {
  readonly busy: Ref<boolean>
  readonly error: Ref<string | undefined>
  readonly reload: () => Promise<void>
  readonly closeDialog: () => void
}

const toMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e)

const withBusy = (bag: Bag) => async (fn: () => Promise<void>) => {
  bag.busy.value = true
  bag.error.value = undefined
  try {
    await fn()
    await bag.reload()
  } catch (e) {
    bag.error.value = toMessage(e)
  } finally {
    bag.busy.value = false
  }
}

/**
 * Build the three Members-section mutation handlers (role change,
 * invite, revoke). They share a busy flag, surface any error into
 * the section's error ref, and reload the list on success.
 *
 * @param bag - busy / error / reload / closeDialog wiring
 * @returns Handler map
 */
export const buildMemberActions = (bag: Bag) => {
  const run = withBusy(bag)
  return {
    onRoleChange: (
      login: string,
      role: 'admin' | 'chief-editor' | 'editor' | 'none'
    ) => run(() => setOrgRole(login, role)),
    onInvite: (req: InviteRequest) =>
      run(async () => {
        await createInvite(req)
        bag.closeDialog()
      }),
    onRevoke: (id: number) => run(() => revokeInvite(id)),
  }
}
