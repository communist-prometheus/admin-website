import { onMounted } from 'vue'
import { buildMemberActions } from './members-actions'
import { buildMembersState } from './members-section-state'

/**
 * Own the Members section state: list, invites, dialog, busy flag,
 * and the three mutation handlers (role change, invite, revoke).
 *
 * @returns reactive state + handlers for MembersSection.vue
 */
export const useMembersSection = () => {
  const s = buildMembersState()
  const openDialog = () => {
    s.dialogOpen.value = true
  }
  const closeDialog = () => {
    s.dialogOpen.value = false
  }
  onMounted(s.load)
  const actions = buildMemberActions(s.busy, s.load, closeDialog)
  return {
    sorted: s.sorted,
    invitations: s.invitations,
    loading: s.loading,
    dialogOpen: s.dialogOpen,
    busy: s.busy,
    disabled: s.disabled,
    canEditSettings: s.canEditSettings,
    openDialog,
    closeDialog,
    ...actions,
  }
}
