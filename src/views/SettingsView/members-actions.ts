import type { Ref } from 'vue'
import { createInvite, revokeInvite } from './org-invite-api'
import { setOrgRole } from './org-role-api'
import type { InviteRequest } from './roles-api-types'

const withBusy =
  (busy: Ref<boolean>, reload: () => Promise<void>) =>
  async (fn: () => Promise<unknown>): Promise<void> => {
    busy.value = true
    try {
      await fn()
      await reload()
    } finally {
      busy.value = false
    }
  }

/**
 * Build the three Members-section mutation handlers (role change,
 * invite, revoke). They share a busy flag and reload the list on
 * every successful mutation.
 *
 * @param busy shared ref toggled around each async op
 * @param reload callback to refresh the members payload
 * @param closeDialog callback to close the invite dialog on success
 * @returns handler map
 */
export const buildMemberActions = (
  busy: Ref<boolean>,
  reload: () => Promise<void>,
  closeDialog: () => void
) => {
  const run = withBusy(busy, reload)
  return {
    onRoleChange: (
      login: string,
      role: 'admin' | 'chief-editor' | 'editor' | 'none'
    ) => run(() => setOrgRole(login, role)),
    onInvite: (req: InviteRequest) =>
      run(async () => {
        await createInvite(req)
        closeDialog()
      }),
    onRevoke: (id: number) => run(() => revokeInvite(id)),
  }
}
