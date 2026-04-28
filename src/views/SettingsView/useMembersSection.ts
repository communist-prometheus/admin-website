import { onMounted } from 'vue'
import { buildMemberActions } from './members-actions'
import { projectMembersPublic } from './members-public-state'
import { buildMembersState } from './members-section-state'

/**
 * Own the Members section state: list, invites, dialog, busy flag,
 * error ref, and the three mutation handlers.
 *
 * @returns Reactive state + handlers for MembersSection.vue
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
  const actions = buildMemberActions({
    busy: s.busy,
    error: s.error,
    reload: s.load,
    closeDialog,
  })
  return projectMembersPublic(s, { openDialog, closeDialog }, actions)
}
